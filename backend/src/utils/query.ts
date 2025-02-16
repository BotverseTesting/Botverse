class QueryUtil {
  public static queryGithub = `
    {
        marketplaceListings(first: 100) {
        nodes {
            name
            resourcePath
            app { url }
            fullDescription
            primaryCategory { name }
            logoUrl
            isVerified
            isPublic
            isPaid
            documentationUrl
            pricingUrl
            installationUrl
        }
        }
    }`;
}

export default QueryUtil;
