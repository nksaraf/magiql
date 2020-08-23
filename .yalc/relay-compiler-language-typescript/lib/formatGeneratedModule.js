"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addAnyTypeCast_1 = require("./addAnyTypeCast");
// import * as Transformer from "relay-compiler/lib/core/IRTransformer";
exports.formatterFactory = function (compilerOptions) {
    if (compilerOptions === void 0) { compilerOptions = {}; }
    return function (_a) {
        var moduleName = _a.moduleName, documentType = _a.documentType, docText = _a.docText, concreteText = _a.concreteText, typeText = _a.typeText, hash = _a.hash, node = _a.node, sourceHash = _a.sourceHash;
        var documentTypeImport = documentType
            ? "import { " + documentType + " } from \"relay-runtime\";"
            : "";
        var docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
        var nodeStatement = "const node: " + (documentType ||
            "never") + " = " + concreteText + ";";
        if (compilerOptions.noImplicitAny) {
            nodeStatement = addAnyTypeCast_1.default(nodeStatement).trim();
        }
        var query;
        if (node.kind === "Request") {
            var matched = typeText.match(/\/[\*]{2}QUERY[\*]{2}\n(?<query>[^\*]*?)[\*]{4}\//);
            query = matched[1];
        }
        return "/* tslint:disable */\n/* eslint-disable */\n// @ts-nocheck\n" + (hash ? "/* " + hash + " */\n" : "") + "\n" + documentTypeImport + "\n" + (typeText || "") + "\n\n" + docTextComment + "\n" + nodeStatement + "\n(node as any).hash = '" + sourceHash + "';\n" + (query ? "(node as any).query = " + JSON.stringify(query) : "") + "\nexport default node;\n";
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0R2VuZXJhdGVkTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Zvcm1hdEdlbmVyYXRlZE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLG1EQUE4QztBQUc5Qyx3RUFBd0U7QUFFM0QsUUFBQSxnQkFBZ0IsR0FBRyxVQUM5QixlQUF3QztJQUF4QyxnQ0FBQSxFQUFBLG9CQUF3QztJQUN2QixPQUFBLFVBQUMsRUFTbkI7WUFSQywwQkFBVSxFQUNWLDhCQUFZLEVBQ1osb0JBQU8sRUFDUCw4QkFBWSxFQUNaLHNCQUFRLEVBQ1IsY0FBSSxFQUNKLGNBQUksRUFDSiwwQkFBVTtRQUVWLElBQU0sa0JBQWtCLEdBQUcsWUFBWTtZQUNyQyxDQUFDLENBQUMsY0FBWSxZQUFZLCtCQUEwQjtZQUNwRCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1AsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzNFLElBQUksYUFBYSxHQUFHLGtCQUFlLFlBQVk7WUFDN0MsT0FBTyxZQUFNLFlBQVksTUFBRyxDQUFDO1FBQy9CLElBQUksZUFBZSxDQUFDLGFBQWEsRUFBRTtZQUNqQyxhQUFhLEdBQUcsd0JBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN0RDtRQUNELElBQUksS0FBSyxDQUFDO1FBQ1YsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUMzQixJQUFNLE9BQU8sR0FBUSxRQUFRLENBQUMsS0FBSyxDQUNqQyxtREFBbUQsQ0FDcEQsQ0FBQztZQUNGLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEI7UUFFRCxPQUFPLGtFQUdQLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBTSxJQUFJLFVBQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUM3QixrQkFBa0IsV0FDbEIsUUFBUSxJQUFJLEVBQUUsYUFFZCxjQUFjLFVBQ2QsYUFBYSxnQ0FDUyxVQUFVLGFBQ2hDLEtBQUssQ0FBQyxDQUFDLENBQUMsMkJBQXlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsOEJBRTlELENBQUM7SUFDRixDQUFDO0FBeENrQixDQXdDbEIsQ0FBQyJ9