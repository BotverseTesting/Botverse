// src/app/apollo.provider.ts
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../enviorenment';

export function provideApollo() {
  return {
    provide: APOLLO_OPTIONS,
    useFactory(httpLink: HttpLink): ApolloClientOptions<any> {
      return {
        link: httpLink.create({ uri: environment.graphql.uri }),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-first',
          },
        },
      };
    },
    deps: [HttpLink],
  };
}