import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { subscriptionService } from '@/lib/services/subscription';

interface Props {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

type ProductType = 'monthly' | 'yearly' | 'lifetime';

export function UpgradeModal({ visible, onClose, feature }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('yearly');
  
  const benefits = subscriptionService.getProBenefits();
  const products = subscriptionService.getProducts();
  
  const handleUpgrade = async () => {
    if (Platform.OS === 'web') {
      setError('Please download the mobile app to subscribe');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await subscriptionService.purchaseProduct(selectedProduct);
    
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else if (result.error) {
      setError(result.error);
    }
  };
  
  const handleRestore = async () => {
    setLoading(true);
    setError(null);
    
    const result = await subscriptionService.restorePurchases();
    
    setLoading(false);
    
    if (result.restored) {
      onClose();
    } else if (!result.success) {
      setError(result.error || 'Failed to restore');
    } else {
      setError('No previous purchases found');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.mutedForeground} />
          </Pressable>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.proBadge}>
                <Ionicons name="diamond" size={24} color={Colors.yellow} />
              </View>
              <Text style={styles.title}>Upgrade to Pro</Text>
              <Text style={styles.subtitle}>
                {feature 
                  ? `${feature} is a Pro feature. Unlock it and more!`
                  : 'Unlock the full MeshBet experience'}
              </Text>
            </View>
            
            <View style={styles.productSelector}>
              {(['yearly', 'monthly', 'lifetime'] as ProductType[]).map((type) => {
                const product = products[type];
                const isSelected = selectedProduct === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedProduct(type)}
                    style={[
                      styles.productOption,
                      isSelected && styles.productOptionSelected,
                    ]}
                  >
                    {type === 'yearly' && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>BEST VALUE</Text>
                      </View>
                    )}
                    <View style={styles.radioOuter}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, isSelected && styles.productNameSelected]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <Text style={styles.productPrice}>{product.displayPrice}</Text>
                    </View>
                    {type === 'lifetime' && (
                      <Text style={styles.lifetimeNote}>One-time</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            
            <View style={styles.benefits}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Ionicons 
                      name={benefit.icon as any} 
                      size={20} 
                      color={Colors.primary} 
                    />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDesc}>{benefit.description}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Pressable 
              onPress={handleUpgrade}
              disabled={loading}
              style={[styles.upgradeButton, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Ionicons name="diamond" size={20} color={Colors.background} />
                  <Text style={styles.upgradeButtonText}>
                    {Platform.OS === 'web' ? 'Get App to Subscribe' : 'Upgrade Now'}
                  </Text>
                </>
              )}
            </Pressable>
            
            {Platform.OS !== 'web' && (
              <Pressable onPress={handleRestore} disabled={loading} style={styles.restoreButton}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  proBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.yellow}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  productSelector: {
    gap: 12,
    marginBottom: 24,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  productOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.mutedForeground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
  },
  productNameSelected: {
    color: Colors.primary,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  lifetimeNote: {
    fontSize: 12,
    color: Colors.yellow,
    fontWeight: '600',
  },
  benefits: {
    gap: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: Colors.mutedForeground,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: `${Colors.red}20`,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.yellow,
    padding: 16,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  restoreButton: {
    alignItems: 'center',
    padding: 12,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
});
