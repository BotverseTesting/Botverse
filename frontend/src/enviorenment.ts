export const environment = {
    production: false,
    graphql: {
      uri: 'http://localhost:3000/graphql', 
      wsUri: 'ws://localhost:3000/graphql', 
    },
    api: {
      baseUrl: 'http://localhost:3000/graphql', 
    },
    auth: {
      tokenKey: 'botverse_token', 
    }
  };