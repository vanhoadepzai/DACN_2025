import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/config';
import { ThemeProvider } from "../SettingsUser/light_black";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number } | null>(null);

  const incidentTypes = [
    { label: 'Hư hỏng đường sá', value: 1 },
    { label: 'Tai nạn giao thông', value: 2 },
    { label: 'Tắc nghẽn giao thông', value: 3 },
    { label: 'Phong tỏa', value: 4 },
    { label: 'Vật cản bất ngờ', value: 5 },
  ];

  // Load logged-in user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('currentUser');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      }
    };
    loadUser();
  }, []);

  // Camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập camera để chụp ảnh.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Gallery
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập thư viện để chọn ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    if (!formData.type || !formData.title || !formData.description || !formData.address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!imageUri) {
      Alert.alert('Lỗi', 'Vui lòng thêm ảnh.');
      return;
    }

    setLoading(true);

    try {
        const form = new FormData();
        form.append('UserId', user.id.toString());
        form.append('Title', formData.title);
        form.append('Type', formData.type);
        form.append('Location', formData.address);
        form.append('Comment', formData.description);
        form.append('Rating', '5');

      const filename = imageUri.split('/').pop(); // extract filename
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      form.append('Picture', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_URL}/api/AccidentReports/upload`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }, // DO NOT set Content-Type
        body: form,
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Báo cáo đã được gửi thành công', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Gửi báo cáo thất bại');
      }
    } catch (error) {
      console.error('Submit error:', error);
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
                key={type.value}
                style={[
                    styles.typeButton,
                    formData.type === type.value && styles.typeButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, type: type.value })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.value && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.label}
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
            <TouchableOpacity style={styles.photoButton} onPress={openCamera}>
              <Text style={styles.photoButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={openGallery}>
              <Text style={styles.photoButtonText}>Từ thư viện</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 100, height: 100, marginTop: 12, borderRadius: 8 }}
            />
          )}


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