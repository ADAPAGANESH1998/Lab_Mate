  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';

  interface LoginRequest {
    email: string;
    password: string;
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class LabmateService {
    saveInstitution(formData: any): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json', // Ensure content type is JSON
      });

      return this.http.post(this.apiUrl+'saveInstitution', formData, { headers: headers });
    }
    // private apiUrl = 'http://localhost:8080/api';  // Replace with your Spring API URL

    // constructor(private http: HttpClient) { }

    // // Method to send POST request to the backend API
    // saveRegister(formData: any): Observable<any> {
    //   return this.http.post(this.apiUrl+'/register', formData);
    // }
    private apiUrl = 'http://localhost:8080/api/';  // Replace with your Spring API URL

    constructor(private http: HttpClient) { }

    saveRegister(formData: any): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json', // Ensure content type is JSON
      });

      return this.http.post(this.apiUrl+'register', formData, { headers: headers });
    }


    getCountries(): Observable<any> {
      return this.http.get('/assets/countries_states.json');
    }

    getInstitutions(): Observable<any> {
      return this.http.get('https://api.ror.org/organizations?query=oxford');
    }

    login(credentials: LoginRequest): Observable<any> {
      return this.http.post(this.apiUrl+'login', credentials);
    }
  }