import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Profile() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/pageUser/settings")}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            {/* Ảnh đại diện */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>Võ Văn Hòa</Text>
                <Text style={styles.email}>hoaxeom@example.com</Text>
            </View>

            {/* Thông tin cá nhân */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>Giới tính: Nam</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>Ngày sinh: 25/10/2003</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>Số điện thoại: 0901234567</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#555" />
                    <Text style={styles.infoText}>Địa chỉ: TP. Hồ Chí Minh</Text>
                </View>
            </View>

            {/* Nút chỉnh sửa */}
            <TouchableOpacity style={styles.editButton} onPress={() => router.push("/SettingsUser/Profile")} >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 20,
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
    avatarContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#007AFF",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        fontSize: 16,
        color: "#666",
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        marginVertical: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#444",
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        borderRadius: 10,
    },
    editText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
});
