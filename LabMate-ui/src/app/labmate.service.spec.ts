import { TestBed } from '@angular/core/testing';

import { LabmateService } from './labmate.service';

describe('LabmateService', () => {
  let service: LabmateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabmateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
