import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  Animated,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/config";

const screenWidth = Dimensions.get("window").width;
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
  category: string;
  status: string;
  date: string;
}

// Interface for stats
interface Stats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
}

const sidebarRoutes = [
  { label: "Sự cố hiện tại", route: "Incidents" },
  { label: "Quản lí nhân viên", route: "Staff" },
  { label: "Liên hệ hỗ trợ", route: "Support" },
  { label: "Đăng xuất", route: "Logout" }
];

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("tuần");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const slideAnim = useRef(new Animated.Value(-250)).current;
  const router = useRouter();

  const background = darkMode ? "#121212" : "#fafafa";
  const textColor = darkMode ? "#fff" : "#333";
  const sidebarBg = darkMode ? "#1E1E1E" : "#fff";

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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch incidents from API
  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/AccidentReports`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data: ApiIncident[] = await response.json();

      // Calculate stats
      const newStats: Stats = {
        total: data.length,
        pending: data.filter(item => item.rating === 5).length,
        processing: data.filter(item => item.rating === 3).length,
        completed: data.filter(item => item.rating === 1).length,
      };
      setStats(newStats);

      // Map API data to display format (get latest 5 incidents)
      const sortedData = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const mappedIncidents: Incident[] = sortedData.slice(0, 5).map((item) => {
        const typeLabel = incidentTypes.find(t => t.value === item.type)?.label || `Loại ${item.type}`;
        return {
          id: item.id,
          title: item.title || 'Không có tiêu đề',
          category: typeLabel,
          status: getStatusFromRating(item.rating),
          date: formatDate(item.createdAt),
        };
      });

      setIncidents(mappedIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sự cố');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Toggle menu animation
  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            router.replace("/Accounts/Login");
          }
        }
      ]
    );
  };

  const handleNavigate = (screen: string) => {
    toggleMenu();
    switch (screen) {
      case "Incidents":
        router.push("/pageAdmin/staff/Incidents");
        break;
      case "Staff":
        router.push("/pageAdmin/staff/Staff");
        break;
      case "Support":
        router.push("/pageAdmin/staff/Support");
        break;
      case "Logout":
        handleLogout();
        break;
      default:
        Alert.alert("Thông báo", "Trang không tồn tại!");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  // Dynamic pie chart data based on real stats
  const pieData = [
    { name: "Hoàn thành", population: stats.completed || 0, color: "#66BB6A", legendFontColor: textColor, legendFontSize: 13 },
    { name: "Đang xử lý", population: stats.processing || 0, color: "#FFA726", legendFontColor: textColor, legendFontSize: 13 },
    { name: "Chờ xử lý", population: stats.pending || 0, color: "#EF5350", legendFontColor: textColor, legendFontSize: 13 },
  ];

  const chartConfig = {
    backgroundGradientFrom: background,
    backgroundGradientTo: background,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => textColor,
    decimalPlaces: 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành": return "#66BB6A";
      case "Đang xử lý": return "#FFA726";
      case "Chờ xử lý": return "#EF5350";
      default: return "#42A5F5";
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: textColor }]}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: background }}>

      {/* --- Menu trượt (Sidebar) --- */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: sidebarBg,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.sidebarTitle, { color: textColor }]}>📁 Danh mục</Text>
        {sidebarRoutes.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.sidebarItem}
            onPress={() => handleNavigate(item.route)}
          >
            <MaterialIcons name="chevron-right" size={18} color="#007AFF" />
            <Text style={[styles.sidebarText, { color: textColor }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* --- Overlay mờ khi menu mở --- */}
      {menuOpen && (
        <Pressable style={styles.overlay} onPress={toggleMenu} />
      )}

      {/* --- Thanh tiêu đề --- */}
      <View style={[styles.header, { backgroundColor: background, borderBottomColor: darkMode ? '#333' : '#eee' }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="menu" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>📊 Trang Quản Trị</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      {/* --- Nội dung chính --- */}
      <ScrollView style={styles.contentScrollView}>

        {/* --- Thẻ thống kê --- */}
        <View style={styles.statsContainer}>
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#E3F2FD" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Tổng sự cố</Text>
            <Text style={[styles.cardValue, { color: textColor }]}>{stats.total}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#FFF3E0" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Chờ xử lý</Text>
            <Text style={[styles.cardValue, { color: "#EF5350" }]}>{stats.pending}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#F3E5F5" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Đang xử lý</Text>
            <Text style={[styles.cardValue, { color: "#FFA726" }]}>{stats.processing}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#E8F5E9" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Hoàn thành</Text>
            <Text style={[styles.cardValue, { color: "#66BB6A" }]}>{stats.completed}</Text>
          </View>
        </View>

        {/* --- Biểu đồ đường --- */}
        <Text style={[styles.chartTitle, { color: textColor }]}>Sự cố theo {filter}</Text>
        <LineChart
          data={{
            labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
            datasets: [{ data: [14, 18, 21, 23, 20, 17, 12], color: () => "#42A5F5" }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />

        {/* --- Biểu đồ tròn --- */}
        <Text style={[styles.chartTitle, { color: textColor }]}>Tỷ lệ trạng thái</Text>
        {stats.total > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            chartConfig={chartConfig}
            absolute
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, { color: textColor }]}>Chưa có dữ liệu</Text>
          </View>
        )}

        {/* --- Danh sách sự cố gần đây --- */}
        <Text style={[styles.chartTitle, { color: textColor }]}>Sự cố mới nhất</Text>
        {incidents.length > 0 ? (
          <FlatList
            data={incidents}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.listItem, { backgroundColor: darkMode ? "#1E1E1E" : "#fff" }]}>
                <View style={styles.listItemHeader}>
                  <Text style={[styles.listTitle, { color: textColor }]}>{item.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={{ color: darkMode ? "#A0A0A0" : "#666", marginTop: 4 }}>{item.category}</Text>
                <Text style={{ fontSize: 12, color: darkMode ? "#666" : "#888", marginTop: 2 }}>{item.date}</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="inbox" size={48} color="#ccc" />
            <Text style={[styles.noDataText, { color: textColor }]}>Chưa có sự cố nào</Text>
          </View>
        )}

        {/* --- Nút refresh --- */}
        <TouchableOpacity
          style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>Làm mới</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 2,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  card: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardLabel: { fontSize: 14 },
  cardValue: { fontSize: 20, fontWeight: "bold", marginTop: 6 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  chart: { borderRadius: 12, marginBottom: 24 },
  listItem: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 12,
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  refreshButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    paddingTop: statusBarHeight + 20,
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 10,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  sidebarText: {
    fontSize: 16,
    marginLeft: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
});