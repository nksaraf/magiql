---
title: Introduction
order: 1
nav:
  title: Guide
  order: 1
---

### Introduction

```typescript
function Todo() {
  const { data, status } = useQuery(
    graphql`
      query MyQuery($limit: Int) {
        todos(order_by: { updated_at: desc }, limit: $limit) {
          id
        }
      }
    `,
    {
      variables: { limit: 3 },
    }
  );

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

```

```jsx
import React from "react";
import {
  GraphQLClient,
  GraphQLClientProvider,
  graphql,
  useQuery,
} from "magiql";

const client = new GraphQLClient({
  endpoint: "https://todo-magiql.hasura.app/v1/graphql",
});


function Todo() {
  const { data, status } = useQuery(
    graphql`
      query MyQuery($limit: Int) {
        todos(order_by: { updated_at: desc }, limit: $limit) {
          id
        }
      }
    `,
    {
      variables: { limit: 3 },
    }
  );

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default () => (
  <GraphQLClientProvider client={client}>
    <Todo />
  </GraphQLClientProvider>
);
```
