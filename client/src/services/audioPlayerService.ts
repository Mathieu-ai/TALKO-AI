import AudioService from './audioService';

/**
 * Singleton service to manage audio playback and prevent 
 * multiple connections of the same audio element
 */
class AudioPlayerService {
  private static instance: AudioPlayerService;
  private audioContext: AudioContext | null = null;
  private currentSource: MediaElementAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioElement: HTMLAudioElement;
  private connectedToAnalyzer: boolean = false;
  private isPlaying: boolean = false;

  private constructor() {
    // Create a single audio element to be reused
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    // Listen for audio end to update playing state
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
    });
  }

  public static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  /**
   * Prepare an audio URL for playback
   */
  public async prepareAudio(url: string): Promise<string> {
    try {
      console.log('AudioPlayerService: Preparing audio URL:', url);
      
      // Process the URL through AudioService to get a playable URL with caching
      const processedUrl = await AudioService.getAudioFile(url);
      console.log('AudioPlayerService: Processed URL:', processedUrl);
      
      return processedUrl;
    } catch (error) {
      console.error('Error preparing audio:', error);
      throw error;
    }
  }

  /**
   * Get the audio element currently being used
   */
  public getAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  /**
   * Stop any currently playing audio
   * Returns true if audio was playing and stopped
   */
  public stopCurrentAudio(): boolean {
    if (this.audioElement && !this.audioElement.paused) {
      console.log('Stopping current audio playback');
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      return true;
    }
    return false;
  }

  /**
   * Play audio from the given URL
   */
  public async playAudio(url: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      // Prepare the new audio URL
      const processedUrl = await this.prepareAudio(url);
      
      // Set the source and play
      this.audioElement.src = processedUrl;
      this.audioElement.load();
      
      // Play the audio
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            console.log('Audio playback started successfully');
          })
          .catch(err => {
            console.error('Error starting audio playback:', err);
            this.isPlaying = false;
          });
      }
    } catch (error) {
      console.error('Error in playAudio:', error);
      throw error;
    }
  }

  /**
   * Check if audio is currently playing
   */
  public isAudioPlaying(): boolean {
    return this.isPlaying || (!this.audioElement.paused && !this.audioElement.ended);
  }

  /**
   * Create an audio context and connect the audio element to an analyzer
   * This method ensures we only create one audio context and properly connect/disconnect
   */
  public createAudioContext(): { 
    audioContext: AudioContext; 
    source: MediaElementAudioSourceNode;
    analyzer: AnalyserNode;
  } {
    console.log('Creating/retrieving audio context');
    
    // Create a new AudioContext if needed
    if (!this.audioContext || this.audioContext.state === 'closed') {
      console.log('Creating new AudioContext');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else if (this.audioContext.state === 'suspended') {
      console.log('Resuming suspended AudioContext');
      this.audioContext.resume();
    }

    // If we already have a connection to this audio element, reuse it
    if (this.currentSource && this.currentAudioElement === this.audioElement && this.connectedToAnalyzer) {
      console.log('Reusing existing audio source connection');
      const analyzer = this.audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      
      this.currentSource.connect(analyzer);
      analyzer.connect(this.audioContext.destination);
      
      return { 
        audioContext: this.audioContext, 
        source: this.currentSource, 
        analyzer 
      };
    }

    // Disconnect any existing source
    this.disconnectCurrentSource();
    
    try {
      console.log('Creating new MediaElementSource');
      const source = this.audioContext.createMediaElementSource(this.audioElement);
      this.currentSource = source;
      this.currentAudioElement = this.audioElement;
      this.connectedToAnalyzer = true;
      
      // Create analyzer
      const analyzer = this.audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;

      // Connect source -> analyzer -> destination
      source.connect(analyzer);
      analyzer.connect(this.audioContext.destination);
      
      return { audioContext: this.audioContext, source, analyzer };
    } catch (err) {
      console.error('Error connecting audio source:', err);
      
      // If there was an error, completely reset our audio setup
      this.closeAudioContext();
      
      // Create a brand new context and connections
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaElementSource(this.audioElement);
      this.currentSource = source;
      this.currentAudioElement = this.audioElement;
      this.connectedToAnalyzer = true;
      
      const analyzer = this.audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      
      source.connect(analyzer);
      analyzer.connect(this.audioContext.destination);
      
      return { audioContext: this.audioContext, source, analyzer };
    }
  }

  /**
   * Reset audio playback completely - use when encountering errors
   */
  public resetAudioPlayback(): void {
    console.log('Resetting audio playback');
    
    this.disconnectCurrentSource();
    
    // Reset the audio element completely
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    
    // Don't clear the source - this causes issues with repeated playback
    // Just reset the element state
  }

  /**
   * Check if audio element is already connected to a source
   */
  public isConnected(): boolean {
    return this.currentSource !== null && 
           this.currentAudioElement === this.audioElement && 
           this.connectedToAnalyzer;
  }

  /**
   * Disconnect current source if it exists
   */
  public disconnectCurrentSource(): void {
    if (this.currentSource && this.connectedToAnalyzer) {
      try {
        console.log('Disconnecting current audio source');
        this.currentSource.disconnect();
        this.connectedToAnalyzer = false;
      } catch (e) {
        console.warn('Error disconnecting source:', e);
      }
    }
  }

  /**
   * Close the audio context and clean up resources
   */
  public closeAudioContext(): void {
    this.disconnectCurrentSource();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      console.log('Closing AudioContext');
      this.audioContext.close().catch(err => {
        console.warn('Error closing AudioContext:', err);
      });
      this.audioContext = null;
    }
  }

  /**
   * Verify if audio is playable
   */
  public async verifyAudio(url: string): Promise<boolean> {
    try {
      // For blob URLs or already processed URLs, we can just return true
      if (url.startsWith('blob:')) {
        return true;
      }
      
      // Check if URL has duplicate api pattern and fix it
      if (url.includes('/api/api/')) {
        url = url.replace('/api/api/', '/api/');
      }
      
      // Process URL first - this will now add the auth token
      const processedUrl = await AudioService.getAudioFile(url);
      return await AudioService.getPlayStatus(processedUrl);
    } catch (error) {
      console.error('Error verifying audio:', error);
      return false;
    }
  }
}

// Singleton export
export default AudioPlayerService;
