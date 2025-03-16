import { TestBed } from '@angular/core/testing';

import { SiteAnimationsService } from './site-animations.service';

describe('SiteAnimationsService', () => {
  let service: SiteAnimationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteAnimationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
