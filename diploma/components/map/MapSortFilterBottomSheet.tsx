import { AppColors } from '@/constants/app-colors';
import {
  getMapSortGridRowCategories,
  MAP_SORT_GRID_ROWS,
  type InterestCategory,
  type MapSortFilterKey,
} from '@/constants/interests';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

const TAB_BAR_CLEARANCE = 42;
const SHEET_BOTTOM_PADDING = 0;
const CARD_ROW_HEIGHT = 108;
const GRID_ROW_GAP = 10;

export type { MapSortFilterKey };

export type MapSortFilterBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  bottomInset: number;
  selectedKey: MapSortFilterKey;
  onSelectKey: (key: MapSortFilterKey) => void;
};

type SortFilterCardProps = {
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

function SortFilterCard({
  selected,
  onPress,
  accessibilityLabel,
  style,
  children,
}: SortFilterCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}

function InterestCategoryCard({
  category,
  selected,
  onPress,
}: {
  category: InterestCategory;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <SortFilterCard
      selected={selected}
      onPress={onPress}
      accessibilityLabel={category.name}
    >
      <Text style={styles.emoji}>{category.emoji}</Text>
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{category.label}</Text>
    </SortFilterCard>
  );
}

function GridRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.gridRow, style]}>{children}</View>;
}

export function MapSortFilterBottomSheet({
  visible,
  onClose,
  bottomInset,
  selectedKey,
  onSelectKey,
}: MapSortFilterBottomSheetProps) {
  const padBottom = bottomInset + TAB_BAR_CLEARANCE + SHEET_BOTTOM_PADDING;
  const firstRowCategories = getMapSortGridRowCategories(MAP_SORT_GRID_ROWS[0]);
  const allSelected = selectedKey === 'all';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />

        <View style={[styles.sheet, { paddingBottom: padBottom }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>
              Сортування за статусами/{'\n'}інтересами
            </Text>
          </View>

          <GridRow>
            <SortFilterCard
              selected={allSelected}
              onPress={() => onSelectKey('all')}
              accessibilityLabel="Усі"
            >
              <Text style={[styles.allLabel, allSelected && styles.allLabelSelected]}>Усі</Text>
            </SortFilterCard>

            {firstRowCategories.map((category) => (
              <InterestCategoryCard
                key={category.key}
                category={category}
                selected={selectedKey === category.key}
                onPress={() => onSelectKey(category.key)}
              />
            ))}
          </GridRow>

          {MAP_SORT_GRID_ROWS.slice(1).map((rowKeys, rowIndex) => {
            const categories = getMapSortGridRowCategories(rowKeys);

            return (
              <GridRow key={`sort-row-${rowIndex}`} style={styles.gridRowSpacing}>
                {categories.map((category) => (
                  <InterestCategoryCard
                    key={category.key}
                    category={category}
                    selected={selectedKey === category.key}
                    onPress={() => onSelectKey(category.key)}
                  />
                ))}
                {categories.length < 3
                  ? Array.from({ length: 3 - categories.length }).map((_, spacerIndex) => (
                      <View key={`spacer-${rowIndex}-${spacerIndex}`} style={styles.gridSpacer} />
                    ))
                  : null}
              </GridRow>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  handle: {
    width: 64,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E4E9F0',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Space Grotesk',
    fontSize: 17,
    fontWeight: '700',
    color: '#19395A',
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_ROW_GAP,
    alignItems: 'stretch',
  },
  gridRowSpacing: {
    marginTop: GRID_ROW_GAP,
  },
  gridSpacer: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    flex: 1,
    minHeight: CARD_ROW_HEIGHT,
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: '#FAFBFF',
  },
  cardIdle: {
    borderColor: '#E4E9F0',
  },
  cardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: '#FFFFFF',
  },
  cardPressed: {
    opacity: 0.92,
  },
  allLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#25496E',
    textAlign: 'center',
  },
  allLabelSelected: {
    color: AppColors.primary,
  },
  emoji: {
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
  },
  cardLabel: {
    marginTop: 10,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#25496E',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardLabelSelected: {
    color: AppColors.primary,
  },
});
