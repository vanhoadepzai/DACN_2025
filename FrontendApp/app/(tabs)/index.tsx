import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mô phỏng check auth
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer); // cleanup
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  // Điều hướng sang login
  return <Redirect href="/Accounts/Login" />;
}
