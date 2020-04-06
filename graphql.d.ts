type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** Query any Pokémon by number or name */
type Query = {
   __typename?: 'Query';
  query: Maybe<Query>;
  pokemons: (args: { first: Scalars['Int'] }) => Maybe<Array<Maybe<Pokemon>>>;
  pokemon: (args: { id?: Maybe<Scalars['String']>, name?: Maybe<Scalars['String']> }) => Maybe<Pokemon>;
};


/** Query any Pokémon by number or name */
type QueryPokemonsArgs = {
  first: Scalars['Int'];
};


/** Query any Pokémon by number or name */
type QueryPokemonArgs = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

/** Represents a Pokémon */
type Pokemon = {
   __typename?: 'Pokemon';
  /** The ID of an object */
  id: Scalars['ID'];
  /** The identifier of this Pokémon */
  number: Maybe<Scalars['String']>;
  /** The name of this Pokémon */
  name: Maybe<Scalars['String']>;
  /** The minimum and maximum weight of this Pokémon */
  weight: Maybe<PokemonDimension>;
  /** The minimum and maximum weight of this Pokémon */
  height: Maybe<PokemonDimension>;
  /** The classification of this Pokémon */
  classification: Maybe<Scalars['String']>;
  /** The type(s) of this Pokémon */
  types: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The type(s) of Pokémons that this Pokémon is resistant to */
  resistant: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The attacks of this Pokémon */
  attacks: Maybe<PokemonAttack>;
  /** The type(s) of Pokémons that this Pokémon weak to */
  weaknesses: Maybe<Array<Maybe<Scalars['String']>>>;
  fleeRate: Maybe<Scalars['Float']>;
  /** The maximum CP of this Pokémon */
  maxCP: Maybe<Scalars['Int']>;
  /** The evolutions of this Pokémon */
  evolutions: Maybe<Array<Maybe<Pokemon>>>;
  /** The evolution requirements of this Pokémon */
  evolutionRequirements: Maybe<PokemonEvolutionRequirement>;
  /** The maximum HP of this Pokémon */
  maxHP: Maybe<Scalars['Int']>;
  image: Maybe<Scalars['String']>;
};

/** Represents a Pokémon's dimensions */
type PokemonDimension = {
   __typename?: 'PokemonDimension';
  /** The minimum value of this dimension */
  minimum: Maybe<Scalars['String']>;
  /** The maximum value of this dimension */
  maximum: Maybe<Scalars['String']>;
};

/** Represents a Pokémon's attack types */
type PokemonAttack = {
   __typename?: 'PokemonAttack';
  /** The fast attacks of this Pokémon */
  fast: Maybe<Array<Maybe<Attack>>>;
  /** The special attacks of this Pokémon */
  special: Maybe<Array<Maybe<Attack>>>;
};

/** Represents a Pokémon's attack types */
type Attack = {
   __typename?: 'Attack';
  /** The name of this Pokémon attack */
  name: Maybe<Scalars['String']>;
  /** The type of this Pokémon attack */
  type: Maybe<Scalars['String']>;
  /** The damage of this Pokémon attack */
  damage: Maybe<Scalars['Int']>;
};

/** Represents a Pokémon's requirement to evolve */
type PokemonEvolutionRequirement = {
   __typename?: 'PokemonEvolutionRequirement';
  /** The amount of candy to evolve */
  amount: Maybe<Scalars['Int']>;
  /** The name of the candy to evolve */
  name: Maybe<Scalars['String']>;
};

type TypeMaps = {
  Query: Query;
  Pokemon: Pokemon;
  PokemonDimension: PokemonDimension;
  PokemonAttack: PokemonAttack;
  Attack: Attack;
  PokemonEvolutionRequirement: PokemonEvolutionRequirement;
}


import { UseQueryResult, UseQueryOptions } from './client/hooks';

export function useMagiqlQuery(name: string, options?: UseQueryOptions<any,any>): Omit<UseQueryResult<any,any>, "data"> & { query: Query }

export function useFragment<K extends keyof TypeMaps>(name: K): TypeMaps[K];