"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function addAsAnyToObjectLiterals(oldSource) {
    function transformer(context) {
        return function transform(rootNode) {
            function visit(node) {
                if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    return ts.createAsExpression(node, ts.createTypeReferenceNode("any", []));
                }
                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
        };
    }
    var source = ts.createSourceFile("", oldSource, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    var result = ts.transform(source, [transformer]);
    var printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    return printer.printFile(result.transformed[0]);
}
exports.default = addAsAnyToObjectLiterals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQW55VHlwZUNhc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWRkQW55VHlwZUNhc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBaUM7QUFFakMsU0FBd0Isd0JBQXdCLENBQUMsU0FBaUI7SUFDaEUsU0FBUyxXQUFXLENBQW9CLE9BQWlDO1FBQ3ZFLE9BQU8sU0FBUyxTQUFTLENBQUMsUUFBVztZQUNuQyxTQUFTLEtBQUssQ0FBQyxJQUFhO2dCQUMxQixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDdkQsT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQzFCLElBQXFCLEVBQ3JCLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQ3RDLENBQUM7aUJBQ0g7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDaEMsRUFBRSxFQUNGLFNBQVMsRUFDVCxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFDdEIsSUFBSSxFQUNKLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUNqQixDQUFDO0lBRUYsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBRW5ELElBQU0sT0FBTyxHQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDM0MsT0FBTyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUTtLQUNqQyxDQUFDLENBQUM7SUFDSCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQWtCLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBOUJELDJDQThCQyJ9