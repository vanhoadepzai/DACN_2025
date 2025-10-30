import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const handleRegister = () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }

        // Ở đây bạn có thể gọi API để đăng ký
        Alert.alert('Đăng ký thành công', `Chào mừng ${name}!`, [
            { text: 'OK', onPress: () => router.replace('/Accounts/Login') }
        ]);

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Đăng ký tài khoản</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={name}
                    onChangeText={setName}
                />

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

                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Đăng ký</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Accounts/Login')}>
                    <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    registerButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    loginLink: { color: '#007AFF', textAlign: 'center', fontSize: 14, marginTop: 10 },
});
