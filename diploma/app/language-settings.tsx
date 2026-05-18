import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#9D8DF1';
const NAVY = '#19395A';
const ROW_TITLE = '#173753';
const BORDER = '#E4E9F0';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

export default function LanguageSettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('uk');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={NAVY} />
          </Pressable>
          <Text style={styles.headerTitle}>Оберіть мову</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.listDivider} />

          {LANGUAGES.map((language, index) => {
            const isSelected = selectedLanguage === language.code;

            return (
              <View key={language.code}>
                <TouchableOpacity
                  style={styles.languageRow}
                  activeOpacity={0.65}
                  onPress={() => setSelectedLanguage(language.code)}
                >
                  <Text style={styles.languageLabel}>{language.label}</Text>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={26} color={PURPLE} />
                  ) : (
                    <View style={styles.checkPlaceholder} />
                  )}
                </TouchableOpacity>
                {index < LANGUAGES.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            );
          })}

          <View style={styles.listDivider} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  backBtn: {
    marginLeft: -8,
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Space Grotesk',
    fontSize: 28,
    fontWeight: '700',
    color: NAVY,
    lineHeight: 34,
  },
  list: {
    marginTop: 4,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  languageLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    color: ROW_TITLE,
  },
  checkPlaceholder: {
    width: 26,
    height: 26,
  },
});
