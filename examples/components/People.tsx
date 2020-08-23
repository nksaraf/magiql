import React from "react";
import { useFragment, graphql } from "../../src";
import { People_person } from "../../generated/People_person.graphql";
import ListItem from "./ListItem";

export function People({ person }: { person: People_person }) {
  const data = useFragment(
    graphql`
      fragment People_person on posts {
        postId
        postType
        communities {
          ...ListItem_community
        }
        question {
          questionId
          body
        }
      }
    `,
    person
  );


  return (
    <div>
      {data.postType} {data.postId} {data.question?.body}{" "}
      {data.communities.length > 0 && <ListItem person={data.communities[0]} />}
    </div>
  );
}
