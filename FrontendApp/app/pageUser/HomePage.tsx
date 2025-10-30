import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import IncidentItem, { Incident } from '../../components/IncidentItem';
import { TextInput } from 'react-native';
export default function HomeScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const mockData: Incident[] = [
    {
      id: 1,
      title: 'Hố sâu đường',
      description: 'Đường bị hư hỏng nặng tạo thành hố sâu nguy hiểm',
      status: 'resolved',
      createdAt: '05/10/2025',
      updatedAt: '10/10/2025'
    },
    {
      id: 2,
      title: 'Cây đổ chắn đường',
      description: 'Cây xanh bị đổ sau cơn bão, chắn lối đi lại',
      status: 'pending',
      createdAt: '04/10/2025',
      updatedAt: '03/11/2025'
    },
    {
      id: 3,
      title: 'Hư hỏng mặt đường',
      description: 'Mặt đường bị nứt vỡ, cần sửa chữa kịp thời',
      status: 'received',
      createdAt: '03/10/2025',
      updatedAt: '03/11/2025'
    },
    // THÊM NHIỀU DATA ĐỂ TEST SCROLL
    {
      id: 4,
      title: 'Đèn đường hỏng',
      description: 'Đèn đường không sáng, gây nguy hiểm ban đêm',
      status: 'pending',
      createdAt: '02/10/2025',
      updatedAt: '03/11/2025'
    },
    {
      id: 5,
      title: 'Ống nước vỡ',
      description: 'Ống nước bị vỡ, nước chảy tràn ra đường',
      status: 'received',
      createdAt: '01/10/2025',
      updatedAt: '03/11/2025'
    },
    {
      id: 6,
      title: 'Biển báo giao thông hư',
      description: 'Biển báo giao thông bị hư hỏng, nghiêng ngả',
      status: 'resolved',
      createdAt: '30/09/2025',
      updatedAt: '10/10/2025'
    }
  ];

  const fetchIncidents = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      // Simulate API call
      setTimeout(() => {
        setIncidents(mockData);
        setLoading(false);
        setRefreshing(false);
      }, 1000);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setIncidents(mockData);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents(true);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const navigateToReport = () => {
    router.push('/pageUser/modal');
  };

  const navigateToIncidentDetail = (incidentId: number) => {
    router.push(`/incident/${incidentId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự cố..."
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Section: Sự cố của tôi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sự cố của tôi</Text>

          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <TouchableOpacity
                key={incident.id}
                onPress={() => navigateToIncidentDetail(incident.id)}
              >
                <IncidentItem incident={incident} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={navigateToReport}
              >
                <Text style={styles.reportButtonText}>Tạo báo cáo đầu tiên</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Quick Action Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Báo cáo sự cố mới</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={navigateToReport}
            >
              <View style={styles.quickActionIcon}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
              <Text style={styles.quickActionText}>Báo cáo mới</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.icon}>📷</Text>
              </View>
              <Text style={styles.quickActionText}>Chụp ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}
              onPress={() => router.push("/SettingsUser/LocationSelectScreen")}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.icon}>📍</Text>
              </View>
              <Text style={styles.quickActionText}>Vị trí</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{incidents.length}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {incidents.filter(i => i.status === 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>Đã xử lý</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {incidents.filter(i => i.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Đang chờ</Text>
          </View>
        </View>

        {/* Thêm khoảng trống cuối để không bị tab bar che */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1, // ← QUAN TRỌNG: cho phép scroll khi content dài
    paddingBottom: 100, // ← Thêm padding để tránh bị tab bar che
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  reportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  plusIcon: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '300',
  },
  icon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 50, // ← Thêm khoảng trống cuối cùng
  },
});