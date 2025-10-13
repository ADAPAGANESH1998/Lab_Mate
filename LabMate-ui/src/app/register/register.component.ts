import { Component, OnInit } from '@angular/core';
import { LabmateService } from '../labmate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  formData = {
    title: 'Dr.',
    fullName: '',
    dateOfBirth: '',
    field: '',
    profession: '',
    country: '',
    state: '',
    email: '',
    confirmEmail: '',
    institution: '',
    password: '',
    confirmPassword: '',
    orcidId : ''
  };

  countries: any[] = [];
  institutions: any[] = [];
  states: string[] = [];
  selectedCountry: string = '';
  selectedState: string = '';

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years: number[] = [];
  days: number[] = [];
  showPopup = false;
  selectedField: string | null = null;
  showFieldPopup: boolean = false;
  showProfessionPopup: boolean = false;
  subfields: string[] = [];
  selectedStates: string[] = [];
  fieldSubfieldMap: { [key: string]: string[] } = {
    physics: ['Astrophysics', 'Condensed Matter', 'Nuclear Physics', 'Quantum Mechanics'],
    chemistry: ['Analytical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
    biology: ['Molecular Biology', 'Microbiology', 'Botany', 'Zoology'],
    mathematics: ['Algebra', 'Calculus', 'Statistics', 'Geometry'],
    engineering: ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'],
    'material-science': ['Nanomaterials', 'Metallurgy', 'Polymers', 'Ceramics'],
    'computer-science': ['AI & ML', 'Cybersecurity', 'Software Engineering', 'Data Science'],
    'pharmaceutical-sciences': ['Pharmacology', 'Pharmaceutics', 'Medicinal Chemistry'],
    'medical-research': ['Oncology', 'Neurology', 'Cardiology'],
    'public-health': ['Epidemiology', 'Health Policy', 'Global Health'],
    geology: ['Petrology', 'Paleontology', 'Geophysics'],
    'environmental-science': ['Climate Change', 'Sustainability', 'Environmental Toxicology'],
    'hydrology-oceanography': ['Hydrology', 'Ocean Currents', 'Marine Biology'],
    'agricultural-sciences': ['Soil Science', 'Horticulture', 'Agronomy'],
    'social-sciences': ['Sociology', 'Economics', 'Political Science'],
    humanities: ['Philosophy', 'History', 'Linguistics'],
    'anthropology-archaeology': ['Cultural Anthropology', 'Archaeological Methods', 'Evolutionary Anthropology']
  };
 
  constructor(
    private registrationService: LabmateService,
    private router: Router
  ) {
    this.generateYears();
    this.generateDays();
  }

  ngOnInit(): void {
    this.registrationService.getCountries().subscribe((data) => {
      this.countries = data;
    });

    this.registrationService.getInstitutions().subscribe((data) => {
      this.institutions = data.items;
    });
    
  }

  onFieldChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    this.showSubfields(selectedValue);
  }
  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      this.years.push(i);
    }
  }
  showSubfields(field: string): void {
    this.selectedField = field;
    this.subfields = this.fieldSubfieldMap[field] || [];
  }

  generateDays() {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
  }
  onSubmit() {
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    if (!this.formData.dateOfBirth) {
      alert('Please select a valid date of birth.');
      return;
    }
  
    // Ensure date format is YYYY-MM-DD
    const dob = new Date(this.formData.dateOfBirth);
    const formattedDOB = `${dob.getFullYear()}-${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob.getDate().toString().padStart(2, '0')}`;
  
    const finalFormData = {
      title: this.formData.title,
      fullName: this.formData.fullName,
      dateOfBirth: formattedDOB,
      field: this.formData.field,
      profession: this.formData.profession,
      country: this.formData.country,
      state: this.formData.state,
      email: this.formData.email,
      confirmEmail: this.formData.confirmEmail,
      institution: this.formData.institution,
      password: this.formData.password,
      confirmPassword: this.formData.confirmPassword,
      orcidId: this.formData.orcidId
    };
  
    this.registrationService.saveRegister(finalFormData).subscribe(
      response => {
        sessionStorage.setItem('registeredUserId', response.id);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error:', error);
        alert('Registration failed. Please try again!');
      }
    );
  }
  professionSubfields: string[] = [
    // Physics
    "Quantum Mechanics", "Condensed Matter Physics", "High Energy Physics", "Atomic, Molecular, and Optical Physics", 
    "Plasma Physics", "Nuclear Physics", "Computational Physics", "Mathematical Physics", "Astrophysics", 
    "Geophysics", "Biophysics", "Quantum Field Theory", "Quantum Information Science",
  
    // Chemistry
    "Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Analytical Chemistry", "Theoretical Chemistry", 
    "Computational Chemistry", "Biochemistry", "Solid-State Chemistry", "Surface Chemistry", "Coordination Chemistry", 
    "Supramolecular Chemistry", "Green Chemistry", "Medicinal Chemistry", "Environmental Chemistry", "Crystallography", 
    "Radiochemistry", "Polymer Chemistry", "Electrochemistry", "Photochemistry", "Quantum Chemistry",
  
    // Biology
    "Molecular Biology", "Cell Biology", "Genetics", "Genomics", "Proteomics", "Microbiology", "Immunology", 
    "Virology", "Developmental Biology", "Neurobiology", "Neuroscience", "Evolutionary Biology", "Systems Biology", 
    "Synthetic Biology", "Structural Biology", "Marine Biology", "Botany", "Zoology", "Ecology", "Bioinformatics", 
    "Ethology", "Biostatistics",
  
    // Mathematics
    "Algebra", "Topology", "Number Theory", "Geometry", "Logic", "Analysis", "Applied Mathematics", 
    "Differential Equations", "Mathematical Modeling", "Operations Research", "Control Theory", "Computational Mathematics", 
    "Numerical Analysis", "Computational Geometry", "Cryptography", "Optimization", "Statistics", "Probability Theory", 
    "Mathematical Biology", "Mathematical Finance", "Game Theory",
  
    // Engineering
    "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", 
    "Aerospace Engineering", "Environmental Engineering", "Industrial Engineering", "Biomedical Engineering", 
    "Structural Engineering", "Mechatronics", "Control Systems", "Robotics", "Automotive Engineering", 
    "Marine Engineering", "Nuclear Engineering", "Petroleum Engineering", "Textile Engineering",
  
    // Material Science
    "Nanomaterials", "Composite Materials", "Biomaterials", "Polymers", "Ceramics", "Metallurgy", 
    "Surface Engineering", "Electronic Materials", "Smart Materials", "2D Materials", "Materials Chemistry",
  
    // Computer Science
    "Algorithms & Data Structures", "Machine Learning", "Deep Learning", "Artificial Intelligence", 
    "Computer Vision", "Natural Language Processing", "Cybersecurity", "Quantum Computing", 
    "Human-Computer Interaction", "Software Engineering", "Distributed Systems", "Cloud Computing", 
    "Internet of Things", "Blockchain", "Databases", "Computer Graphics", "Computational Neuroscience", 
    "Theoretical Computer Science",
  
    // Pharmaceutical Sciences
    "Pharmacognosy", "Pharmacokinetics & Pharmacodynamics", "Pharmaceutics", "Drug Delivery Systems", 
    "Toxicology", "Clinical Trials", "Regulatory Affairs", "Pharmacy Practice",
  
    // Medical Research
    "Oncology", "Cardiology", "Neurology", "Endocrinology", "Rheumatology", "Gastroenterology", "Pulmonology", 
    "Dermatology", "Nephrology", "Psychiatry", "Surgery", "Pathology", "Radiology",
  
    // Public Health
    "Epidemiology", "Health Informatics", "Health Economics", "Infectious Disease Modeling", 
    "Preventive Medicine", "Mental Health", "Occupational Health", "Global Health", "Community Health", 
    "Health Policy", "Environmental Health", "Disaster Medicine",
  
    // Geology
    "Mineralogy", "Petrology", "Seismology", "Geochemistry", "Structural Geology", "Paleontology", 
    "Hydrogeology", "Volcanology", "Geomorphology", "Stratigraphy",
  
    // Environmental Science
    "Climate Science", "Pollution Control", "Environmental Impact Assessment", "Sustainability Studies", 
    "Carbon Sequestration", "Soil Science", "Atmospheric Science", "Conservation Science",
  
    // Hydrology and Oceanography
    "Hydrology", "Surface Water", "Groundwater", "Hydroinformatics", "Oceanography", 
    "Marine Geology", "Coastal Studies", "Fisheries Science", "Aquaculture",
  
    // Agricultural Sciences
    "Crop Science", "Horticulture", "Agricultural Engineering", "Entomology", "Plant Pathology", 
    "Agronomy", "Irrigation Science", "Agricultural Economics",
  
    // Social Sciences
    "Development Economics", "Behavioral Economics", "Financial Systems", "Cultural Sociology", 
    "Urban Sociology", "Cognitive Psychology", "Clinical Psychology", "Behavioral Psychology", 
    "International Relations", "Public Administration", "Criminology", "Gender Studies", "Social Work",
  
    // Humanities
    "Philosophy", "Linguistics", "Literature", "Religious Studies", "Theology", "Ethics", 
    "Art History", "Classics", "Cultural Studies",
  
    // Anthropology and Archaeology
    "Cultural Anthropology", "Biological Anthropology", "Ethnography", "Paleolithic Archaeology", 
    "Anthropological Linguistics"
  ];

  fields: string[] = [
    'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Engineering',
    'Material Science', 'Computer Science', 'Pharmaceutical Sciences',
    'Medical Research', 'Public Health', 'Geology', 'Environmental Science',
    'Hydrology and Oceanography', 'Agricultural Sciences', 'Social Sciences',
    'Humanities', 'Anthropology and Archaeology'
  ];

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  selectField(field: string) {
    this.selectedField = field;
    this.formData.profession = field;
    this.closePopup();
  }

  // onSubmit() {
  //   if (this.selectedField === 'Other') {
  //     console.log('Submitted with custom field:', this.formData.customField);
  //   } else {
  //     console.log('Submitted with selected field:', this.formData.profession);
  //   }
    // Additional validation or API call here
  // }
  


  professionCategories = [
    {
      name: 'Physics',
      subfields: [
        'Quantum Mechanics', 'Condensed Matter Physics', 'High Energy Physics',
        'Atomic, Molecular, and Optical Physics', 'Plasma Physics', 'Nuclear Physics',
        'Computational Physics', 'Mathematical Physics', 'Astrophysics', 'Geophysics',
        'Biophysics', 'Quantum Field Theory', 'Quantum Information Science'
      ]
    },
    {
      name: 'Chemistry',
      subfields: [
        'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry',
        'Analytical Chemistry', 'Theoretical Chemistry', 'Computational Chemistry',
        'Biochemistry', 'Solid-State Chemistry', 'Surface Chemistry', 'Coordination Chemistry',
        'Supramolecular Chemistry', 'Green Chemistry', 'Medicinal Chemistry',
        'Environmental Chemistry', 'Crystallography', 'Radiochemistry', 'Polymer Chemistry',
        'Electrochemistry', 'Photochemistry', 'Quantum Chemistry'
      ]
    },
    {
      name: 'Biology',
      subfields: [
        'Molecular Biology', 'Cell Biology', 'Genetics', 'Genomics', 'Proteomics',
        'Microbiology', 'Immunology', 'Virology', 'Developmental Biology', 'Neurobiology',
        'Neuroscience', 'Evolutionary Biology', 'Systems Biology', 'Synthetic Biology',
        'Structural Biology', 'Marine Biology', 'Botany', 'Zoology', 'Ecology',
        'Bioinformatics', 'Biophysics', 'Ethology', 'Biostatistics'
      ]
    },
    {
      name: 'Mathematics',
      subfields: [
        'Algebra', 'Topology', 'Number Theory', 'Geometry', 'Logic', 'Analysis',
        'Applied Mathematics', 'Differential Equations', 'Mathematical Modeling',
        'Operations Research', 'Control Theory', 'Mathematical Physics',
        'Computational Mathematics', 'Numerical Analysis', 'Computational Geometry',
        'Cryptography', 'Optimization', 'Statistics', 'Probability Theory',
        'Mathematical Biology', 'Mathematical Finance', 'Game Theory'
      ]
    },
    {
      name: 'Engineering',
      subfields: [
        'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
        'Chemical Engineering', 'Aerospace Engineering', 'Environmental Engineering',
        'Industrial Engineering', 'Biomedical Engineering', 'Structural Engineering',
        'Mechatronics', 'Control Systems', 'Robotics', 'Automotive Engineering',
        'Marine Engineering', 'Nuclear Engineering', 'Petroleum Engineering',
        'Textile Engineering'
      ]
    },
    {
      name: 'Material Science',
      subfields: [
        'Nanomaterials', 'Composite Materials', 'Biomaterials', 'Polymers', 'Ceramics',
        'Metallurgy', 'Surface Engineering', 'Electronic Materials', 'Smart Materials',
        '2D Materials', 'Materials Chemistry'
      ]
    },
    {
      name: 'Computer Science',
      subfields: [
        'Algorithms & Data Structures', 'Machine Learning', 'Deep Learning',
        'Artificial Intelligence', 'Computer Vision', 'Natural Language Processing',
        'Cybersecurity', 'Quantum Computing', 'Human-Computer Interaction',
        'Software Engineering', 'Distributed Systems', 'Cloud Computing',
        'Internet of Things', 'Blockchain', 'Databases', 'Computer Graphics',
        'Bioinformatics', 'Computational Neuroscience', 'Theoretical Computer Science'
      ]
    },
    {
      name: 'Pharmaceutical Sciences',
      subfields: [
        'Medicinal Chemistry', 'Pharmacognosy', 'Pharmacokinetics & Pharmacodynamics',
        'Pharmaceutics', 'Drug Delivery Systems', 'Toxicology', 'Clinical Trials',
        'Regulatory Affairs', 'Pharmacy Practice'
      ]
    },
    {
      name: 'Medical Research',
      subfields: [
        'Oncology', 'Cardiology', 'Neurology', 'Endocrinology', 'Immunology',
        'Rheumatology', 'Gastroenterology', 'Pulmonology', 'Dermatology',
        'Nephrology', 'Psychiatry', 'Surgery', 'Pathology', 'Radiology'
      ]
    },
    {
      name: 'Public Health',
      subfields: [
        'Epidemiology', 'Biostatistics', 'Health Informatics', 'Health Economics',
        'Infectious Disease Modeling', 'Preventive Medicine', 'Mental Health',
        'Occupational Health', 'Global Health', 'Community Health', 'Health Policy',
        'Environmental Health', 'Disaster Medicine'
      ]
    },
    {
      name: 'Geology',
      subfields: [
        'Mineralogy', 'Petrology', 'Seismology', 'Geochemistry', 'Structural Geology',
        'Geophysics', 'Paleontology', 'Hydrogeology', 'Volcanology', 'Geomorphology',
        'Stratigraphy'
      ]
    },
    {
      name: 'Environmental Science',
      subfields: [
        'Environmental Chemistry', 'Climate Science', 'Pollution Control',
        'Environmental Impact Assessment', 'Sustainability Studies',
        'Carbon Sequestration', 'Soil Science', 'Atmospheric Science',
        'Conservation Science'
      ]
    },
    {
      name: 'Hydrology and Oceanography',
      subfields: [
        'Hydrology', 'Surface Water', 'Groundwater', 'Hydroinformatics',
        'Oceanography', 'Marine Geology', 'Marine Biology', 'Coastal Studies',
        'Fisheries Science', 'Aquaculture'
      ]
    },
    {
      name: 'Agricultural Sciences',
      subfields: [
        'Crop Science', 'Soil Science', 'Horticulture', 'Agricultural Engineering',
        'Entomology', 'Plant Pathology', 'Agronomy', 'Irrigation Science',
        'Agricultural Economics'
      ]
    },
    {
      name: 'Social Sciences',
      subfields: [
        'Economics', 'Development Economics', 'Behavioral Economics', 'Financial Systems',
        'Sociology', 'Cultural Sociology', 'Urban Sociology', 'Psychology',
        'Cognitive Psychology', 'Clinical Psychology', 'Behavioral Psychology',
        'Social Psychology', 'Political Science', 'International Relations',
        'Public Administration', 'Public Policy', 'Criminology', 'Gender Studies',
        'Social Work'
      ]
    },
    {
      name: 'Humanities',
      subfields: [
        'History', 'Philosophy', 'Linguistics', 'Literature', 'Religious Studies',
        'Theology', 'Ethics', 'Art History', 'Classics', 'Cultural Studies'
      ]
    },
    {
      name: 'Anthropology and Archaeology',
      subfields: [
        'Cultural Anthropology', 'Biological Anthropology', 'Archaeology',
        'Ethnography', 'Paleolithic Archaeology', 'Anthropological Linguistics'
      ]
    },
    { 
      name: 'Others',
      subfields: [
        'Other (please specify)'
      ]
    }
  ];

  professionOptions = [
    {
      name: 'Academic & Research Roles',
      subfields: [
        'Professor',
        'Assistant Professor',
        'Associate Professor',
        'Lecturer',
        'Research Scholar / PhD Student',
        'Postdoctoral Fellow',
        "Master's Student (MSc, MTech, etc.)",
        'Undergraduate Student (BSc, BTech, etc.)',
        'Independent Researcher',
        'Research Associate / Assistant',
        'Visiting Scientist',
        'Principal Investigator (PI)',
        'Research Scientist'
      ]
    },
    {
      name: 'Industry & R&D Professionals',
      subfields: [
        'R&D Scientist',
        'Analytical Chemist / Scientist',
        'Process Engineer',
        'Materials Scientist',
        'Formulation Scientist',
        'Quality Control Analyst',
        'Data Scientist (Research Focused)',
        'AI/ML Researcher in Science',
        'Instrumentation Engineer',
        'Lab Manager',
        'Regulatory Affairs Scientist'
      ]
    },
    {
      name: 'Institutional & Lab Staff',
      subfields: [
        'Lab Technician',
        'Facility In-charge',
        'Instrument Operator',
        'Technical Officer',
        'Project Staff / Project Assistant',
        'CRO (Contract Research Organization) Staff'
      ]
    },
    {
      name: 'Policy, Outreach & Innovation',
      subfields: [
        'Science Communicator',
        'Innovation Officer / Tech Transfer Officer',
        'Grant Coordinator',
        'Patent Analyst',
        'Journal Editor / Peer Reviewer',
        'Research Policy Analyst',
        'Science Outreach Coordinator'
      ]
    },
    {
      name: 'Entrepreneurship & Startups',
      subfields: [
        'Scientific Founder / Co-Founder',
        'Startup Researcher',
        'Deep Tech Innovator',
        'Incubation Center Fellow'
      ]
    },
    {
      name: 'Administrative & Support',
      subfields: [
        'University Admin (Research Cell)',
        'Funding Agency Representative',
        'Procurement Officer (for research tools)',
        'Conference Organizer',
        'Research IT / Database Admin'
      ]
    },
    {
      name: 'Others',
      subfields: [
        'Other (please specify)'
      ]
    }
  ];
  
  
  
  openFieldDialog() {
    this.showFieldPopup = true;
  }

  openProfessionDialog() {
    this.showProfessionPopup = true;
  }
  
  closeFieldDialog() {
    this.showFieldPopup = false;
  }

  closeProfessionDialog() {
    this.showProfessionPopup = false;
  }
  
  selectFielld(subfield: string) {
    this.formData.field = subfield;
    this.closeFieldDialog();
  }
  selectProfession(subfield: string) {
    this.formData.profession = subfield;
    this.closeProfessionDialog();
  }

 
  onCountryChange(): void {
    const country = this.countries.find(c => c.name === this.formData.country);
    this.states = country ? country.states : [];
    this.formData.state = '';
  }   
}