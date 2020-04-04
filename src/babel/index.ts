import jsx from "@babel/plugin-syntax-jsx";
import { looksLike } from "./helpers";
import { loadConfigSync } from "graphql-config";
import * as types from "@babel/types";
// data structure
import { createRazor, createFragmentRazor } from "./dataStructures";
import {
  isObject,
  isCallee,
  getAssignTarget,
  //getObjectPropertyName,
  getCalleeArgs,
  maybeGetSimpleString,
  getSimpleFragmentName
} from "./helpers";
import { semanticTrace } from "./semanticTrace";
// import
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

export default function(babel) {
  const { types: t, template } = babel;
  // const config = loadConfigSync({})
  //   .getDefault()
  //   .getSchemaSync();

  function handleUseFragment(path) {
    if (!isCallee(path)) {
      return;
    }
    let queryArgs = getCalleeArgs(path);
    const razorID = getAssignTarget(path);
    const component = path.scope.path;
    let componentName;
    if (t.isArrowFunctionExpression(component)) {
      t.assertVariableDeclarator(component.container);
      t.assertIdentifier(component.container.id);
      componentName = component.container.id.name;
    } else if (t.isFunctionDeclaration(component)) {
      t.assertIdentifier(component.node.id);
      componentName = component.node.id.name;
      // t.assertVariableDeclarator(component.container);
    }
    // console.log(component);
    let fragmentType = queryArgs[0].value;
    const razor = createFragmentRazor({
      type: "fragment",
      name: componentName + "Fragment",
      fragmentType,
      args: false
    });

    traceRazor(path, razorID, razor);
    path.parentPath.replaceWith(
      t.callExpression(t.identifier("useQuery"), [printRazor(razor, false)])
    );
  }

  function handleUseQuery(path) {
    if (!isCallee(path)) {
      return;
    }
    let queryArgs = getCalleeArgs(path);
    if (!t.isStringLiteral(queryArgs[0])) return;
    let queryName = queryArgs[0].value;
    const dataDeclaration = findQueryDeclaration(path);
    const razorID = dataDeclaration.get("value").get("name").node;
    const razor = createRazor({
      type: "query",
      name: queryName,
      fragmentType: false,
      args: false
    });
    const [tracedRazor, args] = traceRazor(path, razorID, razor);
    path.scope.rename("query", "data");
    dataDeclaration.replaceWith(
      t.objectProperty(t.identifier("data"), t.identifier("data"))
    );
    path.parentPath.replaceWith(
      t.callExpression(t.identifier("useQuery"), [printRazor(razor, args)])
    );
  }

  function findQueryDeclaration(path) {
    const razorParentPath = path.findParent((ppath) =>
      ppath.isVariableDeclarator()
    );
    for (var p of razorParentPath.get("id").get("properties")) {
      if (
        looksLike(p.node, {
          key: {
            name: "query"
          }
        })
      ) {
        return p;
      }
    }
    throw new Error("Could not find data declaration");
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
                argumentReplaceQueue.set(`${name}_${arg.key.name}`, arg.value);
                args.push(arg.key.name);
              }
            }
            else if (x.type === "StringLiteral" || x.type === "TemplateLiteral") {
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
          fragments
        });

        console.log(fragments);
        if (aliasPath) {
          aliasReplaceQueue.set(aliasPath, currentRazor);
        }
      });
    }

    const semanticVisitor = {
      CallExpression(...args) {
        // const [hand, ref, semPath, ...rest] = args
        const [, ref] = args;
        const callee = ref.get("callee");
        // console.log('CallExpression', hand, semPath, ref,callee)
        ref.replaceWith(callee);
      },
      TSAsExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("expression");
        // console.log('CallExpression', hand, semPath, ref,callee)
        ref.replaceWith(callee);
      },
      LogicalExpression(...args) {
        const [, ref] = args;
        const callee = ref.get("left");
        // console.log('CallExpression', hand, semPath, ref,callee)
        ref.replaceWith(callee);
      },
      OptionalCallExpression(...args) {
        // const [hand, ref, semPath, ...rest] = args
        const [, ref] = args;
        const callee = ref.get("callee");
        // console.log('CallExpression', hand, semPath, ref,callee)
        ref.replaceWith(callee);
      },
      Identifier(...args) {
        // const [hand, ref, semPath, ...rest] = args
        const [hand, , semPath] = args;
        // console.log("Identifier", hand, semPath, ref);
        if (hand === "origin") idempotentAddToRazorData(semPath);
      },
      MemberExpression(...topargs) {
        // const [hand, ref, semPath, ...rest] = topargs
        const [, , semPath] = topargs;
        // console.log('MemberExpression', hand, semPath, ref)
        idempotentAddToRazorData(semPath);
      },
      OptionalMemberExpression(...topargs) {
        // const [hand, ref, semPath, ...rest] = topargs
        const [, , semPath] = topargs;
        // console.log('MemberExpression', hand, semPath, ref)
        idempotentAddToRazorData(semPath);
      }
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
      (obj, [key, value]) =>
        Object.assign(obj, { [key]: value }), // Be careful! Maps can have non-String keys; object literals can't.
      {}
    );
    return template(`\`${literal}\``)(obj).expression;
  };

  return {
    name: "babel-magiql",
    inherits: jsx,
    visitor: {
      VariableDeclaration(path) {
        const init = path.get('declarations')[0].get('init');
        if (t.isCallExpression(init) && looksLike(init.get('callee'), { node: { name: "useMagiqlQuery" } })){
          handleUseQuery(init.get('callee'));
        }
      },
      Identifier(path) {
        if (looksLike(path, { node: { name: "useFragment" } })) {
          handleUseFragment(path);
        }
      }
    }
  };
}

// // eslint-disable-next-line max-lines-per-function
// export function handleCreateRazor(path, t) {
//   if (isCreateQuery(path) || isCreateFragment(path)) {
//     // get the identifier and available args
//     const identifier = getAssignTarget(path);
//     let queryArgs;
//     if (isCallee(path)) queryArgs = getCalleeArgs(path);
//     // traverse scope for identifier references
//     const refs = path.scope.bindings[identifier].referencePaths;
//     // clear the reference
//     const razorParentPath = path.findParent((ppath) =>
//       ppath.isVariableDeclaration()
//     );
//     if (!razorParentPath.parentPath.isExportNamedDeclaration()) {
//       razorParentPath.remove(); // remove it unless its exported :)
//     }
//     // create the queue - we will defer alias replacement til all semantic traversals are done
//     const aliasReplaceQueue = new Map();
//     if (refs.length > 0) {
//       let razorID = null;
//       if (isCreateFragment(path) && !queryArgs[0])
//         throw new Error(
//           "createFragment must have one argument to specify the graphql type they are on"
//         );
//       const fragmentType =
//         isCreateFragment(path) && maybeGetSimpleString(queryArgs[0]); //getFragmentName(path)
//       const queryType = isCreateFragment(path) ? "fragment" : "query";
//       const razorData = new RazorData({
//         type: queryType,
//         name: isCreateFragment(path) ? t.Identifier(identifier) : identifier,
//         fragmentType,
//         args: isCreateQuery(path) && queryArgs
//       });
//       // eslint-disable-next-line
//       function idempotentAddToRazorData(semPath) {
//         let currentRazor = razorData;
//         semPath.forEach(([name, ref]) => {
//           let aliasPath, calleeArguments;
//           if (isCallee(ref)) {
//             // if its a callee, extract its args and push it into RHS
//             // will parse out fragments/args/directives later
//             calleeArguments = getCalleeArgs(ref);
//             aliasPath = ref;
//           }
//           const args = [];
//           const fragments = [];
//           const directives = [];

//           if (calleeArguments) {
//             for (const x of calleeArguments) {
//               if (x.type === "StringLiteral" || x.type === "TemplateLiteral") {
//                 // its an arg or a directive; peek at first character to decide
//                 const peek = x.quasis ? x.quasis[0].value.raw[0] : x.value[0];
//                 if (peek === "@") directives.push(x);
//                 else args.push(x);
//               } else {
//                 // its a fragment
//                 fragments.push(x);
//               }
//             }
//           }
//           // const mockRazorToGetAlias = new BladeData({name, args}) // this is hacky, i know; a result of the datastructures being legacy
//           /*console.log('b4',{name,
//                            args: args.length && args[0].value,
//                            currentRazor: [...currentRazor._children],
//                            razorData: [...razorData._children],
//                           })*/
//           currentRazor = currentRazor.add({
//             name,
//             args,
//             directives,
//             fragments
//           });
//           /*console.log('aftr',{
//                            currentRazor: [...currentRazor._children],
//                            razorData: [...razorData._children],
//                           })*/
//           if (currentRazor._args && aliasPath) {
//             aliasReplaceQueue.set(aliasPath, currentRazor);
//           }
//         });
//       }

//       refs.forEach((razor) => {
//         // define visitor
//         const semanticVisitor = {
//           CallExpression(...args) {
//             // const [hand, ref, semPath, ...rest] = args
//             const [, ref] = args;
//             const callee = ref.get("callee");
//             // console.log('CallExpression', hand, semPath, ref,callee)
//             ref.replaceWith(callee);
//           },
//           Identifier(...args) {
//             // const [hand, ref, semPath, ...rest] = args
//             const [hand, , semPath] = args;
//             console.log('HERE', hand, semPath)
//             // console.log("Identifier", hand, semPath, ref);
//             if (hand === "origin") idempotentAddToRazorData(semPath);
//           },
//           MemberExpression(...topargs) {
//             // const [hand, ref, semPath, ...rest] = topargs
//             const [, , semPath] = topargs;
//             // console.log('MemberExpression', hand, semPath, ref)
//             idempotentAddToRazorData(semPath);
//           }
//           /*
//           default(...args){
//             console.log('[debugging callback]', ...args)
//           },
//           */
//         };
//         // go through all razors
//         if (isCallee(razor)) {
//           // we have been activated! time to make a blade!
//           razorID = getAssignTarget(razor);
//           console.log(razorID);
//           // clear the reference
//           if (razor.container.arguments[0])
//             razor.parentPath.replaceWith(razor.container.arguments[0]);
//           else razor.parentPath.remove();
//           // extract data
//           semanticTrace(razor, razorID, semanticVisitor);
//         }
//       });
//       // insert query
//       refs.forEach((razor) => {
//         if (!isObject(razor)) {
//           const { stringAccumulator, litAccumulator } = razorData.print();
//           const graphqlOutput = t.templateLiteral(
//             stringAccumulator.map((str) =>
//               t.templateElement({ raw: str, cooked: str })
//             ),
//             litAccumulator.map((lit) => {
//               if (lit.isFragment) {
//                 // we tagged this inside BladeData
//                 return t.callExpression(lit, [
//                   t.stringLiteral(getSimpleFragmentName(lit))
//                 ]);
//               }
//               return lit || t.nullLiteral();
//             })
//           );

//           if (razor.isExportNamedDeclaration()) {
//             // allow 1 export
//             const decs = razor.get("declaration").get("declarations");
//             if (decs.length > 1)
//               throw new Error(
//                 "detected multiple export declarations in one line, you are restricted to 1 for now"
//               );
//             razor = decs[0].get("init"); // mutate razor to get ready for replacement
//           }
//           if (razorData._type === "fragment") {
//             razor.replaceWith(
//               t.arrowFunctionExpression(
//                 [t.identifier(identifier)],
//                 graphqlOutput
//               )
//             );
//           } else {
//             razor.replaceWith(graphqlOutput);
//           }
//         }
//       });
//     }
