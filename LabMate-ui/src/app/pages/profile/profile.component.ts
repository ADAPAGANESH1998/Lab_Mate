import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'research'; // default tab
  userData: any = {};
  researcherData: any = {};
  collaborationData: any ={};
  selectedFile!: File;
  imageUrl: string | ArrayBuffer | null = null;
  achievementData: any = {};

  selectedFileForInstituteLogo!: File;
  imageUrlForInstitute: string | ArrayBuffer | null = null;

  constructor(private service : LabmateService, private router: Router) { }

  ngOnInit(): void {
      this.getDetails();
      this.fetchImage(); // Load on page load
      this.fetchImageForInstitueLogo();
      this.getDetailsForResearcher();
      this.getDetailsForColloboration();
      this.getDetailsForAchievements();
  }

onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.upload(); // Automatically upload on selection
  }
  onFileSelectedForCollegeLogo(event: any) {
    this.selectedFileForInstituteLogo = event.target.files[0];
    this.uploadForInstituteLogo(); // Automatically upload on selection
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

getDetailsForColloboration() : void {
  const token = sessionStorage.getItem('authToken')!;
// const payload = this.decodeJwtToken(token);
// const email = payload?.sub;
//  console.log("Ganesh"+email);
  if (token) {
    const payload = this.decodeJwtToken(token);
    const email = payload?.sub;

    if (email) {
      this.service.getUserByEmailForCollaboration(email).subscribe(
        data => {
        this.collaborationData = data,
       console.log("Ganesh.   mmm........."+JSON.stringify(this.userData));
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
getDetailsForResearcher(): void {
const token = sessionStorage.getItem('authToken')!;
// const payload = this.decodeJwtToken(token);
// const email = payload?.sub;
//  console.log("Ganesh"+email);
  if (token) {
    const payload = this.decodeJwtToken(token);
    const email = payload?.sub;

    if (email) {
      this.service.getUserByEmailForResearcher(email).subscribe(
        data => {
        this.researcherData = data,
       console.log("Ganesh.   mmm........."+JSON.stringify(this.userData));
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


recommendedCollaborators = [
  { name: 'Dr. Arvind Rao – IIT Bombay', field: 'Nanomaterials & Surface Chemistry' },
  { name: 'Prof. Lata Meena – University of Delhi', field: 'Materials Chemistry, Green Synthesis' },
];

suggestedPapers = [
  { title: 'Polymorphic transitions in pharmaceutical solids', journal: 'Journal of Solid State Chem.', year: 2023 },
  { title: 'Nano-enabled drug delivery systems', journal: 'Adv Drug Delivery Reviews', year: 2022 }
];

events = [
  { title: 'International Conf. on Crystallography', date: 'May 21–24', location: 'Zurich' },
  { title: 'Webinar: X-ray Diffraction', date: 'Apr 30', location: 'Online' }
];

setTab(tab: string): void {
  this.activeTab = tab;
}


getDetailsForAchievements(): void {
const token = sessionStorage.getItem('authToken')!;
// const payload = this.decodeJwtToken(token);
// const email = payload?.sub;
//  console.log("Ganesh"+email);
  if (token) {
    const payload = this.decodeJwtToken(token);
    const email = payload?.sub;

    if (email) {
      this.service.getUserAchievementsByEmail(email).subscribe(
  data => {
    this.achievementData = data;
  },
  error => console.error('Error fetching achievement details:', error)
);
    } else {
      console.warn('Email not found in token');
    }
  } else {
    console.warn('No auth token in sessionStorage');
  }
}

}
