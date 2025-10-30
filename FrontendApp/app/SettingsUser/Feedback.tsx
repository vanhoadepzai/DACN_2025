import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Feedback() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* 🔹 Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/pageUser/settings")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            {/* 🔹 Tiêu đề */}
            <Text style={styles.title}>Gửi phản hồi</Text>

            {/* 🔹 Ô nhập phản hồi */}
            <TextInput
                style={styles.input}
                placeholder="Nhập phản hồi của bạn..."
                placeholderTextColor="#888"
                multiline
            />

            {/* 🔹 Nút gửi */}
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Gửi phản hồi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        padding: 20,
        paddingTop: 50,
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
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#222",
        marginBottom: 16,
    },
    input: {
        height: 140,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 12,
        fontSize: 15,
        lineHeight: 22,
        color: "#333",
        marginBottom: 16,
        textAlignVertical: "top",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
