import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { AuthService } from '../../../../features/auth/auth.service';
import { FavoritesService } from '../bot-card/favorites.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() activePlatform: string | null = null; 
  @Output() platformSelected = new EventEmitter<string>(); 
  @Output() showFavorites = new EventEmitter<void>(); 
  isCollapsed = true;

  constructor(
    public authService: AuthService,
    private router: Router,
    private favoritesService: FavoritesService
  ) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectPlatform(platform: string) {
    this.platformSelected.emit(platform);
  }

  onShowFavorites() {
    this.showFavorites.emit();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}