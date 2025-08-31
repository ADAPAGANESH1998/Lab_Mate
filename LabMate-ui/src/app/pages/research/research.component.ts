import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';

export interface Research {
  email: string; // Optional when posting new data
  aboutResearch: string;
  primaryResearchFocus: string;
  inspirationalQuestion: string;
  currentResearchChallenges: string;
  techniquesExpertise: string;
  researchProjects: string;
  areYouLookingForFunding: string;
}
@Component({
  selector: 'app-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit {
researchForm!: FormGroup;
tooltipText: string | null = null;
userData: any = {};
  selectedFile!: File;
  imageUrl: string | ArrayBuffer | null = null;

  selectedFileForInstituteLogo!: File;
  imageUrlForInstitute: string | ArrayBuffer | null = null;
  constructor(private fb: FormBuilder,private service:LabmateService, private router: Router) { }

  ngOnInit(): void {
   this.researchForm = this.fb.group({
    email : [''],
    aboutResearch: [''],
    primaryResearchFocus: [''],
    inspirationalQuestion: [''],
    currentResearchChallenges: [''],
    techniquesExpertise: [''],
    researchProjects: [''],
    areYouLookingForFunding: ['']
  });
this.fetchImageForInstitueLogo();
this.fetchImage();
}
onSubmit(): void {
  const formData = this.researchForm.value;
  const token = sessionStorage.getItem('authToken')!;

  if (token) {
    const payload = this.decodeJwtToken(token);
    formData.email =  payload?.sub;;
    this.service.saveResearch(formData).subscribe(() => {
   this.router.navigate(['/profile'])
  });

  }
}
decodeJwtToken(token: string): any {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const decodedPayload = atob(padded);
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}
onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.upload(); // Automatically upload on selection
  }
  onFileSelectedForCollegeLogo(event: any) {
    this.selectedFileForInstituteLogo = event.target.files[0];
    this.uploadForInstituteLogo(); // Automatically upload on selection
  }

  showTooltip(text: string): void {
  this.tooltipText = text;
}

hideTooltip(): void {
  this.tooltipText = null;
}
  upload() {
    if (this.selectedFile) {
      this.service.uploadImage(this.selectedFile).subscribe(() => {
        this.fetchImage(); // Refresh after upload
      });
    }
  }

  uploadForInstituteLogo() {
    if (this.selectedFileForInstituteLogo) {
      this.service.uploadImageForInstituteLogo(this.selectedFileForInstituteLogo).subscribe(() => {
        this.fetchImageForInstitueLogo(); // Refresh after upload
      });
    }
  }

  fetchImage() {
    this.service.getLatestImage().subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(imageBlob);
    });
  }

  fetchImageForInstitueLogo() {
    this.service.getLatestImageForInstitute().subscribe(imageBlob => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrlForInstitute = reader.result;
      };
      reader.readAsDataURL(imageBlob);
    });
  }

getDetails(): void {
const token = sessionStorage.getItem('authToken')!;
// const payload = this.decodeJwtToken(token);
// const email = payload?.sub;
//  console.log("Ganesh"+email);
  if (token) {
    const payload = this.decodeJwtToken(token);
    const email = payload?.sub;

    if (email) {
      this.service.getUserByEmail(email).subscribe(
        data => {
this.userData = data,
console.log("Ganesh.........."+JSON.stringify(this.userData));
        }
        
        ,
        error => console.error('Error fetching user details:', error)
      );
    } else {
      console.warn('Email not found in token');
    }
  } else {
    console.warn('No auth token in sessionStorage');
  }
}
fieldConfigs = [
  {
    controlName: 'aboutResearch',
    label: 'About research',
    helper: 'Describe about your research in detail.'
  },
  {
    controlName: 'primaryResearchFocus',
    label: 'Primary research focus',
    helper: 'Summarize your main research area (e.g., Solid-state chemistry, APIs)'
  },
  {
    controlName: 'inspirationalQuestion',
    label: 'Inspirational question',
    helper: 'The big question driving your research (e.g., Can co-crystals enter the market?)'
  },
  {
    controlName: 'currentResearchChallenges',
    label: 'Current research challenges',
    helper: 'Main problems or obstacles in your research.'
  },
  {
    controlName: 'techniquesExpertise',
    label: 'Lab techniques expertise',
    helper: 'List the research techniques you specialize in (e.g., XRD, Spectroscopy).'
  },
  {
    controlName: 'researchProjects',
    label: 'Dream research projects',
    helper: 'If resources were unlimited, what would you work on?'
  },
  {
    controlName: 'areYouLookingForFunding',
    label: 'Are you looking for funding?',
    helper: 'If yes, for what? (e.g., "Yes, for large-scale co-crystal synthesis")'
  }
];

isActive(path: string): boolean {
    return this.router.url === path;
  }
}
