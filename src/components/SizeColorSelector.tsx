import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ColorOption {
  id: string;
  name: string;
  code: string;
}

interface SizeColorSelectorProps {
  colors?: ColorOption[];
  selectedColor?: string;
  onSelectColor?: (colorId: string) => void;
  sizes?: string[];
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

const DEFAULT_COLORS: ColorOption[] = [
  { id: 'black', name: 'Hitam', code: '#0F172A' },
  { id: 'white', name: 'Putih', code: '#F8FAFC' },
  { id: 'navy', name: 'Navy', code: '#1E3A8A' },
  { id: 'coral', name: 'Coral', code: '#FF6B6B' },
  { id: 'beige', name: 'Beige', code: '#D4B996' },
];

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', '40', '41', '42', '43'];

export const SizeColorSelector: React.FC<SizeColorSelectorProps> = ({
  colors = DEFAULT_COLORS,
  selectedColor = 'black',
  onSelectColor,
  sizes = DEFAULT_SIZES,
  selectedSize = 'M',
  onSelectSize,
}) => {
  return (
    <View style={styles.container}>
      {/* Color Swatches */}
      {colors && colors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Warna</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
            {colors.map((item) => {
              const isSelected = item.id === selectedColor;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: item.code },
                    item.code === '#F8FAFC' && { borderWidth: 1, borderColor: '#CBD5E1' },
                    isSelected && styles.colorCircleSelected,
                  ]}
                  onPress={() => onSelectColor && onSelectColor(item.id)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={item.code === '#F8FAFC' ? '#0F172A' : '#FFFFFF'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Size Chips */}
      {sizes && sizes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Ukuran</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeRow}>
            {sizes.map((s) => {
              const isSelected = s === selectedSize;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeChip, isSelected && styles.sizeChipSelected]}
                  onPress={() => onSelectSize && onSelectSize(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 16,
  },
  section: {},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  colorRow: {
    gap: 12,
    alignItems: 'center',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  sizeRow: {
    gap: 8,
  },
  sizeChip: {
    minWidth: 44,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sizeChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
});
