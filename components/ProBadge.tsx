import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

export function ProBadge({ size = 'small' }: Props) {
  const sizeStyles = {
    small: { padding: 4, fontSize: 9, iconSize: 10 },
    medium: { padding: 6, fontSize: 11, iconSize: 14 },
    large: { padding: 8, fontSize: 13, iconSize: 18 },
  };
  
  const s = sizeStyles[size];
  
  return (
    <View style={[styles.badge, { paddingHorizontal: s.padding * 1.5, paddingVertical: s.padding }]}>
      <Ionicons name="diamond" size={s.iconSize} color={Colors.yellow} />
      <Text style={[styles.text, { fontSize: s.fontSize }]}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.yellow}20`,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.yellow}40`,
  },
  text: {
    color: Colors.yellow,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
