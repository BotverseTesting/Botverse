import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotCardComponent, BotCard } from '../bot-card/bot-card.component';
import { GraphqlService } from '../../graphql/services/graphql.service';

@Component({
  selector: 'app-grid-bot',
  standalone: true,
  imports: [CommonModule, BotCardComponent],
  templateUrl: './grid-bot.component.html',
  styleUrls: ['./grid-bot.component.scss']
})
export class GridBotComponent implements OnChanges {
  @Input() filterPlatform: string | null = null;
  @Input() searchQuery: string = '';

  allBots: BotCard[] = [];
  filteredBots: BotCard[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    this.loadBots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterPlatform'] || changes['searchQuery']) {
      this.applyFilters();
    }
  }

  public loadBots(): void {
    this.isLoading = true;
    this.error = null;

    this.graphqlService.getBasicBots().subscribe({
      next: ({ data }) => {
        this.allBots = data.bots.map((bot: any) => ({
          id: bot.id,
          header: bot.name,
          category: bot.sourcePlatform,
          labels: bot.categories || [],
          images: bot.images.find((image: any) => image.type === 'logo')?.url || '',
          isFavorite: false
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los bots';
        this.isLoading = false;
        console.error('Error loading bots:', err);
      }
    });
  }

  private applyFilters(): void {
    if (!this.allBots) return;

    this.filteredBots = this.allBots.filter(bot => {
      const matchesPlatform = !this.filterPlatform || 
        bot.category.toLowerCase() === this.filterPlatform.toLowerCase();
      
      const matchesSearch = !this.searchQuery || 
        bot.header.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesPlatform && matchesSearch;
    });
  }

  selectedBotId: number | null = null;

  selectBot(id: number): void {
    this.selectedBotId = id;
    // Aquí puedes añadir lógica adicional al seleccionar un bot
  }

  toggleFavorite(id: number): void {
    const bot = this.allBots.find(b => b.id === id);
    if (bot) {
      bot.isFavorite = !bot.isFavorite;
      // Aquí podrías llamar a un servicio para guardar el favorito
    }
  }

  trackByBotId(index: number, bot: BotCard): number {
    return bot.id;
  }
}