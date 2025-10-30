import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LocationSelectScreen() {
    const router = useRouter();

    // 🚌 Giá trị mặc định
    const [startPoint, setStartPoint] = useState<string>("Bến xe Miền Đông");
    const [destination, setDestination] = useState<string>("Chợ Bến Thành");

    // ✅ Lưu và quay lại
    const handleConfirm = async (): Promise<void> => {
        try {
            await AsyncStorage.setItem("startPoint", startPoint);
            await AsyncStorage.setItem("destination", destination);
            Alert.alert("✅ Lưu thành công", "Điểm đi và điểm đến đã được lưu!");
            router.back();
        } catch (error) {
            console.error("Lỗi lưu vị trí:", error);
            Alert.alert("❌ Lỗi", "Không thể lưu thông tin vị trí.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chọn vị trí</Text>
                <View style={{ width: 20 }} />
            </View>

            {/* Ô nhập điểm đi */}
            <Text style={styles.label}>Điểm đi</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập điểm đi..."
                value={startPoint}
                onChangeText={setStartPoint}
            />

            {/* Ô nhập điểm đến */}
            <Text style={styles.label}>Điểm đến</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập điểm đến..."
                value={destination}
                onChangeText={setDestination}
            />

            {/* Nút xác nhận */}
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 60 : 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: {
        fontSize: 22,
        color: "#007AFF",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    label: {
        fontSize: 16,
        color: "#555",
        marginTop: 20,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    confirmButton: {
        marginTop: 40,
        backgroundColor: "#007AFF",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
    },
    confirmText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
