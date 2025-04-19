// register.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SideImageComponent } from '../../../app/shared/components/side-image/side-image.component';
import { RegisterFormComponent } from '../../../app/shared/components/register-form/register-form.component';

import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, SideImageComponent, RegisterFormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleRegister(userData: {name: string; email: string; password: string}) {
    this.registerError = null;
    
    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.registerError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}