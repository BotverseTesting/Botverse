export class TeamsBotResponse {
  title: string;
  link: string;
  imgSrc: string | null;
  description: string | null;
  rating: string | null;

  constructor(data: {
    title: string;
    link: string;
    imgSrc: string | null;
    description: string | null;
    rating: string | null;
  }) {
    this.title = data.title;
    this.link = data.link;
    this.imgSrc = data.imgSrc;
    this.description = data.description;
    this.rating = data.rating;
  }
}
export interface TeamsAPIResponse {
  title: string;
  link: string;
  imgSrc: string | null;
  description: string | null;
  rating: string | null;
}
