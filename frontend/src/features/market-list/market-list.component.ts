import { Component } from '@angular/core';
import { SearchBarComponent } from '../../app/shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';
import { BotCardComponent } from '../../app/shared/components/bot-card/bot-card.component';
import { SidebarComponent } from '../../app/shared/components/sidebar/sidebar.component';
import { ChipsComponent } from '../../app/shared/components/chips/chips.component';
import { GridBotComponent } from "../../app/shared/components/grid-bot/grid-bot.component";

@Component({
  selector: 'market-list',
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss'],
  imports: [SearchBarComponent, CommonModule, BotCardComponent, SidebarComponent, ChipsComponent, GridBotComponent],
})
export class MarketListComponent {
  
  botCards = Array(16).fill(null).map((_, i) => ({
    id: i + 1,
    header: `Bot ${i + 1}`,
    category: ['customer-support', 'data-analysis', 'productivity', 'social-media'][i % 4],
    labels: ['AI', 'Automation', 'Cloud', 'Integration'].slice(0, (i % 3) + 1),
    isFavorite: i % 5 === 0 // Cada 5 cards es favorito
  }));

  selectedCardId: number | null = null;

  selectCard(cardId: number): void {
    this.selectedCardId = cardId;
  }

  toggleFavorite(card: any): void {
    card.isFavorite = !card.isFavorite;
  }

  
}