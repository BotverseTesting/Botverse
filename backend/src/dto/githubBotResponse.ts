export class GithubBotResponse {
  name: string;
  resourcePath: string;
  appUrl: string;
  fullDescription: string;
  primaryCategoryName: string;
  logoUrl: string;
  isVerified: boolean;
  isPublic: boolean;
  isPaid: boolean;
  documentationUrl: string;
  pricingUrl: string;
  installationUrl: string;

  constructor(data: GithubAPIResponse) {
    this.name = data.name;
    this.resourcePath = data.resourcePath;
    this.appUrl = data.appUrl;
    this.fullDescription = data.fullDescription;
    this.primaryCategoryName = data.primaryCategory?.name || 'Uncategorized';
    this.logoUrl = data.logoUrl;
    this.isVerified = data.isVerified;
    this.isPublic = data.isPublic;
    this.isPaid = data.isPaid;
    this.documentationUrl = data.documentationUrl;
    this.pricingUrl = data.pricingUrl;
    this.installationUrl = data.installationUrl;
  }
}
export interface GithubAPIResponse {
  name: string;
  resourcePath: string;
  appUrl: string;
  fullDescription: string;
  primaryCategory?: { name: string };
  logoUrl: string;
  isVerified: boolean;
  isPublic: boolean;
  isPaid: boolean;
  documentationUrl: string;
  pricingUrl: string;
  installationUrl: string;
}
