import type { SelectorData, ReaderField } from "relay-runtime";
import { getStorageKey } from "relay-runtime/lib/store/RelayStoreUtils";

import {
  constants,
  SingularReaderSelector,
  ReaderFragmentSpread,
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
  ReaderNode,
  Snapshot,
} from "../types";

const RelayConcreteNode = require("relay-runtime/lib/util/RelayConcreteNode");

export const createFieldReader = (get): Reader<string> => ({
  readField: (field: ReaderField, variables, dataID) => {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);
    const value = get({ id: dataID, field: storageKey });
    return { fieldName, value };
  },
  readRecord: (node, dataID) => {
    return dataID;
  },
  getDataID: (record) => {
    return record;
  },
});

export const createRecordReader = (get): Reader<object> => ({
  readField: (field: ReaderField, variables, record) => {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);
    const value = record[storageKey];
    return { fieldName, value };
  },
  getDataID: (record) => {
    return record[constants.ID_KEY];
  },
  readRecord: (node, dataID) => {
    return get(dataID);
  },
});

function hasData(data) {
  return !(
    data[constants.FRAGMENT_OWNER_KEY] && Object.keys(data).length === 3
  );
}

export interface Reader<TRecord> {
  readField: (
    field: ReaderField,
    variables: any,
    record: TRecord
  ) => { fieldName: string; value: any };
  readRecord: (node: ReaderNode, dataID: string) => TRecord;
  getDataID(record: TRecord): string;
}

export function readFragment<TData, TRecord>(
  reader: Reader<TRecord>,
  selector: SingularReaderSelector,
  { onReadField = () => {}, onReadRecord = () => {} }: any = {}
): Snapshot<TData> {
  let isMissingData = false;
  const seenRecords = new Set();

  function createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: TRecord,
    data: SelectorData
  ): void {
    let fragmentPointers: any = data[constants.FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[constants.FRAGMENTS_KEY] = {};
    }
    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = reader.getDataID(record);
    }
    fragmentPointers[fragmentSpread.name] = {};
    data[constants.FRAGMENT_OWNER_KEY] = selector.owner;
  }

  function traverseSelections(
    selections: readonly ReaderSelection[],
    record: TRecord,
    data: SelectorData
  ) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case RelayConcreteNode.SCALAR_FIELD: {
          const field = selection as ReaderScalarField;
          const { fieldName, value } = reader.readField(
            field,
            selector.variables,
            record
          );

          if (value === undefined) {
            isMissingData = true;
          }

          onReadField(reader.getDataID(record), fieldName);
          data[fieldName] = value;
          break;
        }
        case RelayConcreteNode.LINKED_FIELD: {
          const field = selection as ReaderLinkedField;

          const { fieldName, value } = reader.readField(
            field,
            selector.variables,
            record
          );

          onReadField(reader.getDataID(record), fieldName);

          if (value == null) {
            if (value === undefined) {
              isMissingData = true;
            }
            data[fieldName] = null;
            break;
          }
          if (field.plural || isRefs(value)) {
            const linkedIDs = value[constants.REFS_KEY];
            if (linkedIDs == null) {
              if (linkedIDs === undefined) {
                isMissingData = true;
              }
              data[fieldName] = null;
              break;
            }
            const linkedArray: any[] = [];
            linkedIDs.forEach((linkedID: string) => {
              if (linkedID == null) {
                if (linkedID === undefined) {
                  isMissingData = true;
                }
                // $FlowFixMe[cannot-write]
                linkedArray.push(null);
                return;
              }
              const prevItem = null;
              linkedArray.push(traverse(field, linkedID, prevItem));
            });
            data[fieldName] = linkedArray;
          } else {
            data[fieldName] = traverse(
              field,
              value[constants.REF_KEY],
              data[fieldName]
            );
          }
        }
        case RelayConcreteNode.FRAGMENT_SPREAD:
          createFragmentPointer(
            selection as ReaderFragmentSpread,
            record,
            data
          );
          break;
      }
    }
  }

  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    const record = reader.readRecord(node, dataID);
    if (record === null) {
      return null;
    }

    const data = prevData || {};
    traverseSelections(node.selections, record, data);
    if (hasData(data)) {
      onReadRecord(reader.getDataID(record));
    }
    return data;
  }

  const { node, dataID } = selector as SingularReaderSelector;
  const data = traverse(node, dataID, null) as TData;
  return { data, isMissingData, seenRecords: seenRecords as any, selector };
}

function isRefs(value) {
  return typeof value === "object" && Boolean(value?.[constants.REFS_KEY]);
}
