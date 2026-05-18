import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#9D8DF1';
const PURPLE_LIGHT = '#D4C4F5';
const NAVY = '#19395A';
const BODY = '#25496E';
const MUTED = '#6A8298';
const ROW_TITLE = '#173753';
const BORDER = '#E4E9F0';
const CHIP_BG = '#9D8DF1';
const INPUT_BG = '#F3F5F8';

const AI_INTEREST_CHIPS = ['Пілатес', 'Коворкінг', 'Подорожі'] as const;

const RADIUS_MIN_KM = 0.5;
const RADIUS_MAX_KM = 5;
const RADIUS_DEFAULT_KM = 2.5;

type TimePickerTarget = 'quietFrom' | 'quietTo' | null;

function parseTimeString(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatRadiusKm(km: number) {
  if (km <= RADIUS_MIN_KM) return '500 м';
  if (km >= RADIUS_MAX_KM) return '5 км';
  const text = km.toFixed(1).replace('.', ',');
  return `${text} км`;
}

export default function NotificationSettingsScreen() {
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietFrom, setQuietFrom] = useState('22:00');
  const [quietTo, setQuietTo] = useState('08:00');
  const [radiusKm, setRadiusKm] = useState(RADIUS_DEFAULT_KM);
  const [friendsNearbyEnabled, setFriendsNearbyEnabled] = useState(true);
  const [newRequestsEnabled, setNewRequestsEnabled] = useState(true);
  const [messagesEnabled, setMessagesEnabled] = useState(true);
  const [timePickerTarget, setTimePickerTarget] = useState<TimePickerTarget>(null);
  const [draftTime, setDraftTime] = useState(new Date());

  const radiusLabel = useMemo(() => formatRadiusKm(radiusKm), [radiusKm]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  const openTimePicker = (target: Exclude<TimePickerTarget, null>) => {
    const current = target === 'quietFrom' ? quietFrom : quietTo;
    setDraftTime(parseTimeString(current));
    setTimePickerTarget(target);
  };

  const closeTimePicker = () => {
    setTimePickerTarget(null);
  };

  const applyDraftTime = () => {
    if (!timePickerTarget) return;
    const formatted = formatTime(draftTime);
    if (timePickerTarget === 'quietFrom') setQuietFrom(formatted);
    else setQuietTo(formatted);
    closeTimePicker();
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      closeTimePicker();
      return;
    }
    if (!selectedDate) return;
    setDraftTime(selectedDate);
    if (Platform.OS === 'android') {
      const formatted = formatTime(selectedDate);
      if (timePickerTarget === 'quietFrom') setQuietFrom(formatted);
      if (timePickerTarget === 'quietTo') setQuietTo(formatted);
      closeTimePicker();
    }
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
            Налаштування сповіщення
          </Text>
        </View>
        <Text style={styles.pageSubtitle}>Налаштуйте сповіщення відповідно до ваших потреб</Text>

        <SectionDivider />

        <View style={styles.section}>
          <ToggleHeaderRow
            icon={<Ionicons name="sparkles-outline" size={22} color={PURPLE} />}
            title="Пропозиції від ШІ"
            subtitle="Персоналізовані збіги за інтересами поруч"
            value={aiSuggestionsEnabled}
            onValueChange={setAiSuggestionsEnabled}
          />
          <View style={styles.sectionBodyLeft}>
            <View style={styles.chipsRowLeft}>
              {AI_INTEREST_CHIPS.map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.sectionDescriptionLeft}>
            Отримуйте персоналізовані сповіщення про ідеальні збіги за інтересами поблизу.
          </Text>
        </View>

        <SectionDivider />

        <View style={styles.section}>
          <ToggleHeaderRow
            icon={<Ionicons name="moon-outline" size={22} color={PURPLE} />}
            title="Тихі години"
            subtitle="Режим «Не турбувати»"
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
          />

          <View style={styles.timeRowFull}>
            <TimeField label="З" value={quietFrom} onPress={() => openTimePicker('quietFrom')} style={styles.timeFieldFlex} />
            <View style={styles.timeConnector} />
            <TimeField label="По" value={quietTo} onPress={() => openTimePicker('quietTo')} style={styles.timeFieldFlex} />
          </View>

          <Text style={styles.sectionDescriptionLeft}>
            Ви й надалі будете видимі на мапі. Push-сповіщення будуть вимкнені, але ваша геолокація
            залишатиметься активною.
          </Text>
        </View>

        <SectionDivider />

        <View style={styles.section}>
          <Text style={styles.blockTitle}>Радіус сповіщень</Text>
          <Text style={styles.blockHint}>Зона сповіщень за георадіусом</Text>

          <Slider
            style={styles.radiusSlider}
            value={radiusKm}
            minimumValue={RADIUS_MIN_KM}
            maximumValue={RADIUS_MAX_KM}
            step={0.1}
            minimumTrackTintColor={PURPLE}
            maximumTrackTintColor="#E8E8ED"
            thumbTintColor={PURPLE}
            onValueChange={setRadiusKm}
          />
          <View style={styles.radiusLabels}>
            <Text style={styles.radiusLabel}>500 м</Text>
            <Text style={[styles.radiusLabel, styles.radiusLabelActive]}>{radiusLabel}</Text>
            <Text style={styles.radiusLabel}>5 км</Text>
          </View>
        </View>

        <SectionDivider />

        <View style={styles.section}>
          <Text style={styles.blockTitle}>Категорії сповіщень</Text>
          <Text style={styles.blockHint}>Оберіть, про що ви хочете отримувати сповіщення</Text>

          <CategoryToggleRow
            icon={<MaterialCommunityIcons name="account-group-outline" size={22} color={PURPLE} />}
            title="Друзі поруч"
            subtitle="Сповіщення, коли друзі з'являються у вашому радіусі"
            value={friendsNearbyEnabled}
            onValueChange={setFriendsNearbyEnabled}
          />
          <CategoryToggleRow
            icon={<MaterialCommunityIcons name="account-plus-outline" size={22} color={PURPLE} />}
            title="Нові запити"
            subtitle="Запрошення в друзі та запити на зустріч"
            value={newRequestsEnabled}
            onValueChange={setNewRequestsEnabled}
          />
          <CategoryToggleRow
            icon={<Ionicons name="chatbubble-outline" size={22} color={PURPLE} />}
            title="Повідомлення"
            subtitle="Особисті повідомлення та сповіщення чату"
            value={messagesEnabled}
            onValueChange={setMessagesEnabled}
          />
        </View>
      </ScrollView>

      {timePickerTarget && Platform.OS === 'ios' ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeTimePicker}>
          <Pressable style={styles.modalBackdrop} onPress={closeTimePicker}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalTitle}>
                {timePickerTarget === 'quietFrom' ? 'Час початку' : 'Час закінчення'}
              </Text>
              <DateTimePicker
                value={draftTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="light"
                textColor={NAVY}
              />
              <TouchableOpacity style={styles.modalDoneButton} activeOpacity={0.85} onPress={applyDraftTime}>
                <Text style={styles.modalDoneText}>Готово</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {timePickerTarget && Platform.OS === 'android' ? (
        <DateTimePicker value={draftTime} mode="time" display="default" onChange={handleTimeChange} />
      ) : null}
    </SafeAreaView>
  );
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

function IconCircle({ children }: { children: ReactNode }) {
  return <View style={styles.iconCircle}>{children}</View>;
}

function AppSwitch({ value, onValueChange }: { value: boolean; onValueChange: (next: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E0E0E0', true: PURPLE_LIGHT }}
      thumbColor={value ? PURPLE : '#F4F4F4'}
      ios_backgroundColor="#E0E0E0"
    />
  );
}

function ToggleHeaderRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleHeaderRow}>
      <IconCircle>{icon}</IconCircle>
      <View style={styles.toggleHeaderText}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <AppSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function CategoryToggleRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.categoryRow}>
      <IconCircle>{icon}</IconCircle>
      <View style={styles.categoryText}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <AppSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function TimeField({
  label,
  value,
  onPress,
  style,
}: {
  label: string;
  value: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.timeField, style]} activeOpacity={0.75} onPress={onPress}>
      <Text style={styles.timeFieldLabel}>{label}</Text>
      <View style={styles.timeFieldValueRow}>
        <Text style={styles.timeFieldValue}>{value}</Text>
        <Ionicons name="time-outline" size={18} color={MUTED} />
      </View>
    </TouchableOpacity>
  );
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
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginTop: 24,
    marginBottom: 24,
  },
  section: {
    gap: 14,
  },
  toggleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  toggleHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  toggleTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  toggleSubtitle: {
    marginTop: 4,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  sectionBodyLeft: {
    width: '100%',
    alignItems: 'flex-start',
  },
  chipsRowLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    backgroundColor: CHIP_BG,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sectionDescriptionLeft: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'left',
  },
  timeRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    gap: 10,
  },
  timeField: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeFieldFlex: {
    flex: 1,
    minWidth: 0,
  },
  timeFieldLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: MUTED,
    marginBottom: 6,
  },
  timeFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeFieldValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  timeConnector: {
    width: 18,
    height: 2,
    backgroundColor: BORDER,
    marginTop: 18,
  },
  blockTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  blockHint: {
    marginTop: 6,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  radiusLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: MUTED,
  },
  radiusLabelActive: {
    color: PURPLE,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  categoryText: {
    flex: 1,
    minWidth: 0,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDoneButton: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: PURPLE,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  modalDoneText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
