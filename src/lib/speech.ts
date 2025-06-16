
// Browser Speech Recognition API utility

export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const createSpeechRecognition = () => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser');
  }

  // Use webkitSpeechRecognition for Chrome/Safari or SpeechRecognition for other browsers
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true; // Keep listening for continuous speech
  recognition.interimResults = true; // Show partial results
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
};

export const startListening = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void
): any => {
  try {
    const recognition = createSpeechRecognition();
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        onResult(finalTranscript.trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      onError(event.error);
    };
    
    recognition.onend = () => {
      // Auto-restart if it stops (for continuous listening)
      // User can manually stop by clicking the button
    };
    
    recognition.start();
    return recognition;
  } catch (error) {
    onError('Speech recognition failed to start');
    return null;
  }
};
