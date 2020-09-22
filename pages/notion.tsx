import Prism from "prismjs";
import React from "react";
import { NotionRenderer } from "react-notion";

export async function getStaticProps() {
  const data = await fetch(
    "https://notion-api.splitbee.io/v1/page/3691af2990584abcbcb3d6eb03e231fb"
  ).then((res) => res.json());

  return {
    props: {
      blockMap: data,
    },
  };
}

export default function Blocks({ blockMap }) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }
  }, []);

  return (
    <div style={{ maxWidth: 768 }}>
      <NotionRenderer blockMap={blockMap} />
    </div>
  );
}
