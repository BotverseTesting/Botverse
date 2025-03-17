import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SideImageComponent } from "../../../app/shared/components/side-image/side-image.component";
import { LoginFormComponent } from '../../../app/shared/components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, SideImageComponent,LoginFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  

}
