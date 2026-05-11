import { Tabs, useSegments } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, useColorScheme, View } from 'react-native';

const ACTIVE = '#C88CEB';
const INACTIVE_LIGHT = '#D8BEEB';
const INACTIVE_DARK = '#F3E9FF';

function CircleIcon({
  focused,
  isDark,
  children,
}: {
  focused: boolean;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.circleBase,
        focused ? styles.circleActive : isDark ? styles.circleInactiveDark : styles.circleInactive,
      ]}
    >
      {children}
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments() as readonly string[];
  const isMapTab = segments.some((s) => s === 'map');
  const darkTabChrome = colorScheme === 'dark' && isMapTab;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: darkTabChrome ? INACTIVE_DARK : INACTIVE_LIGHT,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 18,
          height: 78,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen
        name="people"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircleIcon focused={focused} isDark={darkTabChrome}>
              <MaterialCommunityIcons name={focused ? 'account-group' : 'account-group-outline'} size={26} color={focused ? '#FFFFFF' : color} />
            </CircleIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircleIcon focused={focused} isDark={darkTabChrome}>
              <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={24} color={focused ? '#FFFFFF' : color} />
            </CircleIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircleIcon focused={focused} isDark={darkTabChrome}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={focused ? '#FFFFFF' : color} />
            </CircleIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircleIcon focused={focused} isDark={darkTabChrome}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#FFFFFF' : color} />
            </CircleIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <CircleIcon focused={focused} isDark={darkTabChrome}>
              <Ionicons name="options-outline" size={24} color={focused ? '#FFFFFF' : color} />
            </CircleIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  circleBase: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#E7D2F4',
  },
  circleInactiveDark: {
    backgroundColor: 'rgba(38, 38, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(200, 140, 235, 0.42)',
  },
  circleActive: {
    backgroundColor: ACTIVE,
    borderWidth: 1,
    borderColor: ACTIVE,
  },
});
