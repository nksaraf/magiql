"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FindGraphQLTags_1 = require("./FindGraphQLTags");
var formatGeneratedModule_1 = require("./formatGeneratedModule");
var loadCompilerOptions_1 = require("./loadCompilerOptions");
var TypeScriptGenerator = require("./TypeScriptGenerator");
function plugin() {
    return {
        inputExtensions: ["ts", "tsx"],
        outputExtension: "ts",
        findGraphQLTags: FindGraphQLTags_1.find,
        formatModule: formatGeneratedModule_1.formatterFactory(loadCompilerOptions_1.loadCompilerOptions()),
        typeGenerator: TypeScriptGenerator
    };
}
exports.default = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBeUM7QUFDekMsaUVBQTJEO0FBQzNELDZEQUE0RDtBQUM1RCwyREFBNkQ7QUFFN0QsU0FBd0IsTUFBTTtJQUM1QixPQUFPO1FBQ0wsZUFBZSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztRQUM5QixlQUFlLEVBQUUsSUFBSTtRQUNyQixlQUFlLEVBQUUsc0JBQUk7UUFDckIsWUFBWSxFQUFFLHdDQUFnQixDQUFDLHlDQUFtQixFQUFFLENBQUM7UUFDckQsYUFBYSxFQUFFLG1CQUFtQjtLQUNuQyxDQUFDO0FBQ0osQ0FBQztBQVJELHlCQVFDIn0=