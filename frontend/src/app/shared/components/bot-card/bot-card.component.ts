import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
// Ajusta la ruta
import { catchError, of, tap } from 'rxjs';
import { FavoritesService } from './favorites.service';

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
  imports: [CommonModule, RouterModule],
})
export class BotCardComponent implements OnInit {
  @Input() card!: BotCard;
  @Input() selected: boolean = false;
  @Input() isLoggedIn: boolean = false;

  @Output() select = new EventEmitter<number>();
  @Output() favoriteChanged = new EventEmitter<{id: number, isFavorite: boolean}>();

  isLoadingFavorite = false;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    if (this.isLoggedIn && this.card) {
      this.checkFavoriteStatus();
    }
  }

  onCardClick(): void {
    if (this.card) {
      this.select.emit(this.card.id);
    }
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault(); // Prevenir navegación por el routerLink
    if (!this.card || !this.isLoggedIn || this.isLoadingFavorite) return;

    this.isLoadingFavorite = true;
    
    const action$ = this.card.isFavorite 
      ? this.favoritesService.removeFavorite(this.card.id.toString())
      : this.favoritesService.addFavorite(this.card.id.toString());

    action$.pipe(
      tap(() => {
        this.card.isFavorite = !this.card.isFavorite;
        this.favoriteChanged.emit({id: this.card.id, isFavorite: this.card.isFavorite});
      }),
      catchError(error => {
        console.error('Error updating favorite:', error);
        return of(null);
      })
    ).subscribe(() => {
      this.isLoadingFavorite = false;
    });
  }

  private checkFavoriteStatus(): void {
    this.isLoadingFavorite = true;
    this.favoritesService.checkFavorite(this.card.id.toString())
      .pipe(
        catchError(error => {
          console.error('Error checking favorite:', error);
          return of(false);
        })
      )
      .subscribe(isFavorite => {
        this.card.isFavorite = isFavorite;
        this.isLoadingFavorite = false;
      });
  }
}