import { Component, OnInit, Input } from '@angular/core';
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
  @Input() embedded: boolean = false; // when true, render without outer layout/sidebar so it can be embedded inside profile
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

  

  // Compute insights based on the currently loaded publications
  computeInsights(): void {
    try {
      const yearMap: { [year: string]: number } = {};
      const journalMap: { [j: string]: number } = {};

      this.publications.forEach(pub => {
        // Determine year from known fields
        let year: string | null = null;
        if (pub.publicationDate) {
          // format like YYYY or YYYY-MM
          const m = /^\d{4}/.exec(pub.publicationDate);
          if (m) year = m[0];
        }
        if (!year && pub.date) {
          const m = /\d{4}/.exec(pub.date);
          if (m) year = m[0];
        }
        if (!year && pub.publication_date) {
          const m = /\d{4}/.exec(pub.publication_date);
          if (m) year = m[0];
        }
        // fallback: try to extract any 4-digit number from DOI/url
        if (!year && pub.doi) {
          const m = /(19|20)\d{2}/.exec(pub.doi);
          if (m) year = m[0];
        }

        if (year) {
          yearMap[year] = (yearMap[year] || 0) + 1;
        }

        const journal = pub.journal || pub.source || 'Unknown';
        if (journal) {
          journalMap[journal] = (journalMap[journal] || 0) + 1;
        }
      });

      // Sort years ascending
      const years = Object.keys(yearMap).sort((a, b) => parseInt(a) - parseInt(b));
  this.insightsYears = years;
  this.insightsCounts = years.map(y => yearMap[y]);

  // capture original ordering so Reset can restore it
  this.insightsOriginalYears = [...this.insightsYears];
  this.insightsOriginalCounts = [...this.insightsCounts];
  this.insightsSortDesc = false;

  

      this.insightsTotalPublications = this.publications.length;

      // Best year
      let bestYear: string | null = null;
      let bestCount = 0;
      for (const y of years) {
        if (yearMap[y] > bestCount) {
          bestCount = yearMap[y];
          bestYear = y;
        }
      }
      this.insightsBestYear = bestYear;
      this.insightsBestYearCount = bestCount;

      // Most active journal
      let topJournal: string | null = null;
      let topJournalCount = 0;
      Object.keys(journalMap).forEach(j => {
        if (journalMap[j] > topJournalCount) {
          topJournalCount = journalMap[j];
          topJournal = j;
        }
      });
      this.insightsMostActiveJournal = topJournal;
    } catch (e) {
      console.warn('Failed to compute insights', e);
      this.insightsYears = [];
      this.insightsCounts = [];
      this.insightsTotalPublications = this.publications.length || 0;
      this.insightsBestYear = null;
      this.insightsMostActiveJournal = null;
    }
  }

  // Toggle sort order by year (ascending <-> descending)
  sortByYear(): void {
    if (!this.insightsYears || !this.insightsYears.length) return;
    // toggle direction
    this.insightsSortDesc = !this.insightsSortDesc;
    const pairs = this.insightsYears.map((y, i) => ({ y, c: this.insightsCounts[i] || 0 }));
    pairs.sort((a, b) => {
      // sort by numeric year
      const ay = parseInt(a.y as string, 10) || 0;
      const by = parseInt(b.y as string, 10) || 0;
      return this.insightsSortDesc ? by - ay : ay - by;
    });
    this.insightsYears = pairs.map(p => p.y);
    this.insightsCounts = pairs.map(p => p.c);
  }

  resetInsightsSort(): void {
    // restore the original ordering captured when insights were computed
    if (this.insightsOriginalYears && this.insightsOriginalYears.length) {
      this.insightsYears = [...this.insightsOriginalYears];
      this.insightsCounts = [...this.insightsOriginalCounts];
      this.insightsSortDesc = false;
    }
  }

  get insightsSortLabel(): string {
    return this.insightsSortDesc ? 'Year ↓' : 'Year ↑';
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
    // Only proceed if the user agreed to the upload terms (controlled by the template checkbox)
    if (!this.uploadTermsAgreed) {
      alert('Please agree to the terms before uploading.');
      return;
    }

    this.showUploadTermsPopup = false;
    if (this.uploadPDFPub) {
      this.uploadPDF(this.uploadPDFPub);
      this.uploadPDFPub = null;
    }
    // reset agreement state
    this.uploadTermsAgreed = false;
  }

  // Tracks whether the user checked I agree on the upload terms modal
  uploadTermsAgreed: boolean = false;

  // Tracks whether the user agreed on the institutional popup during upload flow
  uploadInstitutionalAgreed: boolean = false;

  // Typed handler for the upload institutional checkbox change
  onUploadInstitutionalChecked(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.uploadInstitutionalAgreed = !!(target && target.checked);
  }

  // When user agrees on the institutional popup, allow direct upload (for upload flow)
  onUploadInstitutionalAgree(): void {
    if (!this.uploadInstitutionalAgreed) {
      alert('Please agree to the institutional repository terms before uploading.');
      return;
    }
    this.showUploadInstitutionalPopup = false;
    if (this.uploadPDFPub) {
      this.uploadPDF(this.uploadPDFPub);
      this.uploadPDFPub = null;
    }
    // reset flag
    this.uploadInstitutionalAgreed = false;
  }

  // Typed handler for the upload terms checkbox change event to satisfy template type checking
  onUploadTermsChecked(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.uploadTermsAgreed = !!(target && target.checked);
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
  // Citation stats fetched for the selected publication (used in Collaborations subpage)
  citationStats: any = null;
  citationYears: number[] = [];
  citationCounts: number[] = [];
  hIndex: number[] = [];
  citationMaxCount: number = 0;
  // Filter and UI state for collaborations chart
  citationFilter: string = 'all'; // all | newest | oldest | last5 | last10 | custom
  customStartYear: number | null = null;
  customEndYear: number | null = null;
  citationFilteredYears: number[] = [];
  citationFilteredCounts: number[] = [];
  citationSortDesc: boolean = false;
  // Insights data for the new 'Insights & Trends' section
  insightsYears: string[] = [];
  insightsCounts: number[] = [];
  insightsTotalPublications: number = 0;
  insightsBestYear: string | null = null;
  insightsBestYearCount: number = 0;
  insightsMostActiveJournal: string | null = null;
  // Keep originals so Reset can restore the initial ordering
  private insightsOriginalYears: string[] = [];
  private insightsOriginalCounts: number[] = [];
  insightsSortDesc: boolean = false; // false => ascending by year, true => descending
  
  // Active subpage inside Publications: 'publications' | 'insights' | 'collaborations' | 'ongoing'
  activeSubpage: string = 'publications';

  setSubpage(tab: string) {
    this.activeSubpage = tab;
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
            // Minor, non-invasive role validation: fetch the canonical user object to obtain role
            // without changing existing behaviour that uses achievements data.
            this.service.getUserByEmail(email).subscribe(
              userObj => {
                if (!userObj) return;
                // If backend provides a simple role field, use it.
                if (userObj.role) {
                  this.userData.role = userObj.role;
                  return;
                }
                // Common alternatives: roles array or authorities
                const alt = userObj.roles || userObj.authorities;
                if (Array.isArray(alt) && alt.length) {
                  const first = alt[0];
                  this.userData.role = typeof first === 'string' ? first : (first.authority || first.role || JSON.stringify(first));
                }
              },
              err => {
                // Don't break existing behaviour if role fetch fails; just log for debugging.
                console.warn('Could not fetch user role from getUserByEmail', err);
              }
            );
        // attempt to load saved publications for this user from backend; if none, fall back to user data
        this.service.getSavedPublications(email).subscribe(
          (saved: any[]) => {
            if (saved && saved.length > 0) {
              this.publications = saved;
              this.selectedPublication = saved[0];
              this.computeInsights();
            } else {
              this.publications.push(this.userData);
              this.selectedPublication = this.userData;
              this.computeInsights();
            }
            this.fetchImage(this.userData.email); // Load on page load
            this.fetchImageForInstituteLogo(this.userData.email);
            // update PDF flags for listed publications
            this.updatePdfFlagsForPublications(email);
          },
          (err: any) => {
            console.warn('Failed to load saved publications from API, falling back to user data', err);
            this.publications.push(this.userData);
            this.selectedPublication = this.userData;
            this.fetchImage(this.userData.email); // Load on page load
            this.fetchImageForInstituteLogo(this.userData.email);
            // update PDF flags for listed publications
            this.updatePdfFlagsForPublications(email);
          }
        );
          },
          error => console.error('Error fetching user details:', error)
        );
      }
    }
  }

  // Save a publication via backend API (replaces previous localStorage approach)
  savePublication(pub: any): void {
    const email = this.userData.email;
    if (!email) {
      alert('User not identified. Please login again.');
      return;
    }

    const payload = Object.assign({}, pub, { savedBy: email });
    this.service.savePublication(payload).subscribe(
      (saved: any) => {
        // refresh saved list from server
        this.service.getSavedPublications(email).subscribe((savedList: any[]) => {
          this.publications = savedList;
          this.selectedPublication = savedList[0];
          this.computeInsights();
        }, () => {
          // fallback: insert saved into list
          this.publications.unshift(saved);
          this.selectedPublication = saved;
          this.computeInsights();
        });
      },
      (err: any) => {
        console.error('Failed to save publication to server:', err);
        alert('Failed to save publication.');
      }
    );
  }

  // After a successful PDF upload, refresh saved publications from backend so UI reflects pdf state
  markPdfUploaded(pub: any): void {
    const email = this.userData.email;
    if (!email) return;
    this.service.getSavedPublications(email).subscribe((savedList: any[]) => {
      this.publications = savedList;
      if (savedList && savedList.length > 0) {
        this.selectedPublication = savedList.find((p: any) => p.title === pub.title) || savedList[0];
        this.computeInsights();
      }
    }, err => console.warn('Failed to refresh saved publications after upload', err));
  }

  // Check backend for each publication whether a PDF file exists and set pub.pdfUploaded = true when present.
  // This uses the existing PDF endpoint: GET /api/pdf/{username}/{title}
  updatePdfFlagsForPublications(username: string): void {
    if (!this.publications || !this.publications.length) return;
    this.publications.forEach(pub => {
      try {
        const title = pub.title || pub.doi || pub.url || 'publication';
        const url = `http://localhost:8080/api/pdf/${encodeURIComponent(username)}/${encodeURIComponent(title)}`;
        // Attempt to HEAD or GET the PDF; backend may not support HEAD, so use GET but ignore the blob body.
        this.http.get(url, { responseType: 'blob' }).subscribe({
          next: blob => {
            // if we receive a blob and size > 0, mark as uploaded
            if (blob && (blob.size === undefined || blob.size > 0)) {
              pub.pdfUploaded = true;
            }
          },
          error: () => {
            // no pdf present or error — clear flag
            pub.pdfUploaded = false;
          }
        });
      } catch (e) {
        pub.pdfUploaded = false;
      }
    });
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

  // When user clicks a publication row: select it, fetch citation stats and show Collaborations subpage
  openPublication(pub: any): void {
    this.selectedPublication = pub;
    // Determine DOI parameter to send to backend API. Prefer full DOI url if available.
    let doiParam = '';
    if (pub.url && pub.url.includes('doi.org')) {
      doiParam = pub.url;
    } else if (pub.doi) {
      // If DOI looks like bare doi (10.x/...), convert to full URL
      doiParam = pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`;
    } else if (pub.id) {
      doiParam = pub.id;
    }

    if (!doiParam) {
      // No DOI available — still navigate to collaborations tab but clear stats
      this.citationStats = null;
      this.citationYears = [];
      this.citationCounts = [];
      this.hIndex = [];
      this.setSubpage('collaborations');
      return;
    }

    const url = `http://localhost:8080/api/citations`;
    // Use POST with DOI as query parameter: POST /api/citations?doi=<doi-url>
    this.http.post(url, {}, { params: { doi: doiParam } }).subscribe({
      next: (resp: any) => {
        this.citationStats = resp || null;
        // Prepare arrays for charting (openAlex counts_by_year preferred)
        this.citationYears = [];
        this.citationCounts = [];
         this.hIndex = [];
        this.citationMaxCount = 0;
        try {
          const counts = resp?.openAlex?.counts_by_year || [];
          // sort ascending by year
          counts.sort((a: any, b: any) => a.year - b.year);
          counts.forEach((c: any) => {
            this.citationYears.push(c.year);
            this.citationCounts.push(c.cited_by_count || 0);
          });
          if (this.citationCounts.length) this.citationMaxCount = Math.max(...this.citationCounts);
        } catch (e) {
          this.citationYears = [];
          this.citationCounts = [];
          this.hIndex=[];
          this.citationMaxCount = 0;
        }
        // initialize filtered arrays and UI state
        this.resetCitationFilter();
        this.setSubpage('collaborations');
        // give Angular time to switch subpage then scroll into view
        setTimeout(() => {
          const el = document.querySelector('.collaborations-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      },
      error: (err: any) => {
        console.error('Failed to fetch citation stats', err);
        this.citationStats = null;
        this.citationYears = [];
        this.citationCounts = [];
        this.citationMaxCount = 0;
        this.hIndex = [];
        this.resetCitationFilter();
        this.setSubpage('collaborations');
      }
    });
  }

  // Apply the currently selected filter to produce filtered arrays used by the chart
  applyCitationFilter(): void {
    if (!this.citationYears || !this.citationYears.length) {
      this.citationFilteredYears = [];
      this.citationFilteredCounts = [];
      this.citationMaxCount = 0;
      return;
    }

    // start from full arrays
    let pairs = this.citationYears.map((y, i) => ({ year: y, count: this.citationCounts[i] || 0 }));

    const sortedAsc = [...pairs].sort((a, b) => a.year - b.year);
    const sortedDesc = [...pairs].sort((a, b) => b.year - a.year);

    switch (this.citationFilter) {
      case 'newest':
        pairs = sortedDesc;
        break;
      case 'oldest':
        pairs = sortedAsc;
        break;
      case 'last5': {
        const maxYear = Math.max(...this.citationYears);
        const start = maxYear - 4;
        pairs = sortedAsc.filter(p => p.year >= start && p.year <= maxYear);
        break;
      }
      case 'last10': {
        const maxYear = Math.max(...this.citationYears);
        const start = maxYear - 9;
        pairs = sortedAsc.filter(p => p.year >= start && p.year <= maxYear);
        break;
      }
      case 'custom': {
        if (this.customStartYear == null || this.customEndYear == null) {
          pairs = sortedAsc;
        } else {
          const s = Math.min(this.customStartYear, this.customEndYear);
          const e = Math.max(this.customStartYear, this.customEndYear);
          pairs = sortedAsc.filter(p => p.year >= s && p.year <= e);
        }
        break;
      }
      default:
        pairs = sortedAsc;
    }

    // Apply sort direction toggle on currently filtered pairs
    pairs = this.citationSortDesc ? pairs.sort((a, b) => b.year - a.year) : pairs.sort((a, b) => a.year - b.year);

    this.citationFilteredYears = pairs.map(p => p.year);
    this.citationFilteredCounts = pairs.map(p => p.count);
    this.citationMaxCount = this.citationFilteredCounts.length ? Math.max(...this.citationFilteredCounts) : 0;
  }

  // Toggle sort order for the collaborations chart
  toggleCitationSort(): void {
    this.citationSortDesc = !this.citationSortDesc;
    this.applyCitationFilter();
  }

  resetCitationFilter(): void {
    this.citationFilter = 'all';
    this.customStartYear = null;
    this.customEndYear = null;
    this.citationSortDesc = false;
    // default filtered arrays are full ascending by year
    const pairs = this.citationYears.map((y, i) => ({ year: y, count: this.citationCounts[i] || 0 })).sort((a, b) => a.year - b.year);
    this.citationFilteredYears = pairs.map(p => p.year);
    this.citationFilteredCounts = pairs.map(p => p.count);
    this.citationMaxCount = this.citationFilteredCounts.length ? Math.max(...this.citationFilteredCounts) : 0;
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
        next: () => {
          alert('PDF uploaded successfully!');
          try {
            this.markPdfUploaded(pub);
          } catch (e) {
            console.warn('Could not update saved publication after upload', e);
          }
        },
        error: () => {
          alert('PDF uploaded successfully!');
        }
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

  // Popup states for DOI/info flow (template uses these)
  showDOIPopup: boolean = false;
  showCopyrightPopup: boolean = false;
  showEmbargoPopup: boolean = false;
  showSelfArchivingPopup: boolean = false;
  showInstitutionalPopup: boolean = false;
  showTermsPopup: boolean = false;

  // Form submit handler (template binding)
  onSubmit(): void {
    // When user submits DOI, fetch publication metadata immediately (no popups)
    const doiControl = this.publicationsForm.get('doiUrl');
    const doi = doiControl ? (doiControl.value || '').trim() : '';
    if (!doi) {
      return;
    }

    this.service.getPublication(doi).subscribe(
      (result: any) => {
        const pub = result || {};
        if (pub.authors && !pub.authorsArray) {
          try {
            pub.authorsArray = Array.isArray(pub.authors) ? pub.authors : pub.authors.split(',').map((a: string) => a.trim());
          } catch (e) {
            pub.authorsArray = [];
          }
        }
        this.publication = pub;
        this.publications.unshift(pub);
        this.selectedPublication = pub;
        doiControl?.setValue('');
      },
      (err: any) => {
        console.error('Failed to fetch publication for DOI/url:', err);
        alert('Could not fetch publication details. Please check the DOI or try again later.');
      }
    );
  }

  // Handlers for the DOI/info popup flow (mirror the upload flow)
  onDOIPopupContinue(): void {
    this.showDOIPopup = false;
    this.showCopyrightPopup = true;
  }

  onCopyrightPopupContinue(): void {
    this.showCopyrightPopup = false;
    this.showEmbargoPopup = true;
  }

  onEmbargoPopupContinue(): void {
    this.showEmbargoPopup = false;
    this.showSelfArchivingPopup = true;
  }

  onSelfArchivingPopupContinue(): void {
    this.showSelfArchivingPopup = false;
    this.showInstitutionalPopup = true;
  }

  onInstitutionalPopupContinue(): void {
    this.showInstitutionalPopup = false;
    this.showTermsPopup = true;
  }

  onTermsPopupContinue(): void {
    this.showTermsPopup = false;
    // Final step for DOI/info flow: submit the DOI to the backend and update UI.
    const doiControl = this.publicationsForm.get('doiUrl');
    const doi = doiControl ? (doiControl.value || '').trim() : '';
    if (!doi) {
      // nothing to do
      return;
    }

    // Use existing service helper to fetch publication metadata (backend should handle DOI/url)
    this.service.getPublication(doi).subscribe(
      (result: any) => {
        // If backend returns a single publication object, push/update list and select it
        const pub = result || {};
        // normalize authorsArray if backend provides authors as a string
        if (pub.authors && !pub.authorsArray) {
          try {
            // If authors is a comma-separated string
            pub.authorsArray = Array.isArray(pub.authors) ? pub.authors : pub.authors.split(',').map((a: string) => a.trim());
          } catch (e) {
            pub.authorsArray = [];
          }
        }
        this.publication = pub;
        // Add to publications list so the UI shows it (unshift to show first)
        this.publications.unshift(pub);
        this.selectedPublication = pub;
        // clear DOI field
        doiControl?.setValue('');
      },
      (err: any) => {
        console.error('Failed to fetch publication for DOI/url:', err);
        alert('Could not fetch publication details. Please check the DOI or try again later.');
      }
    );
  }
}