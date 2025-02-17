export class DiscordBotResponse {
  name: string;
  image: string;
  logo: string;
  category: string;
  description: string;

  constructor(data: DiscordBotResponse) {
    this.name = data.name;
    this.image = data.image;
    this.logo = data.logo;
    this.category = data.category;
    this.description = data.description;
  }
}
export interface DiscordWebsiteResponse {
  name: string;
  image: string;
  logo: string;
  category: string;
  description: string;
}
