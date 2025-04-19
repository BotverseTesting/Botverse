// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: SignInDto): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
      })
    );
  }

  register(userData: SignUpDto): Observable<any> {
    const data = { ...userData, role: 'USER' };
    return this.http.post(`${this.apiUrl}/user`, data);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}