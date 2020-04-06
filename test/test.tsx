import Link from "next/link";
import Layout from "../components/Layout";
import {
  MagiqlProvider,
  createClient,
  useQuery,
  gql,
  useMagiqlQuery,
  Pokemon,
  PokemonAttack,
} from "magiql";

const client = createClient("https://graphql-pokemon.now.sh");

gql`
  query pokemonD($name: String) {
    pokemon(name: $name) {
      ...PokDetails
    }
  }

  fragment PokDetails on Pokemon {
    id
    name
  }
`;

// gql``;

const Data = () => {
  const { data, loading, error } = useQuery(
    gql`
      query pokemon($name: String) {
        pokemon(name: $name) {
          id
          number
          name
          attacks {
            special {
              name
              type
              damage
            }
          }
          image
        }
      }
    `,
    {
      variables: {
        name: "pikachu",
      },
    }
  );
  return <pre>{JSON.stringify({ loading, data, error }, null, 2)}</pre>;
};

const OtherData = () => {
  const { query, loading, error } = useMagiqlQuery("data");
  if (loading) {
    return <div>loading...</div>;
  }
  const { id, attacks } =
    query.pokemon({
      name: "pikach",
    }) ?? {};

  const result = (attacks?.fast ?? []).map((f) => f?.name);

  return (
    <pre>
      {JSON.stringify({ loading, data: query, result: result, error }, null, 2)}
    </pre>
  );
};

const IndexPage = () => (
  <MagiqlProvider client={client}>
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
      <OtherData />
      <Data />
    </Layout>
  </MagiqlProvider>
);

export default IndexPage;
