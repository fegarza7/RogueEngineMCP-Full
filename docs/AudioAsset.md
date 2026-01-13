# AudioAsset

The **AudioAsset** class represents audio files that can be played in your game.

## Usage with Decorator

Use the `@RE.props.audio()` decorator to reference audio assets in the Inspector:

```typescript
import * as RE from 'rogue-engine';

export default class SoundPlayer extends RE.Component {
  @RE.props.audio()
  backgroundMusic: RE.AudioAsset;

  @RE.props.audio()
  jumpSound: RE.AudioAsset;

  @RE.props.audio()
  collectSound: RE.AudioAsset;

  start() {
    this.backgroundMusic?.play();
  }

  onJump() {
    this.jumpSound?.play();
  }

  onCollect() {
    this.collectSound?.play();
  }
}

RE.registerComponent(SoundPlayer);
```

## Methods

### play()
```typescript
play(): void
```
Play the audio asset.

### stop()
```typescript
stop(): void
```
Stop the audio asset if playing.

## Properties

Audio assets wrap the Three.js audio system and provide access to:
- Volume control
- Loop settings
- Playback rate

## Notes

- Audio files should be in formats supported by web browsers (MP3, OGG, WAV)
- Place audio files in your Assets folder
- Use the Asset Manager to configure preloading for important sounds
- Always check if the audio asset exists before playing (`this.sound?.play()`)

## Example: Audio Manager

```typescript
import * as RE from 'rogue-engine';

export default class AudioManager extends RE.Component {
  @RE.props.audio()
  music: RE.AudioAsset;

  @RE.props.audio()
  sfxShoot: RE.AudioAsset;

  @RE.props.audio()
  sfxExplosion: RE.AudioAsset;

  @RE.props.checkbox()
  musicEnabled: boolean = true;

  @RE.props.checkbox()
  sfxEnabled: boolean = true;

  start() {
    if (this.musicEnabled) {
      this.music?.play();
    }
  }

  playShoot() {
    if (this.sfxEnabled) {
      this.sfxShoot?.play();
    }
  }

  playExplosion() {
    if (this.sfxEnabled) {
      this.sfxExplosion?.play();
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.music?.play();
    } else {
      this.music?.stop();
    }
  }
}

RE.registerComponent(AudioManager);
```
