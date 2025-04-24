import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { UserService } from '../auth/user.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [CommonModule],
})
export class UserProfileComponent implements OnInit {
  workflowsCount: number = 0;
  favoritesCount: number = 0;
  isLoading: boolean = true;

  user = {
    name: '',
    email: '',
    avatar: 'botverse.svg' // Imagen por defecto
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.isLoading = false;
      return;
    }

    // Decodificar el token JWT para obtener el ID del usuario
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub;

    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData) => {
          this.user = {
            name: userData.name,
            email: userData.email,
            avatar: userData.profilePicture || this.user.avatar
          };
          this.getUserStatistics(userId);
        },
        error: (err) => {
          console.error('Error al cargar datos del usuario:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  getUserStatistics(userId: number): void {
    // Obtener conteo de workflows
    this.http.get<any[]>('http://localhost:3000/workflow').subscribe({
      next: (data) => {
        this.workflowsCount = data.filter(wf => wf.creatorId === userId).length;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error al obtener workflows:', err);
        this.checkLoadingComplete();
      }
    });

    // Obtener conteo de favoritos
    this.http.get<any[]>(`http://localhost:3000/favorites/${userId}`).subscribe({
      next: (data) => {
        this.favoritesCount = data.length;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error al obtener favoritos:', err);
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Esta función verifica si ambas llamadas han terminado (éxito o error)
    if (this.workflowsCount !== undefined && this.favoritesCount !== undefined) {
      this.isLoading = false;
    }
  }
}