import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface SignInDto {
  email: string;
  password: string;
}

interface SignUpDto {
  email: string;
  password: string;
  name: string;
  role?: 'SUPERUSER' | 'ADMIN' | 'USER';
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private readonly TOKEN_KEY = 'access_token';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  login(credentials: SignInDto): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: SignUpDto): Observable<any> {
    const data = { ...userData, role: 'USER' };
    return this.http.post(`${this.apiUrl}/user`, data).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('Error al acceder a localStorage:', e);
      return null;
    }
  }

  /**
   * Establece el token de autenticación
   */
  private setToken(token: string): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
  }

  /**
   * Verifica si localStorage está disponible
   */
  private isLocalStorageAvailable(): boolean {
    try {
      if (!isPlatformBrowser(this.platformId)) return false;
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage no está disponible en este entorno');
      return false;
    }
  }
}