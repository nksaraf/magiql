import { graphql, useFragment } from "../index";
import { tw } from "twind";

export const Community_community = graphql`
  fragment Community_community on communities {
    communityId
    communityType
  }
`;

export function Community({ community }) {
  const data = useFragment(Community_community, community);
  return (
    <div className={tw`text-white p-2 py-1 rounded-md text-sm bg-gray-300`}>
      {data.communityId} {data.communityType}
    </div>
  );
}
