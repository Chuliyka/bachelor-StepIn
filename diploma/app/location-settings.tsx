import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '@/constants/api';
import type { LocationAccuracyOption } from '@/constants/locationPrivacy';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getSession } from '@/utils/session';

type VisibilityOption = 'all' | 'friends' | 'custom';
type AccuracyOption = LocationAccuracyOption;

const PURPLE = '#9D8DF1';
const NAVY = '#19395A';
const BODY = '#25496E';
const MUTED = '#6A8298';
const ROW_TITLE = '#173753';
const BORDER = '#E4E9F0';

export default function LocationSettingsScreen() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<VisibilityOption>('all');
  const [accuracy, setAccuracy] = useState<AccuracyOption>('approximate');
  const [shareOnMap, setShareOnMap] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingAccuracy, setSavingAccuracy] = useState(false);

  useEffect(() => {
    getSession()
      .then((stored) => setSessionKey(stored))
      .catch(() => setSessionKey(null));
  }, []);

  useEffect(() => {
    if (!sessionKey) {
      setLoadingSettings(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoadingSettings(true);
      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/users/by-phone?phoneNumber=${encodeURIComponent(sessionKey)}`,
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            typeof (data as { message?: string }).message === 'string'
              ? (data as { message: string }).message
              : 'Не вдалося завантажити налаштування',
          );
        }

        const nextAccuracy = (data as { locationAccuracy?: string }).locationAccuracy;
        if (!cancelled && (nextAccuracy === 'precise' || nextAccuracy === 'approximate')) {
          setAccuracy(nextAccuracy);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Не вдалося завантажити налаштування';
          Alert.alert('Помилка', message);
        }
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  const saveAccuracy = useCallback(
    async (next: AccuracyOption) => {
      if (!sessionKey || savingAccuracy) return;

      const previous = accuracy;
      setAccuracy(next);
      setSavingAccuracy(true);

      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/users/by-phone?phoneNumber=${encodeURIComponent(sessionKey)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationAccuracy: next }),
          },
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            typeof (data as { message?: string }).message === 'string'
              ? (data as { message: string }).message
              : 'Не вдалося зберегти налаштування',
          );
        }
      } catch (e: unknown) {
        setAccuracy(previous);
        const message = e instanceof Error ? e.message : 'Не вдалося зберегти налаштування';
        Alert.alert('Помилка', message);
      } finally {
        setSavingAccuracy(false);
      }
    },
    [accuracy, savingAccuracy, sessionKey],
  );

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
          <Text style={styles.headerTitle} numberOfLines={2}>
            Налаштування місцезнаходження
          </Text>
        </View>
        <Text style={styles.pageSubtitle}>Керуйте тим, хто може бачити вашу локацію</Text>
 

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хто може бачити вас</Text>
          <Text style={styles.sectionHint}>Оберіть хто може бачити вашу локацію</Text>

          <VisibilityRow
            selected={visibility === 'all'}
            onPress={() => setVisibility('all')}
            icon={<MaterialCommunityIcons name="account-group-outline" size={22} color={PURPLE} />}
            title="Усі користувачі"
            subtitle="Усі можуть бачити вашу локацію"
          />
          <RowDivider />
          <VisibilityRow
            selected={visibility === 'friends'}
            onPress={() => setVisibility('friends')}
            icon={<MaterialCommunityIcons name="account-multiple-outline" size={22} color={PURPLE} />}
            title="Ваші друзі"
            subtitle="Лише ваші друзі можуть бачити вашу локацію"
          />
          <RowDivider />
          <VisibilityRow
            selected={visibility === 'custom'}
            onPress={() => setVisibility('custom')}
            icon={<Ionicons name="settings-outline" size={22} color={PURPLE} />}
            title="Власний список"
            subtitle="Оберіть конкретних користувачів"
          />
          <RowDivider />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Точність локації</Text>
          <Text style={styles.sectionHint}>
            При «Приблизній» інші бачать позицію з планарним шумом Лапласа (кругове розмиття).
          </Text>

          {loadingSettings ? (
            <ActivityIndicator style={styles.accuracyLoader} color={PURPLE} />
          ) : (
            <>
              <VisibilityRow
                selected={accuracy === 'precise'}
                onPress={() => void saveAccuracy('precise')}
                icon={<Ionicons name="location-outline" size={22} color={PURPLE} />}
                title="Точна"
                subtitle="Інші користувачі бачать тебе з точністю до кількох метрів"
              />
              <RowDivider />
              <VisibilityRow
                selected={accuracy === 'approximate'}
                onPress={() => void saveAccuracy('approximate')}
                icon={<Ionicons name="globe-outline" size={22} color={PURPLE} />}
                title="Приблизна"
                subtitle="Планарний механізм Лапласа — приблизна позиція на мапі"
              />
              <RowDivider />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поширення локації</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Усі можуть бачити вашу локацію на мапі</Text>
            <Switch
              value={shareOnMap}
              onValueChange={setShareOnMap}
              trackColor={{ false: '#E0E0E0', true: '#D4C4F5' }}
              thumbColor={shareOnMap ? PURPLE : '#F4F4F4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconCircle({ children }: { children: ReactNode }) {
  return <View style={styles.iconCircle}>{children}</View>;
}

function VisibilityRow({
  selected,
  onPress,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity style={styles.choiceRow} activeOpacity={0.65} onPress={onPress}>
      <IconCircle>{icon}</IconCircle>
      <View style={styles.choiceTextWrap}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSubtitle}>{subtitle}</Text>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={26} color={PURPLE} /> : <View style={styles.checkPlaceholder} />}
    </TouchableOpacity>
  );
}

function RowDivider() {
  return <View style={styles.divider} />;
}

const ICON_COL = 48;

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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  backBtn: {
    marginLeft: -8,
    padding: 8,
    marginRight: 4,
    marginTop: 2,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    fontFamily: 'Space Grotesk',
    fontSize: 24,
    fontWeight: '700',
    color: NAVY,
    lineHeight: 30,
  },
  pageSubtitle: {
    marginTop: 10,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: BODY,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    marginBottom: 6,
  },
  sectionHint: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    marginBottom: 12,
  },
  iconCircle: {
    width: ICON_COL,
    height: ICON_COL,
    borderRadius: ICON_COL / 2,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFC',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  choiceTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  choiceTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  choiceSubtitle: {
    marginTop: 4,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  checkPlaceholder: {
    width: 26,
    height: 26,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  switchLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: ROW_TITLE,
  },
  accuracyLoader: {
    marginVertical: 20,
  },
});
