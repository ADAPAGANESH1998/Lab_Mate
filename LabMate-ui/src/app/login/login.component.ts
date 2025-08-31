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
          alert('Login successful:');
          // handle navigation or state change
        },
        error: (error) => {
          alert('Login successful:');
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']); // Replace with your actual route
  }

}
