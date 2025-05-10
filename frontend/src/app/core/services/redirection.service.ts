import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {
  constructor(private router: Router) { }

  redirectToLogin(): void {
    this.router.navigate(['/auth/login']); 
  }
}
