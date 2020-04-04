import Link from "next/link";
import Layout from "../components/Layout";
import {
  MagiqlProvider,
  createClient,
  useQuery,
  gql,
  useMagiqlQuery,
} from "magiql";

const client = createClient("https://graphql-pokemon.now.sh");

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
    return "loading...";
  }
  const { id }: any = (query.pokemon({
    name: "pikachu",
  }) ?? {}) as any;

  return (
    <pre>
      {JSON.stringify({ loading, data: { pokemon: id }, error }, null, 2)}
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
    </Layout>
  </MagiqlProvider>
);

export default IndexPage;
