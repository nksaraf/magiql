import { setBatch } from "./store/batchedUpdates";

export * from "./client";
// @ts-ignore
import { unstable_batchedUpdates } from "react-native";

setBatch(unstable_batchedUpdates);
