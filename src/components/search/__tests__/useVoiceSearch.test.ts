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

  it("inicia sin solicitar captura separada y emite el resultado", async () => {
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
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: mockGetUserMedia } });

    const onResult = vi.fn();
    const { result } = renderHook(() => useVoiceSearch({ onResult }));

    expect(result.current.isSupported).toBe(true);

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockGetUserMedia).not.toHaveBeenCalled();
    expect(stopTrack).not.toHaveBeenCalled();
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
      onerror: ((event: { error: string }) => void) | null = null;
      start = vi.fn(() => this.onerror?.({ error: "not-allowed" }));
      stop = vi.fn();
      abort = vi.fn();
    }
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

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

  it("inicia inmediatamente aunque la captura separada deje un permiso pendiente", async () => {
    const start = vi.fn();
    vi.stubGlobal("SpeechRecognition", class {
      start = start;
      abort = vi.fn();
    });
    const getUserMedia = vi.fn(() => new Promise<MediaStream>(() => {}));
    const query = vi.fn(() => new Promise<PermissionStatus>(() => {}));
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia }, permissions: { query } });
    const { result } = renderHook(() => useVoiceSearch({ onResult: vi.fn() }));
    await act(async () => {
      const pending = result.current.startListening();
      expect(start).toHaveBeenCalledOnce();
      await pending;
    });
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it("cancela el arranque pendiente y descarta eventos de sesiones anteriores", async () => {
    class MockRecognition {
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onresult: ((ev: { results: { transcript: string }[][] }) => void) | null = null;
      start = vi.fn();
      abort = vi.fn();
    }
    const instances: MockRecognition[] = [];
    vi.stubGlobal("SpeechRecognition", class extends MockRecognition {
      constructor() { super(); instances.push(this); }
    });
    const onResult = vi.fn();
    const { result, unmount } = renderHook(() => useVoiceSearch({ onResult }));
    await act(() => result.current.toggleListening());
    const oldEnd = instances[0].onend;
    const oldResult = instances[0].onresult;
    await act(() => result.current.toggleListening());
    expect(instances[0].abort).toHaveBeenCalledOnce();
    expect(instances).toHaveLength(1);
    await act(() => result.current.toggleListening());
    act(() => {
      instances[1].onstart?.();
      oldEnd?.();
      oldResult?.({ results: [[{ transcript: "resultado cancelado" }]] });
    });
    expect(result.current.isListening).toBe(true);
    expect(onResult).not.toHaveBeenCalled();
    const lateResult = instances[1].onresult;
    unmount();
    expect(instances[1].abort).toHaveBeenCalledOnce();
    lateResult?.({ results: [[{ transcript: "resultado tardío" }]] });
    expect(onResult).not.toHaveBeenCalled();
  });

  it("evita inicios duplicados mientras espera al navegador", async () => {
    const start = vi.fn();
    vi.stubGlobal("SpeechRecognition", class { start = start; abort = vi.fn(); });
    const { result } = renderHook(() => useVoiceSearch({ onResult: vi.fn() }));
    await act(async () => {
      await Promise.all([result.current.startListening(), result.current.startListening()]);
    });
    expect(start).toHaveBeenCalledOnce();
  });
});
