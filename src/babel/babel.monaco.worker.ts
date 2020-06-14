import * as Babel from "@babel/standalone";
import babel from ".";
import { initialize, BaseWorker } from "next-monaco-editor/worker";

// const
export class BabelWorker extends BaseWorker {
  Babel = Babel;
  constructor(ctx, options) {
    super(ctx, options);
    Babel.registerPlugin("magiql", babel);
  }

  transform(path) {
    try {
      return Babel.transform(this.getText(path), {
        presets: [
          "env",
          ["typescript", { isTsx: true, allExtensions: true }],
          // "next",
        ],
        filename: "babel.ts",
        plugins: ["magiql"],
      }).code;
    } catch (e) {
      return e.toString();
    }
  }
}

initialize(BabelWorker);
