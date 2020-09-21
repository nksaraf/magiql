import React from "react";
import { useFragment, graphql } from "magiql";
import { Person_person } from "../generated/Person_person.graphql";

export function Person({ person }: { person: Person_person }) {
  const data = useFragment(
    graphql`
      fragment Person_person on Person {
        name
        homeworld {
          name
        }
      }
    `,
    person
  );

  return (
    <div>
      <b>{data.name}</b> ({data.homeworld?.name})
    </div>
  );
}
