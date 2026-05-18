import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#9D8DF1';
const NAVY = '#19395A';
const BODY = '#25496E';
const ROW_TITLE = '#173753';
const BORDER = '#E4E9F0';

type BlockedUser = {
  id: string;
  name: string;
  photoUri?: string | null;
};

const INITIAL_BLOCKED_USERS: BlockedUser[] = [
  { id: '1', name: 'Іванна Чулій' },
  { id: '2', name: 'Іванна Чулій' },
  { id: '3', name: 'Іванна Чулій' },
];

function BlockedUserAvatar({ photoUri, name }: { photoUri?: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.avatarRing}>
      <View style={styles.avatarInner}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{initial}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function BlacklistScreen() {
  const [blockedUsers, setBlockedUsers] = useState(INITIAL_BLOCKED_USERS);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/security');
  };

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert('Розблокувати', `Розблокувати ${user.name}?`, [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Розблокувати',
        onPress: () => setBlockedUsers((current) => current.filter((item) => item.id !== user.id)),
      },
    ]);
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
          <Text style={styles.headerTitle}>Чорний список</Text>
        </View>

        <Text style={styles.pageSubtitle}>Користувачі, яких ви заблокували</Text>

        <View style={styles.listDivider} />

        {blockedUsers.length === 0 ? (
          <Text style={styles.emptyText}>Список порожній</Text>
        ) : (
          <View style={styles.list}>
            {blockedUsers.map((user, index) => (
              <View key={user.id}>
                <View style={styles.userRow}>
                  <BlockedUserAvatar photoUri={user.photoUri} name={user.name} />
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.65}
                    onPress={() => handleUnblock(user)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.unblockText}>Розблокувати</Text>
                  </TouchableOpacity>
                </View>
                {index < blockedUsers.length - 1 ? <View style={styles.rowDivider} /> : null}
              </View>
            ))}
            <View style={styles.rowDivider} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 52;

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
    marginBottom: 4,
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
  pageSubtitle: {
    marginTop: 10,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: BODY,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginTop: 24,
    marginBottom: 8,
  },
  list: {
    marginTop: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarInner: {
    width: AVATAR_SIZE - 6,
    height: AVATAR_SIZE - 6,
    borderRadius: (AVATAR_SIZE - 6) / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#EDE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    color: PURPLE,
  },
  userName: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: ROW_TITLE,
  },
  unblockText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: PURPLE,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  emptyText: {
    marginTop: 24,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    color: BODY,
    textAlign: 'center',
  },
});
