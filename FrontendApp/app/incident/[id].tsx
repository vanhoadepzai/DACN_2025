import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../constants/config';

// Define the Incident type
interface Incident {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'received' | 'resolved';
  type: number;
  typeLabel: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  pictureUrl: string;
  userId: number;
  employeeId: number;
}

export default function IncidentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const incidentTypes = [
    { label: 'Hư hỏng đường sá', value: 1 },
    { label: 'Tai nạn giao thông', value: 2 },
    { label: 'Tắc nghẽn giao thông', value: 3 },
    { label: 'Phong tỏa', value: 4 },
    { label: 'Vật cản bất ngờ', value: 5 },
  ];

  const ratingStatusMap: Record<number, 'pending' | 'received' | 'resolved'> = {
    5: 'pending',
    3: 'received',
    1: 'resolved',
  };

  const getStatusFromRating = (rating: number): 'pending' | 'received' | 'resolved' => {
    return ratingStatusMap[rating] || 'pending';
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'received': return 'Đã tiếp nhận';
      case 'resolved': return 'Đã xử lý';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'received': return '#007AFF';
      case 'resolved': return '#34C759';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/AccidentReports/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch incident');
        }

        const item = await response.json();
        const typeLabel = incidentTypes.find(t => t.value === item.type)?.label || `Loại ${item.type}`;

        const mappedIncident: Incident = {
          id: item.id,
          title: item.title || 'Không có tiêu đề',
          description: item.comment,
          type: item.type,
          typeLabel: typeLabel,
          status: getStatusFromRating(item.rating),
          location: item.location,
          createdAt: formatDate(item.createdAt),
          updatedAt: formatDate(item.updatedAt),
          pictureUrl: item.pictureUrl,
          userId: item.userId,
          employeeId: item.employeeId,
        };

        setIncident(mappedIncident);
      } catch (err) {
        console.error('Error fetching incident:', err);
        setError('Không thể tải thông tin sự cố');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !incident) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy sự cố'}</Text>
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

      {incident.pictureUrl && (
        <Image source={{ uri: incident.pictureUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{incident.title}</Text>

        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(incident.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
            {getStatusLabel(incident.status)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Loại sự cố:</Text>
          <Text style={styles.value}>{incident.typeLabel}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Mô tả:</Text>
          <Text style={styles.description}>{incident.description}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Vị trí:</Text>
          <Text style={styles.value}>{incident.location}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>{incident.createdAt}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Cập nhật lần cuối:</Text>
          <Text style={styles.value}>{incident.updatedAt}</Text>
        </View>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    marginLeft: 8,
    marginTop: 50,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});