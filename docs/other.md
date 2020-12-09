---
title: Other
order: 1
---

## Getting Started

1. Install `magiql` in your project

```bash
$ npm i magiql
```

Create a `GraphQLClient` to connect to your GraphQL server and wrap your app in a `GraphQLClientProvider` passing in the client

```typescript
import { GraphQLClient, GraphQLClientProvider } from "magiql";
import App from './App';

const client = new GraphQLClient({
  endpoint: "https://todo-magiql.hasura.app/v1/graphql",
});

export default () => (
  <GraphQLClientProvider client={client}>
    <App />
  </GraphQLClientProvider>
);
```