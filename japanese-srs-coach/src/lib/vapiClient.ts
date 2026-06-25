export type VoiceCallStatus = 'idle' | 'connecting' | 'active' | 'stopping' | 'ended' | 'error';

export interface TranscriptEvent {
  text: string;
  role: 'learner' | 'assistant';
  isFinal: boolean;
}

interface VoiceEvents {
  transcript: TranscriptEvent;
  callStart: undefined;
  callEnd: undefined;
  error: Error;
  status: VoiceCallStatus;
}

export interface VapiAdapter {
  start(assistantId: string): Promise<void>;
  stop(): Promise<void>;
}

export class VapiClient {
  private listeners = new Map<keyof VoiceEvents, Set<(payload: never) => void>>();
  private status: VoiceCallStatus = 'idle';

  constructor(
    private readonly config: { publicKey?: string; assistantId?: string },
    private readonly adapter?: VapiAdapter,
  ) {}

  getStatus() { return this.status; }
  isConfigured() { return Boolean(this.config.publicKey && this.config.assistantId); }

  on<K extends keyof VoiceEvents>(event: K, listener: (payload: VoiceEvents[K]) => void): () => void {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(listener as (payload: never) => void);
    this.listeners.set(event, listeners);
    return () => listeners.delete(listener as (payload: never) => void);
  }

  private emit<K extends keyof VoiceEvents>(event: K, payload: VoiceEvents[K]) {
    this.listeners.get(event)?.forEach((listener) => listener(payload as never));
  }

  private setStatus(status: VoiceCallStatus) {
    this.status = status;
    this.emit('status', status);
  }

  async start(): Promise<void> {
    try {
      this.setStatus('connecting');
      if (this.adapter && this.config.assistantId) await this.adapter.start(this.config.assistantId);
      await new Promise((resolve) => setTimeout(resolve, 250));
      this.setStatus('active');
      this.emit('callStart', undefined);
      if (!this.adapter) {
        this.emit('transcript', {
          role: 'assistant', isFinal: true,
          text: 'Mock voice session started. Romaji and English will always remain visible.',
        });
      }
    } catch (error) {
      const safeError = error instanceof Error ? error : new Error('Voice session failed.');
      this.setStatus('error');
      this.emit('error', safeError);
      throw safeError;
    }
  }

  async stop(): Promise<void> {
    this.setStatus('stopping');
    if (this.adapter) await this.adapter.stop();
    this.setStatus('ended');
    this.emit('callEnd', undefined);
  }
}

export const vapiClient = new VapiClient({
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
});
