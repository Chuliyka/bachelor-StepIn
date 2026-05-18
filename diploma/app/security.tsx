import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#9D8DF1';
const PURPLE_LIGHT = '#D4C4F5';
const NAVY = '#19395A';
const BODY = '#25496E';
const MUTED = '#6A8298';
const ROW_TITLE = '#173753';
const BORDER = '#E4E9F0';
const DANGER = '#FF1F3D';

const ICON_COL = 48;

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

export default function SecurityScreen() {
  const [incognitoEnabled, setIncognitoEnabled] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  const handleBlacklistPress = () => {
    router.push('/blacklist');
  };

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.body}>
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
              Безпека
            </Text>
          </View>

          <Text style={styles.pageSubtitle}>Керуйте доступом, сесіями та приватністю</Text>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Режим інкогніто</Text>
            <Text style={styles.sectionHint}>Приховайте профіль і активність на карті</Text>

            <View style={styles.incognitoRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="eye-off-outline" size={22} color={PURPLE} />
              </View>

              <View style={styles.incognitoTextWrap}>
                <Text style={styles.incognitoTitle}>Інкогніто</Text>
                <Text style={styles.incognitoText}>
                  У цьому режимі ваш профіль та активний статус приховані на карті. Ви також не зможете бачити
                  людей поблизу
                </Text>
              </View>

              <AppSwitch value={incognitoEnabled} onValueChange={setIncognitoEnabled} />
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.65} onPress={handleBlacklistPress}>
            <Text style={styles.menuRowTitle}>Чорний список</Text>
            <Ionicons name="chevron-forward" size={22} color={MUTED} />
          </TouchableOpacity>

          <View style={styles.sectionDivider} />
        </ScrollView>

        <TouchableOpacity style={styles.deleteButton} activeOpacity={0.65} onPress={() => setDeleteModalVisible(true)}>
          <Text style={styles.deleteText}>Видалити акаунт</Text>
        </TouchableOpacity>

        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
            <Pressable style={styles.deleteModal} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalTitle}>Ви впевнені, що хочете видалити акаунт?</Text>
              <Text style={styles.modalDescription}>
                Ця дія є незворотною. Усі ваші дані будуть назавжди видалені з системи StepIn протягом 30 днів
              </Text>

              <TouchableOpacity style={styles.confirmDeleteButton} activeOpacity={0.65} onPress={handleConfirmDelete}>
                <Text style={styles.confirmDeleteText}>Видалити назавжди</Text>
              </TouchableOpacity>

              <View style={styles.modalDivider} />

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.65}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>Скасувати</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
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
  sectionTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  sectionHint: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  incognitoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 4,
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
  incognitoTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  incognitoTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  incognitoText: {
    marginTop: 6,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'left',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuRowTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 8,
  },
  deleteText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    color: DANGER,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  deleteModal: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 28,
  },
  modalTitle: {
    alignSelf: 'center',
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: 'Space Grotesk',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '700',
    color: NAVY,
  },
  modalDescription: {
    alignSelf: 'center',
    maxWidth: 320,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 18,
    color: BODY,
  },
  confirmDeleteButton: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 16,
  },
  confirmDeleteText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    color: DANGER,
  },
  modalDivider: {
    height: 1,
    backgroundColor: BORDER,
  },
  cancelButton: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 12,
  },
  cancelText: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    color: NAVY,
  },
});
