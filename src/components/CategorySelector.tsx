import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId || cat.slug === selectedCategoryId;
          const catKey = cat.slug || cat.id;
          return (
            <TouchableOpacity
              key={cat.id || cat.slug}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelectCategory(catKey)}
              activeOpacity={0.8}
            >
              {cat.icon ? <Text style={styles.icon}>{cat.icon}</Text> : null}
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
