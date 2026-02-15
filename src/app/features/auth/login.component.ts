import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <!-- Aurora Background Blobs -->
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>

      <!-- Main Grid Container -->
      <div class="login-grid">
        
        <!-- Brand Tile -->
        <div class="brand-tile">
          <div class="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 class="brand-title">Bookora</h1>
          <p class="brand-subtitle">Your premium reading experience starts here</p>
        </div>

        <!-- Login Form Tile -->
        <div class="login-tile">
          <div class="form-container">
            <h2 class="form-title">Welcome Back</h2>
            <p class="form-subtitle">Sign in to continue your journey</p>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Email Field -->
              <div class="form-group">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="you@example.com"
                  class="form-input"
                />
              </div>

              <!-- Password Field -->
              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                  <input 
                    [type]="showPassword() ? 'text' : 'password'" 
                    formControlName="password"
                    placeholder="••••••••"
                    class="form-input"
                  />
                  <button 
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="toggle-password"
                  >
                    <span class="material-icons">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <!-- Remember & Forgot -->
              <div class="form-actions">
                <label class="remember-label">
                  <input type="checkbox" class="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" class="forgot-link">Forgot?</a>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="btn-submit"
              >
                @if (isLoading()) {
                  <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                } @else {
                  <span>Sign In</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              </button>

              <!-- Sign Up Link -->
              <p class="signup-text-inline">
                New to Bookora? <a href="#" class="signup-link">Create account</a>
              </p>

              <!-- Divider -->
              <div class="divider">
                <span>OR</span>
              </div>

              <!-- Social Login -->
              <div class="social-buttons">
                <button type="button" class="btn-social">
                  <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button type="button" class="btn-social">
                  <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2.2c-5.5,0-10,4.5-10,10c0,4.4,2.9,8.2,6.8,9.5c0.5,0.1,0.7-0.2,0.7-0.5c0-0.2,0-0.9,0-1.7c-2.8,0.6-3.4-1.4-3.4-1.4C5.6,17.1,5,16.8,5,16.8C4.1,16.2,5.1,16.2,5.1,16.2c1,0.1,1.5,1,1.5,1c0.9,1.5,2.4,1.1,3,0.8c0.1-0.6,0.3-1.1,0.6-1.3c-2.2-0.2-4.6-1.1-4.6-4.9c0-1.1,0.4-2,1-2.8c-0.1-0.3-0.4-1.3,0.1-2.8c0,0,0.8-0.3,2.8,1.1c0.8-0.2,1.6-0.3,2.5-0.3c0.8,0,1.7,0.1,2.5,0.3c1.9-1.3,2.8-1.1,2.8-1.1c0.5,1.6,0.2,2.5,0.1,2.8c0.6,0.8,1,1.7,1,2.8c0,3.8-2.3,4.6-4.6,4.9c0.3,0.3,0.6,0.7,0.6,1.5c0,1.1,0,1.9,0,2.2c0,0.3,0.2,0.6,0.7,0.5c4-1.3,6.8-5.1,6.8-9.5C22,6.7,17.5,2.2,12,2.2z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>


          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  showPassword = signal(false);
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;

      // Simulate API call
      setTimeout(() => {
        const success = this.authService.login(email!, password!);
        this.isLoading.set(false);
        if (success) {
          this.router.navigate(['/library']);
        }
      }, 1500);
    }
  }
}
