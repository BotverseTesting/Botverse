import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../features/auth/auth.service';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  searchQuery: string = '';
  @Output() searchChange = new EventEmitter<string>();
  isLoggedIn: boolean = false;
  tooltipText: string = 'Iniciar sesión';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.tooltipText = this.isLoggedIn ? 'Mi perfil' : 'Iniciar sesión';
  }

  onSearchInput() {
    this.searchChange.emit(this.searchQuery);
  }

  handleUserClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}