import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AudioPlayerInMemoryComponent } from './audio-player-in-memory.component';

describe('AudioPlayerInMemoryComponent', () => {
  let component: AudioPlayerInMemoryComponent;
  let fixture: ComponentFixture<AudioPlayerInMemoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AudioPlayerInMemoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioPlayerInMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
