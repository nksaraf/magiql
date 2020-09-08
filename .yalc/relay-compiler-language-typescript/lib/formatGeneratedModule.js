"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addAnyTypeCast_1 = require("./addAnyTypeCast");
// @ts-ignore
var prettier = require("prettier");
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
        return prettier.format("/* tslint:disable */\n/* eslint-disable */\n// @ts-nocheck\n" + (hash ? "/* " + hash + " */\n" : "") + "\n" + documentTypeImport + "\n" + (typeText || "") + "\n\n" + docTextComment + "\n" + nodeStatement + "\n(node as any).hash = '" + sourceHash + "';\n" + (query ? "(node as any).query = " + JSON.stringify(query) : "") + "\nexport default node;\n", { parser: 'babel-ts' });
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0R2VuZXJhdGVkTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Zvcm1hdEdlbmVyYXRlZE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLG1EQUE4QztBQUM5QyxhQUFhO0FBQ2IsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRXJDLHdFQUF3RTtBQUUzRCxRQUFBLGdCQUFnQixHQUFHLFVBQzlCLGVBQXdDO0lBQXhDLGdDQUFBLEVBQUEsb0JBQXdDO0lBQ3ZCLE9BQUEsVUFBQyxFQVNuQjtZQVJDLDBCQUFVLEVBQ1YsOEJBQVksRUFDWixvQkFBTyxFQUNQLDhCQUFZLEVBQ1osc0JBQVEsRUFDUixjQUFJLEVBQ0osY0FBSSxFQUNKLDBCQUFVO1FBRVYsSUFBTSxrQkFBa0IsR0FBRyxZQUFZO1lBQ3JDLENBQUMsQ0FBQyxjQUFZLFlBQVksK0JBQTBCO1lBQ3BELENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0UsSUFBSSxhQUFhLEdBQUcsa0JBQWUsWUFBWTtZQUM3QyxPQUFPLFlBQU0sWUFBWSxNQUFHLENBQUM7UUFDL0IsSUFBSSxlQUFlLENBQUMsYUFBYSxFQUFFO1lBQ2pDLGFBQWEsR0FBRyx3QkFBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3REO1FBQ0QsSUFBSSxLQUFLLENBQUM7UUFDVixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzNCLElBQU0sT0FBTyxHQUFRLFFBQVEsQ0FBQyxLQUFLLENBQ2pDLG1EQUFtRCxDQUNwRCxDQUFDO1lBQ0YsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQjtRQUVELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxrRUFHdkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFNLElBQUksVUFBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQzdCLGtCQUFrQixXQUNsQixRQUFRLElBQUksRUFBRSxhQUVkLGNBQWMsVUFDZCxhQUFhLGdDQUNTLFVBQVUsYUFDaEMsS0FBSyxDQUFDLENBQUMsQ0FBQywyQkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSw4QkFFOUQsRUFBRyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7QUF4Q2tCLENBd0NsQixDQUFDIn0=