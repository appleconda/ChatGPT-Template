import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import fetch from "cross-fetch";

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: new HttpLink({
      uri: "http://localhost:4000/graphql", // e.g., 'http://localhost:4000/graphql'
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}
