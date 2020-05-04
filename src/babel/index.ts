import jsx from "@babel/plugin-syntax-jsx";
import { looksLike } from "./helpers";
// data structure
import {
  createGqlRoot,
  createFragmentRazor,
  gqlVariableType,
  createRazor,
} from "./gqlTree";
import { isCallee, getCalleeArgs } from "./helpers";
import * as gql from "graphql-ast-types";
import { semanticTrace } from "./semanticTrace";

/****
 *
 * Discussion of babel strategy
 *
 * at the top level we give users createQuery and createFragment methods.
 * when these are called and assigned, whatever identifier they get assigned to becomes a "razor".
 *
 * the strategy is
 *
 * - declare an `aliasReplaceQueue` which is a `Map()`
 * - semanticTraverse entire AST
 *   - read into datastructure
 *   - where renaming will be needed, push the node into `aliasReplaceQueue`
 * - inject graphql
 * - `aliasReplaceQueue.forEach` and rename
 *
 * LHS cases to handle:
 * - const var1 = DATA
 * - const { var2 } = DATA
 * - const { var3, var4 } = DATA
 * - const { var5: var6  } = DATA
 * - const { var7: { var8: var9} } = DATA
 *
 * interaction cases to handle:
 * - const var1 = DATA.v2
 * - const { var2 } = DATA.v2
 * - const { var3, var4 } = DATA.v2
 * - const { var5: var6  } = DATA.v2
 * - const { var7: { var8: var9} } = DATA.v2
 *
 * RHS cases
 * - const var1 = DATA.v3
 * - const var2 = DATA.v3.var3
 * - const var4 = DATA.v3.var5
 * - const var6 = DATA.v3({ foo: 1, bar: 2})
 * - const var7 = DATA.v3({ foo: 3, bar: 4}).var8
 * - DATA.v3.var8 // no assignment!
 *
 * Array methods
 * - const var2 = DATA.v3.var3[0].foo
 * - DATA.foo.map(bar => bar.baz)
 * - DATA.foo.map(({bar}) => bar.baz)
 * - DATA.foo.map(function ({bar}) {bar.baz})
 *
 **/

export default function (babel) {
  const { types: t, template } = babel;

  function buildError(path, ...errors) {
    return path.buildCodeFrameError([...errors, ""].join("\n"));
  }

  /**
   * Handle useFragment calls
   *
   *  const pokemon = useFragment(Pokemon)
   *  return <div>{pokemon.name}</div>;
   *
   * @param path
   */
  function handleUseFragment(path) {
    const callExpression = path.findParent((p) => p.isCallExpression());
    console.log(callExpression);
    if (!callExpression) {
      throw buildError(
        path,
        `useFragment must be used as a function call,`,
        `const pokemon = eg. useFragment("Pokemon")`
      );
    }

    const variableDeclaration = path.findParent((p) =>
      p.isVariableDeclarator()
    );

    const returnPath = variableDeclaration.get("id");

    const fragmentRoot = returnPath.isIdentifier()
      ? returnPath
      : returnPath.isObjectPattern()
      ? returnPath
          .get("properties")
          .find((p) =>
            looksLike(p.node, {
              key: {
                name: "fragment",
              },
            })
          )
          .get("value")
      : null;

    if (!fragmentRoot) {
      throw buildError(
        returnPath,
        `useFragment must be assigned to a variable, or destructured,`,
        "",
        `  eg. const { fragment, loading, error } = useFragment("Pokemon");`,
        `  eg. const pokemon = useFragment("Pokemon");`
      );
    }

    // [queryName, queryOptions = { variables: queryVariables, ...otherOptions }]
    let callArgs = callExpression.get("arguments");
    // console.log(queryArgs[0]);

    // Query name argument
    if (!callArgs[0].isStringLiteral()) {
      throw buildError(
        callArgs[0],
        "The type of the fragment should be a string literal",
        '  eg. useFragment("Pokemon")'
      );
    }

    let fragmentType = callArgs[0].get("value").node;
    console.log("Building type ", fragmentType);

    const component = path.scope.path;
    let componentName;
    let container;

    if (component.isArrowFunctionExpression()) {
      const componentDeclartion = component.findParent((p) =>
        p.isVariableDeclarator()
      );

      if (!componentDeclartion) {
        throw buildError(component, "Must be assigned to a component");
      } else if (!componentDeclartion.get("id").isIdentifier()) {
        throw buildError(
          componentDeclartion.get("id"),
          "Must be a component name"
        );
      }

      componentName = componentDeclartion.get("id").get("name").node;
      console.log(component);
      console.log(component.findParent((p) => p.isStatement()));

      container = component.getStatementParent();
    } else if (t.isFunctionDeclaration(component)) {
      t.assertIdentifier(component.node.id);
      componentName = component.get("id").get("name").node;
      container = component;
    }

    let params = component.get("params");
    if (params.length === 0) {
      component.set("params", [t.objectPattern([])]);
    }

    let fragmentName = componentName + "_" + fragmentRoot + "Fragment";

    const razor = createFragmentRazor({
      type: "fragment",
      name: componentName + "_" + fragmentRoot + "Fragment",
      fragmentType,
      args: false,
    });

    let propsToAdd = [];

    if (returnPath.isIdentifier()) {
      propsToAdd.push(
        t.objectProperty(
          t.identifier(returnPath.node.name),
          t.identifier(returnPath.node.name)
        )
      );
    } else if (returnPath.isObjectPattern()) {
      const propsUsed = returnPath
        .get("properties")
        .find((p) =>
          looksLike(p.node, {
            key: {
              name: "fragment",
            },
          })
        )
        .get("value").node;
      propsToAdd.push(t.objectProperty(propsUsed, propsUsed));
    }

    const gqlTag = traceGqlTree(path, fragmentRoot.get("name").node, razor);
    let propsContainer = component.get("params")[0];
    variableDeclaration.remove();
    propsContainer.set("properties", [
      ...propsToAdd,
      ...propsContainer.get("properties").map((p) => p.node),
    ]);

    console.log(gqlTag);

    console.log("CONT", container);

    container.insertAfter(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(
            t.identifier(componentName),
            t.identifier(fragmentRoot.get("name").node)
          ),
          t.arrowFunctionExpression([t.identifier("fragmentName")], gqlTag)
        )
      )
    );
  }

  /**
   * Handle useMagiqlQuery calls
   *
   *   const { query, loading, variables, error } = useMagiqlQuery("searchPokemon", {
   *     variables: {
   *         name: "Pikachu"
   *      }
   *   });
   *   return <div>{query.pokemon({ name: variables.name }).id}</div>
   *
   *
   * @param path
   */
  function handleUseMagiqlQuery(path) {
    const callExpression = path.findParent((p) => p.isCallExpression());
    if (!callExpression) {
      throw buildError(
        path,
        `useMagiqlQuery must be used as a function call,`,
        `const { query } = eg. useMagiqlQuery("searchPokemon")`
      );
    }

    const variableDeclaration = path.findParent((p) =>
      p.isVariableDeclarator()
    );
    const returnPath = variableDeclaration.get("id");
    const queryRoot = returnPath.isIdentifier()
      ? returnPath
      : returnPath.isObjectPattern()
      ? returnPath
          .get("properties")
          .find((p) =>
            looksLike(p.node, {
              key: {
                name: "query",
              },
            })
          )
          .get("value")
      : null;

    if (!queryRoot) {
      throw buildError(
        returnPath,
        `useMagiqlQuery must be assigned to a variable, or destructured,`,
        "",
        `  eg. const { query, loading, error } = useMagiqlQuery("searchPokemon");`,
        `  eg. const search = useMagiqlQuery("searchPokemon");`
      );
    }

    // [queryName, queryOptions = { variables: queryVariables, ...otherOptions }]
    let callArgs = callExpression.get("arguments");

    // Query name argument
    if (!callArgs[0].isStringLiteral()) {
      throw buildError(
        callArgs[0],
        "The name of the query should be a string literal",
        '  eg. useMagiqlQuery("searchPokemon")'
      );
    }
    let queryName = callArgs[0].get("value").node;
    console.log("Building query ", queryName);

    // Query variables
    let queryVariables = null;
    const variablesUsage =
      returnPath.isObjectPattern() &&
      returnPath.get("properties").find((p) =>
        looksLike(p.node, {
          key: {
            name: "variables",
          },
        })
      );
    if (variablesUsage && callArgs.length < 2) {
      throw buildError(
        variablesUsage,
        "You used variables in your query. To use variables, you have to pass theme to useMagiqlQuery",
        "",
        `  eg. const { query, variables } = useMagiqlQuery("searchPokemon", {`,
        `        variables: { x: 1 }`,
        `      }) `
      );
    }

    if (callArgs.length > 1) {
      const variables = callArgs[1]
        .get("properties")
        .find((prop) => prop.get("key").get("name").node === "variables");

      if (variables) {
        const variablesObject = variables.get("value");
        if (!variablesObject.isObjectExpression()) {
          throw buildError(
            variablesObject,
            "Variables must be an object",
            "",
            `  eg. const { query, variables } = useMagiqlQuery("searchPokemon", {`,
            `        variables: { x: 1 }`,
            `      }) `
          );
        }
        queryVariables = variablesObject
          .get("properties")
          .map((prop) => {
            const variableName = prop.get("key").get("name").node;
            const variableType = prop.get("value");

            if (variableType.isTSAsExpression()) {
              const typeAnnotation = variableType.get("typeAnnotation");
              if (typeAnnotation.isTSTypeReference()) {
                return [
                  variableName,
                  gqlVariableType(
                    typeAnnotation.get("typeName").get("name").node
                  ),
                ];
              } else if (typeAnnotation.isTSArrayType()) {
                // x: y as PokemonInput[]
                return [
                  variableName,
                  gql.listType(
                    gqlVariableType(typeAnnotation.get("elementType").node.type)
                  ),
                ];
              }
            } else {
              if (variableType.node.type.endsWith("Literal")) {
                return [variableName, gqlVariableType(variableType.node.type)];
              }
              return [variableName, gqlVariableType(variableType.node.type)];
            }
          })
          .filter(Boolean);
      } else if (variablesUsage) {
        throw buildError(
          callArgs[1],
          "You used variables in your query. To use variables, you have to pass theme here",
          "",
          `  eg. const { query, variables } = useMagiqlQuery("searchPokemon", {`,
          `        variables: { x: 1 }`,
          `      }) `
        );
      }
    }

    const gqlQueryTree = createRazor({
      type: "query",
      name: queryName,
      variables: queryVariables || [],
      fragmentType: false,
    });

    callArgs[0].replaceWith(
      traceGqlTree(path, queryRoot.get("name").node, gqlQueryTree)
    );

    if (returnPath.isIdentifier()) {
      returnPath.replaceWith(
        t.objectPattern([
          t.objectProperty(
            t.identifier("data"),
            t.identifier(returnPath.node.name)
          ),
        ])
      );
    } else if (returnPath.isObjectPattern()) {
      returnPath
        .get("properties")
        .find((p) =>
          looksLike(p.node, {
            key: {
              name: "query",
            },
          })
        )
        .get("key")
        .replaceWith(t.identifier("data"));
    }

    // Restructure the query as necessary
    path.replaceWith(t.identifier("useQuery"));
  }

  function getSemanticVisitor(
    gqlTree,
    aliasReplaceQueue,
    argumentReplaceQueue
  ) {
    // eslint-disable-next-line
    function idempotentAddToRazorData(semPath) {
      let currentGqlNode = gqlTree;
      semPath.forEach(([name, ref]) => {
        let aliasPath, calleeArguments;
        if (isCallee(ref)) {
          // if its a callee, extract its args and push it into RHS
          // will parse out fragments/args/directives later
          calleeArguments = getCalleeArgs(ref);
          aliasPath = ref;

          if (aliasPath && aliasPath.isMemberExpression()) {
            if (calleeArguments.length === 0) {
              throw buildError(
                aliasPath,
                "while using fragment requires one argumment (type for fragment)"
              );
            }

            console.log(aliasPath);

            if (aliasPath.get("property").get("name").node === "fragment") {
              const random = Math.round(Math.random() * 1000);
              currentGqlNode.fragments.push(t.identifier("Fragment" + random));
              gqlTree.fragments.push(["Fragment" + random, calleeArguments[0]]);
              aliasPath.parentPath.replaceWith(aliasPath.get("object"));
              return;
            }
          }
        }

        let args = [];
        const fragments = [];
        const directives = [];

        if (calleeArguments) {
          for (const x of calleeArguments) {
            if (x.type === "ObjectExpression") {
              for (let arg of x.properties) {
                if (!t.isObjectProperty(arg)) {
                  throw new Error("Only properties allowed");
                }

                if (
                  t.isMemberExpression(arg.value) &&
                  arg.value.object.name === "variables"
                ) {
                  args.push([arg.key.name, arg.value.property.name]);
                } else {
                  argumentReplaceQueue.set(
                    `${name}_${arg.key.name}`,
                    arg.value
                  );
                  args.push(arg.key.name);
                }
              }
            } else if (
              x.type === "StringLiteral" ||
              x.type === "TemplateLiteral"
            ) {
              // its an arg or a directive; peek at first character to decide
              const peek = x.quasis ? x.quasis[0].value.raw[0] : x.value[0];
              if (peek === "@") directives.push(x);
              else args.push(x);
            } else {
              // its a fragment
              fragments.push(x);
            }
          }
        }

        currentGqlNode = currentGqlNode.addChild({
          name,
          args,
          directives,
          fragments,
        });

        if (aliasPath) {
          aliasReplaceQueue.set(aliasPath, currentGqlNode);
        }
      });
    }

    const semanticVisitor = {
      CallExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("callee");
        ref.replaceWith(callee);
      },
      TSAsExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("expression");
        ref.replaceWith(callee);
      },
      LogicalExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("left");
        ref.replaceWith(callee);
      },
      OptionalCallExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("callee");
        ref.replaceWith(callee);
      },
      Identifier(...args) {
        const [hand, , semPath] = args;
        if (hand === "origin") idempotentAddToRazorData(semPath);
      },
      MemberExpression(...topargs) {
        const [, , semPath] = topargs;
        idempotentAddToRazorData(semPath);
      },
      OptionalMemberExpression(...topargs) {
        const [, , semPath] = topargs;
        idempotentAddToRazorData(semPath);
      },
      /*
        default(...args){
          console.log('[debugging callback]', ...args)
        },
        */
    };

    return semanticVisitor;
  }

  const traceGqlTree = (rootPath, rootSymbol, gqlTree) => {
    //trace the razor and get all child razors (ALL THE WORK IS HAPPENING HERE)
    const aliasReplaceMap = new Map();
    const argumentReplaceMap = new Map();

    semanticTrace(
      rootPath,
      rootSymbol,
      getSemanticVisitor(gqlTree, aliasReplaceMap, argumentReplaceMap)
    );

    aliasReplaceMap.forEach((currentRazor, aliasPath) => {
      aliasPath.parentPath.replaceWith(aliasPath);
      if (currentRazor.alias) {
        aliasPath.node.property.name = currentRazor.alias;
      }
    });

    const literal = gqlTree
      .print()
      .replace(/\"{([a-zA-Z1-9_]+)}\"/g, (a, b) => {
        return "${JSON.stringify(%%" + b + "%%)}";
      });

    const fragments = gqlTree.fragments || [];

    let obj = [
      ...fragments,
      ...Array.from(argumentReplaceMap ?? ({} as any)),
    ].reduce(
      (obj, [key, value]) => Object.assign(obj, { [key]: value }), // Be careful! Maps can have non-String keys; object literals can't.
      {}
    );

    return template(
      `gql\`${literal}${
        fragments.length > 0
          ? fragments
              .map((f) => "${%%" + f[0] + '%%("' + f[0] + '")}')
              .join("\n")
          : ""
      }\``
    )(obj).expression;
  };

  const handleMagiqlImportDeclaration = (path) => {
    let gqlImport = false;
    let hasQueryImport = false;
    path.get("specifiers").forEach((p) => {
      const imported = p.get("imported");

      if (imported.node.name) {
        if (imported.node.name === "useMagiqlQuery") {
          p.remove();
          return;
        }

        if (imported.node.name === "useFragment") {
          p.remove();
          return;
        }

        if (imported.node.name === "useQuery") {
          hasQueryImport = true;
        }

        if (imported.node.name === "gql") {
          gqlImport = true;
        }
      }
    });
    path.set("specifiers", [
      ...path.get("specifiers"),
      ...[
        !hasQueryImport &&
          t.importSpecifier(t.identifier("useQuery"), t.identifier("useQuery")),
        !gqlImport &&
          t.importSpecifier(t.identifier("gql"), t.identifier("gql")),
      ].filter(Boolean),
    ]);
  };

  return {
    name: "babel-magiql",
    inherits: jsx,
    visitor: {
      ImportDeclaration(path) {
        const source = path.get("source");
        if (t.isStringLiteral(source) && source.node.value === "magiql") {
          handleMagiqlImportDeclaration(path);
        }
      },
      Identifier(path) {
        if (looksLike(path, { node: { name: "useFragment" } })) {
          handleUseFragment(path);
        }

        if (looksLike(path, { node: { name: "useMagiqlQuery" } })) {
          handleUseMagiqlQuery(path);
        }
      },
    },
  };
}
