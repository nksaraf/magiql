import React from "react";
import { useInfiniteQuery, graphql } from "src/lib";
import { Person, Person_person } from "../components/Person";
import { NavBar } from "../components/NavBar";
import { Header, Actions, ActionButton } from "../components/ActionButton";

export default function PeopleInfinite() {
  const { data, fetchMore, status, isFetchingMore } = useInfiniteQuery(
    graphql`
      query PeopleInfiniteQuery(
        $limit: Int = 10
        $after: String = "YXJyYXljb25uZWN0aW9uOjk="
      ) {
        allPeople(first: $limit, after: $after) {
          edges {
            node {
              id
              name
              homeworld {
                id
                name
              }
              ...Person_person
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
        allFilms {
          edges {
            node {
              id
            }
          }
        }
      }

      ${Person_person}
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
                      <Person key={edge.node.id} person={edge.node} />
                    ))
                  : null}
              </React.Fragment>
            ))}
            {isFetchingMore && "Fetching more..."}
          </div>
        </div>
      </main>
    </>
  );
}
