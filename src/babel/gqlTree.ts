import * as gql from "graphql-ast-types";
import { print } from "graphql/language/printer";

// we could make razordata and bladedata inherit from a common class
// but honestly didnt want to prematurely optimiz

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

/**
 * GQL Tree
 *
 * Root -> type: query/fragment/mutation, variables:
 */

export const createBranch = () => {};

export const createGqlRoot = ({ type = null }) => {};

export const createRazor = ({
  variables = null,
  name = null,
  type = null,
  fragmentType = null,
  fragments = [],
}) => {
  if (!type) throw new Error("type must be either fragment or query");

  let children = [];

  return {
    children,
    variables,
    name,
    type,
    fragments,
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
            gql.selectionSet(getChildrenAst(children)),
            gql.name(name),
            variables
              ? variables.length > 0
                ? variables.map((arg) =>
                    gql.variableDefinition(
                      gql.variable(gql.name(arg[0])),
                      gqlVariableType(arg[1])
                    )
                  )
                : []
              : []
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
  fragments = [],
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
    fragments,
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
            // gql.name(name),
            gql.name("${fragmentName}"),
            gql.namedType(gql.name(fragmentType)),
            gql.selectionSet(getChildrenAst(children))
          ),
        ])
      );
    },
  };
};

const getChildrenAst = (children) => {
  return children
    .map((c) => c.ast())
    .reduce((prev, current) => [...prev, ...current], []);
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
      return [
        gql.field(
          gql.name(name),
          alias ? gql.name(alias) : null,
          argmts,
          directives.length
            ? directives.map((d) => gql.directive(gql.name(d.value.substr(1))))
            : null,
          gql.selectionSet([
            ...(children.length ? getChildrenAst(children) : []),
            ...(fragments.length
              ? fragments.map((fragm) =>
                  gql.fragmentSpread(gql.name(fragm.name))
                )
              : []),
          ])
        ),
      ];
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
