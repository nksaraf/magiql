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
    // Babel.registerPreset("next", nextBabel);
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
