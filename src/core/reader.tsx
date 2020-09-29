import {
  getStorageKey,
  SelectorData,
  NormalizationLinkedField,
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

export function createReader(get: any) {
  let seenRecords = new Set<string>();
  let selector: any;
  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    const record = get(dataID);
    if (record == null) {
      // if (record === undefined) {
      //   this._isMissingData = true;
      // }
      return record;
    }
    const data = prevData || {};
    traverseSelections(node.selections, record, data);
    if (
      !(data[constants.FRAGMENT_OWNER_KEY] && Object.keys(data).length === 3)
    ) {
      seenRecords.add(dataID);
    }
    return data;
  }
  function readScalar(field: ReaderScalarField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = record[storageKey];
    data[applicationName] = value;
    return value;
  }
  function readPluralLink(field: ReaderLinkedField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    let linkedIDs = record[storageKey];
    if (linkedIDs === undefined) {
      return null;
    }
    linkedIDs = linkedIDs[constants.REFS_KEY];
    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        return null;
      }
      return null;
    }
    // const prevData = data[applicationName];
    // invariant(
    //   prevData == null || Array.isArray(prevData),
    //   "RelayReader(): Expected data for field `%s` on record `%s` " +
    //     "to be an array, got `%s`.",
    //   applicationName,
    //   RelayModernRecord.getDataID(record),
    //   prevData
    // );
    // const linkedArray = prevData || [];
    const linkedArray: any[] = [];
    linkedIDs.forEach((linkedID: string, nextIndex: number) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          // this._isMissingData = true;
        }
        // $FlowFixMe[cannot-write]
        linkedArray[nextIndex] = linkedID;
        return;
      }
      const prevItem = null;
      // linkedArray.push(nextIndex);
      // invariant(
      //   prevItem == null || typeof prevItem === "object",
      //   "RelayReader(): Expected data for field `%s` on record `%s` " +
      //     "to be an object, got `%s`.",
      //   applicationName,
      //   RelayModernRecord.getDataID(record),
      //   prevItem
      // );
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[incompatible-variance]
      linkedArray.push(traverse(field, linkedID, prevItem));
    });
    data[applicationName] = linkedArray;
    return linkedArray;
  }
  function readLink(field: ReaderLinkedField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const linkedID = record[storageKey];
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        return null;
      }
      return linkedID;
    }
    const prevData = data[applicationName];
    // invariant(
    //   prevData == null || typeof prevData === "object",
    //   "RelayReader(): Expected data for field `%s` on record `%s` " +
    //     "to be an object, got `%s`.",
    //   applicationName,
    //   RelayModernRecord.getDataID(record),
    //   prevData
    // );
    // $FlowFixMe[incompatible-variance]
    const value = traverse(field, linkedID[constants.REF_KEY], prevData);
    data[applicationName] = value;
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
    // invariant(
    //   typeof fragmentPointers === "object" && fragmentPointers != null,
    //   "RelayReader: Expected fragment spread data to be an object, got `%s`.",
    //   fragmentPointers
    // );
    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = record[constants.ID_KEY];
    }
    // $FlowFixMe[cannot-write] - writing into read-only field
    fragmentPointers[fragmentSpread.name] =
      // fragmentSpread.args
      // ? getArgumentValues(fragmentSpread.args, this._variables)
      // :
      {};
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

export function readFragmentAsFields<TData>(
  getter: any,
  selector: SingularReaderSelector
) {
  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    const data = prevData || {};
    traverseSelections(node.selections, dataID, data);
    return data;
  }
  function readScalar(field: ReaderScalarField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = getter({ id: dataID, field: storageKey });
    data[applicationName] = value;
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
          if ((selection as ReaderLinkedField).plural) {
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
  return traverse(node, dataID, null) as TData;
}
