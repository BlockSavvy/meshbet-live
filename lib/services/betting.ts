import AsyncStorage from '@react-native-async-storage/async-storage';
import { bitchatService } from './bitchat';
import { walletService } from './wallet';

export type BetStatus = 'open' | 'pending' | 'accepted' | 'settled' | 'cancelled' | 'disputed';
export type BetOutcome = 'pending' | 'win' | 'loss' | 'push' | 'cancelled';

export interface BetParticipant {
  peerId: string;
  nickname: string;
  walletAddress: string;
  selection: string;
  signature?: string;
}

export interface Bet {
  id: string;
  createdAt: number;
  expiresAt: number;
  eventId: string;
  eventName: string;
  sport: string;
  
  creator: BetParticipant;
  opponent?: BetParticipant;
  
  amount: number;
  currency: 'SAT' | 'ETH' | 'USDC';
  
  creatorSelection: string;
  opponentSelection: string;
  odds: number;
  
  status: BetStatus;
  outcome?: BetOutcome;
  settledAt?: number;
  
  meshRoomId?: string;
  transactionHash?: string;
}

export type BetMessageType = 
  | 'BET_PROPOSAL'
  | 'BET_ACCEPT'
  | 'BET_REJECT'
  | 'BET_CANCEL'
  | 'BET_SETTLE'
  | 'BET_DISPUTE'
  | 'BET_SYNC';

export interface BetMessage {
  type: BetMessageType;
  betId: string;
  payload: any;
  timestamp: number;
  senderPeerId: string;
  senderWallet: string;
  signature: string;
}

const STORAGE_KEYS = {
  BETS: 'meshbet_bets',
  PENDING_MESSAGES: 'meshbet_pending_messages',
};

class BettingService {
  private bets: Map<string, Bet> = new Map();
  private messageListeners: ((message: BetMessage) => void)[] = [];
  private betUpdateListeners: ((bet: Bet) => void)[] = [];

  async initialize(): Promise<void> {
    await this.loadBets();
    console.log('[Betting] Service initialized');
  }

  private async loadBets(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BETS);
      if (stored) {
        const betsArray: Bet[] = JSON.parse(stored);
        betsArray.forEach(bet => this.bets.set(bet.id, bet));
      }
    } catch (error) {
      console.error('[Betting] Failed to load bets:', error);
    }
  }

  private async saveBets(): Promise<void> {
    try {
      const betsArray = Array.from(this.bets.values());
      await AsyncStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(betsArray));
    } catch (error) {
      console.error('[Betting] Failed to save bets:', error);
    }
  }

  private generateBetId(): string {
    return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createBet(params: {
    eventId: string;
    eventName: string;
    sport: string;
    selection: string;
    opponentSelection: string;
    amount: number;
    currency: 'SAT' | 'ETH' | 'USDC';
    odds: number;
    expiresInMinutes?: number;
  }): Promise<Bet | null> {
    const wallet = await walletService.loadExistingWallet();
    if (!wallet) {
      console.error('[Betting] No wallet found');
      return null;
    }

    const betId = this.generateBetId();
    const now = Date.now();
    const expiresAt = now + (params.expiresInMinutes || 30) * 60 * 1000;

    const bet: Bet = {
      id: betId,
      createdAt: now,
      expiresAt,
      eventId: params.eventId,
      eventName: params.eventName,
      sport: params.sport,
      creator: {
        peerId: bitchatService.localPeerId || 'local',
        nickname: 'You',
        walletAddress: wallet.address,
        selection: params.selection,
      },
      amount: params.amount,
      currency: params.currency,
      creatorSelection: params.selection,
      opponentSelection: params.opponentSelection,
      odds: params.odds,
      status: 'open',
    };

    const signature = await walletService.signMessage(JSON.stringify({
      betId,
      eventId: params.eventId,
      selection: params.selection,
      amount: params.amount,
      timestamp: now,
    }));

    if (signature) {
      bet.creator.signature = signature;
    }

    this.bets.set(betId, bet);
    await this.saveBets();

    await this.broadcastBetMessage({
      type: 'BET_PROPOSAL',
      betId,
      payload: bet,
      timestamp: now,
      senderPeerId: bet.creator.peerId,
      senderWallet: wallet.address,
      signature: signature || '',
    });

    this.notifyBetUpdate(bet);
    return bet;
  }

  async acceptBet(betId: string): Promise<boolean> {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'open') {
      return false;
    }

    const wallet = await walletService.loadExistingWallet();
    if (!wallet) {
      return false;
    }

    const now = Date.now();
    if (now > bet.expiresAt) {
      bet.status = 'cancelled';
      await this.saveBets();
      return false;
    }

    const signature = await walletService.signMessage(JSON.stringify({
      betId,
      action: 'accept',
      timestamp: now,
    }));

    bet.opponent = {
      peerId: bitchatService.localPeerId || 'local',
      nickname: 'You',
      walletAddress: wallet.address,
      selection: bet.opponentSelection,
      signature: signature || undefined,
    };
    bet.status = 'accepted';

    await this.saveBets();

    await this.broadcastBetMessage({
      type: 'BET_ACCEPT',
      betId,
      payload: { opponent: bet.opponent },
      timestamp: now,
      senderPeerId: bet.opponent.peerId,
      senderWallet: wallet.address,
      signature: signature || '',
    });

    this.notifyBetUpdate(bet);
    return true;
  }

  async settleBet(betId: string, winnerSelection: string): Promise<boolean> {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'accepted') {
      return false;
    }

    const wallet = await walletService.loadExistingWallet();
    if (!wallet) {
      return false;
    }

    const isCreatorWinner = bet.creatorSelection === winnerSelection;
    const creatorOutcome: BetOutcome = isCreatorWinner ? 'win' : 'loss';

    if (bet.creator.walletAddress === wallet.address) {
      bet.outcome = creatorOutcome;
    } else if (bet.opponent?.walletAddress === wallet.address) {
      bet.outcome = isCreatorWinner ? 'loss' : 'win';
    }

    bet.status = 'settled';
    bet.settledAt = Date.now();

    await this.saveBets();

    await this.broadcastBetMessage({
      type: 'BET_SETTLE',
      betId,
      payload: { winnerSelection, settledAt: bet.settledAt },
      timestamp: Date.now(),
      senderPeerId: bitchatService.localPeerId || 'local',
      senderWallet: wallet.address,
      signature: '',
    });

    this.notifyBetUpdate(bet);
    return true;
  }

  async cancelBet(betId: string): Promise<boolean> {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'open') {
      return false;
    }

    const wallet = await walletService.loadExistingWallet();
    if (!wallet || bet.creator.walletAddress !== wallet.address) {
      return false;
    }

    bet.status = 'cancelled';
    await this.saveBets();

    await this.broadcastBetMessage({
      type: 'BET_CANCEL',
      betId,
      payload: {},
      timestamp: Date.now(),
      senderPeerId: bitchatService.localPeerId || 'local',
      senderWallet: wallet.address,
      signature: '',
    });

    this.notifyBetUpdate(bet);
    return true;
  }

  private async broadcastBetMessage(message: BetMessage): Promise<void> {
    const messageStr = JSON.stringify(message);
    await bitchatService.sendMessage(messageStr);
    console.log('[Betting] Broadcast message:', message.type);
  }

  handleIncomingMessage(data: string): void {
    try {
      const message: BetMessage = JSON.parse(data);
      if (!message.type || !message.betId) return;

      console.log('[Betting] Received message:', message.type);

      switch (message.type) {
        case 'BET_PROPOSAL':
          this.handleBetProposal(message);
          break;
        case 'BET_ACCEPT':
          this.handleBetAccept(message);
          break;
        case 'BET_CANCEL':
          this.handleBetCancel(message);
          break;
        case 'BET_SETTLE':
          this.handleBetSettle(message);
          break;
      }

      this.messageListeners.forEach(listener => listener(message));
    } catch (error) {
      // Not a bet message
    }
  }

  private async handleBetProposal(message: BetMessage): Promise<void> {
    const bet = message.payload as Bet;
    if (!this.bets.has(bet.id)) {
      this.bets.set(bet.id, bet);
      await this.saveBets();
      this.notifyBetUpdate(bet);
    }
  }

  private async handleBetAccept(message: BetMessage): Promise<void> {
    const bet = this.bets.get(message.betId);
    if (bet && bet.status === 'open') {
      bet.opponent = message.payload.opponent;
      bet.status = 'accepted';
      await this.saveBets();
      this.notifyBetUpdate(bet);
    }
  }

  private async handleBetCancel(message: BetMessage): Promise<void> {
    const bet = this.bets.get(message.betId);
    if (bet && bet.status === 'open') {
      bet.status = 'cancelled';
      await this.saveBets();
      this.notifyBetUpdate(bet);
    }
  }

  private async handleBetSettle(message: BetMessage): Promise<void> {
    const bet = this.bets.get(message.betId);
    if (bet && bet.status === 'accepted') {
      bet.status = 'settled';
      bet.settledAt = message.payload.settledAt;
      await this.saveBets();
      this.notifyBetUpdate(bet);
    }
  }

  private notifyBetUpdate(bet: Bet): void {
    this.betUpdateListeners.forEach(listener => listener(bet));
  }

  onBetUpdate(callback: (bet: Bet) => void): () => void {
    this.betUpdateListeners.push(callback);
    return () => {
      const index = this.betUpdateListeners.indexOf(callback);
      if (index > -1) this.betUpdateListeners.splice(index, 1);
    };
  }

  onMessage(callback: (message: BetMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) this.messageListeners.splice(index, 1);
    };
  }

  getBet(betId: string): Bet | undefined {
    return this.bets.get(betId);
  }

  getAllBets(): Bet[] {
    return Array.from(this.bets.values());
  }

  getOpenBets(): Bet[] {
    return this.getAllBets().filter(bet => bet.status === 'open');
  }

  getActiveBets(): Bet[] {
    return this.getAllBets().filter(bet => 
      bet.status === 'open' || bet.status === 'pending' || bet.status === 'accepted'
    );
  }

  getMyBets(): Bet[] {
    const wallet = walletService.getAddress();
    if (!wallet) return [];
    
    return this.getAllBets().filter(bet => 
      bet.creator.walletAddress === wallet || 
      bet.opponent?.walletAddress === wallet
    );
  }

  getStats(): { totalBets: number; wins: number; losses: number; winRate: number; totalWon: number } {
    const myBets = this.getMyBets().filter(bet => bet.status === 'settled');
    const wallet = walletService.getAddress();
    
    let wins = 0;
    let losses = 0;
    let totalWon = 0;

    myBets.forEach(bet => {
      const isCreator = bet.creator.walletAddress === wallet;
      const myOutcome = isCreator ? bet.outcome : (bet.outcome === 'win' ? 'loss' : 'win');
      
      if (myOutcome === 'win') {
        wins++;
        totalWon += bet.amount * (bet.odds - 1);
      } else if (myOutcome === 'loss') {
        losses++;
      }
    });

    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;

    return {
      totalBets: myBets.length,
      wins,
      losses,
      winRate,
      totalWon,
    };
  }
}

export const bettingService = new BettingService();
