import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';

interface Track {
  src: string;
  title: string;
  artist: string;
  album: string;
  artwork: { src: string; sizes: string; type: string }[];
}

@Component({
  selector: 'app-audio-player-in-memory',
  templateUrl: './audio-player-in-memory.component.html',
  styleUrls: ['./audio-player-in-memory.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonButton, DecimalPipe, IonList, CommonModule],
})
export class AudioPlayerInMemoryComponent implements OnInit, OnDestroy {
  private audio: HTMLAudioElement;
  public playlist: Track[];
  public currentTrackIndex = 0;

  public isSeekMode = true;

  public isPlaying = false;
  public currentTime = 0;
  public duration = 0;

  constructor() {
    this.audio = new Audio();
    this.playlist = this.initializePlaylist();
  }

  ngOnInit() {
    this.setupAudioEventListeners();
    this.loadTrack(this.currentTrackIndex);
  }

  ngOnDestroy() {
    this.removeAudioEventListeners();
  }

  private initializePlaylist(): Track[] {
    return [
      {
        src: 'assets/audio/track1.mp3',
        title: 'Track 1',
        artist: 'Artist 1',
        album: 'Album 1',
        artwork: [
          {
            src: 'https://picsum.photos/512/512?u=a',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
      {
        src: 'assets/audio/track2.mp3',
        title: 'Track 2',
        artist: 'Artist 2',
        album: 'Album 2',
        artwork: [
          {
            src: 'https://picsum.photos/512/512?u=b',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
    ];
  }

  private setupAudioEventListeners() {
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('ended', this.handleTrackEnded);
  }

  private removeAudioEventListeners() {
    this.audio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('ended', this.handleTrackEnded);
  }

  private handleLoadedMetadata = () => {
    this.duration = this.audio.duration;
    this.setupMediaSession();
    console.log('Metadata loaded, duration:', this.duration);
  };

  private handleTimeUpdate = () => {
    this.currentTime = this.audio.currentTime;
    console.log('Time update, current time:', this.currentTime);
  };

  private handleTrackEnded = () => {
    console.log('Track ended');
    this.nextTrack();
  };

  private loadTrack(index: number) {
    const track = this.playlist[index];
    this.audio.src = track.src;
    this.audio.load();
    this.currentTime = 0;
    this.updateMediaSessionMetadata(track);
    this.setupMediaSession();
    console.log('Loaded track:', track.title);
  }

  private updateMediaSessionMetadata(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork.map((art) => ({
          src: art.src,
          sizes: art.sizes,
          type: art.type,
          srcset: `${art.src} ${art.sizes.split('x')[0]}w`,
        })),
      });
      console.log('Updated media session metadata:', track.title);
    }
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      this.updateMediaSessionHandlers();
    }
  }

  private updateMediaSessionHandlers() {
    if ('mediaSession' in navigator) {
      if (this.isSeekMode) {
        navigator.mediaSession.setActionHandler('seekbackward', (details) =>
          this.seek(details.seekTime ?? -10)
        );
        navigator.mediaSession.setActionHandler('seekforward', (details) =>
          this.seek(details.seekTime ?? 10)
        );
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      } else {
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('previoustrack', () =>
          this.previousTrack()
        );
        navigator.mediaSession.setActionHandler('nexttrack', () =>
          this.nextTrack()
        );
      }
    }
  }

  toggleSeekMode() {
    this.isSeekMode = !this.isSeekMode;
    this.updateMediaSessionHandlers();
  }

  playTrack(index: number) {
    this.currentTrackIndex = index;
    this.loadTrack(index);
    this.play();
  }

  toggleAudio() {
    this.isPlaying ? this.pause() : this.play();
  }

  play() {
    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        console.log('Audio playing');
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      })
      .catch((error) => console.error('Error playing audio:', error));
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    console.log('Audio paused');
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  previousTrack() {
    this.currentTrackIndex =
      (this.currentTrackIndex - 1 + this.playlist.length) %
      this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    this.play();
  }

  nextTrack() {
    this.currentTrackIndex =
      (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    this.play();
  }

  private seek(offset: number) {
    this.audio.currentTime = Math.max(
      0,
      Math.min(this.audio.currentTime + offset, this.audio.duration)
    );
    console.log(`Seek ${offset > 0 ? 'forward' : 'backward'}:`, offset);
  }
}
