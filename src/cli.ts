import { generate, loadContext } from '@graphql-codegen/cli';

(async function run() {
  const context = await loadContext('.graphqlconfig.yml');
  const config = context.getConfig();
  config.overwrite = true;
  config.generates = {
    ...config.generates,
    [process.cwd() + '/node_modules/magiql/dist/types/graphql.d.ts']: {
    plugins: ['magiql/codegen'],
    config: { avoidOptionals: true }
  }
};
  await generate(config, true);
})();