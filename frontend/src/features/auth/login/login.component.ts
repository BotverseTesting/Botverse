// login.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SideImageComponent } from "../../../app/shared/components/side-image/side-image.component";
import { LoginFormComponent } from '../../../app/shared/components/login-form/login-form.component';

import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, SideImageComponent, LoginFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleLogin(credentials: {email: string, password: string}) {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/bots']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password'; 
        console.error('Login error:', err);
      }
    });
  }
}