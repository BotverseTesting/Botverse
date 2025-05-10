import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadWorkflowComponent } from './upload-workflow.component';

describe('UploadWorkflowComponent', () => {
  let component: UploadWorkflowComponent;
  let fixture: ComponentFixture<UploadWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
