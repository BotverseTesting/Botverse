import { gql } from 'apollo-angular';

export const GET_BASIC_BOTS = gql`
  query GetBasicBots {
    bots {
      id
      name
      sourcePlatform
      images {
        url
        type
      }
    }
  }
`;

export const GET_BOT_DETAILS = gql`
  query GetBotDetails($id: ID!) {  
    bot(id: $id) {
      id
      name
      description
      sourcePlatform
      officialWebsite
      documentationUrl
      categories
      pricingInfo
      createdAt
      images {
        url
        type
      }
      links {
        text
        url
        type
      }
      features {
        title
        description
        capabilities
      }
      technicalDetails {
        resourcePath
        installationUrl
        isVerified
        metadata
      }
      permissions {
        scope
        description
      }
    }
  }
`;