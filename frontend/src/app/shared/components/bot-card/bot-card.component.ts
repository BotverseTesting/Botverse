import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface BotCard {
  id: number;
  header: string;
  images: string;
  category: string;
  labels?: string[];
  isFavorite?: boolean;
}

@Component({
  selector: 'bot-card',
  templateUrl: './bot-card.component.html',
  styleUrls: ['./bot-card.component.scss'],
  standalone: true,
  imports: [CommonModule,RouterModule],
})
export class BotCardComponent {
  @Input() card!: BotCard;
  @Input() selected: boolean = false;

  @Output() select = new EventEmitter<number>();
  @Output() toggleFavoriteEvent = new EventEmitter<number>();

  onCardClick(): void {
    if (this.card) {
      this.select.emit(this.card.id);
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.card) {
      this.toggleFavoriteEvent.emit(this.card.id);
    }
  }
}
