import React from "react";
import { useInfiniteQuery, graphql } from "magiql";
import { Todo, Todo_todo } from "../components/Todo";
import { NavBar } from "../components/NavBar";
import { Header, Actions, ActionButton } from "../components/ActionButton";

export default function PeopleInfinite() {
  const { data, fetchMore, status, isFetchingMore, client } = useInfiniteQuery(
    graphql`
      query todosInfinite(
        $limit: Int
        $before: timestamptz = "now()"
        $in: [Int!]
      ) {
        todos(
          order_by: { created_at: desc }
          where: { id: { _in: $in }, created_at: { _lt: $before } }
          limit: $limit
        ) {
          id
          created_at
          ...Todo_todo
        }
      }

      ${Todo_todo}
    `,
    {
      variables: {
        limit: 2,
        in: null,
      },
      getFetchMore: (lastpage) =>
        lastpage.todos.length > 0
          ? {
              before: lastpage.todos[lastpage.todos.length - 1].created_at,
            }
          : null,
    }
  );

  if (typeof window !== "undefined") {
    // @ts-ignore
    window.client = client;
  }

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
                  ? page.todos?.map((todo) => (
                      <Todo key={todo.id} todo={todo} />
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
