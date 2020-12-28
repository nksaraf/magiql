import { graphql, useFragment } from "../index";
import { tw } from "twind";
import { Community, Community_community } from "./Community";

export const Profile_profile = graphql`
  fragment Profile_profile on profiles {
    profileId
    userName
    avatarUrl
    communities {
      community {
        ...${Community_community}
      }
    }
  }
`;

export function Profile({ profile }) {
  const data = useFragment(Profile_profile, profile);

  return (
    <div
      className={tw`flex flex-row items-center shadow-md rounded-lg mb-3 gap-3 w-3/4 bg-white`}
    >
      <img height={48} width={48} src={data.avatarUrl} />
      <span className={tw`text-sm text-gray-400`}>{data.profileId}</span>
      <div className={tw`flex flex-col flex-1`}>
        {data.userName}
        <div className={tw`w-full overflow-scroll`}>
          <div className={tw`flex flex-row gap-2 items-center`}>
            {data.communities.map((type, i) => (
              <Community community={type.community} key={i.toString()} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
