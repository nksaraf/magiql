import React from "react";
import { graphql, useQuery } from "magiql";
import { PeopleQuery } from "generated/PeopleQuery.graphql";
import { Actions, ActionButton, Header } from "./ActionButton";
import { NavBar } from "./NavBar";
import { Person_person, Person } from "./Person";

export function People() {
  const { data, status } = useQuery<PeopleQuery>(
    graphql`
      query PeopleQuery($after: String) {
        allPeople(first: 10, after: $after) {
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

      ${Person_person}
    `,
    {
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
                  <Person key={edge.node.id} person={edge.node} />
                ))
              : null}
          </div>
        </div>
      </main>
    </>
  );
}
