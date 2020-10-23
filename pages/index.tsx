import React from "react";
import { graphql, useQuery } from "magiql";
import { Actions, ActionButton, Header } from "../components/ActionButton";
import { NavBar } from "../components/NavBar";
import { Person_person, Person } from "../components/Person";
import { useEnvironment } from "magiql/core/EnvironmentContext";
import Link from "next/link";

export default function People() {
  const environment = useEnvironment();

  const { data, status, operation, client } = useQuery(
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
                  <Link key={edge.node.id} href={`/person/${edge.node.id}`}>
                    <a>
                      <Person person={edge.node} />
                    </a>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </main>
    </>
  );
}
