import jsx from "@babel/plugin-syntax-jsx";
import { looksLike } from "./helpers";
// data structure
import {
  createRazor,
  createFragmentRazor,
  gqlVariableType,
} from "./dataStructures";
import {
  isObject,
  isCallee,
  getAssignTarget,
  //getObjectPropertyName,
  getCalleeArgs,
  maybeGetSimpleString,
  getSimpleFragmentName,
} from "./helpers";
import * as gql from "graphql-ast-types";
import { semanticTrace } from "./semanticTrace";
import dedent from "dedent";

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

  /**
   * Handle useFragment calls
   *
   *  const pokemon = useFragment(Pokemon)
   *  return <div>{pokemon.name}</div>;
   *
   * @param path
   */
  function handleUseFragment(path) {
    if (!isCallee(path)) {
      return;
    }
    let queryArgs = getCalleeArgs(path);
    const fragmentRoot = getAssignTarget(path);

    const component = path.scope.path;
    let componentName;
    let container;

    if (t.isArrowFunctionExpression(component)) {
      t.assertVariableDeclarator(component.container);
      t.assertIdentifier(component.container.id);
      componentName = component.container.id.name;
      const body = component.getStatementParent();
      container = (e) => body.replaceWithMultiple([body.node, e]);
    } else if (t.isFunctionDeclaration(component)) {
      t.assertIdentifier(component.node.id);
      componentName = component.node.id.name;
      container = (e) => component.replaceWithMultiple([component.node, e]);
    }

    let fragmentType = queryArgs[0].value;
    const razor = createFragmentRazor({
      type: "fragment",
      name: componentName + "Fragment",
      fragmentType,
      args: false,
    });

    traceRazor(path, fragmentRoot, razor);

    container(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(
            t.identifier(componentName),
            t.identifier(fragmentRoot + "Fragment")
          ),
          printRazor(razor, false)
        )
      )
    );

    path.parentPath.remove();
  }

  function handleVariablesInput(path) {}

  function buildError(path, ...errors) {
    return path.buildCodeFrameError([...errors, ""].join("\n"));
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
          .get("key")
      : null;

    const variablesUsage =
      returnPath.isObjectPattern() &&
      returnPath.get("properties").find((p) =>
        looksLike(p.node, {
          key: {
            name: "variables",
          },
        })
      );

    if (!queryRoot) {
      throw buildError(
        returnPath,
        `useMagiqlQuery must be assigned to a variable, or destructured,`,
        "",
        `  eg. const { query, loading, error } = useMagiqlQuery("searchPokemon");`,
        `  eg. const search = useMagiqlQuery("searchPokemon");`
      );
    }
    console.log(queryRoot);

    // [queryName, queryOptions = { variables: queryVariables, ...otherOptions }]
    let callArgs = callExpression.get("arguments");
    // console.log(queryArgs[0]);

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
    let queryVariables = false;
    if (callArgs.length > 1) {
      // if we accept dynamic variables
      const variables = callArgs[1]
        .get("properties")
        .find((prop) => prop.get("key").get("name").node === "variables");

      if (variables) {
        const variablesObject = variables.get("value");
        if (!variablesObject.isObjectExpression()) {
          throw buildError(variablesObject, "Variables must be an object");
        }
      } else if (variablesUsage) {
        // if (!variablesObject.isObjectExpression()) {
        throw buildError(
          callArgs[1],
          "You used variables in your query",
          "pass the variables here to have them available for usage"
        );
        // }
      }

      // Get the variables and the types of the variables
      // gqlVariables = variables.value.properties
      //   .map((prop) => {
      //     const variableValue = prop.value;
      //     const variableName = prop.key.name;
      //     if (t.isTSAsExpression(prop.value)) {
      //       if (t.isTSTypeReference(prop.value.typeAnnotation)) {
      //         // x: y as PokemonInput
      //         return [
      //           variableName,
      //           gqlVariableType(prop.value.typeAnnotation.typeName.name),
      //         ];
      //       } else if (t.isTSArrayType(prop.value.typeAnnotation)) {
      //         // x: y as PokemonInput[]
      //         return [
      //           variableName,
      //           gql.listType(
      //             gqlVariableType(prop.value.typeAnnotation.elementType.type)
      //           ),
      //         ];
      //       } else {
      //         return [
      //           variableName,
      //           gqlVariableType(prop.value.typeAnnotation.type),
      //         ];
      //       }
      //     } else {
      //       if (prop.value.type.endsWith("Literal")) {
      //         return [variableName, gqlVariableType(prop.value.type)];
      //       }
      //       return [variableName, gqlVariableType(prop.value.type)];
      //     }
      //   })
      //   .filter(Boolean);
    }

    // find the { query, <- loading, error, ...etc } part of the LHS
    // const dataDeclaration = findQueryRoot(path);

    // create a razor starting from that node
    // const razorID = dataDeclaration.get("value").get("name").node;
    console.log(queryRoot);
    const razor = createRazor({
      type: "query",
      name: queryName,
      fragmentType: false,
      // args: gqlVariables,
    });
    //trace the razor and get all child razors (ALL THE WORK IS HAPPENING HERE)
    const [tracedRazor, args] = traceRazor(
      path,
      queryRoot.get("name").node,
      razor
    );

    console.log("here");

    // rename all instances of query with data
    // path.scope.rename("query", "data");
    // dataDeclaration.replaceWith(
    //   t.objectProperty(t.identifier("data"), t.identifier("data"))
    // );

    // move useMagiqlQuery to useQuery
    path.parentPath.replaceWith(
      t.callExpression(t.identifier("useQuery"), [
        printRazor(razor, args),
        // callArgs[1],
      ])
    );
  }

  function getSemanticVisitor(
    razorData,
    aliasReplaceQueue,
    argumentReplaceQueue
  ) {
    // eslint-disable-next-line
    function idempotentAddToRazorData(semPath) {
      let currentRazor = razorData;
      semPath.forEach(([name, ref]) => {
        let aliasPath, calleeArguments;
        if (isCallee(ref)) {
          // if its a callee, extract its args and push it into RHS
          // will parse out fragments/args/directives later
          calleeArguments = getCalleeArgs(ref);
          aliasPath = ref;
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
        currentRazor = currentRazor.addChild({
          name,
          args,
          directives,
          fragments,
        });

        if (aliasPath) {
          aliasReplaceQueue.set(aliasPath, currentRazor);
        }
      });
    }

    const semanticVisitor = {
      CallExpression(...args) {
        const [, ref] = args;
        console.log(ref);
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

  const traceRazor = (path, razorID, razorData) => {
    const aliasReplaceQueue = new Map();
    const argumentReplaceQueue = new Map();

    semanticTrace(
      path,
      razorID,
      getSemanticVisitor(razorData, aliasReplaceQueue, argumentReplaceQueue)
    );

    aliasReplaceQueue.forEach((currentRazor, aliasPath) => {
      aliasPath.parentPath.replaceWith(aliasPath);
      if (currentRazor.alias) {
        aliasPath.node.property.name = currentRazor.alias;
      }
    });

    return [razorData, argumentReplaceQueue];
  };

  const printRazor = (razor, args) => {
    const literal = razor.print().replace(/\"{([a-zA-Z1-9_]+)}\"/g, (a, b) => {
      return "${JSON.stringify(%%" + b + "%%)}";
    });

    let obj = Array.from(args ?? {}).reduce(
      (obj, [key, value]) => Object.assign(obj, { [key]: value }), // Be careful! Maps can have non-String keys; object literals can't.
      {}
    );

    return template(`gql\`${literal}\``)(obj).expression;
  };

  const handleMagiqlImportDeclaration = (path) => {
    let magiqlImport;
    let gqlImport;
    let hasQueryImport = false;
    path.get("specifiers").forEach((p) => {
      const imported = p.get("imported");
      if (imported && imported.node && imported.node.name) {
        if (imported.node.name === "useMagiqlQuery") {
          magiqlImport = p;
        }
        if (imported.node.name === "useQuery") {
          hasQueryImport = true;
        }

        if (imported.node.name === "gql") {
          gqlImport = true;
        }

        if (magiqlImport) {
          if (!hasQueryImport) {
            magiqlImport.replaceWithMultiple(
              [
                t.importSpecifier(
                  t.identifier("useQuery"),
                  t.identifier("useQuery")
                ),
                !gqlImport &&
                  t.importSpecifier(t.identifier("gql"), t.identifier("gql")),
              ].filter(Boolean)
            );
          } else {
            magiqlImport.remove();
          }
        }
      }
    });
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
