import { FormatModule } from "relay-compiler";
import * as Printer from "relay-compiler/lib/core/IRPrinter";
import * as ts from "typescript";

import addAnyTypeCast from "./addAnyTypeCast";

// @ts-ignore
// import * as Transformer from "relay-compiler/lib/core/IRTransformer";

export const typescriptFormatterFactory = (
  compilerOptions: ts.CompilerOptions = {}
): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  node,
  sourceHash,
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "relay-runtime";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node: ${
    documentType || "never"
  } = ${concreteText};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  let query;
  if (node.kind === "Request") {
    const matched: any = typeText.match(
      /\/[\*]{2}QUERY[\*]{2}\n(?<query>[^\*]*?)[\*]{4}\//
    );
    query = matched[1];
  }

  const text = `/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
${hash ? `/* ${hash} */\n` : ""}
${documentTypeImport}
${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
${query ? `(node as any).query = ${JSON.stringify(query)}` : ""}
export default node;
`;

  try {
    const prettier = require("prettier");
    if (prettier) {
      prettier.format(text, { parser: "typescript" });
    }
    return text;
  } catch (e) {
    return text;
  }
};

export const javascriptFormatterFactory = (): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  node,
  sourceHash,
}) => {
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node = ${concreteText};`;
  let query;
  if (node.kind === "Request") {
    const matched: any = typeText.match(
      /\/[\*]{2}QUERY[\*]{2}\n(?<query>[^\*]*?)[\*]{4}\//
    );
    query = matched[1];
  }

  const text = `/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
${hash ? `/* ${hash} */\n` : ""}

${docTextComment}
${nodeStatement}
node.hash = '${sourceHash}';
${query ? `node.query = ${JSON.stringify(query)}` : ""}
export default node;
`;
  try {
    const prettier = require("prettier");
    if (prettier) {
      prettier.format(text, { parser: "babel" });
    }
    return text;
  } catch (e) {
    return text;
  }
};
