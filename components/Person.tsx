import React from "react";
import { useFragment, graphql } from "magiql";

export const Person_person = graphql`
  fragment Person_person on Person {
    name
    homeworld {
      name
    }
  }
`;

export function Person({ person }: { person: any }) {
  const data = useFragment(Person_person, person);

  return (
    <div>
      <b>{data.name}</b> ({data.homeworld?.name})
    </div>
  );
}
