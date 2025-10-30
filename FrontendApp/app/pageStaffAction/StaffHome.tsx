import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Switch,
    Pressable,
    ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
export default function StaffHome() {
    const [darkMode, setDarkMode] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-250)).current;
    const router = useRouter();

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#222";
    const sidebarBg = darkMode ? "#1E1E1E" : "#fff";

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
            case "AssignedIncidents":
                router.push("/pageStaffAction/AssignedIncidents");
                break;
            // case "UpdateProgress":
            //     router.push("/pageStaffAction/UpdateProgress");
            //     break;
            case "Logout":
                handleLogout(); // gọi hàm đăng xuất
                break;
            default:
                break;
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: background }}>
            {/* Sidebar */}
            <Animated.View
                style={[
                    styles.sidebar,
                    { backgroundColor: sidebarBg, transform: [{ translateX: slideAnim }] },
                ]}
            >
                <Text style={[styles.sidebarTitle, { color: textColor }]}> Danh mục</Text>
                {[
                    { label: "Sự cố được giao", route: "AssignedIncidents" },
                    { label: "Đăng xuất", route: "Logout" }
                    // { label: "Cập nhật tiến độ", route: "UpdateProgress" },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.route}
                        style={styles.sidebarItem}
                        onPress={() => handleNavigate(item.route)}
                    >
                        <MaterialIcons name="chevron-right" size={18} color="#007AFF" />
                        <Text style={[styles.sidebarText, { color: textColor }]}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>

            {/* Overlay */}
            {menuOpen && <Pressable style={styles.overlay} onPress={toggleMenu} />}

            {/* Header */}
            <View style={[styles.header, { backgroundColor: background }]}>
                <TouchableOpacity onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={26} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>👷 Trang Nhân Viên</Text>
                <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
            </View>

            {/* Nội dung */}
            <ScrollView style={{ padding: 16 }}>
                <Text style={[styles.welcome, { color: textColor }]}>
                    Xin chào, nhân viên 👋
                </Text>
                <Text style={{ color: textColor, marginTop: 6 }}>
                    Bạn có 3 sự cố cần xử lý hôm nay.
                </Text>

                <View style={[styles.card, { backgroundColor: darkMode ? "#222" : "#E3F2FD" }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Đèn đường hỏng</Text>
                    <Text style={{ color: textColor }}>Phường 5, Quận 3</Text>
                    <Text style={{ color: "#007AFF", marginTop: 4 }}>Trạng thái: Đang xử lý</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    title: { fontSize: 20, fontWeight: "bold" },
    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: 250,
        paddingTop: 60,
        paddingHorizontal: 20,
        zIndex: 10,
        elevation: 10,
    },
    sidebarTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
    sidebarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    sidebarText: { fontSize: 16, marginLeft: 8 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5 },
    welcome: { fontSize: 22, fontWeight: "600" },
    card: {
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
});
