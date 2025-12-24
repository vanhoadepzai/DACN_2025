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
    Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/config";

// Your Google Maps API Key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Interface for API response
interface ApiIncident {
    id: number;
    userId: number;
    title: string;
    employeeId: number;
    rating: number;
    type: number;
    location: string;
    pictureUrl: string;
    comment: string;
    createdAt: string;
    updatedAt: string | null;
}

// Interface for display with coordinates
interface Incident {
    id: number;
    title: string;
    status: string;
    rating: number;
    latitude: number;
    longitude: number;
    location: string;
    comment: string;
    type: number;
    createdAt: string;
}

// Cache for geocoded addresses
const geocodeCache: Record<string, { lat: number; lng: number }> = {};

export default function MapScreen() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [visibleList, setVisibleList] = useState(false);
    const mapRef = useRef<MapView>(null);

    const getStatusLabel = (rating: number): string => {
        switch (rating) {
            case 1: return 'Đã xử lý';
            case 3: return 'Đã tiếp nhận';
            case 5: return 'Đang chờ';
            default: return 'Không xác định';
        }
    };

    const getMarkerColor = (rating: number): string => {
        switch (rating) {
            case 1: return 'green';
            case 3: return 'orange';
            case 5: return 'red';
            default: return 'blue';
        }
    };

    // Geocode address to coordinates
    const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
        if (geocodeCache[address]) {
            return geocodeCache[address];
        }

        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}&region=vn`
            );

            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                geocodeCache[address] = { lat, lng };
                return { lat, lng };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    // Fallback coordinates for HCM City
    const getApproximateCoordinates = (address: string): { lat: number; lng: number } => {
        const hcmCenter = { lat: 10.7769, lng: 106.7009 };

        const districtCoords: Record<string, { lat: number; lng: number }> = {
            'quận 1': { lat: 10.7756, lng: 106.7004 },
            'quận 2': { lat: 10.7870, lng: 106.7480 },
            'quận 3': { lat: 10.7830, lng: 106.6880 },
            'quận 4': { lat: 10.7580, lng: 106.7010 },
            'quận 5': { lat: 10.7540, lng: 106.6620 },
            'quận 6': { lat: 10.7460, lng: 106.6350 },
            'quận 7': { lat: 10.7340, lng: 106.7220 },
            'quận 8': { lat: 10.7220, lng: 106.6280 },
            'quận 9': { lat: 10.8480, lng: 106.8280 },
            'quận 10': { lat: 10.7720, lng: 106.6680 },
            'quận 11': { lat: 10.7620, lng: 106.6500 },
            'quận 12': { lat: 10.8670, lng: 106.6550 },
            'bình thạnh': { lat: 10.8030, lng: 106.7100 },
            'gò vấp': { lat: 10.8380, lng: 106.6650 },
            'phú nhuận': { lat: 10.7990, lng: 106.6820 },
            'tân bình': { lat: 10.8010, lng: 106.6530 },
            'tân phú': { lat: 10.7900, lng: 106.6280 },
            'bình tân': { lat: 10.7650, lng: 106.6030 },
            'thủ đức': { lat: 10.8520, lng: 106.7590 },
        };

        const lowerAddress = address.toLowerCase();

        for (const [district, coords] of Object.entries(districtCoords)) {
            if (lowerAddress.includes(district)) {
                return {
                    lat: coords.lat + (Math.random() - 0.5) * 0.01,
                    lng: coords.lng + (Math.random() - 0.5) * 0.01,
                };
            }
        }

        return {
            lat: hcmCenter.lat + (Math.random() - 0.5) * 0.02,
            lng: hcmCenter.lng + (Math.random() - 0.5) * 0.02,
        };
    };

    const fetchIncidents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/AccidentReports`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch incidents');
            }

            const data: ApiIncident[] = await response.json();

            console.log('Fetched incidents:', data.length);
            console.log('Sample ratings:', data.slice(0, 5).map(d => ({ id: d.id, rating: d.rating })));

            setGeocodingProgress({ current: 0, total: data.length });

            const incidentsWithCoords: Incident[] = [];

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                setGeocodingProgress({ current: i + 1, total: data.length });

                let coords = await geocodeAddress(item.location);

                if (!coords) {
                    coords = getApproximateCoordinates(item.location);
                }

                incidentsWithCoords.push({
                    id: item.id,
                    title: item.title || 'Không có tiêu đề',
                    status: getStatusLabel(item.rating),
                    rating: item.rating,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    location: item.location,
                    comment: item.comment,
                    type: item.type,
                    createdAt: item.createdAt,
                });

                if (i < data.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            console.log('Processed incidents:', incidentsWithCoords.length);
            setIncidents(incidentsWithCoords);
        } catch (error) {
            console.error("Lỗi tải sự cố:", error);
            Alert.alert('Lỗi', 'Không thể tải danh sách sự cố');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setLocation({ latitude: 10.7769, longitude: 106.7009 });
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
    };

    useEffect(() => {
        getCurrentLocation();
        fetchIncidents();
    }, []);

    // Calculate stats from ALL incidents (not just today)
    const stats = {
        total: incidents.length,
        pending: incidents.filter((i) => i.rating === 5).length,
        received: incidents.filter((i) => i.rating === 3).length,
        resolved: incidents.filter((i) => i.rating === 1).length,
    };

    // Filter incidents for modal based on selection
    const getFilteredIncidents = (): Incident[] => {
        switch (selectedFilter) {
            case 'all':
                return incidents;
            case 'pending':
                return incidents.filter((i) => i.rating === 5);
            case 'received':
                return incidents.filter((i) => i.rating === 3);
            case 'resolved':
                return incidents.filter((i) => i.rating === 1);
            default:
                return incidents;
        }
    };

    const handleShowList = (filter: string) => {
        setSelectedFilter(filter);
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    if (loading || !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Đang tải bản đồ...</Text>
                {geocodingProgress.total > 0 && (
                    <Text style={{ marginTop: 5, color: '#666' }}>
                        Đang xử lý địa chỉ: {geocodingProgress.current}/{geocodingProgress.total}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bản đồ sự cố</Text>
            <Text style={styles.subtitle}>Xem vị trí của bạn và các sự cố trên bản đồ</Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {/* Current location */}
                <Marker
                    coordinate={location}
                    title="Vị trí của bạn"
                >
                    <View style={styles.currentLocationMarker}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </View>
                </Marker>

                {/* Incident markers */}
                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        coordinate={{
                            latitude: incident.latitude,
                            longitude: incident.longitude,
                        }}
                        title={incident.title}
                        description={`${incident.location}\nTrạng thái: ${incident.status}`}
                        pinColor={getMarkerColor(incident.rating)}
                    />
                ))}
            </MapView>

            {/* Statistics Box */}
            <ScrollView style={styles.statsBox}>
                <Text style={styles.statsTitle}>📊 Thống kê sự cố</Text>

                {/* Total */}
                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("all")}>
                    <View style={[styles.statIcon, { backgroundColor: '#007AFF' }]}>
                        <Ionicons name="list" size={18} color="#fff" />
                    </View>
                    <Text style={styles.statLabel}>Tổng sự cố</Text>
                    <Text style={[styles.statNumber, { color: '#007AFF' }]}>{stats.total}</Text>
                </TouchableOpacity>

                {/* Pending - Rating 5 */}
                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("pending")}>
                    <View style={[styles.statIcon, { backgroundColor: '#EF5350' }]}>
                        <Ionicons name="time" size={18} color="#fff" />
                    </View>
                    <Text style={styles.statLabel}>Đang chờ</Text>
                    <Text style={[styles.statNumber, { color: '#EF5350' }]}>{stats.pending}</Text>
                </TouchableOpacity>

                {/* Received - Rating 3 */}
                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("received")}>
                    <View style={[styles.statIcon, { backgroundColor: '#FFA726' }]}>
                        <Ionicons name="download" size={18} color="#fff" />
                    </View>
                    <Text style={styles.statLabel}>Đã tiếp nhận</Text>
                    <Text style={[styles.statNumber, { color: '#FFA726' }]}>{stats.received}</Text>
                </TouchableOpacity>

                {/* Resolved - Rating 1 */}
                <TouchableOpacity style={styles.statItem} onPress={() => handleShowList("resolved")}>
                    <View style={[styles.statIcon, { backgroundColor: '#66BB6A' }]}>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    </View>
                    <Text style={styles.statLabel}>Đã xử lý</Text>
                    <Text style={[styles.statNumber, { color: '#66BB6A' }]}>{stats.resolved}</Text>
                </TouchableOpacity>

                {/* Legend */}
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Chú thích màu:</Text>
                    <View style={styles.legendItems}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                            <Text style={styles.legendText}>Đang chờ</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
                            <Text style={styles.legendText}>Đã tiếp nhận</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                            <Text style={styles.legendText}>Đã xử lý</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Incident list modal */}
            <Modal visible={visibleList} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            {selectedFilter === "all"
                                ? `Tất cả sự cố (${stats.total})`
                                : selectedFilter === "pending"
                                    ? `Đang chờ xử lý (${stats.pending})`
                                    : selectedFilter === "received"
                                        ? `Đã tiếp nhận (${stats.received})`
                                        : `Đã xử lý (${stats.resolved})`}
                        </Text>

                        {getFilteredIncidents().length > 0 ? (
                            <FlatList
                                data={getFilteredIncidents()}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => handleSelectIncident(item)} style={styles.incidentItem}>
                                        <View style={styles.incidentHeader}>
                                            <View style={[styles.statusDot, { backgroundColor: getMarkerColor(item.rating) }]} />
                                            <Text style={styles.incidentTitle} numberOfLines={1}>{item.title}</Text>
                                        </View>
                                        <Text style={styles.incidentLocation} numberOfLines={1}>
                                            📍 {item.location}
                                        </Text>
                                        <View style={styles.incidentMeta}>
                                            <Text style={styles.incidentDate}>
                                                🕐 {formatDate(item.createdAt)}
                                            </Text>
                                            <View style={[styles.ratingBadge, { backgroundColor: getMarkerColor(item.rating) + '20' }]}>
                                                <Text style={[styles.ratingText, { color: getMarkerColor(item.rating) }]}>
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>Không có sự cố nào.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={() => setVisibleList(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
        color: "#666",
        marginHorizontal: 20,
        marginBottom: 10,
    },
    map: {
        width: "100%",
        height: 320,
    },
    currentLocationMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    statsBox: {
        backgroundColor: "#fff",
        margin: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statLabel: {
        fontSize: 15,
        color: "#333",
        flex: 1,
    },
    statNumber: {
        fontWeight: "bold",
        fontSize: 20,
    },
    legend: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    legendTitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    legendItems: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        maxHeight: "75%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        color: "#333",
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    incidentItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    incidentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    incidentTitle: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
        color: '#333',
    },
    incidentLocation: {
        fontSize: 13,
        color: "#666",
        marginLeft: 22,
    },
    incidentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: 22,
    },
    incidentDate: {
        fontSize: 12,
        color: "#888",
    },
    ratingBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#888',
        fontSize: 14,
    },
    closeButton: {
        backgroundColor: "#007AFF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 15,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});