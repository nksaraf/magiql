import {
  ConcreteRequest,
  RelayConcreteNode,
  NormalizationOperation,
  NormalizationLinkedField,
  NormalizationScalarField,
  NormalizationDefer,
  NormalizationSplitOperation,
  NormalizationStream,
  getStorageKey,
} from "relay-runtime";
import {
  NormalizationClientExtension,
  NormalizationCondition,
  NormalizationInlineFragment,
} from "relay-runtime/lib/util/NormalizationNode";

import { assertBabelPlugin } from "../../utils";
import { constants, GetDataID, Record } from "../types";

export type NormalizationNode =
  | NormalizationClientExtension
  | NormalizationCondition
  | NormalizationDefer
  | NormalizationInlineFragment
  | NormalizationLinkedField
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;

const PREFIX = "client:";

export function generateClientID(
  id: string,
  storageKey: string,
  index?: number
): string {
  let key = id + ":" + storageKey;
  if (index != null) {
    key += ":" + index;
  }
  if (key.indexOf(PREFIX) !== 0) {
    key = PREFIX + key;
  }
  return key;
}

export const defaultGetDataId = (record, type) =>
  record.id ? `${type}:${record.id}` : null;

export function createRelayNormalizer({
  getDataID = defaultGetDataId,
}: {
  getDataID: GetDataID;
}) {
  let recordSource: Record = {};
  let variables = {};

  function normalizeLink(
    field: NormalizationLinkedField,
    record: Record,
    storageKey: string,
    fieldValue: any
  ) {
    const type = field.concreteType ?? fieldValue[constants.TYPENAME_KEY];
    const linkId =
      getDataID(fieldValue, type) ??
      record[storageKey]?.[constants.REF_KEY] ??
      generateClientID(record[constants.ID_KEY], storageKey);

    const link: any = {};
    link[constants.REF_KEY] = linkId;
    record[storageKey] = link;

    let nextRecord = recordSource[linkId];
    if (!nextRecord) {
      nextRecord = {
        [constants.ID_KEY]: linkId,
        [constants.TYPENAME_KEY]: type,
      };
      recordSource[linkId] = nextRecord;
    }

    traverseSelections(field, nextRecord, fieldValue);
  }

  function normalizePluralLink(
    field: NormalizationLinkedField,
    record: Record,
    storageKey: string,
    fieldValue: any
  ) {
    const type = field.concreteType;
    const ids: (string | null)[] = [];
    fieldValue.forEach((item: any, index: number) => {
      if (item === null) {
        ids.push(null);
        return;
      }

      const linkId =
        getDataID(item, type) ??
        generateClientID(record[constants.ID_KEY], storageKey, index);

      ids.push(linkId);

      let nextRecord = recordSource[linkId];
      if (!nextRecord) {
        nextRecord = {
          [constants.ID_KEY]: linkId,
          [constants.TYPENAME_KEY]: type,
        };
        recordSource[linkId] = nextRecord;
      }

      traverseSelections(field, nextRecord, item);
    });
    record[storageKey] = {
      [constants.REFS_KEY]: ids,
    };
  }

  function normalizeField(
    node: NormalizationNode,
    selection: NormalizationLinkedField | NormalizationScalarField,
    record: Record,
    data: any
  ) {
    const responseKey = selection.alias ?? selection.name;
    const storageKey = getStorageKey(selection as any, variables);
    // const storageKey = getStorageKey(selection, this._variables);
    const fieldValue = data[responseKey];

    if (fieldValue === null) {
      record[storageKey] = fieldValue;
    } else if (selection.kind === RelayConcreteNode.SCALAR_FIELD) {
      record[storageKey] = fieldValue;
    } else if (
      selection.kind === RelayConcreteNode.LINKED_FIELD &&
      (selection as NormalizationLinkedField)
    ) {
      if ((selection as NormalizationLinkedField).plural) {
        normalizePluralLink(
          selection as NormalizationLinkedField,
          record,
          storageKey,
          fieldValue
        );
      } else {
        normalizeLink(
          selection as NormalizationLinkedField,
          record,
          storageKey,
          fieldValue
        );
      }
    }
  }

  function traverseSelections(
    node: NormalizationNode,
    record: Record,
    data: any
  ) {
    // go thru selections
    node.selections.forEach((selection) => {
      switch (selection.kind) {
        case RelayConcreteNode.LINKED_FIELD:
        case RelayConcreteNode.SCALAR_FIELD: {
          normalizeField(
            node,
            selection as NormalizationLinkedField | NormalizationScalarField,
            record,
            data
          );
        }
      }
    });
  }

  function normalizeResponse(node: ConcreteRequest, data: any, vars: any) {
    assertBabelPlugin(node.operation);

    variables = vars;
    recordSource = {};
    const record = {
      [constants.ID_KEY]: constants.ROOT_ID,
      [constants.TYPENAME_KEY]: constants.ROOT_TYPE,
    };

    recordSource[constants.ROOT_ID] = record;
    traverseSelections(node.operation, record, data);
    return recordSource;
  }

  return {
    normalizeResponse,
  };
}
