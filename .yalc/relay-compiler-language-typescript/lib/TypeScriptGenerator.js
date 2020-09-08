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
// @ts-ignore
var relay_config_1 = require("relay-config");
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
        runtimeImports: new Set(),
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
                    objectTypeProperty("variables", ts.createTypeReferenceNode(inputVariablesType.name, undefined)),
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
                            __assign(__assign({}, selection), { concreteType: schema.getTypeString(node.type) }),
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
                    ts.createLiteralTypeNode(ts.createStringLiteral(node.name)),
                ]));
                var isPluralFragment = isPlural(node);
                var refType = exactObjectTypeAnnotation([
                    refTypeDataProperty,
                    refTypeFragmentRefProperty,
                ]);
                var unmasked = node.metadata != null && node.metadata.mask === false;
                var baseType = selectionsToAST(schema, selections, state, unmasked, unmasked ? undefined : node.name);
                var type = isPlural(node)
                    ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
                        baseType,
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
                        : refType),
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
                        value: TypeScriptTypeTransformers_1.transformScalarType(schema, schema.expectStringType(), state),
                    },
                    {
                        key: "__module_component",
                        conditional: true,
                        value: TypeScriptTypeTransformers_1.transformScalarType(schema, schema.expectStringType(), state),
                    },
                    {
                        key: "__fragments_" + node.name,
                        ref: node.name,
                    },
                ];
            },
            FragmentSpread: function (node) {
                state.usedFragments.add(node.name);
                return [
                    {
                        key: "__fragments_" + node.name,
                        ref: node.name,
                    },
                ];
            },
        },
    };
}
function visitScalarField(schema, node, state) {
    return [
        {
            key: node.alias || node.name,
            schemaName: node.name,
            value: TypeScriptTypeTransformers_1.transformScalarType(schema, node.type, state),
        },
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
            true),
        },
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
            })),
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
            },
        },
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
            documentName: node.documentName,
        },
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
            value: ts.createTypeReferenceNode(FRAGMENT_REFS_TYPE_NAME, [refTypes]),
        });
    }
    return result;
}
function getFragmentRefsTypeImport(state) {
    if (state.usedFragments.size > 0) {
        return [
            ts.createImportDeclaration(undefined, undefined, ts.createImportClause(undefined, ts.createNamedImports([
                ts.createImportSpecifier(undefined, ts.createIdentifier("FragmentRefs")),
            ])), ts.createStringLiteral("relay-runtime")),
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
console.log(relay_config_1.loadConfig());
// @ts-ignore
var IRTransformer = require("relay-compiler/lib/core/IRTransformer");
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
            InlineFragmentsTransform.transform,
            FlattenTransform.transformWithOptions({}),
            function (context) {
                return IRTransformer.transform(context, {
                    LinkedField: visitLinkedFieldId,
                });
            },
        ]);
        return IRTransformer.transform(context, {
            Root: function (root) { return (__assign(__assign({}, root), { query: Printer.print(context.getSchema(), 
                // @ts-ignore
                inlinedContext.get(root.name)) })); },
        });
    },
];
function visitLinkedFieldId(linkedField) {
    var datakeys = {};
    try {
        datakeys = require(process.cwd() + "/generated/dataId");
    }
    catch (e) {
        return linkedField;
    }
    linkedField = this.traverse(linkedField);
    var context = this.getContext();
    var schema = context.getSchema();
    var idFields = datakeys[schema.getRawType(linkedField.type).name];
    if (!idFields) {
        return linkedField;
    }
    var toAdd = (idFields || []).filter(function (id) { return !linkedField.selections.find(function (sel) { return sel.name === id; }); });
    if (!toAdd.length) {
        return linkedField;
    }
    return __assign(__assign({}, linkedField), { selections: __spread(toAdd.map(function (add) {
            var field = schema
                .getFields(schema.getRawType(linkedField.type))
                .find(function (f) { return f.name === add; });
            return {
                kind: "ScalarField",
                alias: field.name,
                args: [],
                directives: [],
                handles: null,
                loc: { kind: "Generated" },
                metadata: null,
                name: field.name,
                type: field.type,
            };
        }), linkedField.selections) });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVNjcmlwdEdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UeXBlU2NyaXB0R2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBVXdCO0FBQ3hCLDJEQUE2RDtBQUk3RCxpRkFBbUY7QUFDbkYsaUdBQW1HO0FBQ25HLDJFQUE2RTtBQUM3RSw2RUFBK0U7QUFDL0UseUdBQTJHO0FBQzNHLCtGQUFpRztBQUNqRywrQkFBaUM7QUFDakMsMkVBSXNDO0FBQ3RDLGFBQWE7QUFDYiw2Q0FBMEM7QUFpQjFDLElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUM3QixJQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztBQUN2QyxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDMUIsSUFBTSx1QkFBdUIsR0FBRyxjQUFjLENBQUM7QUFDL0MsSUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUM7QUFFOUIsUUFBQSxRQUFRLEdBQThCLFVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPO0lBQ3ZFLElBQU0sR0FBRyxHQUFtQix1QkFBdUIsQ0FDakQsMEJBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FDdEQsQ0FBQztJQUVGLGFBQWE7SUFDYiw4QkFBOEI7SUFFOUIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFdkUsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUNwQyxpQkFBaUIsRUFDakIsRUFBRSxFQUNGLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUN0QixLQUFLLEVBQ0wsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFF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