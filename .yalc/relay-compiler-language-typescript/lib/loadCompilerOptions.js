"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
exports.loadCompilerOptions = function () {
    var configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
    if (!configFileName) {
        return {};
    }
    var result = ts.readConfigFile(configFileName, ts.sys.readFile);
    if (result.error) {
        return {};
    }
    return result.config.compilerOptions;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZENvbXBpbGVyT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2FkQ29tcGlsZXJPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQWlDO0FBRXBCLFFBQUEsbUJBQW1CLEdBQUc7SUFDakMsSUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzRSxJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xFLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtRQUNoQixPQUFPLEVBQUUsQ0FBQztLQUNYO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUN2QyxDQUFDLENBQUMifQ==