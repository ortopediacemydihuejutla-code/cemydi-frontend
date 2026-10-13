"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import toast from "react-hot-toast";

export type SpeechRecognitionErrorType =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported"
  | string;

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorType;
  readonly message?: string;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

const emptySubscribe = () => () => {};

export type UseVoiceSearchOptions = {
  lang?: string;
  onResult: (transcript: string) => void;
  onError?: (error: SpeechRecognitionErrorType) => void;
};

export type UseVoiceSearchReturn = {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
};

export function useVoiceSearch({
  lang = "es-MX",
  onResult,
  onError,
}: UseVoiceSearchOptions): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    () => getSpeechRecognitionConstructor() !== null,
    () => false,
  );
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignorar fallas si la instancia ya se detuvo
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognitionClass = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionClass) {
      toast.error("Tu navegador no soporta búsqueda por voz.");
      return;
    }

    if (
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      toast.error("La búsqueda por voz requiere una conexión segura (HTTPS).");
      return;
    }

    // Consulta de permisos previos si la API Permissions está disponible
    if (navigator.permissions?.query) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (permissionStatus.state === "denied") {
          toast.error(
            "El permiso de micrófono está bloqueado en tu navegador. Habilítalo para continuar.",
          );
          return;
        }
      } catch {
        // Si el navegador no soporta consultar 'microphone', continuamos
      }
    }

    // Solicitud explícita de permiso al dispositivo si mediaDevices está disponible
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        const errName = err instanceof Error ? err.name : "";
        if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
          toast.error("Permiso de micrófono denegado. Permite el acceso para buscar por voz.");
        } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
          toast.error("No se encontró ningún micrófono conectado en tu dispositivo.");
        } else {
          toast.error("No se pudo acceder al micrófono.");
        }
        return;
      }
    }

    // Detener cualquier instancia previa activa
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignorar fallos de abort previo
      }
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        const clean = transcript.trim().replace(/\.+$/, "");
        if (clean) {
          onResultRef.current(clean);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        onErrorRef.current?.(event.error);

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Permiso de micrófono denegado. Permite el acceso para buscar por voz.");
        } else if (event.error === "no-speech") {
          toast.error("No se detectó voz. Intenta hablar nuevamente.");
        } else if (event.error === "audio-capture") {
          toast.error("No se detectó ningún micrófono disponible.");
        } else if (event.error === "network") {
          toast.error("Error de conexión al procesar el reconocimiento de voz.");
        } else if (event.error !== "aborted") {
          toast.error("No se pudo completar la búsqueda por voz.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      toast.error("No se pudo iniciar la búsqueda por voz.");
    }
  }, [lang]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignorar
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
