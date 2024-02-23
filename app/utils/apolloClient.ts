import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import fetch from "cross-fetch";

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  const graphql_url = process.env.APOLLO_URL;
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: new HttpLink({
      uri: graphql_url, // e.g., 'http://localhost:4000/graphql'
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}
