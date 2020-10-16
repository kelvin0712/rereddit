import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // take all the queries contained in the cache
    const allFields = cache.inspectFields(entityKey);

    // Filter the queries that we dont need
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const keyField = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolveFieldByKey(entityKey, keyField);

    // tell URQL to do the query
    info.partial = !isItInTheCache;

    const results: string[] = [];
    fieldInfos.forEach((field) => {
      // Array of {field:id} objects
      const data = cache.resolveFieldByKey(
        entityKey,
        field.fieldKey
      ) as string[]; // [{Post: 1}, ...]
      console.log(data);
      results.push(...data);
    });

    console.log(results);

    return results;
  };
};

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error) {
        // the error is a CombinedError with networkError and graphqlErrors properties
        if (error.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",

  // Send cookie
  fetchOptions: {
    credentials: "include" as const,
  },

  exchanges: [
    dedupExchange,
    cacheExchange({
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => {
                return { me: null };
              }
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return { me: result.login.user };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return { me: result.register.user };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
