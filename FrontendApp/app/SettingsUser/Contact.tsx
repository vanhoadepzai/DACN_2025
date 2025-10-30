import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Contact() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/*  Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/pageUser/settings")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            {/*  Tiêu đề */}
            <Text style={styles.title}>Liên hệ hỗ trợ</Text>

            {/*  Thông tin liên hệ */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>Email hỗ trợ:</Text>
                <Text style={styles.value}>hotro@ungdung.vn</Text>

                <Text style={styles.label}>Hotline:</Text>
                <Text style={styles.value}>1900 1234</Text>

                <Text style={styles.label}>Giờ làm việc:</Text>
                <Text style={styles.value}>Thứ 2 - Thứ 6, 8:00 - 17:00</Text>
            </View>

            {/*  Ghi chú */}
            <Text style={styles.note}>
                Nếu bạn gặp sự cố, vui lòng gửi email hoặc gọi hotline để được hỗ trợ nhanh nhất.
            </Text>
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
        marginBottom: 16,
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
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 18,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 15,
        color: "#007AFF",
        fontWeight: "600",
        marginTop: 6,
    },
    value: {
        fontSize: 16,
        color: "#333",
        marginBottom: 4,
    },
    note: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },
});
