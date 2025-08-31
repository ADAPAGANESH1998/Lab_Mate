import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LabmateService } from 'src/app/labmate.service';

export interface Achievement {
  email: string;
  awardsAndRecognition: string;
  majorMilestones: string;
  fundingSecured: string;
  breakthroughsOrInnovations: string;
  teachingAndMentorship: string;
  communityContributions: string;
}

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  achievementsForm!: FormGroup;
  tooltipText: string | null = null;
  userData: any = {};

  selectedFile!: File;
  imageUrl: string | ArrayBuffer | null = null;

  selectedFileForInstituteLogo!: File;
  imageUrlForInstitute: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private service: LabmateService, private router: Router) {}

  ngOnInit(): void {
    this.achievementsForm = this.fb.group({
      email: [''],
      awardsAndRecognition: [''],
      majorMilestones: [''],
      fundingSecured: [''],
      breakthroughsOrInnovations: [''],
      teachingAndMentorship: [''],
      communityContributions: ['']
    });

    this.getDetails();
    this.fetchImage();
    this.fetchImageForInstituteLogo();
  }

  onSubmit(): void {
    const formData = this.achievementsForm.value;
    const token = sessionStorage.getItem('authToken')!;
    if (token) {
      const payload = this.decodeJwtToken(token);
      formData.email = payload?.sub;
      this.service.saveAchievements(formData).subscribe(() => {
        this.router.navigate(['/profile']);
      });
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
        this.service.getUserAchievementsByEmail(email).subscribe(
          data => {
            this.userData = data;
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
      controlName: 'awardsAndRecognition',
      label: 'Awards and Recognition',
      helper: 'List notable awards, fellowships, or honors for your research.\nExamples: Best Young Scientist Award, National Research Fellowship.'
    },
    {
      controlName: 'majorMilestones',
      label: 'Major milestones',
      helper: 'Key achievements like securing patents, or innovation launches.\nExamples: Developed a novel drug formulation, Discovered a gene.'
    },
    {
      controlName: 'fundingSecured',
      label: 'Funding secured',
      helper: 'Mention research grants, sponsorships, or institutional funding.\nExamples: Received NSF grant for nanomaterials research.'
    },
    {
      controlName: 'breakthroughsOrInnovations',
      label: 'Breakthroughs or Innovations',
      helper: 'List groundbreaking discoveries or techniques.\nExamples: Created a high-stability nanofabrication, Developed AI-based simulation.'
    },
    {
      controlName: 'teachingAndMentorship',
      label: 'Teaching and mentorship',
      helper: 'Include mentoring, workshops, or academic roles.\nExamples: Mentored 5 PhD students, Conducted spectroscopy workshops.'
    },
    {
      controlName: 'communityContributions',
      label: 'Community contributions',
      helper: 'Outreach, professional society involvement, or volunteer efforts.\nExamples: Co-chaired a nanoscience conference, organized a materials journal club.'
    }
  ];

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
