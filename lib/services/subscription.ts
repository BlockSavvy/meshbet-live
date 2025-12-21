import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type SubscriptionTier = 'free' | 'pro';
export type PaymentMethod = 'iap' | 'lightning';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: number;
  paymentMethod?: PaymentMethod;
  productId?: string;
  originalTransactionId?: string;
}

export interface ProFeatures {
  hdPriority: boolean;
  advancedStats: boolean;
  customRooms: boolean;
  priorityRelays: boolean;
  exclusiveProps: boolean;
  venueMode: boolean;
}

const STORAGE_KEYS = {
  SUBSCRIPTION: 'meshbet_subscription',
  PRO_FEATURES: 'meshbet_pro_features',
};

const ENTITLEMENT_ID = 'MeshBet Pro';

const PRODUCTS = {
  monthly: {
    id: 'monthly',
    price: 6.99,
    displayPrice: '$6.99/month',
    period: 'month',
  },
  yearly: {
    id: 'yearly',
    price: 59.99,
    displayPrice: '$59.99/year',
    period: 'year',
    savings: '28%',
  },
  lifetime: {
    id: 'lifetime',
    price: 149.99,
    displayPrice: '$149.99 once',
    period: 'forever',
  },
};

const PRO_PRICE = {
  monthly: PRODUCTS.monthly.price,
  productId: PRODUCTS.monthly.id,
  displayPrice: PRODUCTS.monthly.displayPrice,
};

const FREE_FEATURES: ProFeatures = {
  hdPriority: false,
  advancedStats: false,
  customRooms: false,
  priorityRelays: false,
  exclusiveProps: false,
  venueMode: false,
};

const PRO_FEATURES: ProFeatures = {
  hdPriority: true,
  advancedStats: true,
  customRooms: true,
  priorityRelays: true,
  exclusiveProps: true,
  venueMode: true,
};

class SubscriptionService {
  private status: SubscriptionStatus = {
    tier: 'free',
    isActive: false,
  };
  private purchasesSDK: any = null;
  private listeners: ((status: SubscriptionStatus) => void)[] = [];

  async initialize(): Promise<void> {
    await this.loadStatus();
    
    if (Platform.OS !== 'web') {
      await this.initializeRevenueCat();
    }
    
    console.log('[Subscription] Service initialized, tier:', this.status.tier);
  }

  private async initializeRevenueCat(): Promise<void> {
    try {
      const Purchases = await import('react-native-purchases' as any);
      this.purchasesSDK = Purchases.default;
      
      const apiKey = Platform.OS === 'ios' 
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || ''
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '';
      
      if (apiKey) {
        await this.purchasesSDK.configure({ apiKey });
        await this.syncSubscriptionStatus();
        console.log('[Subscription] RevenueCat configured');
      } else {
        console.log('[Subscription] RevenueCat keys not configured');
      }
    } catch (error) {
      console.log('[Subscription] RevenueCat not available (likely Expo Go)');
    }
  }

  private async syncSubscriptionStatus(): Promise<void> {
    if (!this.purchasesSDK) return;
    
    try {
      const customerInfo = await this.purchasesSDK.getCustomerInfo();
      const activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      
      if (activeEntitlement) {
        const expirationDate = activeEntitlement.expirationDate 
          ? new Date(activeEntitlement.expirationDate).getTime()
          : undefined;
        
        this.status = {
          tier: 'pro',
          isActive: true,
          expiresAt: expirationDate,
          paymentMethod: 'iap',
          productId: activeEntitlement.productIdentifier,
        };
        await this.saveStatus();
        this.notifyListeners();
        console.log('[Subscription] Synced Pro status, product:', activeEntitlement.productIdentifier);
      }
    } catch (error) {
      console.error('[Subscription] Failed to sync status:', error);
    }
  }

  private async loadStatus(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (stored) {
        this.status = JSON.parse(stored);
        
        if (this.status.expiresAt && Date.now() > this.status.expiresAt) {
          this.status = { tier: 'free', isActive: false };
          await this.saveStatus();
        }
      }
    } catch (error) {
      console.error('[Subscription] Failed to load status:', error);
    }
  }

  private async saveStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(this.status));
    } catch (error) {
      console.error('[Subscription] Failed to save status:', error);
    }
  }

  async getOfferings(): Promise<any> {
    if (!this.purchasesSDK) return null;
    
    try {
      const offerings = await this.purchasesSDK.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('[Subscription] Failed to get offerings:', error);
      return null;
    }
  }

  async purchaseProduct(productId: 'monthly' | 'yearly' | 'lifetime'): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Please use the mobile app to subscribe' };
    }

    if (!this.purchasesSDK) {
      return { success: false, error: 'Subscription service not available' };
    }

    try {
      const offerings = await this.purchasesSDK.getOfferings();
      const targetProduct = PRODUCTS[productId];
      const pkg = offerings.current?.availablePackages.find(
        (p: any) => p.product.identifier === targetProduct.id
      );

      if (!pkg) {
        return { success: false, error: `${productId} subscription not found` };
      }

      const { customerInfo } = await this.purchasesSDK.purchasePackage(pkg);
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
        const expirationDate = entitlement.expirationDate 
          ? new Date(entitlement.expirationDate).getTime()
          : undefined;
        
        this.status = {
          tier: 'pro',
          isActive: true,
          expiresAt: expirationDate,
          paymentMethod: 'iap',
          productId: targetProduct.id,
        };
        await this.saveStatus();
        this.notifyListeners();
        console.log('[Subscription] Purchased:', productId);
        return { success: true };
      }

      return { success: false, error: 'Purchase not confirmed' };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, error: 'Purchase cancelled' };
      }
      console.error('[Subscription] Purchase failed:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async purchasePro(): Promise<{ success: boolean; error?: string }> {
    return this.purchaseProduct('monthly');
  }

  async restorePurchases(): Promise<{ success: boolean; restored: boolean; error?: string }> {
    if (!this.purchasesSDK) {
      return { success: false, restored: false, error: 'Subscription service not available' };
    }

    try {
      const customerInfo = await this.purchasesSDK.restorePurchases();
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
        const expirationDate = entitlement.expirationDate 
          ? new Date(entitlement.expirationDate).getTime()
          : undefined;
        
        this.status = {
          tier: 'pro',
          isActive: true,
          expiresAt: expirationDate,
          paymentMethod: 'iap',
          productId: entitlement.productIdentifier,
        };
        await this.saveStatus();
        this.notifyListeners();
        console.log('[Subscription] Restored purchase:', entitlement.productIdentifier);
        return { success: true, restored: true };
      }

      return { success: true, restored: false };
    } catch (error: any) {
      console.error('[Subscription] Restore failed:', error);
      return { success: false, restored: false, error: error.message };
    }
  }

  getProducts(): typeof PRODUCTS {
    return PRODUCTS;
  }

  async activateLightningPayment(transactionId: string, durationDays: number = 30): Promise<void> {
    this.status = {
      tier: 'pro',
      isActive: true,
      expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000,
      paymentMethod: 'lightning',
      originalTransactionId: transactionId,
    };
    await this.saveStatus();
    this.notifyListeners();
    console.log('[Subscription] Lightning payment activated');
  }

  getStatus(): SubscriptionStatus {
    return { ...this.status };
  }

  isPro(): boolean {
    return this.status.tier === 'pro' && this.status.isActive;
  }

  getFeatures(): ProFeatures {
    return this.isPro() ? PRO_FEATURES : FREE_FEATURES;
  }

  hasFeature(feature: keyof ProFeatures): boolean {
    return this.getFeatures()[feature];
  }

  requirePro(feature?: keyof ProFeatures): { allowed: boolean; reason?: string } {
    if (this.isPro()) {
      return { allowed: true };
    }
    
    const featureName = feature ? this.getFeatureDisplayName(feature) : 'This feature';
    return { 
      allowed: false, 
      reason: `${featureName} requires MeshBet Pro. Upgrade for $6.99/month.`
    };
  }

  private getFeatureDisplayName(feature: keyof ProFeatures): string {
    const names: Record<keyof ProFeatures, string> = {
      hdPriority: 'HD Priority Streaming',
      advancedStats: 'Advanced Stats',
      customRooms: 'Custom Rooms',
      priorityRelays: 'Priority Relays',
      exclusiveProps: 'Exclusive Props',
      venueMode: 'Venue Mode',
    };
    return names[feature] || feature;
  }

  getProPrice(): typeof PRO_PRICE {
    return PRO_PRICE;
  }

  getProBenefits(): { title: string; description: string; icon: string }[] {
    return [
      { 
        title: 'HD Priority Streaming', 
        description: 'First access to HD streams on mesh network',
        icon: 'videocam'
      },
      { 
        title: 'Advanced Stats', 
        description: 'Detailed betting analytics and insights',
        icon: 'stats-chart'
      },
      { 
        title: 'Custom Rooms', 
        description: 'Create branded betting rooms for your crew',
        icon: 'people'
      },
      { 
        title: 'Priority Relays', 
        description: 'Faster message delivery on mesh network',
        icon: 'flash'
      },
      { 
        title: 'Exclusive Props', 
        description: 'Access to special proposition bets',
        icon: 'trophy'
      },
      { 
        title: 'Venue Mode', 
        description: 'Host official betting events at bars',
        icon: 'storefront'
      },
    ];
  }

  onStatusChange(callback: (status: SubscriptionStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.status));
  }
}

export const subscriptionService = new SubscriptionService();
