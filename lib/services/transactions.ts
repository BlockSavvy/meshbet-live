import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TRANSACTIONS: 'meshbet_transactions',
  PENDING_TXS: 'meshbet_pending_transactions',
};

export type TransactionType = 'bet_stake' | 'bet_win' | 'bet_loss' | 'escrow_lock' | 'escrow_release';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  fromAddress: string;
  toAddress: string;
  betId?: string;
  txHash?: string;
  status: TransactionStatus;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export interface TransactionReceipt {
  success: boolean;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
}

const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
  },
  polygonMumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
  },
};

class TransactionService {
  private ethers: any = null;
  private provider: any = null;
  private wallet: any = null;
  private network: keyof typeof NETWORKS = 'sepolia';
  private transactions: Transaction[] = [];
  private listeners: ((txs: Transaction[]) => void)[] = [];

  async initialize(): Promise<boolean> {
    try {
      const module = await import('ethers');
      this.ethers = module;
      
      const networkConfig = NETWORKS[this.network];
      this.provider = new this.ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      await this.loadTransactions();
      console.log('[Transactions] Service initialized on', networkConfig.name);
      return true;
    } catch (error) {
      console.error('[Transactions] Failed to initialize:', error);
      return false;
    }
  }

  async connectWallet(mnemonic: string): Promise<string | null> {
    if (!this.ethers || !this.provider) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const hdWallet = this.ethers.Wallet.fromPhrase(mnemonic);
      this.wallet = hdWallet.connect(this.provider);
      console.log('[Transactions] Wallet connected:', this.wallet.address);
      return this.wallet.address;
    } catch (error) {
      console.error('[Transactions] Failed to connect wallet:', error);
      return null;
    }
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) return '0';

      const balance = await this.provider.getBalance(targetAddress);
      return this.ethers.formatEther(balance);
    } catch (error) {
      console.error('[Transactions] Failed to get balance:', error);
      return '0';
    }
  }

  async sendTransaction(params: {
    to: string;
    amount: string;
    type: TransactionType;
    betId?: string;
  }): Promise<Transaction | null> {
    if (!this.wallet) {
      console.error('[Transactions] Wallet not connected');
      return null;
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const transaction: Transaction = {
      id: txId,
      type: params.type,
      amount: params.amount,
      fromAddress: this.wallet.address,
      toAddress: params.to,
      betId: params.betId,
      status: 'pending',
      timestamp: Date.now(),
    };

    this.transactions.unshift(transaction);
    await this.saveTransactions();
    this.notifyListeners();

    try {
      const amountWei = this.ethers.parseEther(params.amount);
      
      const tx = await this.wallet.sendTransaction({
        to: params.to,
        value: amountWei,
      });

      transaction.txHash = tx.hash;
      await this.saveTransactions();
      this.notifyListeners();

      console.log('[Transactions] Sent tx:', tx.hash);

      const receipt = await tx.wait();
      
      transaction.status = 'confirmed';
      transaction.blockNumber = receipt.blockNumber;
      transaction.gasUsed = receipt.gasUsed.toString();
      
      await this.saveTransactions();
      this.notifyListeners();

      console.log('[Transactions] Confirmed:', tx.hash);
      return transaction;
    } catch (error: any) {
      console.error('[Transactions] Failed to send:', error);
      
      transaction.status = 'failed';
      transaction.error = error.message || 'Transaction failed';
      
      await this.saveTransactions();
      this.notifyListeners();
      
      return transaction;
    }
  }

  async stakeBet(betId: string, amount: string, escrowAddress: string): Promise<Transaction | null> {
    return await this.sendTransaction({
      to: escrowAddress,
      amount,
      type: 'escrow_lock',
      betId,
    });
  }

  async releaseBetWinnings(betId: string, amount: string, winnerAddress: string): Promise<Transaction | null> {
    return await this.sendTransaction({
      to: winnerAddress,
      amount,
      type: 'escrow_release',
      betId,
    });
  }

  async estimateGas(to: string, amount: string): Promise<{ gas: string; gasPrice: string; total: string } | null> {
    if (!this.wallet || !this.provider) {
      return null;
    }

    try {
      const amountWei = this.ethers.parseEther(amount);
      
      const gasEstimate = await this.provider.estimateGas({
        from: this.wallet.address,
        to,
        value: amountWei,
      });

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || this.ethers.parseGwei('20');
      
      const totalGasCost = gasEstimate * gasPrice;

      return {
        gas: gasEstimate.toString(),
        gasPrice: this.ethers.formatGwei(gasPrice),
        total: this.ethers.formatEther(totalGasCost),
      };
    } catch (error) {
      console.error('[Transactions] Failed to estimate gas:', error);
      return null;
    }
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return 'pending';
      }
      
      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      console.error('[Transactions] Failed to get tx status:', error);
      return 'pending';
    }
  }

  async refreshPendingTransactions(): Promise<void> {
    const pendingTxs = this.transactions.filter(tx => tx.status === 'pending' && tx.txHash);
    
    for (const tx of pendingTxs) {
      if (!tx.txHash) continue;
      
      const status = await this.getTransactionStatus(tx.txHash);
      if (status !== 'pending') {
        tx.status = status;
        
        if (status === 'confirmed') {
          const receipt = await this.provider.getTransactionReceipt(tx.txHash);
          if (receipt) {
            tx.blockNumber = receipt.blockNumber;
            tx.gasUsed = receipt.gasUsed.toString();
          }
        }
      }
    }

    await this.saveTransactions();
    this.notifyListeners();
  }

  setNetwork(network: keyof typeof NETWORKS): void {
    this.network = network;
    const networkConfig = NETWORKS[network];
    
    if (this.ethers) {
      this.provider = new this.ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      if (this.wallet) {
        this.wallet = this.wallet.connect(this.provider);
      }
    }
    
    console.log('[Transactions] Switched to', networkConfig.name);
  }

  getNetwork(): typeof NETWORKS[keyof typeof NETWORKS] {
    return NETWORKS[this.network];
  }

  getExplorerUrl(txHash: string): string {
    const networkConfig = NETWORKS[this.network];
    return `${networkConfig.explorerUrl}/tx/${txHash}`;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getTransactionsByBet(betId: string): Transaction[] {
    return this.transactions.filter(tx => tx.betId === betId);
  }

  onTransactionsUpdate(callback: (txs: Transaction[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    const txs = this.getTransactions();
    this.listeners.forEach(cb => cb(txs));
  }

  private async loadTransactions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Transactions] Failed to load transactions:', error);
    }
  }

  private async saveTransactions(): Promise<void> {
    try {
      const toSave = this.transactions.slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(toSave));
    } catch (error) {
      console.error('[Transactions] Failed to save transactions:', error);
    }
  }

  formatAmount(amount: string, decimals: number = 4): string {
    const num = parseFloat(amount);
    return num.toFixed(decimals);
  }

  isWalletConnected(): boolean {
    return this.wallet !== null;
  }

  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }
}

export const transactionService = new TransactionService();
