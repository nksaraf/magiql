import React from "react";
import Link from "next/link";

export function NavBar() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/index">
          <a>useQuery</a>
        </Link>
      </code>
      <div style={{ width: 8 }} />
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/infinite">
          <a>useInfiniteQuery</a>
        </Link>
      </code>
      <div style={{ width: 8 }} />
      <code style={{ fontFamily: "Roboto Mono" }}>
        <Link href="/paginated">
          <a>usePaginatedQuery</a>
        </Link>
      </code>
    </div>
  );
}
