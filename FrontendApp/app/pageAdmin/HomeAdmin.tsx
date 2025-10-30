import React, { useState, useRef } from "react";
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
  Platform, // Dùng để điều chỉnh paddingTop cho iOS/Android
} from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const statusBarHeight = Platform.OS === 'ios' ? 50 : 40; // Điều chỉnh chiều cao cho thanh trạng thái

// Định nghĩa các route cho Sidebar
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
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const router = useRouter(); //  KHỞI TẠO ROUTER

  const background = darkMode ? "#121212" : "#fafafa";
  const textColor = darkMode ? "#fff" : "#333";
  const sidebarBg = darkMode ? "#1E1E1E" : "#fff";

  // Hiệu ứng mở/đóng menu
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
            // Xóa dữ liệu lưu trữ người dùng (nếu dùng AsyncStorage)
            // import AsyncStorage từ 'react-native' nếu cần
            // await AsyncStorage.removeItem('userToken');

            // Điều hướng về màn hình login
            router.replace("/Accounts/Login"); // replace để không thể back lại dashboard
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
        handleLogout(); // gọi hàm đăng xuất
        break;
      default:
        Alert.alert("Thông báo", "Trang không tồn tại!");
    }
  };



  const incidents = [
    { id: 1, title: "Đèn đường hỏng", category: "Chiếu sáng", status: "Đang xử lý", date: "28/10/2025" },
    { id: 2, title: "Ngập nước tại Q5", category: "Ngập", status: "Chờ xử lý", date: "27/10/2025" },
    { id: 3, title: "Ổ gà trên đường", category: "Hạ tầng", status: "Đã hoàn thành", date: "25/10/2025" },
  ];

  const pieData = [
    { name: "Hoàn thành", population: 136, color: "#66BB6A", legendFontColor: textColor, legendFontSize: 13 },
    { name: "Đang xử lý", population: 8, color: "#FFA726", legendFontFontColor: textColor, legendFontSize: 13 },
    { name: "Chờ xử lý", population: 12, color: "#EF5350", legendFontColor: textColor, legendFontSize: 13 },
  ];

  const chartConfig = {
    backgroundGradientFrom: background,
    backgroundGradientTo: background,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => textColor,
    decimalPlaces: 0,
  };

  const handleRefresh = () => {
    Alert.alert("Cập nhật", "Dữ liệu đã được làm mới!");
  };

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
            onPress={() => handleNavigate(item.route)} // 👈 GỌI HÀM ĐIỀU HƯỚNG
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

      {/* --- Thanh tiêu đề (Đã cố định) --- */}
      <View style={[styles.header, { backgroundColor: background, borderBottomColor: darkMode ? '#333' : '#eee' }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="menu" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>📊 Trang Quản Trị</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      {/* --- Nội dung chính (Cuộn được) --- */}
      <ScrollView style={styles.contentScrollView}>

        {/* --- Thẻ thống kê --- */}
        <View style={styles.statsContainer}>
          {/* Thẻ 1: Tổng sự cố */}
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#E3F2FD" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Tổng sự cố</Text>
            <Text style={[styles.cardValue, { color: textColor }]}>156</Text>
          </View>
          {/* Thẻ 2: Chờ xử lý */}
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#FFF3E0" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Chờ xử lý</Text>
            <Text style={[styles.cardValue, { color: textColor }]}>12</Text>
          </View>
          {/* Thẻ 3: Đang xử lý */}
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#F3E5F5" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Đang xử lý</Text>
            <Text style={[styles.cardValue, { color: textColor }]}>8</Text>
          </View>
          {/* Thẻ 4: Hoàn thành */}
          <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#E8F5E9" }]}>
            <Text style={[styles.cardLabel, { color: darkMode ? '#ccc' : '#555' }]}>Hoàn thành</Text>
            <Text style={[styles.cardValue, { color: textColor }]}>136</Text>
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
        <LineChart
          data={{
            labels: ["Rác", "Hạ tầng", "Ngập", "Giao thông", "Chiếu sáng", "Khác"],
            datasets: [{ data: [45, 38, 25, 20, 18, 22] }],
          }}
          width={screenWidth - 32}
          height={250}
          yAxisLabel=""
          fromZero
          chartConfig={chartConfig}
          style={styles.chart}
        />


        {/* --- Biểu đồ tròn --- */}
        <Text style={[styles.chartTitle, { color: textColor }]}>Tỷ lệ trạng thái</Text>
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

        {/* --- Danh sách sự cố gần đây --- */}
        <Text style={[styles.chartTitle, { color: textColor }]}>Sự cố mới nhất</Text>
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} // Vì đã nằm trong ScrollView cha
          renderItem={({ item }) => (
            <View style={[styles.listItem, { backgroundColor: darkMode ? "#1E1E1E" : "#fff" }]}>
              <Text style={[styles.listTitle, { color: textColor }]}>{item.title}</Text>
              <Text style={{ color: darkMode ? "#A0A0A0" : "#666" }}>{item.category} - {item.status}</Text>
              <Text style={{ fontSize: 12, color: darkMode ? "#666" : "#888" }}>{item.date}</Text>
            </View>
          )}
        />

        {/* --- Nút refresh --- */}
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>Làm mới</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Đã xóa padding, sẽ dùng contentScrollView
  contentScrollView: {
    flex: 1,
    paddingHorizontal: 16, // Đặt padding ngang tại đây
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: statusBarHeight, // Điều chỉnh cho status bar
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Màu sẽ được ghi đè trong JSX
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
  cardLabel: { fontSize: 14 }, // Màu sẽ được đặt inline
  cardValue: { fontSize: 20, fontWeight: "bold", marginTop: 6 }, // Màu sẽ được đặt inline
  chartTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  chart: { borderRadius: 12, marginBottom: 24 },
  listItem: { borderRadius: 10, padding: 12, marginBottom: 8, elevation: 2 },
  listTitle: { fontSize: 16, fontWeight: "600" },
  refreshButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    paddingTop: statusBarHeight + 20, // Tăng thêm padding cho menu
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