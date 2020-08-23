"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function getInputObjectTypeIdentifier(schema, typeID) {
    return schema.getTypeString(typeID);
}
function transformScalarType(schema, type, state, objectProps) {
    if (schema.isNonNull(type)) {
        return transformNonNullableScalarType(schema, schema.getNullableType(type), state, objectProps);
    }
    else {
        return ts.createUnionTypeNode([
            transformNonNullableScalarType(schema, type, state, objectProps),
            ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
        ]);
    }
}
exports.transformScalarType = transformScalarType;
function transformNonNullableScalarType(schema, type, state, objectProps) {
    if (schema.isList(type)) {
        return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
            transformScalarType(schema, schema.getListItemType(type), state, objectProps)
        ]);
    }
    else if (schema.isObject(type) ||
        schema.isUnion(type) ||
        schema.isInterface(type)) {
        return objectProps;
    }
    else if (schema.isScalar(type)) {
        return transformGraphQLScalarType(schema.getTypeString(type), state);
    }
    else if (schema.isEnum(type)) {
        return transformGraphQLEnumType(schema, schema.assertEnumType(type), state);
    }
    else {
        throw new Error("Could not convert from GraphQL type " + type.toString());
    }
}
function transformGraphQLScalarType(typeName, state) {
    var customType = state.customScalars[typeName];
    switch (customType || typeName) {
        case "ID":
        case "String":
        case "Url":
            return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        case "Float":
        case "Int":
            return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
        case "Boolean":
            return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
        default:
            return customType
                ? ts.createTypeReferenceNode(customType, undefined)
                : ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    }
}
function transformGraphQLEnumType(schema, type, state) {
    state.usedEnums[schema.getTypeString(type)] = type;
    return ts.createTypeReferenceNode(ts.createIdentifier(schema.getTypeString(type)), []);
}
function transformInputType(schema, type, state) {
    if (schema.isNonNull(type)) {
        return transformNonNullableInputType(schema, schema.getNullableType(type), state);
    }
    else {
        return ts.createUnionTypeNode([
            transformNonNullableInputType(schema, type, state),
            ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
        ]);
    }
}
exports.transformInputType = transformInputType;
function transformNonNullableInputType(schema, type, state) {
    if (schema.isList(type)) {
        return ts.createTypeReferenceNode(ts.createIdentifier("Array"), [
            transformInputType(schema, schema.getListItemType(type), state)
        ]);
    }
    else if (schema.isScalar(type)) {
        return transformGraphQLScalarType(schema.getTypeString(type), state);
    }
    else if (schema.isEnum(type)) {
        return transformGraphQLEnumType(schema, schema.assertEnumType(type), state);
    }
    else if (schema.isInputObject(type)) {
        var typeIdentifier = getInputObjectTypeIdentifier(schema, type);
        if (state.generatedInputObjectTypes[typeIdentifier]) {
            return ts.createTypeReferenceNode(ts.createIdentifier(typeIdentifier), []);
        }
        state.generatedInputObjectTypes[typeIdentifier] = "pending";
        var fields = schema.getFields(schema.assertInputObjectType(type));
        var props = fields.map(function (fieldID) {
            var fieldType = schema.getFieldType(fieldID);
            var fieldName = schema.getFieldName(fieldID);
            var property = ts.createPropertySignature(undefined, ts.createIdentifier(fieldName), state.optionalInputFields.indexOf(fieldName) >= 0 ||
                !schema.isNonNull(fieldType)
                ? ts.createToken(ts.SyntaxKind.QuestionToken)
                : undefined, transformInputType(schema, fieldType, state), undefined);
            return property;
        });
        state.generatedInputObjectTypes[typeIdentifier] = ts.createTypeLiteralNode(props);
        return ts.createTypeReferenceNode(ts.createIdentifier(typeIdentifier), []);
    }
    else {
        throw new Error("Could not convert from GraphQL type " + type.toString());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVNjcmlwdFR5cGVUcmFuc2Zvcm1lcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvVHlwZVNjcmlwdFR5cGVUcmFuc2Zvcm1lcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrQkFBaUM7QUFpQmpDLFNBQVMsNEJBQTRCLENBQUMsTUFBYyxFQUFFLE1BQWM7SUFDbEUsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxTQUFnQixtQkFBbUIsQ0FDakMsTUFBYyxFQUNkLElBQVksRUFDWixLQUFZLEVBQ1osV0FBeUI7SUFFekIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzFCLE9BQU8sOEJBQThCLENBQ25DLE1BQU0sRUFDTixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUM1QixLQUFLLEVBQ0wsV0FBVyxDQUNaLENBQUM7S0FDSDtTQUFNO1FBQ0wsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUM7WUFDNUIsOEJBQThCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDO1lBQ2hFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztTQUNwRCxDQUFDLENBQUM7S0FDSjtBQUNILENBQUM7QUFuQkQsa0RBbUJDO0FBRUQsU0FBUyw4QkFBOEIsQ0FDckMsTUFBYyxFQUNkLElBQVksRUFDWixLQUFZLEVBQ1osV0FBeUI7SUFFekIsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUN0RSxtQkFBbUIsQ0FDakIsTUFBTSxFQUNOLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQzVCLEtBQUss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