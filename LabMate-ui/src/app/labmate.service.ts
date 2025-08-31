  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
import { Research } from './pages/research/research.component';
import { Collaboration } from './pages/collaboration/collaboration.component';
import { Achievement } from './pages/achievements/achievements.component';

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

   login(credentials: LoginRequest): Observable<string> {
  return this.http.post(this.apiUrl + 'login', credentials, {
    responseType: 'text'
  });
}


    uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl+'upload', formData, { responseType: 'text' });
  }

  getLatestImage(): Observable<Blob> {
    return this.http.get(this.apiUrl + 'latest', { responseType: 'blob' });
  }

   uploadImageForInstituteLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl+'uploadForInstitute', formData, { responseType: 'text' });
  }

  getLatestImageForInstitute(): Observable<Blob> {
    return this.http.get(this.apiUrl + 'latestForInstitute', { responseType: 'blob' });
  }

    getUserById(id: string): Observable<any> {
      console.log(id);
  return this.http.get<any>(this.apiUrl+'researcher'+`${id}`);
}

getUserByEmail(email: string): Observable<any> {
  return this.http.get<any>(this.apiUrl+'getByEmail'+`/${email}`);
}

saveResearch(data: Research): Observable<any> {
    return this.http.post(this.apiUrl+"research", data);
  }
  getUserByEmailForResearcher(email: string): Observable<any> {
  return this.http.get<any>(this.apiUrl+'getResearchByEmail'+`/${email}`);
}

  getUserByEmailForCollaboration(email: string): Observable<any> {
  return this.http.get<any>(this.apiUrl+'getCollaborationByEmail'+`/${email}`);
}


  saveCollaboration(data: Collaboration): Observable<any> {
    return this.http.post(this.apiUrl+"collaboration", data);
  }


   getUserCollaborationByEmail(email: string): Observable<any> {
      return this.http.get<any>(this.apiUrl+'getCollaborationByEmail'+`/${email}`);

    }
   
    saveAchievements(data: Achievement): Observable<any> {
       return this.http.post(this.apiUrl+"achievement", data);
}

getUserAchievementsByEmail(email: string): Observable<any> {
   return this.http.get<any>(this.apiUrl+'getAchievementByEmail'+`/${email}`);
}

  }