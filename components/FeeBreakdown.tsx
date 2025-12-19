import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { FeeBreakdown as FeeBreakdownType } from '../lib/services/fees';

interface Props {
  breakdown: FeeBreakdownType;
  currency?: string;
  showDetails?: boolean;
}

export function FeeBreakdownComponent({ breakdown, currency = 'SAT', showDetails = true }: Props) {
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fee Breakdown</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{breakdown.platformFeePercent}% fee</Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Pot</Text>
        <Text style={styles.value}>{breakdown.totalPot.toLocaleString()} {currency}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Platform Fee</Text>
        <Text style={styles.feeValue}>-{breakdown.platformFee.toFixed(2)} {currency}</Text>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>→ Treasury (60%)</Text>
            <Text style={styles.detailValue}>{breakdown.treasuryShare.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>→ Relay Tips (15%)</Text>
            <Text style={styles.detailValue}>{breakdown.relayTips.toFixed(2)}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.payoutLabel}>Winner Payout</Text>
        <Text style={styles.payoutValue}>{breakdown.winnerPayout.toFixed(2)} {currency}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#00ffff',
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  feeValue: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '500',
  },
  detailsContainer: {
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
  detailValue: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  payoutLabel: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
  },
  payoutValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
  },
});
