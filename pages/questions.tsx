import Link from "next/link";
import Layout from "../examples/components/Layout";
import { useQuery, graphql, usePaginatedQuery, useInfiniteQuery } from "../src";
import { questionsQuery } from "../generated/graphql/questionsQuery.graphql";
import { People } from "../examples/components/People";
import React, { Fragment } from "react";

const AboutPage = () => {
  const [state, setState] = React.useState(10);
  const { data, fetchMore, store } = useInfiniteQuery<questionsQuery>(
    graphql`
      query questionsQuery(
        $limit: Int = 10
        $createdAt: timestamptz = "now()"
      ) {
        posts(
          limit: $limit
          where: { createdAt: { _lt: $createdAt } }
          order_by: { createdAt: desc } # where: { communities: { community: { communityId: { _eq: 5818 } } } }
        ) {
          createdAt
          answer {
            body
          }
          ...People_person
        }
      }
    `,
    {
      variables: {
        limit: state,
      },
      getFetchMore: (lastpage) => ({
        createdAt: lastpage.posts[lastpage.posts.length - 1].createdAt,
      }),
    }
  );

  return (
    <Layout title="About | Next.js + TypeScript Example">
      <button
        onClick={() => {
          // getStorageKey();
          setState((state) => state + 1);
        }}
      >
        +1
      </button>
      <button
        onClick={() => {
          // getStorageKey();
          setState((state) => state - 1);
        }}
      >
        -1
      </button>
      <button
        onClick={() => {
          store.updateRecord(store.getDataID({ questionId: 26 }, "questions"), {
            body: Math.random(),
          });
        }}
      >
        Set
      </button>
      <button
        onClick={() => {
          // getStorageKey();
          fetchMore();
        }}
      >
        Refetch
      </button>
      {/* {status.state} */}
      <h1>About</h1>
      <p>This is the about page</p>
      <Link href="/">
        <a>Go home</a>
      </Link>
      {data?.map((page, index) => (
        <Fragment key={index}>
          {page?.posts?.map((post, index) =>
            post ? <People key={index} person={post} /> : null
          )}
        </Fragment>
      ))}
    </Layout>
  );
};

export default AboutPage;
