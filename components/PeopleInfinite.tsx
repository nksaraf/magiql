import React from "react";
import { useInfiniteQuery, graphql, useQuery } from "magiql";
import { People } from "./Person";
import { PeopleInfiniteQuery } from "../generated/PeopleInfiniteQuery.graphql";
import Link from "next/link";
import { infiniteQuery } from "./code";

export function PeopleInfinite() {
  const {
    data,
    fetchMore,
    status,
    isLoading,
    isFetchingMore,
  } = useInfiniteQuery<PeopleInfiniteQuery>(
    graphql`
      query PeopleInfiniteQuery($limit: Int = 10, $after: String) {
        allPeople(first: $limit, after: $after) {
          edges {
            node {
              id
              ...Person_person
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
      <Header>useInfiniteQuery</Header>
      <main>
        <code style={{ fontFamily: "Roboto Mono" }}>
          <b>status:</b> {status}
        </code>
        <Actions>
          <ActionButton
            onClick={() => {
              fetchMore();
            }}
          >
            Fetch more
          </ActionButton>
        </Actions>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            {data?.map((page, index) => (
              <React.Fragment key={index}>
                {page
                  ? page.allPeople?.edges?.map((edge) => (
                      <People key={edge.node.id} person={edge.node} />
                    ))
                  : null}
              </React.Fragment>
            ))}
            {isFetchingMore && "Fetching more..."}
          </div>
          <pre style={{ fontFamily: "Roboto Mono", flex: 1 }}>
            {infiniteQuery}
          </pre>
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
