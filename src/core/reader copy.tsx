import {
  getStorageKey,
  SelectorData,
  NormalizationLinkedField,
  ReaderField,
} from "relay-runtime";
import {
  constants,
  RelayConcreteNode,
  SingularReaderSelector,
  ReaderFragmentSpread,
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
  ReaderNode,
  Record,
} from "./types";

const fieldReader = (get, subscribe) => ({
  readField: (field: ReaderField, variables, dataID) => {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);
    const value = get({ id: dataID, field: storageKey });
    return { fieldName, value };
  },
  readRecord: (node, dataID) => {
    return dataID;
  },
});
const recordReader = (get, subscribe) => ({
  readField: (field: ReaderField, variables, record) => {
    const fieldName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, variables);
    const value = record[storageKey];
    return { fieldName, value };
  },
  readRecord: (node, dataID) => {
    return get(dataID);
  },
  subscribeToRecord: (dataID) => {
    subscribe(dataID);
  },
  subscribeToField: (dataID) => {
    subscribe(dataID);
  },
});

function hasData(data) {
  return !(
    data[constants.FRAGMENT_OWNER_KEY] && Object.keys(data).length === 3
  );
}

export function createReader(get: any) {
  let seenRecords = new Set<string>();
  let selector: any;
  const reader = recordReader(get, (dataID) => {
    seenRecords.add(dataID);
  });

  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    const record = reader.readRecord(node, dataID);
    if (record == null) {
      return record;
    }

    const data = prevData || {};
    traverseSelections(node.selections, record, data);
    if (hasData(data)) {
      reader.subscribe(dataID);
    }
    return data;
  }
  function readScalar(field: ReaderScalarField, record: Record, data: any) {
    const { fieldName, value } = reader.readField(
      field,
      selector.variables,
      record
    );
    data[fieldName] = value;
    return value;
  }
  function readPluralLink(field: ReaderLinkedField, record: Record, data: any) {
    let { fieldName, value } = reader.readField(
      field,
      selector.variables,
      record
    );

    if (value === undefined) {
      return null;
    }
    let linkedIDs = value[constants.REFS_KEY];
    if (linkedIDs == null) {
      data[fieldName] = linkedIDs;
      if (linkedIDs === undefined) {
        return null;
      }
      return null;
    }

    const linkedArray: any[] = [];
    linkedIDs.forEach((linkedID: string, nextIndex: number) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
        }
        linkedArray[nextIndex] = linkedID;
        return;
      }
      const prevItem = null;
      linkedArray.push(traverse(field, linkedID, prevItem));
    });
    data[fieldName] = linkedArray;
    return linkedArray;
  }
  function readLink(field: ReaderLinkedField, record: Record, data: any) {
    let { fieldName, value: linkedID } = reader.readField(
      field,
      selector.variables,
      record
    );
    if (linkedID == null) {
      data[fieldName] = linkedID;
      if (linkedID === undefined) {
        return null;
      }
      return linkedID;
    }
    const prevData = data[fieldName];
    const value = traverse(field, linkedID[constants.REF_KEY], prevData);
    data[fieldName] = value;
    return value;
  }
  function createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: Record,
    data: SelectorData
  ): void {
    let fragmentPointers: any = data[constants.FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[constants.FRAGMENTS_KEY] = {};
    }

    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = record[constants.ID_KEY];
    }
    fragmentPointers[fragmentSpread.name] = {};
    data[constants.FRAGMENT_OWNER_KEY] = selector.owner;
  }
  function traverseSelections(
    selections: readonly ReaderSelection[],
    record: Record,
    data: SelectorData
  ) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case RelayConcreteNode.SCALAR_FIELD:
          readScalar(selection as ReaderScalarField, record, data);
          break;
        case RelayConcreteNode.LINKED_FIELD:
          const storageKey = getStorageKey(
            selection as NormalizationLinkedField,
            selector.variables
          );

          if (
            (selection as ReaderLinkedField).plural ||
            record[storageKey]?.[constants.REFS_KEY]
          ) {
            readPluralLink(selection as ReaderLinkedField, record, data);
          } else {
            readLink(selection as ReaderLinkedField, record, data);
          }
          break;
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
  function reset() {
    seenRecords = new Set();
  }
  function read<TData>(reader: SingularReaderSelector) {
    selector = reader;
    const { node, dataID } = selector;
    return traverse(node, dataID, null) as TData;
  }
  return { read, reset, seenRecords };
}

export const readFragmentAsRecords = (selector, get) => {
  const dataReader = createReader(get);
  const snaphot = dataReader.read<any>(selector as SingularReaderSelector);
  return { data: snaphot, seenRecords: [...dataReader.seenRecords.values()] };
};

export function readFragmentAsFields<TData>(selector: SingularReaderSelector) {
  const reader = fieldReader(getter);

  function readScalar(field: ReaderScalarField, dataID: string, data: any) {
    const { fieldName, value } = reader.readField(
      field,
      selector.variables,
      dataID
    );
    data[fieldName] = value;
    return value;
  }
  function readPluralLink(field: ReaderLinkedField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = getter({ id: dataID, field: storageKey });
    if (value === null) {
      return null;
    }
    const linkedIDs = value[constants.REFS_KEY];
    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        return null;
      }
      return linkedIDs;
    }
    const linkedArray: any[] = [];
    linkedIDs.forEach((linkedID: string, nextIndex: number) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          return null;
        }
        // $FlowFixMe[cannot-write]
        linkedArray.push(null);
        return;
      }
      const prevItem = null;
      linkedArray.push(traverse(field, linkedID, prevItem));
    });
    data[applicationName] = linkedArray;
    return linkedArray;
  }
  function readLink(field: ReaderLinkedField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const linkedID = getter({ id: dataID, field: storageKey });
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        return null;
      }
      return linkedID;
    }
    const prevData = data[applicationName];
    const value = traverse(field, linkedID[constants.REF_KEY], prevData);
    data[applicationName] = value;
    return value;
  }
  function createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    dataID: string,
    data: SelectorData
  ): void {
    let fragmentPointers: any = data[constants.FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[constants.FRAGMENTS_KEY] = {};
    }
    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = dataID;
    }
    fragmentPointers[fragmentSpread.name] = {};
    data[constants.FRAGMENT_OWNER_KEY] = selector.owner;
  }
  function traverseSelections(
    selections: readonly ReaderSelection[],
    dataID: string,
    data: SelectorData
  ) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case RelayConcreteNode.SCALAR_FIELD:
          readScalar(selection as ReaderScalarField, dataID, data);
          break;
        case RelayConcreteNode.LINKED_FIELD:
          const storageKey = getStorageKey(
            selection as NormalizationLinkedField,
            selector.variables
          );

          console.log(storageKey, data);

          if (
            (selection as ReaderLinkedField).plural ||
            data[storageKey]?.[constants.REFS_KEY]
          ) {
            readPluralLink(selection as ReaderLinkedField, dataID, data);
          } else {
            readLink(selection as ReaderLinkedField, dataID, data);
          }
          break;
        case RelayConcreteNode.FRAGMENT_SPREAD:
          createFragmentPointer(
            selection as ReaderFragmentSpread,
            dataID,
            data
          );
          break;
      }
    }
  }
  const { node, dataID } = selector;
  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    const data = prevData || {};
    traverseSelections(node.selections, dataID, data);
    return data;
  }

  return traverse(node, dataID, null) as TData;
}

interface Reader<TRecord> {
  readField: (
    field: ReaderField,
    variables: any,
    record: TRecord
  ) => { fieldName: string; value: any };
  readRecord: (node: ReaderNode, dataID: string) => TRecord;
  subscribeToRecord: (dataID: string) => void;
  subscribeToField: () => {};
}

function readFragment<TData, TRecord extends string>(
  reader: Reader<TRecord>,
  selector
) {
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
      data[constants.ID_KEY] = dataID;
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

          if (field.plural || isRefs(value)) {
            // readPluralLink(selection as ReaderLinkedField, record, data);
          } else {
            if (value == null) {
              data[fieldName] = null;
              return null;
            }

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
      reader.subscribeToRecord(dataID);
    }
    return data;
  }

  const { node, dataID } = selector;
  return traverse(node, dataID, null) as TData;
}

function isRefs(value) {
  return typeof value === "object" && Boolean(value[constants.REFS_KEY]);
}

function isRef(value) {
  return typeof value === "object" && Boolean(value[constants.REF_KEY]);
}
