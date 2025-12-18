import { Platform } from 'react-native';

export interface BitchatPeer {
  peerID: string;
  nickname: string;
  rssi?: number;
}

export interface BitchatMessage {
  id: string;
  content: string;
  sender: string;
  senderNickname: string;
  channel?: string;
  timestamp: number;
  isPrivate: boolean;
}

export interface BitchatChannel {
  id: string;
  name: string;
  memberCount: number;
  isGeohash: boolean;
}

type MessageListener = (message: BitchatMessage) => void;
type PeerListener = (peer: BitchatPeer) => void;
type StatusListener = (status: 'connected' | 'disconnected' | 'scanning') => void;

class BitchatService {
  private isRunning = false;
  private nickname = '';
  private peers: Map<string, BitchatPeer> = new Map();
  private messageListeners: Set<MessageListener> = new Set();
  private peerConnectedListeners: Set<PeerListener> = new Set();
  private peerDisconnectedListeners: Set<PeerListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private BitchatAPI: any = null;
  public localPeerId: string = `peer_${Math.random().toString(36).substr(2, 8)}`;

  async initialize() {
    if (Platform.OS === 'web') {
      console.log('[Bitchat] Web platform detected - using mock mode');
      return false;
    }

    try {
      const module = await import('expo-bitchat');
      this.BitchatAPI = module.default;
      return true;
    } catch (error) {
      console.log('[Bitchat] Module not available:', error);
      return false;
    }
  }

  async startServices(nickname: string): Promise<boolean> {
    this.nickname = nickname;

    if (Platform.OS === 'web') {
      console.log('[Bitchat] Starting mock services for web');
      this.isRunning = true;
      this.localPeerId = `web_${Math.random().toString(36).substr(2, 8)}`;
      this.notifyStatus('connected');
      return true;
    }

    if (!this.BitchatAPI) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      await this.BitchatAPI.startServices(nickname);
      this.isRunning = true;
      
      try {
        const peerInfo = await this.BitchatAPI.getLocalPeerInfo?.();
        if (peerInfo?.peerID) {
          this.localPeerId = peerInfo.peerID;
        }
      } catch (e) {
        console.log('[Bitchat] Could not get local peer info, using fallback');
      }

      this.BitchatAPI.addMessageListener((message: any) => {
        const msg: BitchatMessage = {
          id: message.id || `${Date.now()}`,
          content: message.content,
          sender: message.sender,
          senderNickname: message.senderNickname || message.sender,
          channel: message.channel,
          timestamp: message.timestamp || Date.now(),
          isPrivate: message.isPrivate || false,
        };
        this.messageListeners.forEach(listener => listener(msg));
      });

      this.BitchatAPI.addPeerConnectedListener((peer: any) => {
        const p: BitchatPeer = {
          peerID: peer.peerID,
          nickname: peer.nickname,
          rssi: peer.rssi,
        };
        this.peers.set(p.peerID, p);
        this.peerConnectedListeners.forEach(listener => listener(p));
      });

      this.BitchatAPI.addPeerDisconnectedListener((peer: any) => {
        const p = this.peers.get(peer.peerID);
        if (p) {
          this.peers.delete(peer.peerID);
          this.peerDisconnectedListeners.forEach(listener => listener(p));
        }
      });

      this.notifyStatus('connected');
      return true;
    } catch (error) {
      console.error('[Bitchat] Failed to start services:', error);
      return false;
    }
  }

  async stopServices(): Promise<void> {
    if (Platform.OS === 'web') {
      this.isRunning = false;
      this.notifyStatus('disconnected');
      return;
    }

    if (this.BitchatAPI && this.isRunning) {
      try {
        await this.BitchatAPI.stopServices();
      } catch (error) {
        console.error('[Bitchat] Failed to stop services:', error);
      }
    }
    this.isRunning = false;
    this.peers.clear();
    this.notifyStatus('disconnected');
  }

  async sendMessage(content: string, channel: string = '#general'): Promise<boolean> {
    if (Platform.OS === 'web') {
      const mockMsg: BitchatMessage = {
        id: `${Date.now()}`,
        content,
        sender: 'self',
        senderNickname: this.nickname,
        channel,
        timestamp: Date.now(),
        isPrivate: false,
      };
      this.messageListeners.forEach(listener => listener(mockMsg));
      return true;
    }

    if (!this.BitchatAPI || !this.isRunning) return false;

    try {
      await this.BitchatAPI.sendMessage(content, [], channel);
      return true;
    } catch (error) {
      console.error('[Bitchat] Failed to send message:', error);
      return false;
    }
  }

  async sendPrivateMessage(content: string, peerID: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Bitchat] Mock private message to', peerID);
      return true;
    }

    if (!this.BitchatAPI || !this.isRunning) return false;

    try {
      const peer = this.peers.get(peerID);
      if (!peer) return false;
      await this.BitchatAPI.sendPrivateMessage(content, peerID, peer.nickname);
      return true;
    } catch (error) {
      console.error('[Bitchat] Failed to send private message:', error);
      return false;
    }
  }

  async getConnectedPeers(): Promise<BitchatPeer[]> {
    if (Platform.OS === 'web') {
      return Array.from(this.peers.values());
    }

    if (!this.BitchatAPI || !this.isRunning) return [];

    try {
      const peers = await this.BitchatAPI.getConnectedPeers();
      return Object.entries(peers).map(([peerID, nickname]) => ({
        peerID,
        nickname: nickname as string,
      }));
    } catch (error) {
      console.error('[Bitchat] Failed to get peers:', error);
      return [];
    }
  }

  async startDiscovery(): Promise<void> {
    this.notifyStatus('scanning');
    
    if (Platform.OS === 'web') {
      setTimeout(() => {
        const mockPeers: BitchatPeer[] = [
          { peerID: 'peer_a7x', nickname: 'Bar2049_Host', rssi: -45 },
          { peerID: 'peer_b9y', nickname: 'MikeTailgate', rssi: -62 },
          { peerID: 'peer_c2z', nickname: 'UFC_Watcher', rssi: -78 },
        ];
        
        mockPeers.forEach((peer, index) => {
          setTimeout(() => {
            this.peers.set(peer.peerID, peer);
            this.peerConnectedListeners.forEach(listener => listener(peer));
          }, (index + 1) * 1000);
        });

        setTimeout(() => {
          this.notifyStatus('connected');
        }, 4000);
      }, 500);
      return;
    }

    if (!this.BitchatAPI || !this.isRunning) {
      console.log('[Bitchat] Cannot start discovery - service not running');
      return;
    }

    try {
      if (this.BitchatAPI.startDiscovery) {
        await this.BitchatAPI.startDiscovery();
      }
      
      const peers = await this.getConnectedPeers();
      peers.forEach(peer => {
        if (!this.peers.has(peer.peerID)) {
          this.peers.set(peer.peerID, peer);
          this.peerConnectedListeners.forEach(listener => listener(peer));
        }
      });
      
      setTimeout(() => {
        this.notifyStatus('connected');
      }, 3000);
    } catch (error) {
      console.error('[Bitchat] Discovery failed:', error);
      this.notifyStatus('connected');
    }
  }

  async hydratePeers(): Promise<void> {
    const peers = await this.getConnectedPeers();
    peers.forEach(peer => {
      if (!this.peers.has(peer.peerID)) {
        this.peers.set(peer.peerID, peer);
      }
    });
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onPeerConnected(listener: PeerListener): () => void {
    this.peerConnectedListeners.add(listener);
    return () => this.peerConnectedListeners.delete(listener);
  }

  onPeerDisconnected(listener: PeerListener): () => void {
    this.peerDisconnectedListeners.add(listener);
    return () => this.peerDisconnectedListeners.delete(listener);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(status: 'connected' | 'disconnected' | 'scanning') {
    this.statusListeners.forEach(listener => listener(status));
  }

  get running() {
    return this.isRunning;
  }

  get currentNickname() {
    return this.nickname;
  }

  get peerCount() {
    return this.peers.size;
  }

  get connectedPeers(): BitchatPeer[] {
    return Array.from(this.peers.values());
  }
}

export const bitchatService = new BitchatService();
