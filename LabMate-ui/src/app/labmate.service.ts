  import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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


    uploadImage(file: File, email: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl+'upload'+`/${email}`, formData, { responseType: 'text' });
  }

  getLatestImage( email:string ): Observable<Blob> {
    return this.http.get(this.apiUrl + 'latest'+`/${email}`, { responseType: 'blob' });
  }

   uploadImageForInstituteLogo(file: File, email: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl+'uploadForInstitute'+`/${email}`, formData, { responseType: 'text' });
  }

  getLatestImageForInstitute(email:any): Observable<Blob> {
    return this.http.get(this.apiUrl + 'latestForInstitute'+`/${email}`, { responseType: 'blob' });
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

getPublication(scienceDirectUrl: string): Observable<any> {
 

  // construct the backend URL
  const backendUrl = 'http://localhost:8080/api/article';
  // const elsevierUrl = `https://api.elsevier.com/content/article/pii/${pii}`;

  return this.http.get<any>(backendUrl, { params: { url: scienceDirectUrl } });
}

  // Fetch saved publications for a user
  getSavedPublications(email: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'publications' + `/${encodeURIComponent(email)}`);
  }

  // Save a publication (persist to backend)
  savePublication(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl + 'publications', JSON.stringify(data), { headers });
  }
  }