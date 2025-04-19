// login-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm: FormGroup;
  @Output() loginSubmit = new EventEmitter<{email: string, password: string}>();
  @Input() loginError: boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginSubmit.emit(this.loginForm.value);
    }
  }
}