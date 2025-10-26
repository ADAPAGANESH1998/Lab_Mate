import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  showPDFModal = false;
  pdfUrl: string | null = null;
  safePdfUrl: SafeResourceUrl | null = null;
  pdfBlobUrl: string | null = null;

  constructor(private fb: FormBuilder, private service: LabmateService, private router: Router, private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.publicationsForm = this.fb.group({
      doiUrl: ['']
    });

    this.getDetails();
   
  }

  // Remove popup state for Enter DOI, add for Upload PDF
  showUploadDOIPopup = false;
  showUploadCopyrightPopup = false;
  showUploadEmbargoPopup = false;
  showUploadSelfArchivingPopup = false;
  showUploadInstitutionalPopup = false;
  showUploadTermsPopup = false;
  private uploadPDFPub: any = null;

  onUploadPDFPopup(pub: any): void {
    this.uploadPDFPub = pub;
    this.showUploadDOIPopup = true;
  }
  onUploadDOIPopupContinue(): void {
    this.showUploadDOIPopup = false;
    this.showUploadCopyrightPopup = true;
  }
  onUploadCopyrightPopupContinue(): void {
    this.showUploadCopyrightPopup = false;
    this.showUploadEmbargoPopup = true;
  }
  onUploadEmbargoPopupContinue(): void {
    this.showUploadEmbargoPopup = false;
    this.showUploadSelfArchivingPopup = true;
  }
  onUploadSelfArchivingPopupContinue(): void {
    this.showUploadSelfArchivingPopup = false;
    this.showUploadInstitutionalPopup = true;
  }
  onUploadInstitutionalPopupContinue(): void {
    this.showUploadInstitutionalPopup = false;
    this.showUploadTermsPopup = true;
  }
  onUploadTermsPopupContinue(): void {
    this.showUploadTermsPopup = false;
    if (this.uploadPDFPub) {
      this.uploadPDF(this.uploadPDFPub);
      this.uploadPDFPub = null;
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

  uploadPDF(pub: any): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const username = this.userData.email;
      const title = pub.title;
      const url = `http://localhost:8080/api/upload-pdf?username=${encodeURIComponent(username)}&title=${encodeURIComponent(title)}`;
      this.http.post(url, formData).subscribe({
        next: () => alert('PDF uploaded successfully!'),
        error: () => alert('PDF upload failed!')
      });
    };
    input.click();
  }

  viewPDF(pub: any): void {
    const username = this.userData.email;
    const title = pub.title;
    const url = `http://localhost:8080/api/pdf/${encodeURIComponent(username)}/${encodeURIComponent(title)}`;
    // Fetch as blob and create a blob URL
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
      }
      this.pdfBlobUrl = URL.createObjectURL(blob);
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfBlobUrl);
      this.pdfUrl = this.pdfBlobUrl;
      this.showPDFModal = true;
    }, err => {
      alert('Failed to load PDF.');
    });
  }

  closePDFModal(): void {
    this.showPDFModal = false;
    this.pdfUrl = null;
    this.safePdfUrl = null;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }

  downloadPDF(): void {
    if (this.pdfBlobUrl) {
      const a = document.createElement('a');
      a.href = this.pdfBlobUrl;
      a.download = 'publication.pdf';
      a.click();
    }
  }
}
