import { generate, parseArgv, createContext } from "@graphql-codegen/cli";
import path from 'path';

const pluginPath = "magiql/codegen";
const outputPath = "/node_modules/magiql/dist";

// const pluginPath = "./dist/codegen";
// const outputPath = "/dist";

async function run() {
  const cliFlags = parseArgv(process.argv);
  cliFlags.config = cliFlags.config ?? ".graphqlconfig.yml";
  const context = await createContext(cliFlags);
  const config = context.getConfig();
  config.overwrite = true;
  config.hooks = {
    ...config.hooks,
    afterOneFileWrite: 'prettier --write --with-node-modules'
  }
  config.generates = {
    ...config.generates,
    // [process.cwd() + "/node_modules/magiql/dist/types/graphql.d.ts"]: {
    //   plugins: ["magiql/codegen"],
    //   config: { avoidOptionals: true },
    // },
    [path.join(process.cwd(), outputPath, "/types/graphql.d.ts")]: {
      plugins: [pluginPath],
      config: { avoidOptionals: true, noExport: true, mode: 'magic' },
    },
    [path.join(process.cwd(), outputPath, "/types/hooks.d.ts")]: {
      plugins: ["typescript", "typescript-operations", pluginPath],
      config: { mode: 'hooks-types', preResolveTypes: true,
      flattenGeneratedTypes: true },
    },
    [path.join(process.cwd(), outputPath, "/esm/hooks.js")]: {
      plugins: [pluginPath],
      config: { mode: 'hooks-esm' },
    },
    [path.join(process.cwd(), outputPath, "/cjs/hooks.js")]: {
      plugins: [pluginPath],
      config: { mode: 'hooks-cjs' },
    },
  };
  await generate(config, true);
};

run().catch(error => console.log(error));
