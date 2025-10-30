import React, { useState } from "react"; // 👈 React and Hooks (useState) come from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform, Modal, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const statusBarHeight = Platform.OS === 'ios' ? 50 : 40;

// INTERFACE KHẮC PHỤC LỖI TYPESCRIPT
interface StaffMember {
    id: number;
    name: string;
    role: string;
    status: string;
    lat: number | string;
    lon: number | string;
}

// Dữ liệu giả định ban đầu
const initialStaff: StaffMember[] = [
    { id: 101, name: "Nguyễn Văn A", role: "Giám sát", status: "Đang hoạt động", lat: 10.760, lon: 106.690 },
    { id: 102, name: "Trần Thị B", role: "Kỹ thuật", status: "Nghỉ phép", lat: 10.745, lon: 106.665 },
    { id: 103, name: "Lê Văn C", role: "Hành chính", status: "Đang hoạt động", lat: 10.785, lon: 106.715 },
];

const staffRoles = ["Giám sát", "Kỹ thuật", "Hành chính"];
const staffStatuses = ["Đang hoạt động", "Nghỉ phép", "Tạm ngưng"];

export default function Staff() {
    const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
    const [darkMode, setDarkMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // Sử dụng Interface đã định nghĩa
    const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
    const router = useRouter();

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#333";
    const cardBg = darkMode ? "#1E1E1E" : "#fff";
    const modalBg = darkMode ? "#282828" : "#fff";

    const getStatusColor = (status: string) => status === "Đang hoạt động" ? "#66BB6A" : "#EF5350";

    const handleOpenModal = (staff: StaffMember | null = null) => {
        setIsEditing(!!staff);
        setCurrentStaff(staff || {
            id: staffList.length > 0 ? staffList[staffList.length - 1].id + 1 : 101, // Logic id Frontend
            name: '',
            role: 'Kỹ thuật',
            status: 'Đang hoạt động',
            lat: 0,
            lon: 0
        });
        setModalVisible(true);
    };

    // Xử lý Frontend: Thêm/Sửa nhân viên trong state
    const handleSave = () => {
        if (!currentStaff || !currentStaff.name) {
            Alert.alert("Lỗi", "Tên nhân viên không được để trống.");
            return;
        }

        if (isEditing) {
            setStaffList(prev => prev.map(s => s.id === currentStaff.id ? currentStaff : s));
            Alert.alert("Thành công", `Đã cập nhật thông tin nhân viên ${currentStaff.name}.`);
        } else {
            setStaffList(prev => [...prev, currentStaff]);
            Alert.alert("Thành công", `Đã thêm nhân viên ${currentStaff.name}.`);
        }
        setModalVisible(false);
    };

    // Xử lý Frontend: Xóa nhân viên trong state
    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc chắn muốn xóa nhân viên ${name}?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                        setStaffList(prev => prev.filter(s => s.id !== id));
                        Alert.alert("Thành công", `Đã xóa nhân viên ${name}.`);
                    }
                },
            ]
        );
    };

    const StaffModal = () => {
        if (!currentStaff) return null; // Kiểm tra null

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: modalBg }]} onPress={() => { }}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            {isEditing ? `Sửa Nhân Viên #${currentStaff.id}` : "Thêm Nhân Viên Mới"}
                        </Text>

                        <ScrollView>
                            <TextInput
                                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
                                placeholder="Tên nhân viên"
                                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                                value={currentStaff.name}
                                onChangeText={(text) => setCurrentStaff(prev => prev ? ({ ...prev, name: text }) : null)}
                            />

                            <Text style={[styles.inputLabel, { color: textColor }]}>Vai trò:</Text>
                            <View style={styles.pickerContainer}>
                                {staffRoles.map(role => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[styles.pill, { backgroundColor: currentStaff.role === role ? '#007AFF' : cardBg }]}
                                        onPress={() => setCurrentStaff(prev => prev ? ({ ...prev, role: role }) : null)}
                                    >
                                        <Text style={{ color: currentStaff.role === role ? '#fff' : textColor, fontSize: 13 }}>{role}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.inputLabel, { color: textColor }]}>Trạng thái:</Text>
                            <View style={styles.pickerContainer}>
                                {staffStatuses.map(status => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.pill, { backgroundColor: currentStaff.status === status ? getStatusColor(status) : cardBg, borderColor: currentStaff.status === status ? getStatusColor(status) : (darkMode ? '#555' : '#ddd'), borderWidth: 1 }]}
                                        onPress={() => setCurrentStaff(prev => prev ? ({ ...prev, status: status }) : null)}
                                    >
                                        <Text style={{ color: currentStaff.status === status ? '#fff' : textColor, fontSize: 13 }}>{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
                            <Text style={styles.modalButtonText}>{isEditing ? "Lưu thay đổi" : "Thêm nhân viên"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseText}>Hủy</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {currentStaff && <StaffModal />}

            <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Quản Lý Nhân Viên</Text>
                <TouchableOpacity onPress={() => handleOpenModal(null)}>
                    <MaterialIcons name="person-add" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={staffList}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
                renderItem={({ item }) => (
                    <View style={[styles.listItem, { backgroundColor: cardBg }]}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="person" size={24} color={textColor} />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={[styles.listTitle, { color: textColor }]}>{item.name} (#{item.id})</Text>
                                <Text style={[styles.listText, { color: darkMode ? '#A0A0A0' : "#888" }]}>Vai trò: {item.role}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: getStatusColor(item.status), fontSize: 13, fontWeight: 'bold' }}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenModal(item)}>
                                <MaterialIcons name="edit" size={16} color="#007AFF" />
                                <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, item.name)}>
                                <MaterialIcons name="delete" size={16} color="#EF5350" />
                                <Text style={[styles.actionButtonText, { color: '#EF5350' }]}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    listTitle: { fontSize: 18, fontWeight: "700", marginBottom: 3 },
    listText: { fontSize: 14 },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: 34,
        marginTop: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingVertical: 5,
    },
    actionButtonText: { marginLeft: 5, fontSize: 13, fontWeight: 'bold' },
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    input: { height: 45, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 10 },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
    pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 5, elevation: 1 },
    modalSaveButton: { backgroundColor: '#66BB6A', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalClose: { alignSelf: 'center', marginTop: 15, padding: 8 },
    modalCloseText: { color: '#EF5350', fontWeight: 'bold' },
});