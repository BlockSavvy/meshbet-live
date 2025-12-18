import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';

const WALLET_STORAGE_KEYS = {
  MNEMONIC: 'meshbet_wallet_mnemonic',
  ADDRESS: 'meshbet_wallet_address',
  PUBLIC_KEY: 'meshbet_wallet_pubkey',
  HAS_BACKUP: 'meshbet_wallet_backed_up',
};

export interface WalletInfo {
  address: string;
  publicKey: string;
  hasBackup: boolean;
}

class WalletService {
  private mnemonic: string | null = null;
  private address: string | null = null;
  private publicKey: string | null = null;
  private ethers: any = null;

  async initialize(): Promise<boolean> {
    try {
      const module = await import('ethers');
      this.ethers = module;
      return true;
    } catch (error) {
      console.error('[Wallet] Failed to load ethers:', error);
      return false;
    }
  }

  async createWallet(): Promise<{ mnemonic: string; address: string; publicKey: string } | null> {
    if (!this.ethers) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const wallet = this.ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase || '';
      const address = wallet.address as string;
      const publicKey = wallet.publicKey as string;
      
      this.mnemonic = mnemonic;
      this.address = address;
      this.publicKey = publicKey;

      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.MNEMONIC, mnemonic);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.ADDRESS, address);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.PUBLIC_KEY, publicKey);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.HAS_BACKUP, 'false');

      return {
        mnemonic,
        address,
        publicKey,
      };
    } catch (error) {
      console.error('[Wallet] Failed to create wallet:', error);
      return null;
    }
  }

  async restoreFromMnemonic(mnemonic: string): Promise<{ address: string; publicKey: string } | null> {
    if (!this.ethers) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const wallet = this.ethers.Wallet.fromPhrase(mnemonic.trim());
      const trimmedMnemonic = mnemonic.trim();
      const address = wallet.address as string;
      const publicKey = wallet.publicKey as string;
      
      this.mnemonic = trimmedMnemonic;
      this.address = address;
      this.publicKey = publicKey;

      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.MNEMONIC, trimmedMnemonic);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.ADDRESS, address);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.PUBLIC_KEY, publicKey);
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.HAS_BACKUP, 'true');

      return {
        address,
        publicKey,
      };
    } catch (error) {
      console.error('[Wallet] Failed to restore wallet:', error);
      return null;
    }
  }

  async loadExistingWallet(): Promise<WalletInfo | null> {
    try {
      const address = await SecureStore.getItemAsync(WALLET_STORAGE_KEYS.ADDRESS);
      const publicKey = await SecureStore.getItemAsync(WALLET_STORAGE_KEYS.PUBLIC_KEY);
      const hasBackup = await SecureStore.getItemAsync(WALLET_STORAGE_KEYS.HAS_BACKUP);

      if (address && publicKey) {
        this.address = address;
        this.publicKey = publicKey;
        this.mnemonic = await SecureStore.getItemAsync(WALLET_STORAGE_KEYS.MNEMONIC);

        return {
          address,
          publicKey,
          hasBackup: hasBackup === 'true',
        };
      }
      return null;
    } catch (error) {
      console.error('[Wallet] Failed to load wallet:', error);
      return null;
    }
  }

  async getMnemonic(): Promise<string | null> {
    if (this.mnemonic) return this.mnemonic;
    
    try {
      return await SecureStore.getItemAsync(WALLET_STORAGE_KEYS.MNEMONIC);
    } catch (error) {
      console.error('[Wallet] Failed to get mnemonic:', error);
      return null;
    }
  }

  async markAsBackedUp(): Promise<void> {
    try {
      await SecureStore.setItemAsync(WALLET_STORAGE_KEYS.HAS_BACKUP, 'true');
    } catch (error) {
      console.error('[Wallet] Failed to mark as backed up:', error);
    }
  }

  async signMessage(message: string): Promise<string | null> {
    if (!this.ethers) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const mnemonic = await this.getMnemonic();
      if (!mnemonic) return null;

      const wallet = this.ethers.Wallet.fromPhrase(mnemonic);
      return await wallet.signMessage(message);
    } catch (error) {
      console.error('[Wallet] Failed to sign message:', error);
      return null;
    }
  }

  async signBetCommitment(betData: {
    eventId: string;
    amount: string;
    odds: string;
    side: string;
    timestamp: number;
  }): Promise<{ signature: string; message: string } | null> {
    const message = JSON.stringify({
      type: 'BET_COMMITMENT',
      ...betData,
    });

    const signature = await this.signMessage(message);
    if (!signature) return null;

    return { signature, message };
  }

  async deleteWallet(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEYS.MNEMONIC);
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEYS.ADDRESS);
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEYS.PUBLIC_KEY);
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEYS.HAS_BACKUP);
      this.mnemonic = null;
      this.address = null;
      this.publicKey = null;
    } catch (error) {
      console.error('[Wallet] Failed to delete wallet:', error);
    }
  }

  getAddress(): string | null {
    return this.address;
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }

  hasWallet(): boolean {
    return this.address !== null;
  }

  formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const walletService = new WalletService();
