export const infiniteQuery = `import React from "react";
import { useInfiniteQuery, graphql, useQuery } from "magiql";
import { People } from "./Person";
import { PeopleInfiniteQuery } from "../generated/PeopleInfiniteQuery.graphql";
import Link from "next/link";

export function PeopleInfinite() {
  const { data, fetchMore } = useInfiniteQuery<PeopleInfiniteQuery>(
    graphql\`
      query PeopleInfiniteQuery($limit: Int = 10, $after: String) {
        allPeople(first: $limit, after: $after) {
          edges {
            node {
              id
              ...Person_person
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    \`,
    {
      variables: {
        limit: 10,
      },
      getFetchMore: (lastpage) => ({
        after: lastpage.allPeople.pageInfo.hasNextPage
          ? lastpage.allPeople.pageInfo.endCursor
          : null,
      }),
    }
  );

  return (
    <>
      <Actions>
        <ActionButton
          onClick={() => {
            fetchMore();
          }}
        >
          Fetch more
        </ActionButton>
      </Actions>
      <div>
        {data?.map((page, index) => (
          <React.Fragment key={index}>
            {page
              ? page.allPeople?.edges?.map((node) => (
                  <People key={node.node.id} person={node.node} />
                ))
              : null}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}



`;
