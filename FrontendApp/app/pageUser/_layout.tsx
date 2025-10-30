import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#e0e0e0',
                    height: 80,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'HomePage') iconName = focused ? 'home' : 'home-outline';
                    if (route.name === 'map') iconName = focused ? 'map' : 'map-outline';
                    if (route.name === 'modal') iconName = focused ? 'add-circle' : 'add-circle-outline';
                    if (route.name === 'settings') iconName = focused ? 'settings' : 'settings-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabel: ({ focused, color }) => {
                    let label = '';

                    if (route.name === 'HomePage') label = 'Trang chủ';
                    if (route.name === 'map') label = 'Bản đồ';
                    if (route.name === 'modal') label = 'Báo cáo mới';
                    if (route.name === 'settings') label = 'Cài đặt';

                    return (
                        <Text style={{
                            color,
                            fontSize: 12,
                            fontWeight: '500',
                        }}>
                            {label}
                        </Text>
                    );
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
            })}
        >
            {/* Thứ tự đúng: Trang chủ -> Bản đồ -> Báo cáo -> Cài đặt */}
            <Tabs.Screen name="HomePage" />
            <Tabs.Screen name="map" />
            <Tabs.Screen name="modal" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}