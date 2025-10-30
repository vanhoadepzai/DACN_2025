import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function EditProfile() {
    const router = useRouter();
    const [name, setName] = useState("Võ Văn Hòa");
    const [email, setEmail] = useState("hoaxeom@example.com");
    const [phone, setPhone] = useState("0909123456");

    const handleSave = () => {
        Alert.alert(" Thành công", "Thông tin cá nhân đã được cập nhật!");
        router.push("/SettingsUser/Profile");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/SettingsUser/Profile")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Chỉnh sửa thông tin cá nhân</Text>

            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập họ tên"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}> Lưu thay đổi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
        backgroundColor: "#F9FAFB",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#E8F0FE",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    backText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "500",
    },
    back: {
        color: "#007AFF",
        marginBottom: 10,
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#555",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
