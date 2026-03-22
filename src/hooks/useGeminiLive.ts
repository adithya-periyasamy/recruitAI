import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { AudioProcessor } from '../utils/audio-utils';
import { InterviewMessage } from '../types';

const LIVE_MODELS = [
  "gemini-2.5-flash-native-audio-preview-12-2025",
  "gemini-2.5-flash-native-audio-preview-09-2025"
];

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioProcessorRef = useRef<AudioProcessor>(new AudioProcessor());
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    audioProcessorRef.current.stopRecording();
    if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(async (systemInstruction: string, attempt = 0) => {
    if (attempt >= LIVE_MODELS.length) {
      setError("Failed to connect with all available models.");
      return;
    }

    const modelName = LIVE_MODELS[attempt];
    setError(null);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found. Please set GEMINI_API_KEY in your .env file.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      // Identity and Accent instructions
      const enhancedInstruction = `
        Your name is RecruitAI. You are NOT Gemini. 
        Always identify yourself as RecruitAI.
        Speak slowly and clearly with a pleasant, professional, and supportive accent.
        
        CRITICAL: You MUST ONLY speak in English. Do not use any other languages.
        
        ${systemInstruction}
      `;

      const sessionPromise = ai.live.connect({
        model: modelName,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: enhancedInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            audioProcessorRef.current.startRecording((base64Data) => {
              sessionRef.current?.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            });

            // Start volume monitoring
            volumeIntervalRef.current = window.setInterval(() => {
              setUserVolume(audioProcessorRef.current.getUserVolume());
            }, 100);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsAiSpeaking(true);
              await audioProcessorRef.current.playAudioChunk(base64Audio, outputAudioContextRef.current);
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              // Only interrupt if user volume is above a certain threshold to avoid small sounds triggering it
              const currentVol = audioProcessorRef.current.getUserVolume();
              if (currentVol > 15) { 
                setIsInterrupted(true);
                setIsAiSpeaking(false);
                audioProcessorRef.current.stopPlayback();
              }
            }

            // Handle transcription
            const modelTranscription = message.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
            if (modelTranscription) {
               setMessages(prev => [...prev, { role: 'ai', text: modelTranscription, timestamp: Date.now() }]);
               setIsAiSpeaking(false);
            }

            const serverContent = message.serverContent as any;
            const userTranscription = serverContent?.userTurn?.parts?.find((p: any) => p.text)?.text;
            if (userTranscription) {
              setMessages(prev => [...prev, { role: 'user', text: userTranscription, timestamp: Date.now() }]);
            }
          },
          onclose: () => {
            setIsConnected(false);
            audioProcessorRef.current.stopRecording();
            if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
          },
          onerror: (err: any) => {
            console.error(`Gemini Live Error with ${modelName}:`, err);
            // If it's a connection error, try fallback
            if (!isConnected) {
              connect(systemInstruction, attempt + 1);
            } else {
              setError(err.message || "Connection failed. Check your API key and region.");
              setIsConnected(false);
              if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(`Failed to connect with ${modelName}:`, err);
      connect(systemInstruction, attempt + 1);
    }
  }, [disconnect]);

  return {
    isConnected,
    isInterrupted,
    messages,
    isAiSpeaking,
    userVolume,
    error,
    connect,
    disconnect
  };
}
