import {
  enumType,
  list,
  makeSchema,
  nonNull,
  objectType,
  queryType,
  stringArg,
} from "@nexus/schema";
import { join } from "path";
import fetch from "isomorphic-unfetch";
const omdb = new (require("omdbapi"))("e776345a");

const MovieType = enumType({
  name: "MovieType",
  description: "A movie, series, or and episode",
  members: [
    {
      name: "MOVIE",
      value: "movie",
      description: "a cinema film",
    },
    {
      name: "SERIES",
      value: "series",
      description: "a set or sequence of related television programmes",
    },
    {
      name: "EPISODE",
      value: "episode",
      description:
        "each of the separate instalments into which a television programme is divided",
    },
  ],
});

const Pokemon = objectType({
  name: "Pokemon",
  definition(t) {
    t.id("id");
    t.string("name");
    t.int("hp");
    t.int("attack");
    t.int("defense");
    t.int("specialAttack");
    t.int("specialDefense");
    t.field("types", {
      type: list(PokemonType),
    });
    t.field("sprites", {
      type: PokemonSprite,
    });
  },
});

const types = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PokemonType = objectType({
  name: "PokemonType",
  definition(t) {
    t.field("name", { type: PokemonTypeEnum });
    t.id("id");
    t.string("color");
  },
});

const PokemonTypeEnum = enumType({
  name: "PokemonTypeEnum",
  members: Object.keys(types).map((type) => ({
    name: type.toUpperCase(),
    value: type.charAt(0).toUpperCase() + type.substr(1),
  })),
});

const PokemonSprite = objectType({
  name: "PokemonSprite",
  definition(t) {
    t.string("normal");
    t.string("large");
    t.string("animated");
  },
});

let _db;
const db = async () => {
  if (!_db) {
    _db = await (
      await fetch(
        "https://raw.githubusercontent.com/joseluisq/pokemons/master/pokemons.json"
      )
    ).json();
  }
  return _db.results.filter((p) => p.evolution === null);
};

const Query = queryType({
  definition(t) {
    t.string("hello", {
      args: { name: stringArg() },
      resolve: (parent, { name }) => `Hello ${name || "World"}!`,
    });
    t.field("pokemon", {
      type: Pokemon,
      description: "Find a movie, series or epidsode by its title",
      args: {
        title: nonNull(stringArg()),
      },
      resolve: async (root, { title }) => {
        const poke = await db();
        console.log(poke[0]);
        return mapPoke(poke[0]);
      },
    });
    t.field("pokemons", {
      type: list(Pokemon),
      description: "Find a movie, series or epidsode by its title",
      resolve: async (root) => {
        await sleep(3000);
        const poke = await db();
        return poke.slice(0, 10).map(mapPoke);
      },
    });
  },
});

function mapPoke(pok) {
  return {
    ...pok,
    types: pok.type.map((t) => ({
      name: t,
      color: types[t.toLowerCase()],
      id: t.toLowerCase(),
    })),
    id: pok.national_number,
  };
}

export const schema = makeSchema({
  types: [Query], // 1
  outputs: {
    typegen: join(__dirname, "..", "schema.types.ts"), // 2
    schema: join(__dirname, "..", "schema.graphql"), // 3
  },
});

import {
  getGraphQLParameters,
  processRequest,
  shouldRenderGraphiQL,
} from "graphql-helix";

import renderGraphiQL from "graphiql-playground";

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

export default allowCors(async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if (shouldRenderGraphiQL(request)) {
    res.send(renderGraphiQL({ endpoint: "/api/graphql" }));
  } else {
    const { operationName, query, variables } = getGraphQLParameters(request);

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
    });

    if (result.type === "RESPONSE") {
      result.headers.forEach(({ name, value }) => res.setHeader(name, value));
      res.status(result.status);
      res.json(result.payload);
    } else if (result.type === "MULTIPART_RESPONSE") {
      res.writeHead(200, {
        Connection: "keep-alive",
        "Content-Type": 'multipart/mixed; boundary="-"',
        "Transfer-Encoding": "chunked",
      });

      req.on("close", () => {
        result.unsubscribe();
      });

      res.write("---");

      await result.subscribe((result) => {
        const chunk = Buffer.from(JSON.stringify(result), "utf8");
        const data = [
          "",
          "Content-Type: application/json; charset=utf-8",
          "Content-Length: " + String(chunk.length),
          "",
          chunk,
        ];

        if (result.hasNext) {
          data.push("---");
        }

        res.write(data.join("\r\n"));
      });

      res.write("\r\n-----\r\n");
      res.end();
    } else {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      req.on("close", () => {
        result.unsubscribe();
      });

      await result.subscribe((result) => {
        res.write(`data: ${JSON.stringify(result)}\n\n`);
      });
    }
  }
});
