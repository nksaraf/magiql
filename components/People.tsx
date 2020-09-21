import React from "react";
import { graphql, useQuery } from "magiql";
import Link from "next/link";
import { PeopleQuery } from "generated/PeopleQuery.graphql";

export function People() {
  const { data, status } = useQuery<PeopleQuery>(
    graphql`
      query PeopleQuery($limit: Int = 10, $after: String) {
        allPeople(first: $limit, after: $after) {
          edges {
            node {
              id
              name
              homeworld {
                name
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    {
      variables: {
        limit: 10,
      },
      getFetchMore: (lastpage) => ({
        after: lastpage.allPeople.pageInfo.hasNextPage
          ? lastpage.allPeople.pageInfo.endCursor
          : null,
      }),
    }
  );

  return (
    <>
      <NavBar />
      <Header>useQuery</Header>
      <main>
        <code style={{ fontFamily: "Roboto Mono" }}>
          <b>status:</b> {status}
        </code>
        <Actions>
          <ActionButton onClick={() => {}}>Refresh</ActionButton>
        </Actions>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            {data
              ? data.allPeople?.edges?.map((edge) => (
                  <div key={edge.node.id}>
                    <b>{edge.node.name}</b> ({edge.node.homeworld?.name})
                  </div>
                ))
              : null}
          </div>
        </div>
      </main>
    </>
  );
}

function ActionButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

function Actions({ children }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}
function Header({ children }) {
  return (
    <h1>
      <code style={{ fontFamily: "Roboto Mono" }}>{children}</code>
    </h1>
  );
}

function NavBar() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/paginated">
          <a>useQuery</a>
        </Link>
      </code>
      <div style={{ width: 8 }} />
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/infinite">
          <a>useInfiniteQuery</a>
        </Link>
      </code>
      <div style={{ width: 8 }} />
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/paginated">
          <a>usePaginatedQuery</a>
        </Link>
      </code>
    </div>
  );
}
