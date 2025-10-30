import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // dùng router để điều hướng

export default function AssignedIncidents() {
    const router = useRouter();

    const incidents = [
        { id: 1, title: "Ngập nước đường Nguyễn Trãi", status: "Chờ xử lý" },
        { id: 2, title: "Đèn giao thông hỏng", status: "Đang xử lý" },
        { id: 3, title: "Rác thải tồn đọng", status: "Hoàn thành" },
    ];
    const handleUpdateIncident = (incidentId: number) => {
        router.push({
            pathname: "/pageStaffAction/UpdateProgress",
            params: { id: incidentId.toString() },
        });
    };

    return (
        <View style={styles.container}>
            {/* Nút quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}>📋 Danh sách sự cố được giao</Text>

            <FlatList
                data={incidents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => handleUpdateIncident(item.id)}
                    >
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.status}>Trạng thái: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fafafa", paddingTop: 40 },
    backButton: {
        marginBottom: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
        backgroundColor: "#eee",
        borderRadius: 6,
    },
    backText: { fontSize: 16, color: "#333" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
    item: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
    },
    itemTitle: { fontSize: 16, fontWeight: "600" },
    status: { marginTop: 4, color: "#555" },
});
