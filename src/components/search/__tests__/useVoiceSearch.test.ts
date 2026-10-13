import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import toast from "react-hot-toast";
import { useVoiceSearch } from "../useVoiceSearch";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useVoiceSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("informa si el navegador no soporta reconocimiento de voz", async () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    const onResult = vi.fn();
    const { result } = renderHook(() => useVoiceSearch({ onResult }));

    expect(result.current.isSupported).toBe(false);

    await act(async () => {
      await result.current.startListening();
    });

    expect(toast.error).toHaveBeenCalledWith("Tu navegador no soporta búsqueda por voz.");
    expect(result.current.isListening).toBe(false);

  });

  it("solicita permiso y emite el resultado cuando se reconoce voz", async () => {
    let instanceRef: {
      onstart: (() => void) | null;
      onresult: ((ev: unknown) => void) | null;
      onerror: ((ev: unknown) => void) | null;
      onend: (() => void) | null;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      abort: ReturnType<typeof vi.fn>;
    } | null = null;

    class MockSpeechRecognition {
      onstart: (() => void) | null = null;
      onresult: ((ev: unknown) => void) | null = null;
      onerror: ((ev: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start = vi.fn(() => {
        this.onstart?.();
      });
      stop = vi.fn(() => {
        this.onend?.();
      });
      abort = vi.fn(() => {
        this.onend?.();
      });
    }

    const MockConstructor = vi.fn().mockImplementation(function () {
      const instance = new MockSpeechRecognition();
      instanceRef = instance;
      return instance;
    });

    vi.stubGlobal("SpeechRecognition", MockConstructor);

    const stopTrack = vi.fn();
    const mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: stopTrack }],
    });
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
    });

    const onResult = vi.fn();
    const { result } = renderHook(() => useVoiceSearch({ onResult }));

    expect(result.current.isSupported).toBe(true);

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(stopTrack).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);

    // Simular transcripción recibida
    act(() => {
      instanceRef?.onresult?.({
        results: [
          [
            {
              transcript: "silla de ruedas.",
              confidence: 0.95,
            },
          ],
        ],
      });
    });

    expect(onResult).toHaveBeenCalledWith("silla de ruedas");
  });

  it("gestiona denegación de permisos de micrófono", async () => {
    class MockSpeechRecognition {
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
    }
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const permissionError = new Error("Permission denied");
    permissionError.name = "NotAllowedError";

    const mockGetUserMedia = vi.fn().mockRejectedValue(permissionError);
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
    });

    const onResult = vi.fn();
    const { result } = renderHook(() => useVoiceSearch({ onResult }));

    await act(async () => {
      await result.current.startListening();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Permiso de micrófono denegado. Permite el acceso para buscar por voz.",
    );
    expect(result.current.isListening).toBe(false);
  });
});
