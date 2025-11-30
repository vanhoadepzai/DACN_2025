import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock data (same as your HomeScreen)
const mockIncidents = [
  {
    id: 1,
    title: 'Hố sâu đường',
    description: 'Đường bị hư hỏng nặng tạo thành hố sâu nguy hiểm',
    status: 'resolved',
    createdAt: '05/10/2025',
    updatedAt: '10/10/2025',
    pictureUrl: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fdantri.com.vn%2Fthoi-su%2Fho-sau-bat-ngo-xuat-hien-tren-duong-1363753344.htm&psig=AOvVaw0x2dCoanVBWeMRKBdwxePe&ust=1764575222546000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLDaqIyxmZEDFQAAAAAdAAAAABAE',
  },
  {
    id: 2,
    title: 'Cây đổ chắn đường',
    description: 'Cây xanh bị đổ sau cơn bão, chắn lối đi lại',
    status: 'pending',
    createdAt: '04/10/2025',
    updatedAt: '03/11/2025',
    pictureUrl: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2021/7/17/931491/Cay-Ba-Goc-Ha-Noi.jpg',
  },
  {
    id: 3,
    title: 'Hư hỏng mặt đường',
    description: 'Mặt đường bị nứt vỡ, cần sửa chữa kịp thời',
    status: 'received',
    createdAt: '03/10/2025',
    updatedAt: '03/11/2025',
    pictureUrl: 'https://xaydungdaithanh.vn/wp-content/uploads/2022/03/hu-hong-nut-cao-su.jpg',
  },
  {
    id: 4,
    title: 'Đèn đường hỏng',
    description: 'Đèn đường không sáng, gây nguy hiểm ban đêm',
    status: 'pending',
    createdAt: '02/10/2025',
    updatedAt: '03/11/2025',
    pictureUrl: 'https://i.pravatar.cc/200?img=4',
  },
  {
    id: 5,
    title: 'Ống nước vỡ',
    description: 'Ống nước bị vỡ, nước chảy tràn ra đường',
    status: 'received',
    createdAt: '01/10/2025',
    updatedAt: '03/11/2025',
    pictureUrl: 'https://i.pravatar.cc/200?img=5',
  },
  {
    id: 6,
    title: 'Biển báo giao thông hư',
    description: 'Biển báo giao thông bị hư hỏng, nghiêng ngả',
    status: 'resolved',
    createdAt: '30/09/2025',
    updatedAt: '10/10/2025',
    pictureUrl: 'https://i.pravatar.cc/200?img=6',
  },
];

export default function IncidentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<typeof mockIncidents[0] | null>(null);

  useEffect(() => {
    // Find the incident by id
    const incidentId = Number(id);
    const found = mockIncidents.find(item => item.id === incidentId);
    setIncident(found || null);
  }, [id]);

  if (!incident) {
    return (
      <View style={styles.centerContainer}>
        <Text>Không tìm thấy sự cố</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>

      <Image source={{ uri: incident.pictureUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.label}>Mô tả:</Text>
        <Text style={styles.description}>{incident.description}</Text>

        <Text style={styles.label}>Trạng thái:</Text>
        <Text style={styles.status}>{incident.status}</Text>

        <Text style={styles.label}>Ngày tạo:</Text>
        <Text>{incident.createdAt}</Text>

        <Text style={styles.label}>Cập nhật lần cuối:</Text>
        <Text>{incident.updatedAt}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    marginLeft: 16,
    marginTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  status: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
