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

    const handleLogin = () => {

        console.log('Login với:', email, password);
        // Kiểm tra thông tin đăng nhập
        const account = AccountTest.find(
            acc => acc.email === email && acc.password === password
        );
        // phân quyền login
        if (account) {
            Alert.alert(
                'Đăng nhập thành công',
                `Chào mừng ${account.name} đến với TuTi`,
                [{
                    text: `Ok`, onPress: () => {
                        if (account.role === 'Admin') {
                            router.replace('/pageAdmin/HomeAdmin');
                        } else if (account.role === 'User') {
                            router.replace('/pageUser/HomePage');
                        } else if (account.role === 'employyer') {
                            router.replace('/pageStaffAction/StaffHome');
                        }
                    }

                }]
            );
            console.log('Use logged in :', account);
        } else {
            Alert.alert(
                'Đăng nhập thất bại',
                'Email hoặc mật khẩu không đúng. Vui lòng thử lại'
            );
        }
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
