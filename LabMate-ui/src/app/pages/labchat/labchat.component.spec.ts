import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabchatComponent } from './labchat.component';

describe('LabchatComponent', () => {
  let component: LabchatComponent;
  let fixture: ComponentFixture<LabchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabchatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
