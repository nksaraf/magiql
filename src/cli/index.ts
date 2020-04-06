import { generate, parseArgv, createContext } from "@graphql-codegen/cli";


async function run() {
  const cliFlags = parseArgv(process.argv);
  cliFlags.config = cliFlags.config ?? ".graphqlconfig.yml";
  const context = await createContext(cliFlags);
  const config = context.getConfig();
  config.overwrite = true;
  config.generates = {
    ...config.generates,
    // [process.cwd() + "/node_modules/magiql/dist/types/graphql.d.ts"]: {
    //   plugins: ["magiql/codegen"],
    //   config: { avoidOptionals: true },
    // },
    [process.cwd() + "/node_modules/magiql/dist/types/graphql.d.ts"]: {
      plugins: ["magiql/codegen"],
      config: { avoidOptionals: true, noExport: true, mode: 'magiql-query' },
    },
    [process.cwd() + "/node_modules/magiql/dist/types/hooks.d.ts"]: {
      plugins: ["typescript", "typescript-operations", "magiql/codegen"],
      config: { mode: 'magiql-hooks', preResolveTypes: true,
      flattenGeneratedTypes: true },
    },
  };
  await generate(config, true);
};

run().catch(error => console.log(error));
