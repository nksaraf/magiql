import React from "react";
import { graphql, usePaginatedQuery } from "magiql";
import { Person } from "./Person";
import { PeoplePaginatedQuery } from "../generated/PeoplePaginatedQuery.graphql";
import Link from "next/link";
import { NavBar } from "./NavBar";
import { Header } from "./ActionButton";

export function PeoplePaginated() {
  const [state, setState] = React.useState(10);
  const { resolvedData } = usePaginatedQuery<PeoplePaginatedQuery>(
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
      <NavBar />
      <Header>usePaginatedQuery</Header>
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
          <Person key={node.node.id} person={node.node} />
        ))}
      </div>
    </div>
  );
}
