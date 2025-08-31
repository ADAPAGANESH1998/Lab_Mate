import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';


export interface Collaboration {
  email: string;
  typesOfCollaborationDesired: string;
  preferredDomains: string;
  collaborationGoals: string;
  resourceSharing: string;
  availableTime: string;
  desiredSkillsInCollaborators: string;
  mutualBenefitsInCollaboration: string;
}

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss']
})
export class CollaborationComponent implements OnInit {
  collaborationForm!: FormGroup;
  tooltipText: string | null = null;
  userData: any = {};

  selectedFile!: File;
  imageUrl: string | ArrayBuffer | null = null;

  selectedFileForInstituteLogo!: File;
  imageUrlForInstitute: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private service: LabmateService, private router: Router) {}

  ngOnInit(): void {
    this.collaborationForm = this.fb.group({
      email: [''],
      typesOfCollaborationDesired: [''],
      preferredDomains: [''],
      collaborationGoals: [''],
      resourceSharing: [''],
      availableTime: [''],
      desiredSkillsInCollaborators: [''],
      mutualBenefitsInCollaboration: ['']
    });

    this.getDetails();
    this.fetchImage();
    this.fetchImageForInstituteLogo();
  }

  onSubmit(): void {
    const formData = this.collaborationForm.value;
    const token = sessionStorage.getItem('authToken')!;

    if (token) {
      const payload = this.decodeJwtToken(token);
      formData.email = payload?.sub;

      this.service.saveCollaboration(formData).subscribe(() => {
        this.router.navigate(['/profile']);
      });
    }
  }

  decodeJwtToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT structure');

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      return JSON.parse(atob(padded));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.upload();
  }

  onFileSelectedForCollegeLogo(event: any) {
    this.selectedFileForInstituteLogo = event.target.files[0];
    this.uploadForInstituteLogo();
  }

  upload() {
    if (this.selectedFile) {
      this.service.uploadImage(this.selectedFile).subscribe(() => this.fetchImage());
    }
  }

  uploadForInstituteLogo() {
    if (this.selectedFileForInstituteLogo) {
      this.service.uploadImageForInstituteLogo(this.selectedFileForInstituteLogo).subscribe(() => {
        this.fetchImageForInstituteLogo();
      });
    }
  }

  fetchImage() {
    this.service.getLatestImage().subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => (this.imageUrl = reader.result);
      reader.readAsDataURL(imageBlob);
    });
  }

  fetchImageForInstituteLogo() {
    this.service.getLatestImageForInstitute().subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => (this.imageUrlForInstitute = reader.result);
      reader.readAsDataURL(imageBlob);
    });
  }

  getDetails(): void {
    const token = sessionStorage.getItem('authToken')!;
    if (token) {
      const payload = this.decodeJwtToken(token);
      const email = payload?.sub;
      if (email) {
        this.service.getUserCollaborationByEmail(email).subscribe(
          data => {
            this.userData = data;
            console.log('User loadedjjjj:', JSON.stringify(this.userData));
          },
          error => console.error('Error fetching user details:', error)
        );
      }
    }
  }

  showTooltip(text: string): void {
    this.tooltipText = text;
  }

  hideTooltip(): void {
    this.tooltipText = null;
  }

  fieldConfigs = [
    {
      controlName: 'typesOfCollaborationDesired',
      label: 'Types of collaboration desired',
      helper: 'What kind of collaborations are you interested in? (e.g., Joint research, co-authoring, shared lab access)'
    },
    {
      controlName: 'preferredDomains',
      label: 'Preferred domains',
      helper: 'Fields you would prefer to collaborate in. Example: Computational Chemistry, Material Science.'
    },
    {
      controlName: 'collaborationGoals',
      label: 'Collaboration goals',
      helper: 'What do you aim to achieve through collaboration?'
    },
    {
      controlName: 'resourceSharing',
      label: 'Resource sharing',
      helper: 'What facilities or resources can you offer or expect to share?'
    },
    {
      controlName: 'availableTime',
      label: 'Available time',
      helper: 'How much time can you dedicate? Example: 5 hrs/week or weekends only.'
    },
    {
      controlName: 'desiredSkillsInCollaborators',
      label: 'Desired skills in collaborators',
      helper: 'Specific skills or expertise you look for in collaborators.'
    },
    {
      controlName: 'mutualBenefitsInCollaboration',
      label: 'Mutual benefits in collaboration',
      helper: 'How both parties can benefit. Example: Joint publication, shared funding.'
    }
  ];

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}