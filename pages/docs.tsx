import { GetServerSideProps } from "next";

export default () => {
  return <></>;
};

export function redirectTo(path): GetServerSideProps {
  return async (ctx) => {
    if (ctx.res) {
      ctx.res.writeHead(302, { Location: path });
      ctx.res.end();
    }
    return { props: {} };
  };
}

export const getServerSideProps: GetServerSideProps = redirectTo(
  "/docs/index.html"
);
