import React from "react";
import { graphql, usePaginatedQuery } from "magiql";
import { People } from "./Person";
import { PeoplePaginatedQuery } from "../generated/PeoplePaginatedQuery.graphql";
import Link from "next/link";

export function PeoplePaginated() {
  const [state, setState] = React.useState(10);
  const { resolvedData, store, fetchMore } = usePaginatedQuery<
    PeoplePaginatedQuery
  >(
    graphql`
      query PeoplePaginatedQuery($limit: Int = 10) {
        allPeople(first: $limit) {
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
        limit: state,
      },
    }
  );

  return (
    <div>
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
      <h1>
        <code style={{ fontFamily: "Roboto Mono" }}>usePaginatedQuery</code>
      </h1>
      <button
        onClick={() => {
          // getStorageKey();
          setState((state) => state + 1);
        }}
      >
        +1
      </button>
      <button
        style={{
          marginBottom: 16,
        }}
        onClick={() => {
          // getStorageKey();
          setState((state) => state - 1);
        }}
      >
        -1
      </button>
      <div>
        {resolvedData?.allPeople?.edges?.map((node) => (
          <People key={node.node.id} person={node.node} />
        ))}
      </div>
    </div>
  );
}
