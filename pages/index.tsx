import React from "react";
import { graphql, useMutation, useQuery } from "magiql";
import { Actions, ActionButton, Header } from "../components/ActionButton";
import { NavBar } from "../components/NavBar";
import { Todo, Todo_todo } from "../components/Todo";

import Link from "next/link";
import { stringifyData } from "magiql/utils/stringify";

export default function People() {
  const { data, status } = useQuery(
    graphql`
      query MyQuery($limit: Int) {
        todos(order_by: { updated_at: desc }, limit: $limit) {
          id
          ...Todo_todo
        }
      }

      ${Todo_todo}
    `,
    {
      variables: { limit: 3 },
    }
  );

  const [mutate] = useMutation(
    graphql`
      mutation createTodo($text: String) {
        insert_todos_one(object: { description: $text, is_checked: false }) {
          id
          description
        }
      }
    `,
    {
      invalidateQueries: ["MyQuery"],
    }
  );

  console.log(data);

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
          <ActionButton
            onClick={() => {
              mutate({ text: "random" });
            }}
          >
            Create
          </ActionButton>
        </Actions>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <pre style={{ flex: 1 }}>
            {data
              ? data.todos.map((todo) => <Todo key={todo.id} todo={todo} />)
              : null}
          </pre>
        </div>
      </main>
    </>
  );
}
