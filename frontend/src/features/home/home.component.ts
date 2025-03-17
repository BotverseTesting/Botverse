import { Component } from '@angular/core';
import { RedirectionService } from '../../app/core/services/redirection.service';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [RedirectionService], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private redirectionService: RedirectionService) {}

  onRedirectToLogin(): void {
    this.redirectionService.redirectToLogin();  
  }
}
