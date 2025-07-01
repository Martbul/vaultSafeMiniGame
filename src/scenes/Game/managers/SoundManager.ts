export default class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private soundPaths = {
    doorOpen: "/sounds/shine.mp3",
    handleRotating: "/sounds/doorSwing.mp3",
    clicking: "/sounds/click.mp3",
    locked: "/sounds/locked.mp3",
    resetDoorHandle: "/sounds/lock.mp3",
  };

  constructor() {
    this.loadSounds();
  }

  private loadSounds(): void {
    Object.entries(this.soundPaths).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      this.sounds.set(key, audio);
    });
  }

  private playSound(soundKey: string): Promise<void> {
    let audio = this.sounds.get(soundKey);
    if (!audio) {
      return Promise.resolve();
    }

    audio = audio.cloneNode() as HTMLAudioElement;

    return audio.play().catch((e) => {
      console.log(`Audio play failed for "${soundKey}"`, e);
    });
  }

  public playDoorOpenSound(): Promise<void> {
    return this.playSound("doorOpen");
  }

  public playHandleRotatingSound(): Promise<void> {
    return this.playSound("handleRotating");
  }

  public playClickingSound(): Promise<void> {
    return this.playSound("clicking");
  }

  public playLockedSound(): Promise<void> {
    return this.playSound("locked");
  }

  public playResetDoorHandleSound(): Promise<void> {
    return this.playSound("resetDoorHandle");
  }
}
