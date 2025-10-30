import React, { useState } from "react"; // 👈 React and Hooks (useState) come from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Platform, Modal, Pressable, TextInput, ScrollView } from "react-native"; // 👈 All React Native components (View, Text, ScrollView, etc.) come from "react-native"
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


const statusBarHeight = Platform.OS === 'ios' ? 50 : 40;

export default function Support() {
    const [darkMode, setDarkMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [subject, setSubject] = useState('');
    const router = useRouter();

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#333";
    const cardBg = darkMode ? "#1E1E1E" : "#fff";
    const modalBg = darkMode ? "#282828" : "#fff";

    const handleCall = (number: string) => Linking.openURL(`tel:${number}`);

    // Xử lý Frontend: Gửi phản hồi (chỉ dùng Alert)
    const handleSendFeedback = () => {
        if (!subject || !feedback) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ Chủ đề và Nội dung phản hồi.");
            return;
        }
        Alert.alert("Thành công (Không xử lý Backend)", `Đã gửi phản hồi:\nChủ đề: ${subject}\nNội dung: ${feedback}`);
        setFeedback('');
        setSubject('');
        setModalVisible(false);
    };

    const FeedbackModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                <Pressable style={[styles.modalContent, { backgroundColor: modalBg }]} onPress={() => { }}>
                    <Text style={[styles.modalTitle, { color: textColor }]}>Gửi Phản Hồi/Báo Lỗi</Text>

                    <TextInput
                        style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
                        placeholder="Chủ đề (ví dụ: Lỗi đăng nhập, Đề xuất tính năng)"
                        placeholderTextColor={darkMode ? '#888' : '#aaa'}
                        value={subject}
                        onChangeText={setSubject}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
                        placeholder="Nội dung chi tiết phản hồi/báo cáo lỗi..."
                        placeholderTextColor={darkMode ? '#888' : '#aaa'}
                        multiline
                        numberOfLines={5}
                        value={feedback}
                        onChangeText={setFeedback}
                    />

                    <TouchableOpacity style={styles.modalSendButton} onPress={handleSendFeedback}>
                        <Text style={styles.modalButtonText}>Gửi Phản Hồi Ngay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Hủy</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <FeedbackModal />

            <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Liên Hệ Hỗ Trợ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Trung Tâm Hỗ Trợ Kỹ Thuật</Text>
                    <Text style={[styles.cardText, { color: darkMode ? '#A0A0A0' : '#888' }]}>Nếu gặp lỗi hệ thống hoặc cần hỗ trợ về code, vui lòng liên hệ:</Text>

                    <TouchableOpacity style={styles.contactItem} onPress={() => handleCall('0901234567')}>
                        <MaterialIcons name="call" size={20} color="#007AFF" />
                        <Text style={styles.contactText}>Hotline: 0901 234 567</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@app.com')}>
                        <MaterialIcons name="email" size={20} color="#007AFF" />
                        <Text style={styles.contactText}>Email: support@app.com</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Quy Trình & Tài Liệu</Text>
                    <Text style={[styles.cardText, { color: darkMode ? '#A0A0A0' : '#888' }]}>Đọc tài liệu hướng dẫn về quy trình cập nhật và xử lý sự cố chuẩn.</Text>
                    <TouchableOpacity style={styles.docButton} onPress={() => Alert.alert("Tài liệu", "Mở đường link tài liệu PDF hướng dẫn (Chức năng Frontend)")}>
                        <MaterialIcons name="description" size={18} color="#fff" />
                        <Text style={styles.docButtonText}>Xem Hướng Dẫn Vận Hành</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: cardBg }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Phản Hồi & Báo Lỗi</Text>
                    <Text style={[styles.cardText, { color: darkMode ? '#A0A0A0' : '#888' }]}>Gửi phản hồi trực tiếp đến đội ngũ phát triển về trải nghiệm sử dụng ứng dụng.</Text>
                    <TouchableOpacity style={styles.feedbackButton} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="send" size={18} color="#fff" />
                        <Text style={styles.docButtonText}>Gửi Phản Hồi Ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
    },
    cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
    cardText: { fontSize: 14, marginBottom: 15 },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactText: { fontSize: 15, marginLeft: 10, color: "#007AFF", fontWeight: '600' },
    docButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#66BB6A',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFA726',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    docButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', borderRadius: 15, padding: 20, elevation: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
    input: { height: 45, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
    textArea: { height: 100, paddingTop: 15 },
    modalSendButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalClose: { alignSelf: 'center', marginTop: 15, padding: 8 },
    modalCloseText: { color: '#EF5350', fontWeight: 'bold' },
});