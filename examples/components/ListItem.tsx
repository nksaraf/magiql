import React from "react";
import Link from "next/link";

import { useFragment, graphql } from "../../src";
import { ListItem_community } from "../../generated/ListItem_community.graphql";

const ListItem = ({ person }: { person: ListItem_community }) => {
  const data = useFragment(
    graphql`
      fragment ListItem_community on community_posts {
        communityId
        postId
        community {
          communityId
          communityType
        }
      }
    `,
    person
  );

  return (
    <a>
      {data.communityId}: {data.postId}
    </a>
  );
};

export default ListItem;
