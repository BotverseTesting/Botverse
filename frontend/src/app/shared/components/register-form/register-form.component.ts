  // register-form.component.ts
  import { Component, EventEmitter, Input, Output } from '@angular/core';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-register-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './register-form.component.html',
    styleUrls: ['./register-form.component.scss'],
  })
  export class RegisterFormComponent {
    registerForm: FormGroup;
    @Output() registerSubmit = new EventEmitter<{
      name: string;
      email: string;
      password: string;
    }>();
    @Input() registerError: string | null = null;

    constructor(private fb: FormBuilder,private router: Router) {
      this.registerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }

    onSubmit() {
      if (this.registerForm.valid) {
        this.registerSubmit.emit(this.registerForm.value);
      }
    }
    navigateToLogin(): void {
      this.router.navigate(['/auth/login']);
    }
  }