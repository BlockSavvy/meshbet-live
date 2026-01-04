import { bitchatService } from './bitchat';
import { subscriptionService } from './subscription';

export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'buffering' | 'paused' | 'ended';

export interface StreamChunk {
  streamId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string;
  timestamp: number;
  isKeyframe: boolean;
}

export interface StreamMetadata {
  streamId: string;
  title: string;
  eventId: string;
  hostPeerId: string;
  hostNickname: string;
  quality: 'low' | 'medium' | 'high';
  fps: number;
  startedAt: number;
  viewerCount: number;
}

export interface StreamMessage {
  type: 'STREAM_ANNOUNCE' | 'STREAM_CHUNK' | 'STREAM_END' | 'STREAM_REQUEST' | 'STREAM_QUALITY';
  payload: StreamMetadata | StreamChunk | { streamId: string };
  timestamp: number;
  senderPeerId: string;
}

const CHUNK_SIZE = 16 * 1024;
const BUFFER_SIZE = 30;

class StreamingService {
  private activeStreams: Map<string, StreamMetadata> = new Map();
  private chunkBuffers: Map<string, StreamChunk[]> = new Map();
  private streamListeners: ((streams: StreamMetadata[]) => void)[] = [];
  private chunkListeners: Map<string, ((chunk: StreamChunk) => void)[]> = new Map();
  private status: StreamStatus = 'idle';

  private currentStreamId: string | null = null;
  private isHost: boolean = false;
  private announceInterval: ReturnType<typeof setInterval> | null = null;
  private unsubPeerConnected: (() => void) | null = null;

  async initialize(): Promise<void> {
    bitchatService.registerStreamHandler((data: string) => {
      this.handleIncomingMessage(data);
    });
    
    this.unsubPeerConnected = bitchatService.onPeerConnected(() => {
      if (this.isHost && this.currentStreamId) {
        const stream = this.activeStreams.get(this.currentStreamId);
        if (stream) {
          this.broadcastMessage({
            type: 'STREAM_ANNOUNCE',
            payload: stream,
            timestamp: Date.now(),
            senderPeerId: stream.hostPeerId,
          });
        }
      }
    });
    
    console.log('[Streaming] Service initialized with protocol handler');
  }

  async startStream(params: {
    title: string;
    eventId: string;
    quality?: 'low' | 'medium' | 'high';
  }): Promise<StreamMetadata | null> {
    if (params.quality === 'high') {
      const check = subscriptionService.requirePro('hdPriority');
      if (!check.allowed) {
        console.warn('[Streaming] HD quality requires Pro:', check.reason);
        params.quality = 'medium';
      }
    }
    
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const metadata: StreamMetadata = {
      streamId,
      title: params.title,
      eventId: params.eventId,
      hostPeerId: bitchatService.localPeerId || 'local',
      hostNickname: 'Host',
      quality: params.quality || 'medium',
      fps: params.quality === 'high' ? 30 : params.quality === 'low' ? 15 : 24,
      startedAt: Date.now(),
      viewerCount: 0,
    };

    this.activeStreams.set(streamId, metadata);
    this.currentStreamId = streamId;
    this.isHost = true;
    this.status = 'streaming';

    await this.broadcastMessage({
      type: 'STREAM_ANNOUNCE',
      payload: metadata,
      timestamp: Date.now(),
      senderPeerId: metadata.hostPeerId,
    });

    this.announceInterval = setInterval(() => {
      const currentStream = this.activeStreams.get(streamId);
      if (currentStream && this.isHost) {
        this.broadcastMessage({
          type: 'STREAM_ANNOUNCE',
          payload: currentStream,
          timestamp: Date.now(),
          senderPeerId: currentStream.hostPeerId,
        });
      }
    }, 15000);

    this.notifyStreamUpdate();
    console.log('[Streaming] Started stream:', streamId);
    return metadata;
  }

  async stopStream(streamId: string): Promise<void> {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;

    if (this.announceInterval) {
      clearInterval(this.announceInterval);
      this.announceInterval = null;
    }

    await this.broadcastMessage({
      type: 'STREAM_END',
      payload: { streamId },
      timestamp: Date.now(),
      senderPeerId: bitchatService.localPeerId || 'local',
    });

    this.activeStreams.delete(streamId);
    this.chunkBuffers.delete(streamId);
    
    if (this.currentStreamId === streamId) {
      this.currentStreamId = null;
      this.isHost = false;
      this.status = 'idle';
    }

    this.notifyStreamUpdate();
    console.log('[Streaming] Stopped stream:', streamId);
  }

  async joinStream(streamId: string): Promise<boolean> {
    await this.broadcastMessage({
      type: 'STREAM_REQUEST',
      payload: { streamId },
      timestamp: Date.now(),
      senderPeerId: bitchatService.localPeerId || 'local',
    });

    this.currentStreamId = streamId;
    this.isHost = false;
    this.status = 'connecting';
    this.chunkBuffers.set(streamId, []);

    console.log('[Streaming] Joining stream:', streamId);
    return true;
  }

  async leaveStream(): Promise<void> {
    if (this.currentStreamId) {
      this.chunkBuffers.delete(this.currentStreamId);
      this.currentStreamId = null;
      this.status = 'idle';
    }
  }

  async sendChunk(streamId: string, data: ArrayBuffer, isKeyframe: boolean = false): Promise<void> {
    if (!this.isHost || this.currentStreamId !== streamId) return;

    const base64Data = this.arrayBufferToBase64(data);
    const chunks = this.splitIntoChunks(base64Data, CHUNK_SIZE);
    const totalChunks = chunks.length;

    for (let i = 0; i < chunks.length; i++) {
      const chunk: StreamChunk = {
        streamId,
        chunkIndex: i,
        totalChunks,
        data: chunks[i],
        timestamp: Date.now(),
        isKeyframe: isKeyframe && i === 0,
      };

      await this.broadcastMessage({
        type: 'STREAM_CHUNK',
        payload: chunk,
        timestamp: chunk.timestamp,
        senderPeerId: bitchatService.localPeerId || 'local',
      });
    }
  }

  handleIncomingMessage(data: string): void {
    try {
      const message: StreamMessage = JSON.parse(data);
      if (!message.type) return;

      switch (message.type) {
        case 'STREAM_ANNOUNCE':
          this.handleStreamAnnounce(message.payload as StreamMetadata);
          break;
        case 'STREAM_CHUNK':
          this.handleStreamChunk(message.payload as StreamChunk);
          break;
        case 'STREAM_END':
          this.handleStreamEnd((message.payload as { streamId: string }).streamId);
          break;
        case 'STREAM_REQUEST':
          this.handleStreamRequest(message);
          break;
      }
    } catch (error) {
      // Not a stream message
    }
  }

  private handleStreamAnnounce(metadata: StreamMetadata): void {
    this.activeStreams.set(metadata.streamId, metadata);
    this.notifyStreamUpdate();
    console.log('[Streaming] Discovered stream:', metadata.title);
  }

  private handleStreamChunk(chunk: StreamChunk): void {
    if (this.currentStreamId !== chunk.streamId) return;

    const buffer = this.chunkBuffers.get(chunk.streamId) || [];
    buffer.push(chunk);

    while (buffer.length > BUFFER_SIZE) {
      buffer.shift();
    }

    this.chunkBuffers.set(chunk.streamId, buffer);

    if (this.status === 'connecting' && buffer.length >= 5) {
      this.status = 'streaming';
    }

    const listeners = this.chunkListeners.get(chunk.streamId) || [];
    listeners.forEach(listener => listener(chunk));
  }

  private handleStreamEnd(streamId: string): void {
    this.activeStreams.delete(streamId);
    this.chunkBuffers.delete(streamId);
    
    if (this.currentStreamId === streamId) {
      this.status = 'ended';
    }

    this.notifyStreamUpdate();
    console.log('[Streaming] Stream ended:', streamId);
  }

  private handleStreamRequest(message: StreamMessage): void {
    const streamId = (message.payload as { streamId: string }).streamId;
    const stream = this.activeStreams.get(streamId);
    
    if (stream && this.isHost && this.currentStreamId === streamId) {
      stream.viewerCount++;
      this.broadcastMessage({
        type: 'STREAM_ANNOUNCE',
        payload: stream,
        timestamp: Date.now(),
        senderPeerId: bitchatService.localPeerId || 'local',
      });
    }
  }

  private async broadcastMessage(message: StreamMessage): Promise<void> {
    const messageStr = JSON.stringify(message);
    await bitchatService.sendMessage(messageStr);
  }

  private notifyStreamUpdate(): void {
    const streams = Array.from(this.activeStreams.values());
    this.streamListeners.forEach(listener => listener(streams));
  }

  onStreamUpdate(callback: (streams: StreamMetadata[]) => void): () => void {
    this.streamListeners.push(callback);
    return () => {
      const index = this.streamListeners.indexOf(callback);
      if (index > -1) this.streamListeners.splice(index, 1);
    };
  }

  onChunk(streamId: string, callback: (chunk: StreamChunk) => void): () => void {
    const listeners = this.chunkListeners.get(streamId) || [];
    listeners.push(callback);
    this.chunkListeners.set(streamId, listeners);

    return () => {
      const currentListeners = this.chunkListeners.get(streamId) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) currentListeners.splice(index, 1);
    };
  }

  getActiveStreams(): StreamMetadata[] {
    return Array.from(this.activeStreams.values());
  }

  getCurrentStream(): StreamMetadata | null {
    if (!this.currentStreamId) return null;
    return this.activeStreams.get(this.currentStreamId) || null;
  }

  getStatus(): StreamStatus {
    return this.status;
  }

  getBufferLevel(streamId: string): number {
    const buffer = this.chunkBuffers.get(streamId);
    if (!buffer) return 0;
    return Math.min(100, (buffer.length / BUFFER_SIZE) * 100);
  }

  private splitIntoChunks(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const streamingService = new StreamingService();
