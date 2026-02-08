import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
    onResult: (text: string) => void;
    placeholder?: string;
    className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, className }) => {
    const [isListening, setIsListening] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSupported(true);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            onResult(text);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isListening, onResult]);

    if (!supported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`btn-icon ${className}`}
            style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: isListening ? 'var(--error)' : 'rgba(212, 175, 55, 0.1)',
                color: isListening ? 'white' : 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '32px',
                height: '32px',
                flexShrink: 0
            }}
            title={isListening ? 'Escuchando...' : 'Dictar por voz'}
        >
            {isListening ? (
                <Loader2 size={16} className="spin" />
            ) : (
                <Mic size={16} />
            )}
        </button>
    );
};

export default VoiceInput;
