import * as Babel from "@babel/standalone";
import syntaxJsx from "@babel/plugin-syntax-jsx";
import babel from ".";
import {
  monacoWorker,
  initialize,
  BaseWorker,
} from "next-monaco-editor/worker";

// const
class BabelWorker extends BaseWorker {
  constructor(ctx, options) {
    super(ctx, options);
    Babel.registerPlugin("magiql", babel);
  }

  transform(path) {
    try {
      return Babel.transform(this.getText(path), {
        presets: [
          "react",
          ["typescript", { isTsx: true, allExtensions: true }],
        ],
        filename: "babel.ts",
        plugins: ["magiql"],
      }).code;
    } catch (e) {
      return e.message;
    }
  }
}

initialize(BabelWorker);
