import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  publicationsForm!: FormGroup;
  tooltipText: string | null = null;
  userData: any = {};
  publication: any = null;

  selectedFile!: File;
  imageUrl: string | ArrayBuffer | null = null;

  selectedFileForInstituteLogo!: File;
  imageUrlForInstitute: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private service: LabmateService, private router: Router) {}

  ngOnInit(): void {
    this.publicationsForm = this.fb.group({
      doiUrl: ['']
    });

    this.getDetails();
   
  }

  onSubmit(): void {
    const doiUrl = this.publicationsForm.value.doiUrl;
    if (doiUrl) {
      this.service.getPublication(doiUrl).subscribe(data => {
        this.publication = data;
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.upload();
  }

  onFileSelectedForCollegeLogo(event: any) {
    this.selectedFileForInstituteLogo = event.target.files[0];
    this.uploadForInstituteLogo(this.userData.email);
  }

  upload() {
    if (this.selectedFile) {
      this.service.uploadImage(this.selectedFile,this.userData.email).subscribe(() => this.fetchImage(this.userData.email));
    }
  }

  uploadForInstituteLogo(email:string) {
    if (this.selectedFileForInstituteLogo) {
      this.service.uploadImageForInstituteLogo(this.selectedFileForInstituteLogo,email).subscribe(() => {
        this.fetchImageForInstituteLogo(email);
      });
    }
  }

  fetchImage(email: string) {
    this.service.getLatestImage(email).subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => (this.imageUrl = reader.result);
      reader.readAsDataURL(imageBlob);
    });
  }

  fetchImageForInstituteLogo(email: string) {
    this.service.getLatestImageForInstitute(email).subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => (this.imageUrlForInstitute = reader.result);
      reader.readAsDataURL(imageBlob);
    });
  }
publications: any[] = [];
  selectedPublication: any = null;
  getDetails(): void {
    const token = sessionStorage.getItem('authToken')!;
    if (token) {
      const payload = this.decodeJwtToken(token);
      const email = payload?.sub;
      if (email) {
        this.service.getUserAchievementsByEmail(email).subscribe(
          data => {
            this.userData = data;
        this.publications.push(this.userData);
        this.selectedPublication = this.userData;
         this.fetchImage(this.userData.email); // Load on page load
    this.fetchImageForInstituteLogo(this.userData.email);
          },
          error => console.error('Error fetching user details:', error)
        );
      }
    }
  }

  decodeJwtToken(token: string): any {
    try {
      const parts = token.split('.');
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      return JSON.parse(atob(padded));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
  selectPublication(pub: any): void {
    this.selectedPublication = pub;
  }

}
