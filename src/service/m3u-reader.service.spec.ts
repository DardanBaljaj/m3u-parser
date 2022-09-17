import { TestBed } from '@angular/core/testing';

import { M3UReaderService } from './m3u-reader.service';

describe('M3UReaderService', () => {
  let service: M3UReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(M3UReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
