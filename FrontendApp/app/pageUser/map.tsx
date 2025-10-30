import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
    Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/config";

interface Incident {
    id: number;
    title: string;
    status: string;
    latitude: number;
    longitude: number;
    createdAt: string;
}

export default function MapScreen() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [visibleList, setVisibleList] = useState(false);
    const mapRef = useRef<MapView>(null);

    // Mock data test
    const mockData: Incident[] = [
        {
            id: 1,
            title: "Cây ngã giữa đường",
            status: "pending",
            latitude: 10.7765,
            longitude: 106.7009,
            createdAt: "2025-10-25T08:30:00Z",
        },
        {
            id: 2,
            title: "Ngập nước tại Nguyễn Huệ",
            status: "resolved",
            latitude: 10.7723,
            longitude: 106.7034,
            createdAt: "2025-10-25T09:15:00Z",
        },
        {
            id: 3,
            title: "Đèn tín hiệu bị hỏng",
            status: "received",
            latitude: 10.7788,
            longitude: 106.6907,
            createdAt: "2025-10-25T10:45:00Z",
        },
    ];

    const fetchIncidents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/incidents`);
            const text = await response.text();
            let data: Incident[] = [];

            if (text) {
                data = JSON.parse(text);
            } else {
                console.warn("API rỗng, dùng mock data");
                data = mockData;
            }

            setIncidents(data);
        } catch (error) {
            console.error("Lỗi tải sự cố:", error);
            setIncidents(mockData);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
    };

    useEffect(() => {
        fetchIncidents();
        getCurrentLocation();
    }, []);

    const todayIncidents = incidents.filter(
        (item) => new Date(item.createdAt).toDateString() === new Date().toDateString()
    );

    // Lọc theo trạng thái
    const filteredIncidents =
        selectedStatus === "all"
            ? todayIncidents
            : todayIncidents.filter((i) => i.status === selectedStatus);

    const handleShowList = (status: string) => {
        setSelectedStatus(status);
        setVisibleList(true);
    };

    const handleSelectIncident = (incident: Incident) => {
        setVisibleList(false);
        mapRef.current?.animateToRegion(
            {
                latitude: incident.latitude,
                longitude: incident.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
            1000
        );
    };

    if (loading || !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Đang tải bản đồ...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bản đồ sự cố</Text>
            <Text style={styles.subtitle}>Xem vị trí của bạn và các sự cố trong ngày</Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                {/* Vị trí hiện tại */}
                <Marker coordinate={location} title="Vị trí của bạn" pinColor="#007AFF" />

                {/* Các sự cố */}
                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        coordinate={{
                            latitude: incident.latitude,
                            longitude: incident.longitude,
                        }}
                        title={incident.title}
                        description={`Trạng thái: ${incident.status}`}
                        pinColor={
                            incident.status === "resolved"
                                ? "green"
                                : incident.status === "pending"
                                    ? "orange"
                                    : "blue"
                        }
                    />
                ))}
            </MapView>

            {/* Thống kê */}
            <ScrollView style={styles.statsBox}>
                <Text style={styles.statsTitle}>📊 Thống kê hôm nay</Text>

                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("all")}>
                    <Ionicons name="alert-circle" size={20} color="#007AFF" />
                    <Text style={styles.statText}>
                        Tổng sự cố: <Text style={styles.statNumber}>{todayIncidents.length}</Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("resolved")}>
                    <Ionicons name="checkmark-circle" size={20} color="green" />
                    <Text style={styles.statText}>
                        Đã xử lý:{" "}
                        <Text style={[styles.statNumber, { color: "green" }]}>
                            {todayIncidents.filter((i) => i.status === "resolved").length}
                        </Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("pending")}>
                    <Ionicons name="time" size={20} color="orange" />
                    <Text style={styles.statText}>
                        Đang chờ:{" "}
                        <Text style={[styles.statNumber, { color: "orange" }]}>
                            {todayIncidents.filter((i) => i.status === "pending").length}
                        </Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("received")}>
                    <Ionicons name="download" size={20} color="#007AFF" />
                    <Text style={styles.statText}>
                        Đã tiếp nhận:{" "}
                        <Text style={[styles.statNumber, { color: "#007AFF" }]}>
                            {todayIncidents.filter((i) => i.status === "received").length}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal danh sách sự cố */}
            <Modal visible={visibleList} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            {selectedStatus === "all"
                                ? "Tất cả sự cố hôm nay"
                                : selectedStatus === "resolved"
                                    ? "Sự cố đã xử lý"
                                    : selectedStatus === "pending"
                                        ? "Sự cố đang chờ"
                                        : "Sự cố đã tiếp nhận"}
                        </Text>

                        {filteredIncidents.length > 0 ? (
                            <FlatList
                                data={filteredIncidents}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => handleSelectIncident(item)} style={styles.incidentItem}>
                                        <Text style={styles.incidentTitle}>{item.title}</Text>
                                        <Text style={styles.incidentDate}>
                                            {new Date(item.createdAt).toLocaleTimeString("vi-VN")}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        ) : (
                            <Text style={{ textAlign: "center", color: "#666", marginVertical: 20 }}>
                                Không có sự cố nào.
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={() => setVisibleList(false)}
                            style={styles.closeButton}
                        >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ================== STYLE ==================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 60,
        marginHorizontal: 20,
    },
    subtitle: {
        fontSize: 14,
        color: "#0e0b0bff",
        marginHorizontal: 20,
        marginBottom: 10,
    },
    map: {
        width: "100%",
        height: 400,
    },
    statsBox: {
        backgroundColor: "#fff",
        margin: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 5,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
        color: "#007AFF",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
    },
    statText: {
        fontSize: 15,
        color: "#333",
        marginLeft: 10,
    },
    statNumber: {
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        maxHeight: "70%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        color: "#007AFF",
        marginBottom: 10,
    },
    incidentItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    incidentTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    incidentDate: {
        fontSize: 13,
        color: "#777",
    },
    closeButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
});
