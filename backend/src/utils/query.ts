class QueryUtil {
  public static generateGithubQuery(cursor?: string): string {
    return `
        query {
          marketplaceListings(first: 100${cursor ? `, after: "${cursor}"` : ''}) {
            pageInfo {
              endCursor
              hasNextPage
            }
            edges {
              node {
                name
                resourcePath
                app {
                  url
                }
                fullDescription
                primaryCategory {
                  name
                }
                logoUrl
                isVerified
                isPublic
                isPaid
                documentationUrl
                pricingUrl
                installationUrl
              }
            }
          }
        }
      `;
  }
}

export default QueryUtil;
