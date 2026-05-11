import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';

  loginForm = new FormGroup({
    userName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'يرجى إدخال اسم المستخدم وكلمة المرور';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>(`${environment.apiUrl}/api/Account/Login`, this.loginForm.value).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.role === 'admin') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('auth_token', data.token); // ✅ أضيفي السطر ده

          localStorage.setItem('role', data.role);
          this.router.navigate(['/products']);
        } else {
          this.errorMessage = 'ليس لديك صلاحية الوصول';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      }
    });
  }
}