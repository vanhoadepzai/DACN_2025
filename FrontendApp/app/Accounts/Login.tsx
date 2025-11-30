import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountTest =
    [{
        email: 'admin@gmail.com',
        password: '123456',
        role: 'Admin',
        name: 'quản trị viên'
    },
    {
        email: 'vanhoadepzai@gmail.com',
        password: '123456',
        role: 'User',
        name: 'người dùng'
    },
    {
        email: 'v',
        password: '123456',
        role: 'User',
        name: 'người dùng'
    },
    {
        email: 'nhanvien',
        password: '123456',
        role: 'employyer',
        name: 'Nhân viên'
    }
    ]
export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

// make sure this points to your API file

    const handleLogin = async () => {
      console.log('Trying login with:', email, password);

      let loggedInUser = null;

      try {
        const response = await fetch(`${API_URL}/api/Users/login`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const user = await response.json();
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          if (user && user.id) {
            loggedInUser = user; // API login success
            console.log('API login success:', user);
          } else {
            console.warn('API returned no user, fallback to mock');
          }
        } else {
          console.warn('API login failed with status', response.status);
        }
      } catch (error) {
        console.error('Login API error:', error);
      }

      // If API failed or returned no user, fallback to mock
      if (!loggedInUser) {
        const account = AccountTest.find(
          acc => acc.email === email && acc.password === password
        );

        if (account) {
          loggedInUser = account;
          console.log('Logged in with mock data:', account);
        }
      }

      // If still no user, show error
      if (!loggedInUser) {
        Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng. Vui lòng thử lại');
        return;
      }

      // Navigate based on role
      Alert.alert(
        'Đăng nhập thành công',
        `Chào mừng ${loggedInUser.name} đến với TuTi`,
        [{
          text: 'Ok',
          onPress: () => {
            if (loggedInUser.role === '2' || loggedInUser.role === 2) {
              router.replace('/pageAdmin/HomeAdmin');
            } else if (loggedInUser.role === '0' || loggedInUser.role === 0) {
              router.replace('/pageUser/HomePage');
            } else if (loggedInUser.role === '1' || loggedInUser.role === 1) {
              router.replace('/pageStaffAction/StaffHome');
            }
          }
        }]
      );
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { fontSize: 40 }]}>TuTi</Text>
                <Text style={styles.title}>Urban-Incident</Text>
                <Text style={styles.subtitle}>Đăng nhập vào tài khoản</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
                <View style={styles.quickLoginButtons}>
                    <TouchableOpacity style={[styles.quickButton, styles.googleButton]} >
                        <FontAwesome name="google" size={20} color="#fff" />
                        <Text style={styles.quickButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickButton, styles.facebookButton]} >
                        <FontAwesome name="facebook" size={20} color="#fff" />
                        <Text style={styles.quickButtonText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/Accounts/Register')}>
                    <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    quickLoginContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    quickLoginTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    quickLoginButtons: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    quickButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    googleButton: {
        backgroundColor: '#DB4437', // màu Google
    },
    facebookButton: {
        backgroundColor: '#4267B2', // màu Facebook
    },
    quickButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerLink: {
        alignItems: 'center',
        marginTop: 10,
    },
    registerText: {
        color: '#007AFF',
        fontSize: 14,
    },
});
