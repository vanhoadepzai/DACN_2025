import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function ChangePassword() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/pageUser/settings")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Đổi mật khẩu</Text>

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu cũ"
                placeholderTextColor="#999"
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 20,
        paddingTop: 60,
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
        fontSize: 16,
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        marginBottom: 25,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
