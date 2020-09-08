import React from "react";
import { useFragment, graphql } from "../../src";
import { People_person } from "../../generated/graphql/People_person.graphql";
import ListItem from "./ListItem";

export function People({ person }: { person: People_person }) {
  const data = useFragment(
    graphql`
      fragment People_person on posts {
        postType
        communities {
          ...ListItem_community
        }
        question {
          body
        }
      }
    `,
    person
  );

  return (
    <div>
      {data.postType} {data.question?.body}{" "}
      {data.communities.length > 0 && <ListItem person={data.communities[0]} />}
    </div>
  );
}
