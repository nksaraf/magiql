"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var relay_compiler_1 = require("relay-compiler");
var Printer = require("relay-compiler/lib/core/IRPrinter");
var FlattenTransform = require("relay-compiler/lib/transforms/FlattenTransform");
var InlineFragmentsTransform = require("relay-compiler/lib/transforms/InlineFragmentsTransform");
var MaskTransform = require("relay-compiler/lib/transforms/MaskTransform");
var MatchTransform = require("relay-compiler/lib/transforms/MatchTransform");
var RefetchableFragmentTransform = require("relay-compiler/lib/transforms/RefetchableFragmentTransform");
var RelayDirectiveTransform = require("relay-compiler/lib/transforms/RelayDirectiveTransform");
var ts = require("typescript");
var TypeScriptTypeTransformers_1 = require("./TypeScriptTypeTransformers");
var REF_TYPE = " $refType";
var FRAGMENT_REFS = " $fragmentRefs";
var DATA_REF = " $data";
var FRAGMENT_REFS_TYPE_NAME = "FragmentRefs";
var DIRECTIVE_NAME = "raw_response_type";
exports.generate = function (schema, node, options) {
    var ast = aggregateRuntimeImports(relay_compiler_1.IRVisitor.visit(node, createVisitor(schema, options)));
    // @ts-ignore
    // console.log(Printer.print);
    var printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    var resultFile = ts.createSourceFile("grapghql-def.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    var fullProgramAst = ts.updateSourceFileNode(resultFile, ast);
    return (printer.printNode(ts.EmitHint.SourceFile, fullProgramAst, resultFile) +
        (node.kind === "Root"
            ? "\n/**QUERY**\n" + node.query + "****/"
            : ""));
};
function aggregateRuntimeImports(ast) {
    var importNodes = ast.filter(function (declaration) {
        return ts.isImportDeclaration(declaration);
    });
    var runtimeImports = importNodes.filter(function (importDeclaration) {
        return importDeclaration.moduleSpecifier.text ===
            "relay-runtime";
    });
    if (runtimeImports.length > 1) {
        var namedImports_1 = [];
        runtimeImports.map(function (node) {
            node.importClause.namedBindings.elements.map(function (element) {
                namedImports_1.push(element.name.text);
            });
        });
        var importSpecifiers_1 = [];
        namedImports_1.map(function (namedImport) {
            var specifier = ts.createImportSpecifier(undefined, ts.createIdentifier(namedImport));
            importSpecifiers_1.push(specifier);
        });
        var namedBindings = ts.createNamedImports(importSpecifiers_1);
        var aggregatedRuntimeImportDeclaration = ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, namedBindings), ts.createStringLiteral("relay-runtime"));
        var aggregatedRuntimeImportAST = ast.reduce(function (prev, curr) {
            if (!ts.isImportDeclaration(curr))
                prev.push(curr);
            return prev;
        }, [aggregatedRuntimeImportDeclaration]);
        return aggregatedRuntimeImportAST;
    }
    else {
        return ast;
    }
}
function nullthrows(obj) {
    if (obj == null) {
        throw new Error("Obj is null");
    }
    return obj;
}
function makeProp(schema, selection, state, unmasked, concreteType) {
    var value = selection.value;
    var key = selection.key, schemaName = selection.schemaName, conditional = selection.conditional, nodeType = selection.nodeType, nodeSelections = selection.nodeSelections;
    if (schemaName === "__typename" && concreteType) {
        value = ts.createLiteralTypeNode(ts.createLiteral(concreteType));
    }
    else if (nodeType) {
        value = TypeScriptTypeTransformers_1.transformScalarType(schema, nodeType, state, selectionsToAST(schema, [Array.from(nullthrows(nodeSelections).values())], state, unmasked));
    }
    var typeProperty = objectTypeProperty(key, value);
    if (conditional) {
        typeProperty.questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);
    }
    return typeProperty;
}
var isTypenameSelection = function (selection) {
    return selection.schemaName === "__typename";
};
var hasTypenameSelection = function (selections) {
    return selections.some(isTypenameSelection);
};
var onlySelectsTypename = function (selections) {
    return selections.every(isTypenameSelection);
};
function selectionsToAST(schema, selections, state, unmasked, fragmentTypeName) {
    var baseFields = new Map();
    var byConcreteType = {};
    flattenArray(selections).forEach(function (selection) {
        var concreteType = selection.concreteType;
        if (concreteType) {
            byConcreteType[concreteType] = byConcreteType[concreteType] || [];
            byConcreteType[concreteType].push(selection);
        }
        else {
            var previousSel = baseFields.get(selection.key);
            baseFields.set(selection.key, previousSel ? mergeSelection(selection, previousSel) : selection);
        }
    });
    var types = [];
    if (Object.keys(byConcreteType).length > 0 &&
        onlySelectsTypename(Array.from(baseFields.values())) &&
        (hasTypenameSelection(Array.from(baseFields.values())) ||
            Object.keys(byConcreteType).every(function (type) {
                return hasTypenameSelection(byConcreteType[type]);
            }))) {
        var typenameAliases_1 = new Set();
        var _loop_1 = function (concreteType) {
            types.push(groupRefs(__spread(Array.from(baseFields.values()), byConcreteType[concreteType])).map(function (selection) {
                if (selection.schemaName === "__typename") {
                    typenameAliases_1.add(selection.key);
                }
                return makeProp(schema, selection, state, unmasked, concreteType);
            }));
        };
        for (var concreteType in byConcreteType) {
            _loop_1(concreteType);
        }
        // It might be some other type then the listed concrete types. Ideally, we
        // would set the type to diff(string, set of listed concrete types), but
        // this doesn't exist in Flow at the time.
        types.push(Array.from(typenameAliases_1).map(function (typenameAlias) {
            var otherProp = objectTypeProperty(typenameAlias, ts.createLiteralTypeNode(ts.createLiteral("%other")));
            var otherPropWithComment = ts.addSyntheticLeadingComment(otherProp, ts.SyntaxKind.MultiLineCommentTrivia, "This will never be '%other', but we need some\n" +
                "value in case none of the concrete values match.", true);
            return otherPropWithComment;
        }));
    }
    else {
        var selectionMap = selectionsToMap(Array.from(baseFields.values()));
        for (var concreteType in byConcreteType) {
            selectionMap = mergeSelections(selectionMap, selectionsToMap(byConcreteType[concreteType].map(function (sel) { return (__assign(__assign({}, sel), { conditional: true })); })));
        }
        var selectionMapValues = groupRefs(Array.from(selectionMap.values())).map(function (sel) {
            return isTypenameSelection(sel) && sel.concreteType
                ? makeProp(schema, __assign(__assign({}, sel), { conditional: false }), state, unmasked, sel.concreteType)
                : makeProp(schema, sel, state, unmasked);
        });
        types.push(selectionMapValues);
    }
    var typeElements = types.map(function (props) {
        if (fragmentTypeName) {
            props.push(objectTypeProperty(REF_TYPE, ts.createLiteralTypeNode(ts.createStringLiteral(fragmentTypeName))));
        }
        return unmasked
            ? ts.createTypeLiteralNode(props)
            : exactObjectTypeAnnotation(props);
    });
    if (typeElements.length === 1) {
        return typeElements[0];
    }
    return ts.createUnionTypeNode(typeElements);
}
// We don't have exact object types in typescript.
function exactObjectTypeAnnotation(properties) {
    return ts.createTypeLiteralNode(properties);
}
var idRegex = /^[$a-zA-Z_][$a-z0-9A-Z_]*$/;
function objectTypeProperty(propertyName, type, options) {
    if (options === void 0) { options = {}; }
    var optional = options.optional, _a = options.readonly, readonly = _a === void 0 ? true : _a;
    var modifiers = readonly
        ? [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)]
        : undefined;
    return ts.createPropertySignature(modifiers, idRegex.test(propertyName)
        ? ts.createIdentifier(propertyName)
        : ts.createLiteral(propertyName), optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined, type, undefined);
}
function mergeSelection(a, b, shouldSetConditional) {
    if (shouldSetConditional === void 0) { shouldSetConditional = true; }
    if (!a) {
        if (shouldSetConditional) {
            return __assign(__assign({}, b), { conditional: true });
        }
        return b;
    }
    return __assign(__assign({}, a), { nodeSelections: a.nodeSelections
            ? mergeSelections(a.nodeSelections, nullthrows(b.nodeSelections), shouldSetConditional)
            : null, conditional: a.conditional && b.conditional });
}
function mergeSelections(a, b, shouldSetConditional) {
    var e_1, _a, e_2, _b;
    if (shouldSetConditional === void 0) { shouldSetConditional = true; }
    var merged = new Map();
    try {
        for (var _c = __values(Array.from(a.entries())), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
            merged.set(key, value);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var _f = __values(Array.from(b.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _h = __read(_g.value, 2), key = _h[0], value = _h[1];
            merged.set(key, mergeSelection(a.get(key), value, shouldSetConditional));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return merged;
}
function isPlural(node) {
    return Boolean(node.metadata && node.metadata.plural);
}
function exportType(name, type) {
    return ts.createTypeAliasDeclaration(undefined, [ts.createToken(ts.SyntaxKind.ExportKeyword)], ts.createIdentifier(name), undefined, type);
}
function importTypes(names, fromModule) {
    return (names &&
        ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports(names.map(function (name) {
            return ts.createImportSpecifier(undefined, ts.createIdentifier(name));
        }))), ts.createLiteral(fromModule)));
}
function createVisitor(schema, options) {
    var state = {
        customScalars: options.customScalars,
        enumsHasteModule: options.enumsHasteModule,
        existingFragmentNames: options.existingFragmentNames,
        generatedFragments: new Set(),
        generatedInputObjectTypes: {},
        optionalInputFields: options.optionalInputFields,
        usedEnums: {},
        usedFragments: new Set(),
        useHaste: options.useHaste,
        useSingleArtifactDirectory: options.useSingleArtifactDirectory,
        noFutureProofEnums: options.noFutureProofEnums,
        matchFields: new Map(),
        runtimeImports: new Set()
    };
    return {
        leave: {
            Root: function (node) {
                var e_3, _a;
                var inputVariablesType = generateInputVariablesType(schema, node, state);
                var inputObjectTypes = generateInputObjectTypes(state);
                var responseType = exportType(node.name + "Response", selectionsToAST(schema, 
                /* $FlowFixMe: selections have already been transformed */
                node.selections, state, false));
                var operationTypes = [
                    objectTypeProperty("response", ts.createTypeReferenceNode(responseType.name, undefined)),
                    objectTypeProperty("variables", ts.createTypeReferenceNode(inputVariablesType.name, undefined))
                ];
                // Generate raw response type
                var rawResponseType;
                var normalizationIR = options.normalizationIR;
                if (normalizationIR &&
                    node.directives.some(function (d) { return d.name === DIRECTIVE_NAME; })) {
                    rawResponseType = relay_compiler_1.IRVisitor.visit(normalizationIR, createRawResponseTypeVisitor(schema, state));
                }
                var nodes = [];
                if (state.runtimeImports.size) {
                    nodes.push(importTypes(Array.from(state.runtimeImports).sort(), "relay-runtime"));
                }
                nodes.push.apply(nodes, __spread(getFragmentRefsTypeImport(state), getEnumDefinitions(schema, state), inputObjectTypes, [inputVariablesType,
                    responseType]));
                if (rawResponseType) {
                    try {
                        for (var _b = __values(state.matchFields), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var _d = __read(_c.value, 2), key = _d[0], ast = _d[1];
                            nodes.push(exportType(key, ast));
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    operationTypes.push(objectTypeProperty("rawResponse", ts.createTypeReferenceNode(node.name + "RawResponse", undefined)));
                    nodes.push(rawResponseType);
                }
                nodes.push(exportType(node.name, exactObjectTypeAnnotation(operationTypes)));
                return nodes;
            },
            Fragment: function (node) {
                var flattenedSelections = flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections);
                var numConcreteSelections = flattenedSelections.filter(function (s) { return s.concreteType; }).length;
                var selections = flattenedSelections.map(function (selection) {
                    if (numConcreteSelections <= 1 &&
                        isTypenameSelection(selection) &&
                        !schema.isAbstractType(node.type)) {
                        return [
                            __assign(__assign({}, selection), { concreteType: schema.getTypeString(node.type) })
                        ];
                    }
                    return [selection];
                });
                state.generatedFragments.add(node.name);
                var dataTypeName = getDataTypeName(node.name);
                var dataType = ts.createTypeReferenceNode(node.name, undefined);
                var refTypeName = getRefTypeName(node.name);
                var refTypeDataProperty = objectTypeProperty(DATA_REF, ts.createTypeReferenceNode(dataTypeName, undefined), { optional: true });
                refTypeDataProperty.questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);
                var refTypeFragmentRefProperty = objectTypeProperty(FRAGMENT_REFS, ts.createTypeReferenceNode(FRAGMENT_REFS_TYPE_NAME, [
                    ts.createLiteralTypeNode(ts.createStringLiteral(node.name))
                ]));
                var isPluralFragment = isPlural(node);
                var refType = exactObjectTypeAnnotation([
                    refTypeDataProperty,
                    refTypeFragmentRefProperty
                ]);
                var unmasked = node.metadata != null && node.metadata.mask === false;
                var baseType = selectionsToAST(schema, selections, state, unmasked, unmasked ? undefined : node.name);
                var type = isPlural(node)
                    ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
                        baseType
                    ])
                    : baseType;
                state.runtimeImports.add("FragmentRefs");
                return __spread([
                    importTypes(Array.from(state.runtimeImports).sort(), "relay-runtime")
                ], getEnumDefinitions(schema, state), [
                    // exportType(node.name, type),
                    exportType(dataTypeName, type),
                    exportType(node.name, isPluralFragment
                        ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [refType])
                        : refType)
                ]);
            },
            InlineFragment: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections).map(function (typeSelection) {
                    return schema.isAbstractType(node.typeCondition)
                        ? __assign(__assign({}, typeSelection), { conditional: true }) : __assign(__assign({}, typeSelection), { concreteType: schema.getTypeString(node.typeCondition) });
                });
            },
            Condition: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections).map(function (selection) {
                    return __assign(__assign({}, selection), { conditional: true });
                });
            },
            // TODO: Why not inline it like others?
            ScalarField: function (node) {
                return visitScalarField(schema, node, state);
            },
            LinkedField: visitLinkedField,
            ModuleImport: function (node) {
                return [
                    {
                        key: "__fragmentPropName",
                        conditional: true,
                        value: TypeScriptTypeTransformers_1.transformScalarType(schema, schema.expectStringType(), state)
                    },
                    {
                        key: "__module_component",
                        conditional: true,
                        value: TypeScriptTypeTransformers_1.transformScalarType(schema, schema.expectStringType(), state)
                    },
                    {
                        key: "__fragments_" + node.name,
                        ref: node.name
                    }
                ];
            },
            FragmentSpread: function (node) {
                state.usedFragments.add(node.name);
                return [
                    {
                        key: "__fragments_" + node.name,
                        ref: node.name
                    }
                ];
            }
        }
    };
}
function visitScalarField(schema, node, state) {
    return [
        {
            key: node.alias || node.name,
            schemaName: node.name,
            value: TypeScriptTypeTransformers_1.transformScalarType(schema, node.type, state)
        }
    ];
}
function visitLinkedField(node) {
    return [
        {
            key: node.alias || node.name,
            schemaName: node.name,
            nodeType: node.type,
            nodeSelections: selectionsToMap(flattenArray(
            /* $FlowFixMe: selections have already been transformed */
            node.selections), 
            /*
             * append concreteType to key so overlapping fields with different
             * concreteTypes don't get overwritten by each other
             */
            true)
        }
    ];
}
function makeRawResponseProp(schema, _a, state, concreteType) {
    var key = _a.key, schemaName = _a.schemaName, value = _a.value, conditional = _a.conditional, nodeType = _a.nodeType, nodeSelections = _a.nodeSelections, kind = _a.kind;
    if (kind === "ModuleImport") {
        // TODO: In flow one can extend an object type with spread, with TS we need an intersection (&)
        // return ts.createSpread(ts.createIdentifier(key));
        throw new Error("relay-compiler-language-typescript does not support @module yet");
    }
    if (schemaName === "__typename" && concreteType) {
        value = ts.createLiteralTypeNode(ts.createLiteral(concreteType));
    }
    else if (nodeType) {
        value = TypeScriptTypeTransformers_1.transformScalarType(schema, nodeType, state, selectionsToRawResponseBabel(schema, [Array.from(nullthrows(nodeSelections).values())], state, schema.isAbstractType(nodeType) || schema.isWrapper(nodeType)
            ? null
            : schema.getTypeString(nodeType)));
    }
    var typeProperty = objectTypeProperty(key, value);
    if (conditional) {
        typeProperty.questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);
    }
    return typeProperty;
}
function selectionsToMap(selections, appendType) {
    var map = new Map();
    selections.forEach(function (selection) {
        var key = appendType && selection.concreteType
            ? selection.key + "::" + selection.concreteType
            : selection.key;
        var previousSel = map.get(key);
        map.set(key, previousSel ? mergeSelection(previousSel, selection) : selection);
    });
    return map;
}
// Transform the codegen IR selections into TS types
function selectionsToRawResponseBabel(schema, selections, state, nodeTypeName) {
    var baseFields = [];
    var byConcreteType = {};
    flattenArray(selections).forEach(function (selection) {
        var concreteType = selection.concreteType;
        if (concreteType) {
            byConcreteType[concreteType] = byConcreteType[concreteType] || [];
            byConcreteType[concreteType].push(selection);
        }
        else {
            baseFields.push(selection);
        }
    });
    var types = [];
    if (Object.keys(byConcreteType).length) {
        var baseFieldsMap = selectionsToMap(baseFields);
        var _loop_2 = function (concreteType) {
            var mergedSeletions = Array.from(mergeSelections(baseFieldsMap, selectionsToMap(byConcreteType[concreteType]), false).values());
            types.push(exactObjectTypeAnnotation(mergedSeletions.map(function (selection) {
                return makeRawResponseProp(schema, selection, state, concreteType);
            })));
            appendLocal3DPayload(types, mergedSeletions, schema, state, concreteType);
        };
        for (var concreteType in byConcreteType) {
            _loop_2(concreteType);
        }
    }
    if (baseFields.length > 0) {
        types.push(exactObjectTypeAnnotation(baseFields.map(function (selection) {
            return makeRawResponseProp(schema, selection, state, nodeTypeName);
        })));
        appendLocal3DPayload(types, baseFields, schema, state, nodeTypeName);
    }
    return ts.createUnionTypeNode(types);
}
function appendLocal3DPayload(types, selections, schema, state, currentType) {
    var moduleImport = selections.find(function (sel) { return sel.kind === "ModuleImport"; });
    if (moduleImport) {
        // Generate an extra opaque type for client 3D fields
        state.runtimeImports.add("Local3DPayload");
        types.push(ts.createTypeReferenceNode(ts.createIdentifier("Local3DPayload"), [
            stringLiteralTypeAnnotation(moduleImport.documentName),
            exactObjectTypeAnnotation(selections
                .filter(function (sel) { return sel.schemaName !== "js"; })
                .map(function (selection) {
                return makeRawResponseProp(schema, selection, state, currentType);
            }))
        ]));
    }
}
// Visitor for generating raw response type
function createRawResponseTypeVisitor(schema, state) {
    return {
        leave: {
            Root: function (node) {
                return exportType(node.name + "RawResponse", selectionsToRawResponseBabel(schema, 
                /* $FlowFixMe: selections have already been transformed */
                node.selections, state, null));
            },
            InlineFragment: function (node) {
                var typeCondition = node.typeCondition;
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections).map(function (typeSelection) {
                    return schema.isAbstractType(typeCondition)
                        ? typeSelection
                        : __assign(__assign({}, typeSelection), { concreteType: schema.getTypeString(typeCondition) });
                });
            },
            ScalarField: function (node) {
                return visitScalarField(schema, node, state);
            },
            ClientExtension: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections).map(function (sel) { return (__assign(__assign({}, sel), { conditional: true })); });
            },
            LinkedField: visitLinkedField,
            Condition: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections);
            },
            Defer: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections);
            },
            Stream: function (node) {
                return flattenArray(
                /* $FlowFixMe: selections have already been transformed */
                node.selections);
            },
            ModuleImport: function (node) {
                return visitRawResponseModuleImport(schema, node, state);
            },
            FragmentSpread: function (_node) {
                throw new Error("A fragment spread is found when traversing the AST, " +
                    "make sure you are passing the codegen IR");
            }
        }
    };
}
// Dedupe the generated type of module selections to reduce file size
function visitRawResponseModuleImport(schema, node, state) {
    var selections = node.selections, key = node.name;
    var moduleSelections = selections
        .filter(function (sel) { return sel.length && sel[0].schemaName === "js"; })
        .map(function (arr) { return arr[0]; });
    if (!state.matchFields.has(key)) {
        var ast = selectionsToRawResponseBabel(schema, node.selections.filter(function (sel) { return sel.length > 1 || sel[0].schemaName !== "js"; }), state, null);
        state.matchFields.set(key, ast);
    }
    return __spread(moduleSelections, [
        {
            key: key,
            kind: "ModuleImport",
            documentName: node.documentName
        }
    ]);
}
function flattenArray(arrayOfArrays) {
    var result = [];
    arrayOfArrays.forEach(function (array) { return result.push.apply(result, __spread(array)); });
    return result;
}
function generateInputObjectTypes(state) {
    return Object.keys(state.generatedInputObjectTypes).map(function (typeIdentifier) {
        var inputObjectType = state.generatedInputObjectTypes[typeIdentifier];
        if (inputObjectType === "pending") {
            throw new Error("TypeScriptGenerator: Expected input object type to have been" +
                " defined before calling `generateInputObjectTypes`");
        }
        else {
            return exportType(typeIdentifier, inputObjectType);
        }
    });
}
function generateInputVariablesType(schema, node, state) {
    return exportType(node.name + "Variables", exactObjectTypeAnnotation(node.argumentDefinitions.map(function (arg) {
        return objectTypeProperty(arg.name, TypeScriptTypeTransformers_1.transformInputType(schema, arg.type, state), { readonly: false, optional: !schema.isNonNull(arg.type) });
    })));
}
function groupRefs(props) {
    var result = [];
    var refs = [];
    props.forEach(function (prop) {
        if (prop.ref) {
            refs.push(prop.ref);
        }
        else {
            result.push(prop);
        }
    });
    if (refs.length > 0) {
        var refTypes = ts.createUnionTypeNode(refs.map(function (ref) { return ts.createLiteralTypeNode(ts.createStringLiteral(ref)); }));
        result.push({
            key: FRAGMENT_REFS,
            conditional: false,
            value: ts.createTypeReferenceNode(FRAGMENT_REFS_TYPE_NAME, [refTypes])
        });
    }
    return result;
}
function getFragmentRefsTypeImport(state) {
    if (state.usedFragments.size > 0) {
        return [
            ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports([
                ts.createImportSpecifier(undefined, ts.createIdentifier("FragmentRefs"))
            ])), ts.createStringLiteral("relay-runtime"))
        ];
    }
    return [];
}
function getEnumDefinitions(schema, _a) {
    var enumsHasteModule = _a.enumsHasteModule, usedEnums = _a.usedEnums, noFutureProofEnums = _a.noFutureProofEnums;
    var enumNames = Object.keys(usedEnums).sort();
    if (enumNames.length === 0) {
        return [];
    }
    if (typeof enumsHasteModule === "string") {
        return [importTypes(enumNames, enumsHasteModule)];
    }
    if (typeof enumsHasteModule === "function") {
        return enumNames.map(function (enumName) {
            return importTypes([enumName], enumsHasteModule(enumName));
        });
    }
    return enumNames.map(function (name) {
        var values = __spread(schema.getEnumValues(usedEnums[name]));
        values.sort();
        if (!noFutureProofEnums) {
            values.push("%future added value");
        }
        return exportType(name, ts.createUnionTypeNode(values.map(function (value) { return stringLiteralTypeAnnotation(value); })));
    });
}
function stringLiteralTypeAnnotation(name) {
    return ts.createLiteralTypeNode(ts.createLiteral(name));
}
function getRefTypeName(name) {
    return name + "$key";
}
function getDataTypeName(name) {
    return name + "$data";
}
// @ts-ignore
var IRTransformer = require("relay-compiler/lib/core/IRTransformer");
// type FragmentVisitorCache = Map<FragmentSpread, FragmentSpread>;
// type FragmentVisitor = (fragmentSpread: FragmentSpread) => ?FragmentSpread;
// /**
//  * A transform that inlines all fragments and removes them.
//  */
// function inlineFragmentsTransform(context: CompilerContext): CompilerContext {
//   const visitFragmentSpread = fragmentSpreadVisitor(new Map());
//   return IRTransformer.transform(context, {
//     Fragment: visitFragment,
//     FragmentSpread: visitFragmentSpread,
//   });
// }
// function visitFragment(fragment: Fragment): null {
//   return null;
// }
// function fragmentSpreadVisitor(cache: FragmentVisitorCache): FragmentVisitor {
//   return function visitFragmentSpread(fragmentSpread: FragmentSpread) {
//     let traverseResult = cache.get(fragmentSpread);
//     if (traverseResult != null) {
//       return traverseResult;
//     }
//     invariant(
//       fragmentSpread.args.length === 0,
//       'InlineFragmentsTransform: Cannot flatten fragment spread `%s` with ' +
//         'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
//       fragmentSpread.name,
//     );
//     const fragment: Fragment = this.getContext().getFragment(
//       fragmentSpread.name,
//       fragmentSpread.loc,
//     );
//     const result: InlineFragment = {
//       kind: 'InlineFragment',
//       directives: fragmentSpread.directives,
//       loc: {kind: 'Derived', source: fragmentSpread.loc},
//       metadata: fragmentSpread.metadata,
//       selections: fragment.selections,
//       typeCondition: fragment.type,
//     };
//     traverseResult = this.traverse(result);
//     cache.set(fragmentSpread, traverseResult);
//     return traverseResult;
//   };
// }
var dataId_1 = require("./dataId");
// Should match FLOW_TRANSFORMS array
// https://github.com/facebook/relay/blob/v10.0.0/packages/relay-compiler/language/javascript/RelayFlowGenerator.js#L982
exports.transforms = [
    RelayDirectiveTransform.transform,
    MaskTransform.transform,
    MatchTransform.transform,
    FlattenTransform.transformWithOptions({}),
    RefetchableFragmentTransform.transform,
    function (context) {
        var inlinedContext = context.applyTransforms([
            function (c) {
                var schema = c.getSchema();
                var keyMap = dataId_1.dataKeys;
                return IRTransformer.transform(c, {
                    LinkedField: function (linkedField) {
                        var idFields = keyMap[schema.getRawType(linkedField.type).name];
                        if (!idFields) {
                            return linkedField;
                        }
                        var toAdd = (idFields || []).filter(function (id) {
                            return !linkedField.selections.find(function (sel) { return sel.name === id; });
                        });
                        console.log(toAdd);
                        if (!toAdd.length) {
                            return linkedField;
                        }
                        return __assign(__assign({}, linkedField), { selections: __spread(toAdd.map(function (add) {
                                var field = schema
                                    .getFields(schema.getRawType(linkedField.type))
                                    .find(function (f) { return f.name === add; });
                                console.log(field);
                                return {
                                    kind: "ScalarField",
                                    alias: field.name,
                                    args: [],
                                    directives: [],
                                    handles: null,
                                    loc: { kind: "Generated" },
                                    metadata: null,
                                    name: field.name,
                                    type: field.type
                                };
                            }), linkedField.selections) });
                    },
                    Fragment: function (fragment) {
                        var idFields = keyMap[schema.getRawType(fragment.type).name];
                        if (!idFields) {
                            return fragment;
                        }
                        var toAdd = (idFields || []).filter(function (id) {
                            return !fragment.selections.find(function (sel) { return sel.name === id; });
                        });
                        if (!toAdd.length) {
                            return fragment;
                        }
                        console.log(toAdd);
                        // console.log(
                        //   toAdd.map(t =>
                        //     schema.getFieldByName(schema.getRawType(fragment.type), toAdd)
                        //   )
                        // );
                        return __assign(__assign({}, fragment), { selections: __spread(toAdd.map(function (add) {
                                var field = schema
                                    .getFields(fragment.type)
                                    .find(function (f) { return f.name === add; });
                                console.log(field);
                                return {
                                    kind: "ScalarField",
                                    alias: field.name,
                                    args: [],
                                    directives: [],
                                    handles: null,
                                    loc: { kind: "Generated" },
                                    metadata: null,
                                    name: field.name,
                                    type: field.type
                                };
                            }), fragment.selections) });
                    }
                });
            },
            InlineFragmentsTransform.transform,
            FlattenTransform.transformWithOptions({})
        ]);
        return IRTransformer.transform(context, {
            Root: function (root) { return (__assign(__assign({}, root), { 
                // @ts-ignore
                query: Printer.print(context.getSchema(), inlinedContext.get(root.name)) })); }
        });
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVNjcmlwdEdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UeXBlU2NyaXB0R2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBV3dCO0FBQ3hCLDJEQUE2RDtBQUk3RCxpRkFBbUY7QUFDbkYsaUdBQW1HO0FBQ25HLDJFQUE2RTtBQUM3RSw2RUFBK0U7QUFDL0UseUdBQTJHO0FBQzNHLCtGQUFpRztBQUNqRywrQkFBaUM7QUFDakMsMkVBSXNDO0FBaUJ0QyxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDN0IsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7QUFDdkMsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzFCLElBQU0sdUJBQXVCLEdBQUcsY0FBYyxDQUFDO0FBQy9DLElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDO0FBRTlCLFFBQUEsUUFBUSxHQUE4QixVQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTztJQUN2RSxJQUFNLEdBQUcsR0FBbUIsdUJBQXVCLENBQ2pELDBCQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQ3RELENBQUM7SUFFRixhQUFhO0lBQ2IsOEJBQThCO0lBRTlCLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDcEMsaUJBQWlCLEVBQ2pCLEVBQUUsRUFDRixFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFDdEIsS0FBSyxFQUNMLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUNqQixDQUFDO0lBRUYsSUFBTSxj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