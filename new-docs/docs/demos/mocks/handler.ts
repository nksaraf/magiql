import { graphql } from 'msw';

export const handlers = [
  // Handles a "Login" mutation
  graphql.mutation('Login', null),
  // Handles a "GetUserInfo" query
  graphql.query('GetUserInfo', null),
];
