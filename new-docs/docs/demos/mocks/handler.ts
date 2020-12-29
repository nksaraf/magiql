import { graphql } from 'msw';

const delay = time => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

export const handlers = [
  // Handles a "Login" mutation
  graphql.query('simplePokemonQuery', async (req, res, context) => {
    const db = await fetchDB();
    await delay(1000);
    // throw new Error('hello');
    let start = req.variables.after ?? 0;
    let length = req.variables.limit ?? 5;
    // let end = req.variables.before
    console.log(req, db.slice(start, start + length).map(mapPoke));
    return res(
      context.data({
        pokemons: db.slice(start, start + length),
      }),
    );
  }),
  // Handles a "GetUserInfo" query
];

import { setupWorker } from 'msw';

let _db;

async function fetchDB() {
  if (!_db) {
    _db = await (
      await fetch(
        'https://raw.githubusercontent.com/joseluisq/pokemons/master/pokemons.json',
      )
    ).json();
    _db = _db.results.filter(p => p.evolution === null).map(mapPoke);
    return _db;
  }

  return _db;
}

const types = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function mapPoke(pok) {
  return {
    ...pok,
    types: pok.type.map(t => ({
      name: t,
      __typename: 'PokemonType',
      color: types[t.toLowerCase()],
      id: t.toLowerCase(),
    })),
    __typename: 'Pokemon',
    sprites: {
      ...pok.sprites,
      __typename: 'PokemonSprites',
    },
    id: pok.national_number,
  };
}

fetchDB();

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);
