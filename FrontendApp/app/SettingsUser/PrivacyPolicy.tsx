import { Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            {/* 🔹 Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/pageUser/settings")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            {/* 🔹 Tiêu đề */}
            <Text style={styles.title}>Chính sách bảo mật</Text>

            {/* 🔹 Nội dung */}
            <Text style={styles.content}>
                Ứng dụng cam kết bảo mật thông tin người dùng, không chia sẻ dữ liệu cá nhân với bên thứ ba
                nếu không có sự đồng ý của người dùng. Dữ liệu chỉ được sử dụng cho mục đích cải thiện trải
                nghiệm và cung cấp dịch vụ tốt hơn.
            </Text>

            <Text style={styles.content}>
                Mọi thông tin nhạy cảm như mật khẩu hoặc mã định danh sẽ được mã hóa và lưu trữ an toàn.
                Người dùng có thể yêu cầu xóa tài khoản hoặc dữ liệu cá nhân bất kỳ lúc nào.
            </Text>

            <Text style={styles.content}>
                Chúng tôi khuyến khích người dùng thường xuyên cập nhật ứng dụng để đảm bảo sử dụng phiên
                bản mới nhất với các biện pháp bảo mật hiện đại.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    backButton: {
        marginBottom: 12,
        alignSelf: "flex-start",
        backgroundColor: "#E8F0FE",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
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
    content: {
        fontSize: 15,
        color: "#333",
        lineHeight: 24,
        textAlign: "justify",
        marginBottom: 12,
    },
});
