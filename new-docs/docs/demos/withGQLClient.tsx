import { GQLClient } from 'magiql';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import React from 'react';
import { tw } from 'twind';

if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/handler');
  worker.start();
}

const client = new GQLClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  url: 'https://poke-api-delta.vercel.app/api/graphql',
});

export function withGQLClient(Component) {
  return () => {
    return (
      <QueryClientProvider client={client}>
        <div className={tw`px-6 py-6 bg-gray-100`}>
          <Component />
        </div>
        <ReactQueryDevtools />
      </QueryClientProvider>
    );
  };
}
