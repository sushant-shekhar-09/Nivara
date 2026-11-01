/**
 * Deterministic Audio Playback Service for Nivara Voice Screening.
 * 
 * Features:
 * - Plays pre-generated PocketTTS audio files served directly from static assets (/audio/questions/...).
 * - Zero per-question runtime model inference or downloading large weights to the client.
 * - Automatic preloading of subsequent question audio to minimize transition latency to 0ms.
 * - Single-track audio lock with session ID tracking to strictly prevent any overlapping audio.
 * - Complete removal of browser SpeechSynthesis (legacy TTS) to eliminate dual-voice artifacts.
 * - Immediate hardware release and echo prevention before microphone activation.
 */

export interface AudioPlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class AudioPlaybackService {
  private activeAudio: HTMLAudioElement | null = null;
  private preloadedCache: Map<string, HTMLAudioElement> = new Map();
  private isPlayingAudio: boolean = false;
  private currentSessionId: number = 0;

  /**
   * Resolves canonical static audio URL for a questionnaire item.
   */
  public getQuestionAudioUrl(instrument: string, questionId: number): string {
    const instKey = instrument.toLowerCase().trim();
    return `/audio/questions/${instKey}_${questionId}.wav`;
  }

  /**
   * Resolves canonical static audio URL for fixed prompts.
   */
  public getPromptAudioUrl(promptName: string): string {
    return `/audio/prompts/prompt_${promptName}.wav`;
  }

  /**
   * Preloads an audio asset in the background without playing it.
   */
  public preloadAudio(url: string): void {
    if (typeof window === 'undefined') return;
    if (this.preloadedCache.has(url)) return;

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.preloadedCache.set(url, audio);
    } catch {
      // Ignore background preload errors
    }
  }

  /**
   * Preloads the subsequent question audio asset.
   */
  public preloadNextQuestion(instrument: string, currentIndex: number, totalQuestions: number): void {
    if (currentIndex + 1 < totalQuestions) {
      const nextQId = currentIndex + 2; // 1-indexed question id
      const nextUrl = this.getQuestionAudioUrl(instrument, nextQId);
      this.preloadAudio(nextUrl);
    }
  }

  /**
   * Plays the pre-generated PocketTTS audio asset for the given question.
   * Enforces strict single-track playback: any active audio is killed before starting.
   */
  public playQuestionAudio(
    instrument: string,
    questionId: number,
    _fallbackText?: string,
    callbacks?: AudioPlaybackCallbacks
  ): void {
    // 1. Terminate all active audio and cancel any residual browser speech synthesis
    this.stopAll();

    if (typeof window === 'undefined') {
      callbacks?.onError?.(new Error('Window context unavailable'));
      return;
    }

    const sessionId = ++this.currentSessionId;
    const audioUrl = this.getQuestionAudioUrl(instrument, questionId);

    try {
      // Use clean Audio element to guarantee detached event listeners
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;
      this.isPlayingAudio = true;

      let started = false;

      const handleStart = () => {
        if (this.currentSessionId !== sessionId) return;
        if (!started) {
          started = true;
          this.isPlayingAudio = true;
          callbacks?.onStart?.();
        }
      };

      const handleEnd = () => {
        if (this.currentSessionId !== sessionId) return;
        this.isPlayingAudio = false;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        callbacks?.onEnd?.();
      };

      const handleError = (err?: any) => {
        if (this.currentSessionId !== sessionId) return;
        this.isPlayingAudio = false;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        callbacks?.onError?.(err || new Error(`Audio asset failed to load: ${audioUrl}`));
      };

      audio.onplay = handleStart;
      audio.onplaying = handleStart;
      audio.onended = handleEnd;
      audio.onerror = (e) => handleError(e);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.currentSessionId !== sessionId) return;
          if (err.name === 'AbortError') {
            // Intentionally aborted by stopAll or user action
            return;
          }
          handleError(err);
        });
      }
    } catch (err) {
      if (this.currentSessionId === sessionId) {
        this.isPlayingAudio = false;
        this.activeAudio = null;
        callbacks?.onError?.(err);
      }
    }
  }

  /**
   * Plays a pre-generated fixed prompt audio asset.
   */
  public playPromptAudio(promptName: string, callbacks?: AudioPlaybackCallbacks): void {
    this.stopAll();

    if (typeof window === 'undefined') {
      callbacks?.onError?.(new Error('Window context unavailable'));
      return;
    }

    const sessionId = ++this.currentSessionId;
    const audioUrl = this.getPromptAudioUrl(promptName);

    try {
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;
      this.isPlayingAudio = true;

      let started = false;

      const handleStart = () => {
        if (this.currentSessionId !== sessionId) return;
        if (!started) {
          started = true;
          callbacks?.onStart?.();
        }
      };

      const handleEnd = () => {
        if (this.currentSessionId !== sessionId) return;
        this.isPlayingAudio = false;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        callbacks?.onEnd?.();
      };

      const handleError = (err?: any) => {
        if (this.currentSessionId !== sessionId) return;
        this.isPlayingAudio = false;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        callbacks?.onError?.(err || new Error(`Prompt asset failed to load: ${audioUrl}`));
      };

      audio.onplay = handleStart;
      audio.onplaying = handleStart;
      audio.onended = handleEnd;
      audio.onerror = (e) => handleError(e);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.currentSessionId !== sessionId) return;
          if (err.name === 'AbortError') return;
          handleError(err);
        });
      }
    } catch (err) {
      if (this.currentSessionId === sessionId) {
        this.isPlayingAudio = false;
        this.activeAudio = null;
        callbacks?.onError?.(err);
      }
    }
  }

  /**
   * Stops any currently playing audio track and releases hardware locks.
   * Completely silences any residual SpeechSynthesis queue.
   */
  public stopAll(): void {
    this.currentSessionId++;
    this.isPlayingAudio = false;

    if (this.activeAudio) {
      try {
        this.activeAudio.onplay = null;
        this.activeAudio.onplaying = null;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
      } catch {
        // Ignore
      }
      this.activeAudio = null;
    }

    // Failsafe: Ensure legacy browser SpeechSynthesis is dead and never speaks
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Returns whether audio is currently playing.
   */
  public isPlaying(): boolean {
    return this.isPlayingAudio && Boolean(this.activeAudio && !this.activeAudio.paused);
  }
}

export const audioService = new AudioPlaybackService();
