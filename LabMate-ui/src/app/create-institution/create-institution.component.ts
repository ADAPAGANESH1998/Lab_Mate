import { Component, OnInit, OnDestroy } from '@angular/core';
import { LabmateService } from '../labmate.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-institution',
  templateUrl: './create-institution.component.html',
  styleUrls: ['./create-institution.component.scss']
})
export class CreateInstitutionComponent implements OnInit, OnDestroy {
  formData = {
    institution: '',
    country: '',
    state: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  };

  countries: { name: string, states: string[] }[] = [];
  states: string[] = [];
  selectedCountry: string = '';
  selectedState: string = '';
  private countrySubscription!: Subscription;

  constructor(private registrationService: LabmateService, private router: Router) {}

  ngOnInit(): void {
    this.countrySubscription = this.registrationService.getCountries().subscribe(
      (data) => {
        this.countries = data;
      },
      (error) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  onCountryChange(): void {
    const selectedCountryData = this.countries.find(country => country.name === this.formData.country);
    this.states = selectedCountryData ? selectedCountryData.states : [];
  }

  onSubmit(): void {
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Ensure date format is YYYY-MM-DD
    const finalFormData = {
    
      institution: this.formData.institution,
      country: this.formData.country,
      state: this.formData.state,
      email: this.formData.email,
      confirmEmail: this.formData.confirmEmail,
  
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
    };
  

    this.registrationService.saveInstitution(finalFormData).subscribe(
      response => {
        console.log('Registration Successful:', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error:', error);
        alert('Registration failed. Please try again!');
      }
    );
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }
}