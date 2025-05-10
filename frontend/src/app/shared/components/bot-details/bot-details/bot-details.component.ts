import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { SidebarComponent } from '../../sidebar/sidebar.component';
import { SearchBarComponent } from "../../search-bar/search-bar.component";
import { GraphqlService } from '../../../graphql/services/graphql.service';

interface BotDetails {
  id: string;
  name: string;
  description: string;
  sourcePlatform: string;
  officialWebsite: string;
  documentationUrl: string;
  categories: string[];
  pricingInfo: string;
  createdAt: string;
  images: {
    url: string;
    type: string;
  }[];
  links: {
    text: string;
    url: string;
    type: string;
  }[];
  features: {
    title: string;
    description: string;
    capabilities: string[];
  }[];
  technicalDetails: {
    resourcePath: string;
    installationUrl: string;
    isVerified: boolean;
    metadata: any;
  };
  permissions: {
    scope: string;
    description: string;
  }[];
}

@Component({
  selector: 'app-bot-details',
  standalone: true,
  imports: [CommonModule, SidebarComponent, SearchBarComponent],
  templateUrl: './bot-details.component.html',
  styleUrls: ['./bot-details.component.scss']
})
export class BotDetailsComponent implements OnInit {
  bot: BotDetails | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private graphqlService: GraphqlService
  ) {}

  ngOnInit(): void {
    this.loadBotDetails();
  }

  private loadBotDetails(): void {
    const botId = this.route.snapshot.paramMap.get('id');
   
    if (!botId) {
      this.error = 'No se proporcionó un ID de bot válido';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.graphqlService.getBotDetails(botId).subscribe({
      next: ({ data }) => {
        this.bot = data.bot;
        this.isLoading = false;
      },
     
    });
    
  }

 
}