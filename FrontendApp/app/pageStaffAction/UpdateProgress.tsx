import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router"; // import router

export default function UpdateProgress() {
    const router = useRouter(); // sử dụng router để quay lại
    const [progress, setProgress] = useState(50);

    const handleUpdate = () => {
        Alert.alert("✅ Cập nhật thành công", "Tiến độ xử lý đã được lưu!");
    };

    return (
        <View style={styles.container}>
            {/* Nút Quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}> Cập nhật tiến độ xử lý</Text>

            <Text style={styles.label}>Tiến độ hiện tại: {progress}%</Text>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#42A5F5" }]}
                    onPress={() => setProgress((prev) => Math.min(prev + 10, 100))}
                >
                    <Text style={styles.buttonText}>+10%</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#EF5350" }]}
                    onPress={() => setProgress((prev) => Math.max(prev - 10, 0))}
                >
                    <Text style={styles.buttonText}>-10%</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveText}>Lưu tiến độ</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fafafa", paddingTop: 40 },
    backButton: {
        marginBottom: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
        backgroundColor: "#eee",
        borderRadius: 6,
    },
    backText: { fontSize: 16, color: "#333" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
    label: { fontSize: 16, marginBottom: 20 },
    buttons: { flexDirection: "row", justifyContent: "space-around" },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    saveButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 30,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
