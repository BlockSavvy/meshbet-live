import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeeBreakdown {
  totalPot: number;
  platformFee: number;
  platformFeePercent: number;
  treasuryShare: number;
  relayTips: number;
  winnerPayout: number;
}

export interface TreasuryStats {
  totalCollected: number;
  relayTipsDistributed: number;
  lastUpdated: number;
}

const STORAGE_KEYS = {
  TREASURY_STATS: 'meshbet_treasury_stats',
  RELAY_TIPS: 'meshbet_relay_tips',
};

const FEE_CONFIG = {
  PLATFORM_FEE_PERCENT: 0.75,
  TREASURY_SHARE_PERCENT: 60,
  RELAY_TIPS_PERCENT: 15,
  RESERVE_PERCENT: 25,
};

function convertOddsToMultiplier(odds: number): number {
  if (odds >= 1 && odds <= 10) {
    return odds;
  }
  
  if (odds > 0) {
    return 1 + (odds / 100);
  } else {
    return 1 + (100 / Math.abs(odds));
  }
}

class FeeService {
  private treasuryStats: TreasuryStats = {
    totalCollected: 0,
    relayTipsDistributed: 0,
    lastUpdated: Date.now(),
  };

  async initialize(): Promise<void> {
    await this.loadStats();
    console.log('[Fees] Service initialized');
  }

  private async loadStats(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TREASURY_STATS);
      if (stored) {
        this.treasuryStats = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Fees] Failed to load stats:', error);
    }
  }

  private async saveStats(): Promise<void> {
    try {
      this.treasuryStats.lastUpdated = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.TREASURY_STATS, JSON.stringify(this.treasuryStats));
    } catch (error) {
      console.error('[Fees] Failed to save stats:', error);
    }
  }

  calculateFeeBreakdown(betAmount: number, odds: number = 2.0): FeeBreakdown {
    const multiplier = convertOddsToMultiplier(odds);
    const totalPot = betAmount * multiplier;
    const platformFee = totalPot * (FEE_CONFIG.PLATFORM_FEE_PERCENT / 100);
    const treasuryShare = platformFee * (FEE_CONFIG.TREASURY_SHARE_PERCENT / 100);
    const relayTips = platformFee * (FEE_CONFIG.RELAY_TIPS_PERCENT / 100);
    const winnerPayout = totalPot - platformFee;

    return {
      totalPot,
      platformFee,
      platformFeePercent: FEE_CONFIG.PLATFORM_FEE_PERCENT,
      treasuryShare,
      relayTips,
      winnerPayout,
    };
  }

  formatFeeBreakdown(breakdown: FeeBreakdown, currency: string = 'SAT'): string[] {
    return [
      `Total Pot: ${breakdown.totalPot.toLocaleString()} ${currency}`,
      `Platform Fee (${breakdown.platformFeePercent}%): ${breakdown.platformFee.toFixed(2)} ${currency}`,
      `Winner Payout: ${breakdown.winnerPayout.toFixed(2)} ${currency}`,
    ];
  }

  getDetailedBreakdown(breakdown: FeeBreakdown): {
    treasury: string;
    relays: string;
    total: string;
  } {
    return {
      treasury: `${((FEE_CONFIG.TREASURY_SHARE_PERCENT / 100) * 100).toFixed(0)}% → Treasury`,
      relays: `${((FEE_CONFIG.RELAY_TIPS_PERCENT / 100) * 100).toFixed(0)}% → Relay Node Tips`,
      total: `Ultra-low ${FEE_CONFIG.PLATFORM_FEE_PERCENT}% fee`,
    };
  }

  async recordFeeCollection(breakdown: FeeBreakdown): Promise<void> {
    this.treasuryStats.totalCollected += breakdown.treasuryShare;
    this.treasuryStats.relayTipsDistributed += breakdown.relayTips;
    await this.saveStats();
    
    console.log('[Fees] Collected:', {
      treasury: breakdown.treasuryShare,
      relays: breakdown.relayTips,
    });
  }

  getTreasuryStats(): TreasuryStats {
    return { ...this.treasuryStats };
  }

  getFeeConfig() {
    return { ...FEE_CONFIG };
  }

  getFeeBadgeText(): string {
    return `Ultra-low ${FEE_CONFIG.PLATFORM_FEE_PERCENT}% fees`;
  }
}

export const feeService = new FeeService();
