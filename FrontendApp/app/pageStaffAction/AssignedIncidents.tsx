import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Modal, Pressable, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";
import { TouchableWithoutFeedback } from "react-native";


const statusBarHeight = Platform.OS === 'ios' ? 50 : 40;

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

// Interface for display
interface Incident {
    id: number;
    title: string;
    location: string;
    status: string;
    type: string;
    typeLabel: string;
    date: string;
    rating: number;
    comment: string;
    pictureUrl: string;
}

export default function AssignedIncidents() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [employeeId, setEmployeeId] = useState<number>(0);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#333";
    const cardBg = darkMode ? "#1E1E1E" : "#fff";
    const modalBg = darkMode ? "#282828" : "#fff";

    const incidentTypes = [
        { label: 'Hư hỏng đường sá', value: 1 },
        { label: 'Tai nạn giao thông', value: 2 },
        { label: 'Tắc nghẽn giao thông', value: 3 },
        { label: 'Phong tỏa', value: 4 },
        { label: 'Vật cản bất ngờ', value: 5 },
    ];

    // Rating to Status mapping
    const ratingStatusMap: Record<number, string> = {
        5: 'Chờ xử lý',
        3: 'Đang xử lý',
        1: 'Hoàn thành',
    };

    const getStatusFromRating = (rating: number): string => {
        return ratingStatusMap[rating] || 'Chờ xử lý';
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Hoàn thành': return '#66BB6A';
            case 'Đang xử lý': return '#FFA726';
            case 'Chờ xử lý': return '#EF5350';
            default: return '#007AFF';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Get current logged in user
    const getCurrentUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setEmployeeId(user.id);
                return user.id;
            }
            return 0;
        } catch (error) {
            console.error('Error getting current user:', error);
            return 0;
        }
    };

    // Fetch incidents assigned to this employee
    const fetchAssignedIncidents = async (empId: number) => {
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

            // Filter incidents assigned to this employee
            const myIncidents = data.filter(item => item.employeeId === empId);

            // Map to display format and sort by date (newest first)
            const mappedIncidents: Incident[] = myIncidents
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(item => {
                    const typeLabel = incidentTypes.find(t => t.value === item.type)?.label || `Loại ${item.type}`;
                    return {
                        id: item.id,
                        title: item.title || 'Không có tiêu đề',
                        location: item.location,
                        status: getStatusFromRating(item.rating),
                        type: item.type.toString(),
                        typeLabel: typeLabel,
                        date: formatDate(item.createdAt),
                        rating: item.rating,
                        comment: item.comment,
                        pictureUrl: item.pictureUrl,
                    };
                });

            setIncidents(mappedIncidents);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    // Initial data load
    const loadData = async () => {
        setLoading(true);
        const empId = await getCurrentUser();
        if (empId) {
            await fetchAssignedIncidents(empId);
        }
        setLoading(false);
    };

    // Refresh data
    const onRefresh = async () => {
        setRefreshing(true);
        if (employeeId) {
            await fetchAssignedIncidents(employeeId);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Open detail modal
    const handleOpenDetail = (incident: Incident) => {
        setSelectedIncident(incident);
        setDetailModalVisible(true);
    };

    // Update incident status (mark as complete)
    const handleMarkComplete = async () => {
        if (!selectedIncident) return;

        try {
            setUpdatingStatus(true);
            const apiUrl = `${API_URL}/api/Admin/accident-reports/${selectedIncident.id}/status`;

            // If current status is "Đang xử lý" (rating 3), need 1 call
            // If current status is "Chờ xử lý" (rating 5), need 2 calls
            const callsNeeded = selectedIncident.rating === 5 ? 2 : 1;

            for (let i = 0; i < callsNeeded; i++) {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to update status on call ${i + 1}`);
                }
            }

            // Update local state
            const updatedIncident = { ...selectedIncident, status: 'Hoàn thành', rating: 1 };
            setIncidents(prev => prev.map(inc =>
                inc.id === selectedIncident.id ? updatedIncident : inc
            ));
            setSelectedIncident(updatedIncident);

        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer, { backgroundColor: background }]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, { color: textColor }]}>Đang tải danh sách sự cố...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDetailModalVisible(false)}>
                    <View style={styles.modalOverlay}>

                        <Pressable
                            style={[styles.modalContent, { backgroundColor: modalBg }]}
                            onPress={() => {}}  // Prevent closing when clicking inside
                        >
                            {selectedIncident && (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={[styles.modalTitle, { color: textColor }]}>
                                            Chi tiết sự cố #{selectedIncident.id}
                                        </Text>
                                        <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                            <MaterialIcons name="close" size={24} color={textColor} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={styles.modalBody}>
                                        {selectedIncident.pictureUrl && (
                                            <Image
                                                source={{ uri: selectedIncident.pictureUrl }}
                                                style={styles.incidentImage}
                                                resizeMode="cover"
                                            />
                                        )}

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="title" size={20} color="#007AFF" />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Tiêu đề</Text>
                                                <Text style={[styles.infoValue, { color: textColor }]}>{selectedIncident.title}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="category" size={20} color="#007AFF" />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Loại sự cố</Text>
                                                <Text style={[styles.infoValue, { color: textColor }]}>{selectedIncident.typeLabel}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="location-on" size={20} color="#007AFF" />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Vị trí</Text>
                                                <Text style={[styles.infoValue, { color: textColor }]}>{selectedIncident.location}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="description" size={20} color="#007AFF" />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Mô tả</Text>
                                                <Text style={[styles.infoValue, { color: textColor }]}>
                                                    {selectedIncident.comment || 'Không có mô tả'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="schedule" size={20} color="#007AFF" />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Ngày tạo</Text>
                                                <Text style={[styles.infoValue, { color: textColor }]}>{selectedIncident.date}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="flag" size={20} color={getStatusColor(selectedIncident.status)} />
                                            <View style={styles.infoContent}>
                                                <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Trạng thái</Text>
                                                <Text style={[styles.infoValue, { color: getStatusColor(selectedIncident.status), fontWeight: 'bold' }]}>
                                                    {selectedIncident.status}
                                                </Text>
                                            </View>
                                        </View>
                                    </ScrollView>

                                    {selectedIncident.status !== 'Hoàn thành' && (
                                        <TouchableOpacity
                                            style={[styles.completeButton, updatingStatus && styles.completeButtonDisabled]}
                                            onPress={handleMarkComplete}
                                            disabled={updatingStatus}
                                        >
                                            {updatingStatus ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <>
                                                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                                                    <Text style={styles.completeButtonText}>Đánh dấu hoàn thành</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setDetailModalVisible(false)}
                                    >
                                        <Text style={styles.closeButtonText}>Đóng</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Pressable>

                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            {/* Header */}
            <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Sự cố được giao</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <MaterialIcons name="refresh" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Stats summary */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{incidents.length}</Text>
                    <Text style={styles.statLabel}>Tổng</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#EF5350' }]}>
                        {incidents.filter(i => i.status === 'Chờ xử lý').length}
                    </Text>
                    <Text style={styles.statLabel}>Chờ xử lý</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#FFA726' }]}>
                        {incidents.filter(i => i.status === 'Đang xử lý').length}
                    </Text>
                    <Text style={styles.statLabel}>Đang xử lý</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#66BB6A' }]}>
                        {incidents.filter(i => i.status === 'Hoàn thành').length}
                    </Text>
                    <Text style={styles.statLabel}>Hoàn thành</Text>
                </View>
            </View>

            {/* Incident list */}
            {incidents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="inbox" size={64} color="#ccc" />
                    <Text style={[styles.emptyText, { color: textColor }]}>Chưa có sự cố nào được giao</Text>
                </View>
            ) : (
                <FlatList
                    data={incidents}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#007AFF']}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: cardBg }]}
                            onPress={() => handleOpenDetail(item)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                <Text style={[styles.cardStatus, { color: getStatusColor(item.status) }]}>
                                    {item.status}
                                </Text>
                            </View>

                            <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
                                {item.title}
                            </Text>

                            <View style={styles.cardInfo}>
                                <MaterialIcons name="category" size={14} color="#888" />
                                <Text style={[styles.cardInfoText, { color: darkMode ? '#aaa' : '#666' }]}>
                                    {item.typeLabel}
                                </Text>
                            </View>

                            <View style={styles.cardInfo}>
                                <MaterialIcons name="location-on" size={14} color="#888" />
                                <Text style={[styles.cardInfoText, { color: darkMode ? '#aaa' : '#666' }]} numberOfLines={1}>
                                    {item.location}
                                </Text>
                            </View>

                            <View style={styles.cardInfo}>
                                <MaterialIcons name="schedule" size={14} color="#888" />
                                <Text style={[styles.cardInfoText, { color: darkMode ? '#888' : '#888' }]}>
                                    {item.date}
                                </Text>
                            </View>

                            <View style={styles.cardAction}>
                                <Text style={styles.cardActionText}>Xem chi tiết</Text>
                                <MaterialIcons name="chevron-right" size={18} color="#007AFF" />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: statusBarHeight,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    title: { fontSize: 20, fontWeight: "bold" },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    card: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    cardStatus: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    cardInfoText: {
        fontSize: 13,
        marginLeft: 6,
        flex: 1,
    },
    cardAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    cardActionText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '92%',
        maxHeight: '85%',
        borderRadius: 15,
        padding: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        maxHeight: 400,
    },
    incidentImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#66BB6A',
        padding: 14,
        borderRadius: 10,
        marginTop: 20,
    },
    completeButtonDisabled: {
        backgroundColor: '#ccc',
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    closeButton: {
        alignItems: 'center',
        padding: 12,
        marginTop: 10,
    },
    closeButtonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});