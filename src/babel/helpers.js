/****
 *
 * HELPERS.JS
 * Simple readable utils for navigating the path,
 * pure export functions w no significant logic
 *
 */

export function getSimpleFragmentName(frag) {
  if (frag.type === "MemberExpression")
    return `${frag.object.name}${frag.property.name}`;
  if (frag.type === "Identifier") return frag.name;
  throw new Error(
    "unrecognized fragment type being passed to getSimpleFragmentName, please file an issue"
  );
}

export function getAssignTarget(path) {
  return path.parentPath.container.id
    ? path.parentPath.container.id.name
    : undefined;
}

export function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined;
}

export function isObject(path) {
  return looksLike(path, { key: "object" });
}

export function getCalleeArgs(calleePath) {
  const parent = calleePath.findParent((p) => p.isCallExpression());
  const arg = calleePath.container.arguments;
  return arg;
}

export function isCallee(path) {
  const parent = path.parentPath;
  return (
    (parent.isCallExpression() || parent.isOptionalCallExpression()) &&
    path.node === parent.node.callee
  );
}

export function isPropertyCall(path, name) {
  return (
    looksLike(path, {
      node: {
        type: "CallExpression",
        callee: {
          property: { name },
        },
      },
    }) ||
    looksLike(path, {
      node: {
        type: "OptionalCallExpression",
        callee: {
          property: { name },
        },
      },
    })
  );
}

export function maybeGetSimpleString(Literal) {
  if (Literal.type === "StringLiteral") return Literal.value;
  if (
    Literal.type === "TemplateLiteral" &&
    !Literal.expressions.length &&
    Literal.quasis.length === 1
  )
    return Literal.quasis[0].value.raw;
  // else
  return null;
}

export function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every((bKey) => {
      const bVal = b[bKey];
      const aVal = a[bKey];
      if (typeof bVal === "function") {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}

export function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val);
}

/*
eslint
  complexity: ["error", 8],
  import/no-unassigned-import: "off",
  import/no-dynamic-require: "off",
*/
