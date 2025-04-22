// favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../../features/auth/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'http://localhost:3000/favorites';
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getUserId(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
    
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.sub || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  addFavorite(botId: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('User not authenticated'));

    return this.http.post(`${this.apiUrl}/${userId}/${botId}`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  removeFavorite(botId: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('User not authenticated'));

    return this.http.delete(`${this.apiUrl}/${userId}/${botId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  checkFavorite(botId: string): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('User not authenticated'));

    return this.http.get<boolean>(`${this.apiUrl}/${userId}/check?botId=${botId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getUserFavorites(): Observable<any[]> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('User not authenticated'));

    return this.http.get<any[]>(`${this.apiUrl}/${userId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}