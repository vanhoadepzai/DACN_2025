import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Modal, Pressable, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "../../../constants/config";

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
  status: string;
  category: string;
  date: string;
  location: string;
  employeeId: number;
  assignedTo: string;
  priority: string;
  comment: string;
  pictureUrl: string;
  userId: number;
  rating: number;
}

// Interface for Employee
interface Employee {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  pictureUrl: string;
  role: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const router = useRouter();

  // Employee assignment states
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Cache for employee names to avoid repeated API calls (use ref to avoid stale closure)
  const employeeCacheRef = useRef<Record<number, string>>({});

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

  const getPriorityFromRating = (rating: number): string => {
    if (rating >= 5) return 'Cao';
    if (rating >= 3) return 'Trung bình';
    return 'Thấp';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  // Fetch employee name by ID
  const fetchEmployeeName = async (employeeId: number): Promise<string> => {
    if (!employeeId || employeeId === 0) {
      return 'Chưa phân công';
    }

    if (employeeCacheRef.current[employeeId]) {
      return employeeCacheRef.current[employeeId];
    }

    try {
      const response = await fetch(`${API_URL}/api/Admin/users/${employeeId}`);
      if (!response.ok) {
        return 'Không xác định';
      }
      const data = await response.json();
      const name = data.name || 'Không xác định';
      employeeCacheRef.current[employeeId] = name;
      return name;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return 'Không xác định';
    }
  };

  // Fetch all employees for assignment
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch(`${API_URL}/api/Admin/employee`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch all incidents
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/AccidentReports`);

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data: ApiIncident[] = await response.json();

      const mappedIncidents: Incident[] = await Promise.all(
        data.map(async (item) => {
          const typeLabel = incidentTypes.find(t => t.value === item.type)?.label || `Loại ${item.type}`;
          const employeeName = item.employeeId && item.employeeId !== 0
            ? await fetchEmployeeName(item.employeeId)
            : 'Chưa phân công';

          return {
            id: item.id,
            title: item.title || 'Không có tiêu đề',
            status: getStatusFromRating(item.rating),
            category: typeLabel,
            date: formatDate(item.createdAt),
            location: item.location,
            employeeId: item.employeeId || 0,
            assignedTo: employeeName,
            priority: getPriorityFromRating(item.rating),
            comment: item.comment,
            pictureUrl: item.pictureUrl,
            userId: item.userId,
            rating: item.rating,
          };
        })
      );

      setIncidents(mappedIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sự cố');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenDetail = (item: Incident) => {
    setSelectedIncident(item);
    setModalVisible(true);
  };

  // Handle "Tiếp nhận" button - open employee selection modal
  const handleTiepNhan = async () => {
    if (!selectedIncident) return;
    await fetchEmployees();
    setSelectedEmployee(null);
    setAssignModalVisible(true);
  };

  // Handle employee assignment and status update
  const handleAssignEmployee = async () => {
    if (!selectedIncident || !selectedEmployee) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhân viên để phân công');
      return;
    }

    try {
      setAssigning(true);
      const accidentId = selectedIncident.id;

      // Step 1: Update status to "Đang xử lý"
      const statusResponse = await fetch(`${API_URL}/api/Admin/accident-reports/${accidentId}/status`, {
        method: 'POST',
        headers: { 'Accept': '*/*' },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update status');
      }

      // Step 2: Assign employee to the incident
      const assignResponse = await fetch(`${API_URL}/api/Admin/assign/${accidentId}?employee=${selectedEmployee.id}`, {
        method: 'POST',
        headers: { 'Accept': '*/*' },
      });

      if (!assignResponse.ok) {
        throw new Error('Failed to assign employee');
      }

      employeeCacheRef.current[selectedEmployee.id] = selectedEmployee.name;

      // Update local state
      const updatedIncident = {
        ...selectedIncident,
        status: 'Đang xử lý',
        rating: 3,
        assignedTo: selectedEmployee.name,
        employeeId: selectedEmployee.id
      };

      setIncidents(prev => prev.map(inc =>
        inc.id === selectedIncident.id ? updatedIncident : inc
      ));
      setSelectedIncident(updatedIncident);

      // Close only the assignment modal
      setAssignModalVisible(false);
      setSelectedEmployee(null);

      Alert.alert("Thành công", `Đã tiếp nhận sự cố #${selectedIncident.id} và phân công cho ${selectedEmployee.name}.`);

    } catch (error) {
      console.error('Error assigning employee:', error);
      Alert.alert("Lỗi", "Không thể phân công nhân viên.");
    } finally {
      setAssigning(false);
    }
  };

  // Update incident status via API (for "Đánh dấu Hoàn thành")
  const handleMarkResolved = async () => {
    if (!selectedIncident) return;

    try {
      const accidentId = selectedIncident.id;
      const apiUrl = `${API_URL}/api/Admin/accident-reports/${accidentId}/status`;
      const callsNeeded = selectedIncident.rating === 5 ? 2 : 1;

      for (let i = 0; i < callsNeeded; i++) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Accept': '*/*' },
        });

        if (!response.ok) {
          throw new Error(`Failed to update status on call ${i + 1}`);
        }
      }

      const updatedIncident = { ...selectedIncident, status: 'Hoàn thành', rating: 1 };

      setIncidents(prev => prev.map(inc =>
        inc.id === selectedIncident.id ? updatedIncident : inc
      ));
      setSelectedIncident(updatedIncident);

      Alert.alert("Cập nhật", `Đã đánh dấu hoàn thành sự cố #${selectedIncident.id}.`);

    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái sự cố.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Detail Modal - Inline */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: modalBg }]} onPress={() => { }}>
            {selectedIncident && (
              <>
                <Text style={[styles.modalTitle, { color: textColor }]}>Chi Tiết Sự Cố #{selectedIncident.id}</Text>
                <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Tiêu đề: </Text>
                    {selectedIncident.title}
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Danh mục: </Text>
                    {selectedIncident.category}
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Độ ưu tiên: </Text>
                    {selectedIncident.priority}
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Trạng thái: </Text>
                    <Text style={{ color: getStatusColor(selectedIncident.status), fontWeight: 'bold' }}>
                      {selectedIncident.status}
                    </Text>
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Phân công: </Text>
                    <Text style={{ color: selectedIncident.employeeId === 0 ? '#EF5350' : '#66BB6A', fontWeight: '600' }}>
                      {selectedIncident.assignedTo}
                    </Text>
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Vị trí: </Text>
                    {selectedIncident.location}
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Mô tả: </Text>
                    {selectedIncident.comment}
                  </Text>
                  <Text style={[styles.modalText, { color: textColor }]}>
                    <Text style={styles.modalLabel}>Ngày tạo: </Text>
                    {selectedIncident.date}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedIncident.status === 'Chờ xử lý' && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#FFA726' }]}
                      onPress={handleTiepNhan}
                    >
                      <Text style={styles.modalButtonText}>Tiếp nhận</Text>
                    </TouchableOpacity>
                  )}
                  {selectedIncident.status !== 'Hoàn thành' && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: getStatusColor("Hoàn thành") }]}
                      onPress={handleMarkResolved}
                    >
                      <Text style={styles.modalButtonText}>Đánh dấu Hoàn thành</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Assign Employee Modal - Inline */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAssignModalVisible(false)}>
          <Pressable style={[styles.assignModalContent, { backgroundColor: modalBg }]} onPress={() => { }}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Phân công nhân viên</Text>

            {loadingEmployees ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, { color: textColor }]}>Đang tải danh sách nhân viên...</Text>
              </View>
            ) : employees.length === 0 ? (
              <View style={styles.emptyEmployeeContainer}>
                <MaterialIcons name="person-off" size={48} color="#ccc" />
                <Text style={[styles.emptyText, { color: textColor }]}>Không có nhân viên nào</Text>
              </View>
            ) : (
              <ScrollView style={styles.employeeList}>
                {employees.map((employee) => (
                  <TouchableOpacity
                    key={employee.id}
                    style={[
                      styles.employeeItem,
                      selectedEmployee?.id === employee.id && styles.employeeItemSelected
                    ]}
                    onPress={() => setSelectedEmployee(employee)}
                  >
                    <View style={styles.employeeInfo}>
                      <View style={styles.employeeAvatar}>
                        <Text style={styles.employeeAvatarText}>
                          {employee.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.employeeDetails}>
                        <Text style={[styles.employeeName, { color: textColor }]}>{employee.name}</Text>
                        <Text style={[styles.employeeEmail, { color: darkMode ? '#aaa' : '#666' }]}>{employee.email}</Text>
                        <Text style={[styles.employeePhone, { color: darkMode ? '#aaa' : '#666' }]}>{employee.phoneNumber}</Text>
                      </View>
                    </View>
                    {selectedEmployee?.id === employee.id && (
                      <MaterialIcons name="check-circle" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.assignModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setAssignModalVisible(false);
                  setSelectedEmployee(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.assignButton,
                  (!selectedEmployee || assigning) && styles.assignButtonDisabled
                ]}
                onPress={handleAssignEmployee}
                disabled={!selectedEmployee || assigning}
              >
                {assigning ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.assignButtonText}>Phân công</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#333' : '#eee' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Danh Sách Sự Cố</Text>
        <TouchableOpacity onPress={fetchIncidents}>
          <MaterialIcons name="refresh" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={64} color="#ccc" />
          <Text style={[styles.emptyText, { color: textColor }]}>Chưa có sự cố nào</Text>
        </View>
      ) : (
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
              </View>
              <Text style={[styles.listTitle, { color: textColor }]}>{item.title}</Text>
              <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>Danh mục: {item.category}</Text>
              <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>Vị trí: {item.location}</Text>
              <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>Ngày: {item.date}</Text>
              <Text style={[styles.listText, { color: darkMode ? '#ccc' : '#888' }]}>
                Phân công: <Text style={{ fontWeight: '600', color: item.employeeId === 0 ? '#EF5350' : '#66BB6A' }}>
                  {item.assignedTo}
                </Text>
              </Text>

              <TouchableOpacity style={styles.detailButton} onPress={() => handleOpenDetail(item)}>
                <Text style={styles.detailButtonText}>Chi tiết & Cập nhật</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmployeeContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
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
  listText: { fontSize: 14, marginTop: 2 },
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
  assignModalContent: {
    width: '90%',
    maxHeight: '80%',
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
  modalLabel: {
    fontWeight: '600',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
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
  },
  employeeList: {
    maxHeight: 300,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  employeeItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    marginBottom: 1,
  },
  employeePhone: {
    fontSize: 12,
  },
  assignModalActions: {
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
  assignButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  assignButtonDisabled: {
    backgroundColor: '#ccc',
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});