import React from "react";
import { useFragment, graphql, useMutation } from "magiql";
import { ActionButton } from "./ActionButton";
import Link from "next/link";

export const Todo_todo = graphql`
  fragment Todo_todo on todos {
    id
    description
  }
`;

export const Todo = React.memo(
  ({ todo }: { todo: any }) => {
    const data = useFragment(Todo_todo, todo);
    const [mutate] = useMutation(
      graphql`
        mutation updateMutation($id: Int!, $text: String!) {
          update_todos_by_pk(
            pk_columns: { id: $id }
            _set: { description: $text }
          ) {
            id
            description
          }
        }

        ${Todo_todo}
      `,
      {
        optimisticResponse: (vars) => ({
          update_todos_by_pk: {
            __typename: "todos",
            id: vars.id,
            description: vars.text,
          },
        }),
      }
    );
    return (
      <div>
        <Link key={data.id} href={`/todo/${data.id}`}>
          <a>
            <b>{data.id}</b> {data.description}
          </a>
        </Link>
        <ActionButton
          onClick={() => {
            mutate({ id: data.id, text: "task" + Math.random() });
          }}
        >
          Update
        </ActionButton>
      </div>
    );
  }
  // (oldProps, newProps) => oldProps.todo["__id"] === newProps.todo["__id"]
);
