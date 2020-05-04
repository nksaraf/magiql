// attempt at making a standalone testable data structure

import { maybeGetSimpleString, getSimpleFragmentName } from "./helpers";
import * as gql from "graphql-ast-types";
import { print } from "graphql/language/printer";

// we could make razordata and bladedata inherit from a common class
// but honestly didnt want to prematurely optimize

export const createQueryRazor = ({ name = null }) => {
  let children = [];

  return {
    name,
    children,
  };
};

const varsMap = {
  String: gql.namedType(gql.name("String")),
  Number: gql.namedType(gql.name("Int")),
  Int: gql.namedType(gql.name("Int")),
  Boolean: gql.namedType(gql.name("Boolean")),
  TSNumberKeyword: gql.namedType(gql.name("Int")),
  Float: gql.namedType(gql.name("Float")),
  TSBooleanKeyword: gql.namedType(gql.name("Boolean")),
  TSStringKeyword: gql.namedType(gql.name("String")),
  StringLiteral: gql.namedType(gql.name("String")),
  NumericLiteral: gql.namedType(gql.name("Int")),
  // TsStringKeyword: gql.namedType(gql.name("String")),
};

export const gqlVariableType = (key: any) => {
  return typeof key === "string"
    ? varsMap[key]
      ? gql.nonNullType(varsMap[key])
      : gql.namedType(gql.name(key))
    : key;
};

export const createRazor = ({
  args = null,
  name = null,
  type = null,
  fragmentType = null,
}) => {
  if (!type) throw new Error("type must be either fragment or query");
  if (type === "fragment" && !fragmentType)
    throw new Error("fragments must come with a fragmentType");
  if (type === "fragment" && !name)
    throw new Error("fragments must come with a name");

  let children = [];
  return {
    children,
    args,
    name,
    type,
    fragmentType,
    addChild: (val) => {
      // let preferredNameOrAlias =
      // val.args && val.args.length ? hashArgs(val.args, val.name) : val.name;
      const child = findChild(children, val.name);
      // if a similar child already exists (do nothing)
      if (child && child.alias == hashArgs(val.args, val.name)) {
        return child;
      }

      const newChild = createBlade(val);
      children.push(newChild);
      return newChild;
    },
    print: () => {
      return print(
        gql.document([
          gql.operationDefinition(
            "query",
            gql.selectionSet(children.map((c) => c.ast())),
            gql.name(name),
            args &&
              args.length > 0 &&
              args.map((arg) =>
                gql.variableDefinition(
                  gql.variable(gql.name(arg[0])),
                  gqlVariableType(arg[1])
                )
              )
          ),
        ])
      );
    },
  };
};

export const createFragmentRazor = ({
  args = null,
  name = null,
  type = null,
  fragmentType = null,
}) => {
  if (!type) throw new Error("type must be either fragment or query");
  if (type === "fragment" && !fragmentType)
    throw new Error("fragments must come with a fragmentType");
  if (type === "fragment" && !name)
    throw new Error("fragments must come with a name");

  let children = [];
  return {
    children,
    args,
    name,
    type,
    fragmentType,
    addChild: (val) => {
      let preferredNameOrAlias =
        val.args && val.args.length ? hashArgs(val.args, val.name) : val.name;
      const child = findChild(children, preferredNameOrAlias);
      // if a similar child already exists (do nothing)
      if (child && child.alias == hashArgs(val.args, val.name)) {
        return child;
      }

      const newChild = createBlade(val);
      children.push(newChild);
      return newChild;
    },
    print: () => {
      return print(
        gql.document([
          gql.fragmentDefinition(
            gql.name(name),
            gql.namedType(gql.name(fragmentType)),
            gql.selectionSet(children.map((c) => c.ast()))
          ),
        ])
      );
      // if (!children.length)
      //   return (
      //     /* eslint-disable-next-line */
      //     console.log(
      //       "babel-blade Warning: razor with no children, doublecheck"
      //     );
      //   ); // really shouldnt happen, should we throw an error?
      // let maybeArgs = coerceNullLiteralToNull(args && args[0]);
      // let TemplateLiteral = appendLiterals();
      // if (type === "query") {
      //   TemplateLiteral.addStr(`\nquery ${name || ""}`);
      // } else {
      //   // have to make fragment name parametric
      //   TemplateLiteral.addStr(`\nfragment `);
      //   TemplateLiteral.addLit(name);
      //   TemplateLiteral.addStr(` on ${fragmentType}`);
      // }
      // TemplateLiteral.addStr(maybeArgs ? "(" : "")
      //   .addLit(maybeArgs)
      //   .addStr(maybeArgs ? ")" : "")
      //   .addStr("{\n");
      // let indent = "  ";
      // let fragments = []; // will be mutated to add all the fragments included
      // let accumulators = Object.keys(children).map((key) =>
      //   children[key].print(indent, fragments)
      // );
      // accumulators.forEach(TemplateLiteral.append);
      // TemplateLiteral.addStr("}"); // cap off the string
      // if (fragments.length) {
      //   fragments.forEach((frag) => {
      //     TemplateLiteral.addStr("\n\n");
      //     TemplateLiteral.addLit(frag);
      //     // babel is not happy if you don't have strings surrounding the var
      //     TemplateLiteral.addStr(" ");
      //   });
      // }
      // return zipAccumulators(TemplateLiteral.get());
    },
  };
};

const findChild = (children, id) => {
  for (let i = 0; i < children.length; i++) {
    if (children[i].name === id || children[i].alias === id) return children[i];
  }
  return null;
};

const createBlade = ({
  name = null,
  args = [],
  fragments = [],
  directives = [],
}) => {
  if (!name) throw new Error("new Blade must have name");
  if (!Array.isArray(fragments)) throw new Error("fragments must be array");
  let children = [];
  let alias = hashArgs(args, name);
  fragments = fragments.map((frag) => {
    frag.isFragment = true;
    return frag;
  });
  return {
    name,
    args,
    fragments,
    directives,
    children,
    alias,
    addChild: (val) => {
      const child = findChild(children, val.name);
      // if a similar child already exists (do nothing)
      if (child && child.alias == hashArgs(val.args, val.name)) {
        return child;
      }

      const newChild = createBlade(val);
      children.push(newChild);
      return newChild;
    },
    ast: () => {
      const argmts = args.length
        ? args.map((arg) =>
            Array.isArray(arg)
              ? gql.argument(gql.name(arg[0]), gql.variable(gql.name(arg[1])))
              : gql.argument(gql.name(arg), gql.stringValue(`{${name}_${arg}}`))
          )
        : null;
      return gql.field(
        gql.name(name),
        alias ? gql.name(alias) : null,
        argmts,
        directives.length
          ? directives.map((d) => gql.directive(gql.name(d.value.substr(1))))
          : null,
        children.length ? gql.selectionSet(children.map((c) => c.ast())) : null
      );
    },
    print: (indent, fragments) => {
      let maybeArgs = args.length && args;
      let maybeDirs = directives.length && directives;
      let printName = alias ? `${alias}: ${name}` : name;
      if (fragments.length) fragments.map((frag) => fragments.push(frag)); // mutates fragments!
      let TemplateLiteral = appendLiterals()
        .addStr(`${indent}${printName}`)
        .addStr(maybeArgs ? "(" : "");
      if (maybeArgs) {
        maybeArgs.forEach((arg, i) => {
          if (i !== 0) TemplateLiteral.addStr(", ");
          TemplateLiteral.addLit(arg);
        });
      }
      TemplateLiteral.addStr(maybeArgs ? ")" : "");
      if (maybeDirs) {
        TemplateLiteral.addStr(" ");
        maybeDirs.forEach((dir, i) => {
          if (i !== 0) TemplateLiteral.addStr(" ");
          TemplateLiteral.addLit(dir);
        });
      }
      let fields = children;
      if (fields.length || fragments.length) {
        TemplateLiteral.addStr(" {\n");
        let accumulators = Object.keys(fields).map((key) =>
          /* eslint-disable-next-line */
          fields[key].print(indent + "  ", fragments)
        );
        accumulators.forEach(TemplateLiteral.append);
        fragments.forEach((frag) => {
          TemplateLiteral.addStr(
            `${indent}  ...${getSimpleFragmentName(frag)}\n`
          );
        });
        TemplateLiteral.addStr(`${indent}}\n`); // cap off the query
      } else {
        TemplateLiteral.addStr("\n");
      }
      return TemplateLiteral.get();
    },
  };
};

const getArgsStr = (args, name) =>
  args
    .map(
      (arg) =>
        !Array.isArray(arg) &&
        `${arg}: "{${name}_${arg}_${hashCode(`${name}_${arg}`)}}"`
    )
    .filter(Boolean)
    .join(", ");

export function hashArgs(args, name) {
  return args.filter((a) => !Array.isArray(a)).length
    ? `${name}_${hashCode(getArgsStr(args, name))}`
    : null;
}

// https://stackoverflow.com/a/8831937/1106414
function hashCode(str) {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);

    /* eslint-disable-next-line */
    hash = (hash << 5) - hash + char;

    /* eslint-disable-next-line */
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16).slice(-4); // last4hex
}

function appendLiterals() {
  let stringAccumulator = [];
  let litAccumulator = [];
  let me = {
    addStr(str = null) {
      stringAccumulator.push(str);
      litAccumulator.push(null);
      return me;
    },
    addLit(lit = null) {
      stringAccumulator.push(null);
      litAccumulator.push(lit);
      return me;
    },
    add(str = null, lit = null) {
      stringAccumulator.push(str);
      litAccumulator.push(lit);
      return me;
    },
    append(newMe) {
      newMe.stringAccumulator.forEach((str) => stringAccumulator.push(str));
      newMe.litAccumulator.forEach((lit) => litAccumulator.push(lit));
      return me;
    },
    get() {
      return { stringAccumulator, litAccumulator };
    },
  };
  return me;
}

function zipAccumulators({ stringAccumulator, litAccumulator }) {
  // cannot have any spare

  /* eslint-disable-next-line */
  let str = "",
    newStrAcc = [],
    newLitAcc = [];
  for (let i = 0; i < stringAccumulator.length; i++) {
    if (litAccumulator[i]) {
      let maybeSimpleString = maybeGetSimpleString(litAccumulator[i]);
      if (maybeSimpleString) {
        // its just a simplestring!
        str += maybeSimpleString;
      } else {
        newLitAcc.push(litAccumulator[i]);
        newStrAcc.push(str + (stringAccumulator[i] || ""));
        str = "";
      }
    } else {
      // there is an empty lit, store in state
      str += stringAccumulator[i] || "";
    }
  }
  // flush store
  if (str !== "") newStrAcc.push(str);
  return { stringAccumulator: newStrAcc, litAccumulator: newLitAcc };
}

function coerceNullLiteralToNull(lit) {
  return lit && lit.type === "NullLiteral" ? null : lit;
}
