
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
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  return recognition;
};

export const startListening = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void
): any => {
  try {
    const recognition = createSpeechRecognition();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    
    recognition.onerror = (event: any) => {
      onError(event.error);
    };
    
    recognition.start();
    return recognition;
  } catch (error) {
    onError('Speech recognition failed to start');
    return null;
  }
};
