import { TypeGenerator } from "relay-compiler";
import * as Printer from "relay-compiler/lib/core/IRPrinter";
import * as IRTransformer from "relay-compiler/lib/core/IRTransformer";
import * as FlattenTransform from "relay-compiler/lib/transforms/FlattenTransform";
import * as InlineFragmentsTransform from "relay-compiler/lib/transforms/InlineFragmentsTransform";
import * as MaskTransform from "relay-compiler/lib/transforms/MaskTransform";
import * as MatchTransform from "relay-compiler/lib/transforms/MatchTransform";
import * as RefetchableFragmentTransform from "relay-compiler/lib/transforms/RefetchableFragmentTransform";
import * as RelayDirectiveTransform from "relay-compiler/lib/transforms/RelayDirectiveTransform";

// Should match FLOW_TRANSFORMS array
// https://github.com/facebook/relay/blob/v10.0.0/packages/relay-compiler/language/javascript/RelayFlowGenerator.js#L982

export const MagiqlQueryTransform = {
  transformWithOptions({ keyFields }) {
    return (context: any) => {
      function visitLinkedFieldId(this: any, linkedField: any) {
        linkedField = this.traverse(linkedField);
        const context = this.getContext();
        const schema = context.getSchema();
        const typeIdFields = 
        
        (keyFields as any)[
          schema.getRawType(linkedField.type).name as string
        ];

        if (!typeIdFields) {
          return linkedField;
        }

        const toAdd = (typeIdFields || []).filter(
          (id: string) =>
            !linkedField.selections.find((sel: any) => sel.name === id)
        );

        if (!toAdd.length) {
          return linkedField;
        }

        return {
          ...linkedField,
          selections: [
            ...toAdd.map((add: string) => {
              const field = schema
                .getFields(schema.getRawType(linkedField.type))
                .find((f: any) => f.name === add);
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
            }),
            ...linkedField.selections,
          ],
        };
      }

      const inlinedContext = context.applyTransforms([
        InlineFragmentsTransform.transform,
        FlattenTransform.transformWithOptions({}),
        (context) => {
          return IRTransformer.transform(context, {
            LinkedField: visitLinkedFieldId,
          });
        },
      ]);

      return IRTransformer.transform(context, {
        Root: (root: any) => ({
          ...root,
          query: Printer.print(
            context.getSchema(),
            // @ts-ignore
            inlinedContext.get(root.name)
          ),
        }),
      });
    };
  },
};

export const transforms: TypeGenerator["transforms"] = [
  RelayDirectiveTransform.transform,
  MaskTransform.transform,
  MatchTransform.transform,
  FlattenTransform.transformWithOptions({}),
  RefetchableFragmentTransform.transform,
];
