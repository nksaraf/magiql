import { Todo, Todo_todo } from "components/Todo";
import { graphql, useQuery } from "magiql";
import { useRouter } from "next/router";
import React from "react";

export default function TodoPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, status } = useQuery(
    graphql`
      query TodoQuery($id: Int!) {
        todos_by_pk(id: $id) {
          ...Todo_todo
        }
      }

      ${Todo_todo}
    `,
    { variables: { id: Number(id) } }
  );

  return data?.todos_by_pk ? <Todo todo={data.todos_by_pk} /> : null;
}
