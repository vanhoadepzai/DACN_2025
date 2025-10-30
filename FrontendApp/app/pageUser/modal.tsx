import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/config';
import { ThemeProvider } from "../SettingsUser/light_black";
export default function ReportModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const incidentTypes = [
    'Hư hỏng đường sá',
    'Mất điện',
    'Cấp nước',
    'Vệ sinh môi trường',
    'Cây xanh',
    'Khác'
  ];

  const handleSubmit = async () => {
    if (!formData.type || !formData.title || !formData.description || !formData.address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Báo cáo đã được gửi thành công', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        throw new Error('Gửi báo cáo thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo Sự cố Mới</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Loại sự cố */}
          <Text style={styles.label}>Loại sự cố *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tiêu đề */}
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề sự cố..."
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          {/* Mô tả */}
          <Text style={styles.label}>Mô tả sự cố *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết sự cố tại đây..."
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          {/* Ảnh/Video */}
          <Text style={styles.label}>Thêm ảnh/video</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>Từ thư viện</Text>
            </TouchableOpacity>
          </View>

          {/* Địa chỉ */}
          <Text style={styles.label}>Địa chỉ cụ thể *</Text>
          <TextInput
            style={styles.input}
            placeholder="Đường Nguyễn Huệ, Quận 1, TP.HCM"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />

          {/* Nút gửi */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang gửi...' : 'Gửi Báo Cáo'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 60 : 12,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    marginBottom: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});