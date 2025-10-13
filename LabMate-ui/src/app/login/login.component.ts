import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabmateService } from '../labmate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  constructor(private fb: FormBuilder, private service: LabmateService,private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.service.login(loginData).subscribe({
       next: (response) => {
  console.log('Login response:', response); // 👈 Check what's actually returned

  // Try accessing the correct field
  sessionStorage.setItem('authToken', response);  
// token, accessToken, jwt, etc.
this.router.navigate(['/profile']);
 // alert('Login successful');
}
,
        error: (error) => {
            sessionStorage.setItem('authToken', error);
          this.router.navigate(['/profile']);
     
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']); // Replace with your actual route
  }

}
