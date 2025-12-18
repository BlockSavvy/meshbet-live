import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { walletService, WalletInfo } from "@/lib/services/wallet";
import { bettingService } from "@/lib/services/betting";

interface Transaction {
  id: string;
  type: 'win' | 'loss' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  description: string;
  timestamp: number;
}

export default function WalletScreen() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [stats, setStats] = useState({ totalBets: 0, wins: 0, losses: 0, winRate: 0, totalWon: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const loadData = useCallback(async () => {
    const walletData = await walletService.loadExistingWallet();
    setWallet(walletData);

    await bettingService.initialize();
    const bettingStats = bettingService.getStats();
    setStats(bettingStats);

    const settledBets = bettingService.getMyBets().filter(b => b.status === 'settled');
    const txs: Transaction[] = settledBets.map(bet => ({
      id: bet.id,
      type: bet.outcome === 'win' ? 'win' : 'loss',
      amount: bet.outcome === 'win' ? bet.amount * (bet.odds - 1) : bet.amount,
      currency: bet.currency,
      description: bet.eventName,
      timestamp: bet.settledAt || bet.createdAt,
    }));
    setTransactions(txs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
  }, []);

  useEffect(() => {
    loadData();

    const unsub = bettingService.onBetUpdate(() => {
      const bettingStats = bettingService.getStats();
      setStats(bettingStats);
    });

    return () => unsub();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCopyAddress = () => {
    if (wallet?.address) {
      Alert.alert("Copied", "Wallet address copied to clipboard");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'SAT') return `${Math.round(amount)} sats`;
    if (currency === 'ETH') return `${amount.toFixed(4)} ETH`;
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="WALLET" />

      <ScrollView 
        className="flex-1 px-4 pt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View
          className="rounded-2xl p-5 overflow-hidden"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: Colors.mutedForeground }}
              >
                Betting Stats
              </Text>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-3xl font-bold font-mono text-white">
                  {stats.totalBets}
                </Text>
                <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                  bets
                </Text>
              </View>
              {stats.winRate > 0 && (
                <Text className="text-xs font-mono mt-1" style={{ color: Colors.green }}>
                  {stats.winRate.toFixed(1)}% win rate
                </Text>
              )}
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Ionicons name="wallet" size={20} color={Colors.foreground} />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: `${Colors.green}15` }}>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Wins</Text>
              <Text className="text-xl font-bold" style={{ color: Colors.green }}>{stats.wins}</Text>
            </View>
            <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Losses</Text>
              <Text className="text-xl font-bold" style={{ color: '#ef4444' }}>{stats.losses}</Text>
            </View>
          </View>

          {wallet && (
            <Pressable 
              onPress={() => setShowAddress(!showAddress)}
              className="p-3 rounded-xl mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                  Wallet Address
                </Text>
                <Ionicons 
                  name={showAddress ? "eye-off" : "eye"} 
                  size={16} 
                  color={Colors.mutedForeground} 
                />
              </View>
              <Pressable onPress={handleCopyAddress}>
                <Text className="font-mono text-sm mt-1" style={{ color: Colors.primary }}>
                  {showAddress 
                    ? wallet.address 
                    : `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}`}
                </Text>
              </Pressable>
              {!wallet.hasBackup && (
                <View className="flex-row items-center mt-2 gap-1">
                  <Ionicons name="warning" size={12} color={Colors.yellow} />
                  <Text className="text-xs" style={{ color: Colors.yellow }}>
                    Backup not confirmed
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2"
              style={{ backgroundColor: Colors.primary }}
            >
              <Ionicons name="flash" size={18} color={Colors.primaryForeground} />
              <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                Deposit
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2"
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Ionicons name="arrow-up" size={18} color={Colors.foreground} />
              <Text className="font-bold text-white">Withdraw</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <Text
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: Colors.mutedForeground }}
          >
            Recent Activity
          </Text>

          {transactions.length === 0 ? (
            <View 
              className="p-6 rounded-xl items-center"
              style={{ backgroundColor: Colors.card }}
            >
              <Ionicons name="receipt-outline" size={32} color={Colors.mutedForeground} />
              <Text className="text-sm mt-2" style={{ color: Colors.mutedForeground }}>
                No transactions yet
              </Text>
              <Text className="text-xs mt-1 text-center" style={{ color: Colors.mutedForeground }}>
                Place your first bet to see activity here
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                className="flex-row justify-between items-center py-3"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        tx.type === "win"
                          ? `${Colors.green}20`
                          : tx.type === "loss"
                          ? "rgba(239,68,68,0.2)"
                          : `${Colors.primary}20`,
                    }}
                  >
                    <Ionicons
                      name={
                        tx.type === "win"
                          ? "trending-up"
                          : tx.type === "loss"
                          ? "trending-down"
                          : tx.type === "deposit"
                          ? "arrow-down"
                          : "arrow-up"
                      }
                      size={16}
                      color={
                        tx.type === "win"
                          ? Colors.green
                          : tx.type === "loss"
                          ? "#ef4444"
                          : Colors.primary
                      }
                    />
                  </View>
                  <View>
                    <Text className="text-sm text-white" numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                      {formatDate(tx.timestamp)}
                    </Text>
                  </View>
                </View>
                <Text
                  className="font-mono font-bold"
                  style={{
                    color:
                      tx.type === "loss"
                        ? "#ef4444"
                        : tx.type === "win"
                        ? Colors.green
                        : Colors.primary,
                  }}
                >
                  {tx.type === "loss" ? "-" : "+"}{formatCurrency(tx.amount, tx.currency)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
