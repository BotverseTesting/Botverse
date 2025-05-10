import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowMarketplaceComponent } from './workflow-marketplace.component';

describe('WorkflowMarketplaceComponent', () => {
  let component: WorkflowMarketplaceComponent;
  let fixture: ComponentFixture<WorkflowMarketplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowMarketplaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
