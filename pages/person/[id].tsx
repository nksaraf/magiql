import { Person, Person_person } from "components/Person";
import { graphql, useQuery } from "magiql";
import { useRouter } from "next/router";
import React from "react";

export default function PersonPage() {
  const router = useRouter();
  const { id } = router.query;

  console.log(id);

  const { data, status } = useQuery(
    graphql`
      query PersonQuery($id: ID) {
        person(id: $id) {
          ...Person_person
        }
      }

      ${Person_person}
    `,
    { variables: { id } }
  );

  return data?.person ? <Person person={data.person} /> : null;
}
