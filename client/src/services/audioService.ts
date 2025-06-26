import { axiosInstance, getAudioWithAuth } from './api';
import { AudioOptions } from '../types/audio';

/**
 * Service to handle audio operations with proper authentication
 */
const audioService = {
  /**
   * Format API URL to ensure no duplicate /api/ paths
   * @param endpoint API endpoint path
   * @returns Properly formatted URL
   */
  formatApiUrl(endpoint: string): string {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    // Ensure endpoint doesn't start with a slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Format the endpoint URL to avoid duplicate /api/
    let fullUrl;
    if (apiBaseUrl.endsWith('/api')) {
      // If base URL already includes /api, don't add it again
      fullUrl = `${apiBaseUrl}/${cleanEndpoint}`;
    } else {
      // Otherwise, add /api/ to the path
      fullUrl = `${apiBaseUrl}/api/${cleanEndpoint}`;
    }
    
    // Fix any duplicate api paths that might occur
    return fullUrl.replace(/\/api\/api\//g, '/api/');
  },

  /**
   * Creates an authenticated URL for an audio source
   * Use this instead of directly setting src attribute on audio elements
   */
  async getAuthenticatedAudioUrl(audioPath: string): Promise<string> {
    // If the path is already a full URL
    if (audioPath.startsWith('http')) {
      const fixedUrl = audioPath.replace('/api/api/', '/api/');
      return getAudioWithAuth(fixedUrl);
    }
    
    // If it's a relative path
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    // Format the path correctly - ensure it uses the audio/stream endpoint
    if (audioPath.startsWith('/')) {
      audioPath = audioPath.substring(1); // Remove leading slash
    }
    
    // Remove duplicate 'api/' in the path if present
    if (audioPath.startsWith('api/api/')) {
      audioPath = audioPath.replace('api/api/', 'api/');
    }
    
    // If the path contains file ID without proper prefix, add the stream path
    if (audioPath.startsWith('audio_') && !audioPath.includes('/')) {
      audioPath = `api/audio/stream/${audioPath}`;
    }
    // If it doesn't start with api/, add it
    else if (!audioPath.startsWith('api/')) {
      audioPath = `api/audio/stream/${audioPath.split('/').pop()}`;
    }
    
    // Final check to prevent duplication
    if (audioPath.includes('/api/api/')) {
      audioPath = audioPath.replace('/api/api/', '/api/');
    }
    
    return getAudioWithAuth(`${apiBaseUrl}/${audioPath}`);
  },

  /**
   * Play audio with authentication
   * @param audioPath Path to the audio file
   * @returns Audio element that can be controlled
   */
  async playAudioWithAuth(audioPath: string): Promise<HTMLAudioElement> {
    const authUrl = await this.getAuthenticatedAudioUrl(audioPath);
    const audio = new Audio(authUrl);
    audio.play();
    return audio;
  },

  /**
   * Fetch audio as a blob with authentication
   * Useful when you need to process the audio data
   */
  async fetchAudioBlob(audioPath: string): Promise<Blob> {
    const token = localStorage.getItem('talko_token');
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const fullUrl = audioPath.startsWith('http') ? audioPath : `${apiBaseUrl}/${audioPath}`;
    
    const response = await axiosInstance.get(fullUrl, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      }
    });
    
    return response.data;
  },

  /**
   * Get audio file from server with proper authentication
   * @param audioPath The path to the audio file
   * @returns URL to the audio file that can be used in audio elements
   */
  async getAudioFile(audioPath: string): Promise<string> {
    try {
      // Check if it's a blob URL already
      if (audioPath.startsWith('blob:')) {
        return audioPath;
      }
      
      // Format the audio path to use the correct endpoint
      let fullUrl;
      if (audioPath.startsWith('http')) {
        fullUrl = audioPath;
        // Fix any duplicate api paths that might occur
        fullUrl = fullUrl.replace(/\/api\/api\//g, '/api/');
      } else {
        // Extract the file name if a full path is provided
        const fileName = audioPath.includes('/') ? audioPath.split('/').pop() : audioPath;
        
        // Use formatApiUrl to get the correct URL
        fullUrl = this.formatApiUrl(`audio/stream/${fileName}`);
      }
      
      const token = localStorage.getItem('talko_token');
      console.log('Getting audio file from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting audio file:', error);
      throw error;
    }
  },

  /**
   * Check if audio is playable
   * @param audioPath The path to the audio file
   * @returns Boolean indicating if the audio is playable
   */
  async getPlayStatus(audioPath: string): Promise<boolean> {
    try {
      // If it's a blob URL, assume it's valid
      if (audioPath.startsWith('blob:')) {
        return true;
      }
      
      // Format the audio path to use the correct endpoint
      let fullUrl;
      if (audioPath.startsWith('http')) {
        fullUrl = audioPath;
        // Fix any duplicate api paths that might occur
        fullUrl = fullUrl.replace(/\/api\/api\//g, '/api/');
      } else {
        // Extract the file name if a full path is provided
        const fileName = audioPath.includes('/') ? audioPath.split('/').pop() : audioPath;
        
        // Use formatApiUrl to get the correct URL
        fullUrl = this.formatApiUrl(`audio/stream/${fileName}`);
      }
      
      const token = localStorage.getItem('talko_token');
      console.log('Checking audio playability from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking audio status:', error);
      return false;
    }
  },

  /**
   * Generate speech from text
   * @param text Text to convert to speech
   * @param options Options for speech generation
   * @returns Response with audio URL
   */
  async generateSpeech(text: string, options: AudioOptions = {}): Promise<any> {
    const token = localStorage.getItem('talko_token');
    
    // Use the formatApiUrl method to get a properly formatted URL
    const url = this.formatApiUrl('audio/generate-speech');
    
    console.log('Making text-to-speech request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: JSON.stringify({ text, ...options }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error generating speech: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Transcribe speech to text
   * @param audioBlob Audio blob to transcribe
   * @returns Transcription result
   */
  async transcribeSpeech(audioBlob: Blob): Promise<any> {
    const token = localStorage.getItem('talko_token');
    
    // Create form data with the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recorded_audio.wav');
    
    // Use the formatApiUrl method to get a properly formatted URL
    const url = this.formatApiUrl('audio/speech-to-text');
    
    console.log('Making speech-to-text request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error transcribing speech: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Download multiple audio files as a ZIP archive
   * @param audioIds Array of audio IDs to download
   */
  async downloadMultipleAsZip(audioIds: string[]): Promise<void> {
    if (!audioIds.length) {
      throw new Error('No audio IDs provided');
    }
    
    try {
      const token = localStorage.getItem('talko_token');
      
      // Use formatApiUrl to get the correct URL
      const url = this.formatApiUrl('audio/download-zip');
      
      console.log('Making download-zip request to:', url);
      
      // Make a request to server to generate a ZIP file
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: JSON.stringify({ audioIds }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download files: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const urlBlob = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', 'talko-audio-files.zip');
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error downloading audio files:', error);
      throw error;
    }
  },

  /**
   * Download a single audio file
   * @param audioId ID of the audio to download
   */
  async downloadAudio(audioId: string): Promise<void> {
    if (!audioId) {
      throw new Error('No audio ID provided');
    }
    
    try {
      const token = localStorage.getItem('talko_token');
      
      // Use formatApiUrl to get the correct URL
      const url = this.formatApiUrl(`audio/download/${audioId}`);
      
      console.log('Making download request to:', url);
      
      // Make a request to server to download the file
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'audio-file.mp3';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const urlBlob = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error downloading audio file:', error);
      throw error;
    }
  }
};

export default audioService;
