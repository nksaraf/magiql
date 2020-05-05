import { generate, parseArgv, createContext } from "@graphql-codegen/cli";
import path from "path";

const pluginPath = "magiql/codegen";
const outputPath = "/node_modules/magiql/dist";

// const pluginPath = "./dist/cjs/codegen";
// const outputPath = "/dist";

async function run() {
  const cliFlags = parseArgv(process.argv);
  cliFlags.config = cliFlags.config ?? ".graphqlconfig.yml";
  const context = await createContext(cliFlags);
  const { documents, ...config } = context.getConfig();
  config.overwrite = true;
  config.hooks = {
    ...(config.hooks as any),
    afterOneFileWrite: "prettier --write --with-node-modules",
  };

  const magiqlGenerate = {
    [path.join(process.cwd(), outputPath, "/types/graphql.d.ts")]: {
      plugins: [pluginPath],
      config: {
        avoidOptionals: true,
        preResolveTypes: true,
        flattenGeneratedTypes: true,
        noExport: true,
        mode: "magic",
      },
    },
  };

  const hooksGenerate = {
    [path.join(process.cwd(), outputPath, "/types/hooks.d.ts")]: {
      plugins: ["typescript", "typescript-operations", pluginPath],
      config: {
        mode: "hooks-types",
        // avoidOptionals: false,
        preResolveTypes: true,
        flattenGeneratedTypes: true,
      },
    },
    [path.join(process.cwd(), outputPath, "/esm/hooks.js")]: {
      plugins: [pluginPath],
      config: { mode: "hooks-esm" },
    },
    [path.join(process.cwd(), outputPath, "/cjs/development/hooks.js")]: {
      plugins: [pluginPath],
      config: { mode: "hooks-cjs" },
    },
    [path.join(process.cwd(), outputPath, "/cjs/production/hooks.js")]: {
      plugins: [pluginPath],
      config: { mode: "hooks-cjs" },
    },
  };
  try {
    const magiqlConfig = {
      ...config,
      generates: {
        ...config.generates,
        ...magiqlGenerate,
      },
    };
    await generate(magiqlConfig, true);
  } catch (e) {
    process.exit(0);
  }
  try {
    const hooks = await context.loadDocuments(documents as any);
    if (hooks.length > 0) {
      const hooksConfig = {
        ...config,
        documents,
        generates: {
          ...config.generates,
          ...hooksGenerate,
        },
      };
      await generate(hooksConfig, true);
    }
  } catch (e) {}
}

run().catch((error) => console.log(error));
