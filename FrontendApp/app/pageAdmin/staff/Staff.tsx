import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform, Modal, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../../constants/config";

const statusBarHeight = Platform.OS === 'ios' ? 50 : 40;

// Interface for API response
interface ApiUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  pictureUrl: string;
  role: string;
}

// Interface for display
interface StaffMember {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  pictureUrl: string;
  role: string;
  status: string;
}

export default function Staff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields as separate state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthday, setFormBirthday] = useState('');

  const router = useRouter();

  const background = darkMode ? "#121212" : "#fafafa";
  const textColor = darkMode ? "#fff" : "#333";
  const cardBg = darkMode ? "#1E1E1E" : "#fff";
  const modalBg = darkMode ? "#282828" : "#fff";

  // Fetch all users and filter employees (role = "1")
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/Admin/users`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: ApiUser[] = await response.json();

      // Filter only employees (role = "1")
      const employees = data
        .filter(user => user.role === "1")
        .map(user => ({
          ...user,
          status: 'Đang hoạt động',
        }));

      setStaffList(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Open info modal
  const handleOpenInfo = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setInfoModalVisible(true);
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormBirthday('');
    setAddModalVisible(true);
  };

  // Close add modal
  const handleCloseAddModal = () => {
    setAddModalVisible(false);
  };

  // Add new employee
  const handleAddEmployee = async () => {
    if (!formName || !formEmail || !formPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Email, Mật khẩu)');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Register new user
      const registerResponse = await fetch(`${API_URL}/api/Users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phoneNumber: formPhone || '',
          birthday: formBirthday || '',
          pictureUrl: '',
          password: formPassword,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.text();
        throw new Error(errorData || 'Failed to register user');
      }

      const registeredUser = await registerResponse.json();
      const newUserId = registeredUser.id;

      // Step 2: Change role to employee (role = "1")
      const roleResponse = await fetch(`${API_URL}/api/Admin/users/${newUserId}/role?newRole=1`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!roleResponse.ok) {
        throw new Error('Failed to set employee role');
      }

      Alert.alert('Thành công', `Đã thêm nhân viên ${formName}`);
      setAddModalVisible(false);
      fetchEmployees();

    } catch (error: any) {
      console.error('Error adding employee:', error);
      Alert.alert('Lỗi', error.message || 'Không thể thêm nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete employee
  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa nhân viên ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/Admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                  'Accept': '*/*',
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete user');
              }

              Alert.alert('Thành công', `Đã xóa nhân viên ${name}`);
              fetchEmployees();

            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Lỗi', 'Không thể xóa nhân viên');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: textColor }]}>Đang tải danh sách nhân viên...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Information Modal - Inline */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setInfoModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: modalBg }]} onPress={() => {}}>
            {selectedStaff && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Thông tin nhân viên</Text>
                  <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                </View>

                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {selectedStaff.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.statusIndicator} />
                </View>

                <ScrollView style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="badge" size={20} color="#007AFF" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>ID</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>#{selectedStaff.id}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="person" size={20} color="#007AFF" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Họ và tên</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>{selectedStaff.name}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="email" size={20} color="#007AFF" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Email</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>{selectedStaff.email}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={20} color="#007AFF" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Số điện thoại</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>{selectedStaff.phoneNumber || 'Chưa cập nhật'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="cake" size={20} color="#007AFF" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Ngày sinh</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>{selectedStaff.birthday || 'Chưa cập nhật'}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="circle" size={20} color="#66BB6A" />
                    <View style={styles.infoContent}>
                      <Text style={[styles.infoLabel, { color: darkMode ? '#aaa' : '#666' }]}>Trạng thái</Text>
                      <Text style={[styles.infoValue, { color: '#66BB6A' }]}>{selectedStaff.status}</Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setInfoModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Employee Modal - Inline */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={handleCloseAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Thêm nhân viên mới</Text>
              <TouchableOpacity onPress={handleCloseAddModal}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
              <Text style={[styles.inputLabel, { color: textColor }]}>Họ và tên *</Text>
              <TextInput
                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f5f5f5' }]}
                placeholder="Nhập họ và tên"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.inputLabel, { color: textColor }]}>Email *</Text>
              <TextInput
                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f5f5f5' }]}
                placeholder="Nhập email"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formEmail}
                onChangeText={setFormEmail}
              />

              <Text style={[styles.inputLabel, { color: textColor }]}>Mật khẩu *</Text>
              <TextInput
                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f5f5f5' }]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                secureTextEntry
                value={formPassword}
                onChangeText={setFormPassword}
              />

              <Text style={[styles.inputLabel, { color: textColor }]}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f5f5f5' }]}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                keyboardType="phone-pad"
                value={formPhone}
                onChangeText={setFormPhone}
              />

              <Text style={[styles.inputLabel, { color: textColor }]}>Ngày sinh</Text>
              <TextInput
                style={[styles.input, { borderColor: darkMode ? '#555' : '#ddd', color: textColor, backgroundColor: darkMode ? '#333' : '#f5f5f5' }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
                value={formBirthday}
                onChangeText={setFormBirthday}
              />
            </ScrollView>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseAddModal}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleAddEmployee}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Thêm nhân viên</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Quản Lý Nhân Viên</Text>
        <TouchableOpacity onPress={handleOpenAddModal}>
          <MaterialIcons name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Employee count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, { color: textColor }]}>
          Tổng số nhân viên: <Text style={styles.countNumber}>{staffList.length}</Text>
        </Text>
        <TouchableOpacity onPress={fetchEmployees}>
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {staffList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="people-outline" size={64} color="#ccc" />
          <Text style={[styles.emptyText, { color: textColor }]}>Chưa có nhân viên nào</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={handleOpenAddModal}>
            <Text style={styles.addFirstButtonText}>Thêm nhân viên đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.listItem, { backgroundColor: cardBg }]}>
              <View style={styles.listItemHeader}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.staffInfo}>
                  <Text style={[styles.listTitle, { color: textColor }]}>{item.name}</Text>
                  <Text style={[styles.listText, { color: darkMode ? '#A0A0A0' : "#888" }]}>{item.email}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenInfo(item)}>
                  <MaterialIcons name="info" size={18} color="#007AFF" />
                  <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Thông tin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, item.name)}>
                  <MaterialIcons name="delete" size={18} color="#EF5350" />
                  <Text style={[styles.actionButtonText, { color: '#EF5350' }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  countText: {
    fontSize: 14,
  },
  countNumber: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
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
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  staffInfo: {
    flex: 1,
  },
  listTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  listText: { fontSize: 13, marginBottom: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#66BB6A',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#66BB6A',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionButtonText: { marginLeft: 5, fontSize: 13, fontWeight: 'bold' },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#66BB6A',
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoContainer: {
    maxHeight: 250,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Add Modal Styles
  formContainer: {
    maxHeight: 350,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#66BB6A',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});