


export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const createSpeechRecognition = () => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser');
  }

  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true; 
  recognition.interimResults = true; 
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
};

export const startListening = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onSilence?: () => void
): any => {
  try {
    const recognition = createSpeechRecognition();
    let silenceTimer: NodeJS.Timeout | null = null;
    let lastSpeechTime = Date.now();
    
    const resetSilenceTimer = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      silenceTimer = setTimeout(() => {
        recognition.stop();
        if (onSilence) {
          onSilence();
        }
      }, 7000); 
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let hasInterimResults = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          lastSpeechTime = Date.now();
          resetSilenceTimer(); 
        } else {
          hasInterimResults = true;
          
          resetSilenceTimer();
        }
      }
      
      if (finalTranscript) {
        onResult(finalTranscript.trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      onError(event.error);
    };
    
    recognition.onend = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
    
    recognition.start();
    resetSilenceTimer(); 
    
    return recognition;
  } catch (error) {
    onError('Speech recognition failed to start');
    return null;
  }
};
