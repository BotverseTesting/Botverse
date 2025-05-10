import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotCardComponent, BotCard } from '../bot-card/bot-card.component';
import { GraphqlService } from '../../graphql/services/graphql.service';
import { FavoritesService } from '../bot-card/favorites.service';
import { AuthService } from '../../../../features/auth/auth.service';


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
  @Input() showOnlyFavorites: boolean = false;
  @Input() isLoggedIn: boolean = false;

  allBots: BotCard[] = [];
  filteredBots: BotCard[] = [];
  favoriteBots: number[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private graphqlService: GraphqlService,
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBots();
    if (this.isLoggedIn) {
      this.loadFavorites();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterPlatform'] || changes['searchQuery'] || changes['showOnlyFavorites'] || changes['isLoggedIn']) {
      this.applyFilters();
      
      if (changes['isLoggedIn']?.currentValue) {
        this.loadFavorites();
      }
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
          isFavorite: this.favoriteBots.includes(bot.id)
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

  private loadFavorites(): void {
    if (!this.authService.isLoggedIn()) return;

    this.favoritesService.getUserFavorites().subscribe({
      next: (favorites) => {
        this.favoriteBots = favorites.map((f: any) => f.botId);
        // Actualizar el estado isFavorite en todos los bots
        this.allBots.forEach(bot => {
          bot.isFavorite = this.favoriteBots.includes(bot.id);
        });
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
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
      
      const matchesFavorites = !this.showOnlyFavorites || bot.isFavorite;
      
      return matchesPlatform && matchesSearch && matchesFavorites;
    });
  }

  toggleFavorite(id: number): void {
    if (!this.authService.isLoggedIn()) {
      // Opcional: Redirigir a login o mostrar mensaje
      return;
    }

    const bot = this.allBots.find(b => b.id === id);
    if (!bot) return;

    if (bot.isFavorite) {
      this.removeFavorite(id, bot);
    } else {
      this.addFavorite(id, bot);
    }
  }

  private addFavorite(id: number, bot: BotCard): void {
    this.favoritesService.addFavorite(id.toString()).subscribe({
      next: () => {
        bot.isFavorite = true;
        this.favoriteBots.push(id);
        if (this.showOnlyFavorites) {
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error adding favorite:', err);
      }
    });
  }

  private removeFavorite(id: number, bot: BotCard): void {
    this.favoritesService.removeFavorite(id.toString()).subscribe({
      next: () => {
        bot.isFavorite = false;
        this.favoriteBots = this.favoriteBots.filter(botId => botId !== id);
        if (this.showOnlyFavorites) {
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
      }
    });
  }

  selectedBotId: number | null = null;

  selectBot(id: number): void {
    this.selectedBotId = id;
  }

  trackByBotId(index: number, bot: BotCard): number {
    return bot.id;
  }
}