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
        $where: todos_bool_exp = { created_at: { _lt: "now()" } }
      ) {
        todos(order_by: { created_at: desc }, where: $where, limit: $limit) {
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
      },
      getFetchMore: (lastpage) =>
        lastpage.todos.length > 0
          ? {
              where: {
                id: { _lt: 5 },
                created_at: {
                  _lt: lastpage.todos[lastpage.todos.length - 1].created_at,
                },
              },
            }
          : null,
    }
  );

  if (typeof window !== "undefined") {
    window.client = client;
  }

  console.log(data);

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
