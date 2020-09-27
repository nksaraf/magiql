import React from "react";
import { graphql, useQuery } from "magiql";
import { PeopleQuery } from "generated/PeopleQuery.graphql";
import { Actions, ActionButton, Header } from "./ActionButton";
import { NavBar } from "./NavBar";

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
