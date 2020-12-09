#!/usr/bin/env node
//  @ts-ignore
/**
 * Adapted from https://github.com/facebook/relay/blob/master/packages/relay-compiler/bin/RelayCompilerBin.js
 */

import * as fs from "fs";
import meow from "meow";
import mkdirp from "mkdirp";
import fetch from "node-fetch";
import * as path from "path";
import * as query from "querystringify";
import { relayCompiler } from "relay-compiler";

import { buildClientSchema } from "../node_modules/graphql/utilities/buildClientSchema";
import { getIntrospectionQuery } from "../node_modules/graphql/utilities/getIntrospectionQuery";
import { printSchema } from "../node_modules/graphql/utilities/printSchema";
import { loadConfig } from "./relay-adapter/config";

/**
 *
 * Normalizes header input from CLI
 *
 * @param cli
 */
export function getHeadersFromInput(
  cli: meow.Result<any>
): { key: string; value: string }[] {
  switch (typeof cli.flags.header) {
    case "string": {
      const keys = query.parse(cli.flags.header);
      const key = Object.keys(keys)[0];
      return [{ key, value: keys[key] }];
    }
    case "object": {
      return (cli.flags.header as any).map((header) => {
        const keys = query.parse(header);
        const key = Object.keys(keys)[0];
        return { key, value: keys[key] };
      });
    }
    default: {
      return [];
    }
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: { [key: string]: string };
  json?: boolean;
}

/**
 *
 * Fetch remote schema and turn it into string
 *
 * @param endpoint
 * @param options
 */
export async function getRemoteSchema(
  endpoint: string,
  options: Options
): Promise<
  { status: "ok"; schema: string } | { status: "err"; message: string }
> {
  try {
    const { data, errors } = await fetch(endpoint, {
      method: options.method,
      headers: options.headers,
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    }).then((res) => res.json());

    if (errors) {
      return { status: "err", message: JSON.stringify(errors, null, 2) };
    }

    if (options.json) {
      return {
        status: "ok",
        schema: JSON.stringify(data, null, 2),
      };
    } else {
      const schema = buildClientSchema(data);
      return {
        status: "ok",
        schema: printSchema(schema),
      };
    }
  } catch (err) {
    return { status: "err", message: err.message };
  }
}

/**
 *
 * Prints schema to file.
 *
 * @param dist
 * @param schema
 */
export function printToFile(
  dist: string,
  schema: string
): { status: "ok"; path: string } | { status: "err"; message: string } {
  try {
    const output = path.dirname(path.join(process.cwd(), dist));

    if (!fs.existsSync(output)) {
      mkdirp.sync(output);
    }

    fs.writeFileSync(path.join(process.cwd(), dist), schema);

    return { status: "ok", path: output };
  } catch (err) {
    return { status: "err", message: err.message };
  }
}

const magiql = meow(
  `
Usage: 
  $ magiql schema ENDPOINT_URL --output schema.graphql
Fetch and print the GraphQL schema from a GraphQL HTTP endpoint (Outputs schema in IDL syntax by default).
Options:
  --header, -h    Add a custom header (ex. 'X-API-KEY=ABC123'), can be used multiple times
  --json, -j      Output in JSON format (based on introspection query)
  --method        Use method (GET,POST, PUT, DELETE)
  --output       Save schema to file.
`,
  {
    flags: {
      header: {
        type: "string",
        alias: "h",
      },
      json: {
        type: "boolean",
        alias: "j",
        default: false,
      },
      method: {
        type: "string",
        default: "POST",
      },
      output: {
        type: "string",
      },
      watch: {
        type: "boolean",
        default: false,
      },
    },
  }
);

/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") main(magiql);

/**
 * Main
 */
export async function main(cli: typeof magiql): Promise<void> {
  /* Get remote endpoint from args */
  const [command, endpoint] = cli.input;

  if (command && command === "schema") {
    if (!endpoint) {
      console.warn("No endpoint provided");
      return;
    }

    /* Headers */
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const headers = getHeadersFromInput(cli).reduce(
      (acc, { key, value }) => ({ ...acc, [key]: value }),
      defaultHeaders
    );

    /* Fetch schema */

    const schema = await getRemoteSchema(endpoint, {
      method: cli.flags.method as any,
      headers,
      json: cli.flags.json,
    });

    if (schema.status === "err") {
      console.warn(schema.message);
      return;
    }

    if (cli.flags.output !== undefined) {
      printToFile(cli.flags.output, schema.schema);
    } else {
      console.log(schema.schema);
    }
  } else {
    const {
      schema,
      src,
      artifactDirectory,
      extensions,
      verbose,
      quiet,
      validate,
      watchman,
      language,
      languagePlugin,
      runWithBabel,
      include,
      exclude,
    } = loadConfig();

    relayCompiler({
      schema,
      src,
      artifactDirectory,
      extensions,
      verbose,
      quiet,
      watch: cli.flags.watch,
      validate,
      watchman,
      language: languagePlugin,
      include,
      exclude,
    });
  }
}
