import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SideImageComponent } from '../../../app/shared/components/side-image/side-image.component';
import { RegisterFormComponent } from '../../../app/shared/components/register-form/register-form.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, SideImageComponent, RegisterFormComponent],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

}
