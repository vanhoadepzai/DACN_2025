import React, { useState } from "react"; // 👈 React and Hooks (useState) come from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Platform, Modal, Pressable, TextInput, ScrollView, FlatList } from "react-native"; // 👈 All React Native components (View, Text, ScrollView, etc.) come from "react-native"
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const statusBarHeight = Platform.OS === 'ios' ? 50 : 40;

// INTERFACE KHẮC PHỤC LỖI TYPESCRIPT
interface Incident {
    id: number;
    title: string;
    status: string;
    category: string;
    date: string;
    lat: number;
    lon: number;
    assignedTo: string;
    priority: string;
    nearestStaff?: string; // Tạm thời thêm vào khi tìm kiếm
}

// Dữ liệu giả định
const mockIncidentsData: Incident[] = [
    { id: 1, title: "Cây ngã đường (Q1)", status: "Chờ xử lý", category: "Hạ tầng", date: "29/10/2025", lat: 10.772, lon: 106.696, assignedTo: "Chưa phân công", priority: "Cao" },
    { id: 2, title: "Ổ gà lớn (Q5)", status: "Đang xử lý", category: "Hạ tầng", date: "28/10/2025", lat: 10.757, lon: 106.671, assignedTo: "Nguyễn Văn A", priority: "Trung bình" },
    { id: 3, title: "Lắp đặt lại đèn (Q7)", status: "Hoàn thành", category: "Chiếu sáng", date: "27/10/2025", lat: 10.730, lon: 106.708, assignedTo: "Trần Thị B", priority: "Thấp" },
];

const mockStaff = [
    { id: 101, name: "Nguyễn Văn A", role: "Giám sát", status: "Đang hoạt động", lat: 10.760, lon: 106.690 },
    { id: 102, name: "Trần Thị B", role: "Kỹ thuật", status: "Đang hoạt động", lat: 10.745, lon: 106.665 },
    { id: 103, name: "Lê Văn C", role: "Hành chính", status: "Nghỉ phép", lat: 10.785, lon: 106.715 },
];

// Hàm tìm nhân viên gần nhất (Frontend Logic)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
};
interface NearestStaff {
    name: string;
    role: string;
    distance: number;
}


const findNearestStaff = (incidentLat: number, incidentLon: number): string => {
    let nearestStaff: NearestStaff | null = null;
    let minDistance = Infinity;
    const activeStaff = mockStaff.filter(s => s.status === "Đang hoạt động");

    if (activeStaff.length === 0) return "Không có nhân viên đang hoạt động.";

    activeStaff.forEach(staff => {
        const distance = parseFloat(getDistance(incidentLat, incidentLon, staff.lat, staff.lon));
        if (distance < minDistance) {
            minDistance = distance;
            nearestStaff = { name: staff.name, role: staff.role, distance: distance };
        }
    });

    if (nearestStaff) {
        return `${nearestStaff.name} (${nearestStaff.role}) - ${nearestStaff.distance} km`;
    }

    return "Không tìm thấy nhân viên.";
};

export default function Incidents() {
    const [incidents, setIncidents] = useState<Incident[]>(mockIncidentsData);
    const [darkMode, setDarkMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    // Sử dụng Interface đã định nghĩa
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const router = useRouter();

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#333";
    const cardBg = darkMode ? "#1E1E1E" : "#fff";
    const modalBg = darkMode ? "#282828" : "#fff";

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Hoàn thành": return "#66BB6A";
            case "Đang xử lý": return "#FFA726";
            case "Chờ xử lý": return "#EF5350";
            default: return "#42A5F5";
        }
    };

    const handleOpenDetail = (item: Incident) => {
        const nearestStaffInfo = findNearestStaff(item.lat, item.lon);
        // Cập nhật selectedIncident với thông tin nhân viên gần nhất
        setSelectedIncident({ ...item, nearestStaff: nearestStaffInfo });
        setModalVisible(true);
    };

    // Xử lý Frontend: Cập nhật trạng thái sự cố trong state
    const handleStatusUpdate = (newStatus: string) => {
        if (!selectedIncident) return;

        setIncidents(prev => prev.map(inc =>
            inc.id === selectedIncident.id ? { ...inc, status: newStatus } : inc
        ));
        setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
        Alert.alert("Cập nhật", `Đã chuyển trạng thái sự cố #${selectedIncident.id} thành ${newStatus}.`);
    };

    // Xử lý Frontend: Phân công nhân viên gần nhất
    const handleAssign = () => {
        if (!selectedIncident || selectedIncident.nearestStaff === "Không có nhân viên đang hoạt động.") {
            Alert.alert("Lỗi", "Không thể phân công. Không có nhân viên hoạt động gần đó.");
            return;
        }

        const staffName = selectedIncident.nearestStaff ? selectedIncident.nearestStaff.split('(')[0].trim() : "Không rõ";

        setIncidents(prev => prev.map(inc =>
            inc.id === selectedIncident.id ? { ...inc, assignedTo: staffName, status: "Đang xử lý" } : inc
        ));
        setSelectedIncident(prev => prev ? { ...prev, assignedTo: staffName, status: "Đang xử lý" } : null);
        Alert.alert("Phân công", `Đã phân công sự cố cho ${staffName} và cập nhật trạng thái.`);
    };

    const DetailModal = () => {
        // KIỂM TRA NULL ĐỂ KHẮC PHỤC LỖI "Cannot read property 'id' of null"
        if (!selectedIncident) {
            return null;
        }

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: modalBg }]} onPress={() => { }}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Chi Tiết Sự Cố #{selectedIncident.id}</Text>
                        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                            <Text style={[styles.modalText, { color: textColor }]}>**Tiêu đề:** {selectedIncident.title}</Text>
                            <Text style={[styles.modalText, { color: textColor }]}>**Danh mục:** {selectedIncident.category}</Text>
                            <Text style={[styles.modalText, { color: textColor }]}>**Độ ưu tiên:** {selectedIncident.priority}</Text>
                            <Text style={[styles.modalText, { color: textColor }]}>**Trạng thái:** <Text style={{ color: getStatusColor(selectedIncident.status), fontWeight: 'bold' }}>{selectedIncident.status}</Text></Text>
                            <Text style={[styles.modalText, { color: textColor }]}>**Phân công:** {selectedIncident.assignedTo}</Text>
                            <Text style={[styles.modalText, { color: textColor }]}>**Vị trí:** {selectedIncident.lat}, {selectedIncident.lon} (Xem bản đồ)</Text>

                            <View style={styles.separator} />

                            <Text style={[styles.modalSubtitle, { color: textColor }]}>**Nhân viên gần nhất:**</Text>
                            <Text style={[styles.modalText, { color: textColor }]}>{selectedIncident.nearestStaff}</Text>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            {selectedIncident.status === 'Chờ xử lý' && (
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FFA726' }]} onPress={handleAssign}>
                                    <Text style={styles.modalButtonText}>Phân công ({selectedIncident.nearestStaff?.split('-')[0].trim()})</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: getStatusColor("Hoàn thành") }]}
                                onPress={() => handleStatusUpdate("Hoàn thành")}
                            >
                                <Text style={styles.modalButtonText}>Đánh dấu Hoàn thành</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseText}>Đóng</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {/* Chỉ render Modal khi selectedIncident có dữ liệu */}
            {selectedIncident && <DetailModal />}

            <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Danh Sách Sự Cố</Text>
                <TouchableOpacity onPress={() => Alert.alert("Lọc", "Thực hiện lọc dữ liệu...")}>
                    <MaterialIcons name="filter-list" size={24} color={textColor} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={incidents}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
                renderItem={({ item }) => (
                    <View style={[styles.listItem, { backgroundColor: cardBg }]}>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                            <Text style={{ color: getStatusColor(item.status), fontWeight: '600' }}>
                                {item.status}
                            </Text>
                            <Text style={[styles.listSubtitle, { color: darkMode ? '#A0A0A0' : '#666', marginLeft: 10 }]}>Phân công: {item.assignedTo}</Text>
                        </View>
                        <Text style={[styles.listTitle, { color: textColor }]}>{item.title}</Text>
                        <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>Danh mục: {item.category}</Text>
                        <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>Ngày: {item.date}</Text>

                        <TouchableOpacity style={styles.detailButton} onPress={() => handleOpenDetail(item)}>
                            <Text style={styles.detailButtonText}>Chi tiết & Cập nhật</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    listItem: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
    },
    listTitle: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
    listSubtitle: { fontSize: 14 },
    listText: { fontSize: 14 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    detailButton: {
        alignSelf: 'flex-end',
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#007AFF',
        borderRadius: 6,
    },
    detailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '70%',
        borderRadius: 15,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 1,
        paddingBottom: 10,
        borderBottomColor: '#666',
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 22,
    },
    separator: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 15,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#666',
    },
    modalButton: {
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    modalClose: {
        alignSelf: 'flex-end',
        marginTop: 15,
        padding: 8,
    },
    modalCloseText: {
        color: '#007AFF',
        fontWeight: 'bold',
    }
});