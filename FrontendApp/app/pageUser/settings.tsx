import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [setLocation] = useState<any>(null);

    const router = useRouter();

    // 🔹 Bật/tắt chế độ tối
    const toggleDarkMode = (value: boolean) => {
        setDarkModeEnabled(value);
        Alert.alert("Chế độ hiển thị", value ? "Đã bật chế độ tối 🌙" : "Đã tắt chế độ tối ☀️");
    };

    // 🔹 Hàm xử lý bật/tắt vị trí
    const handleToggleLocation = async (value: boolean) => {
        setLocationEnabled(value);

        if (value) {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Quyền bị từ chối", "Ứng dụng không thể truy cập vị trí.");
                    setLocationEnabled(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc.coords);

                Alert.alert(
                    "Vị trí hiện tại",
                    `Vĩ độ: ${loc.coords.latitude}\nKinh độ: ${loc.coords.longitude}`
                );
            } catch (error) {
                console.error("Lỗi khi lấy vị trí:", error);
                Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
            }
        } else {
            setLocation(null);
            Alert.alert("Tắt định vị", "Bạn đã tắt quyền truy cập vị trí.");
        }
    };

    // 🔹 Hàm xử lý đăng xuất
    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem("userToken");
                        await AsyncStorage.removeItem("userInfo");
                        router.replace("/Accounts/Login");
                    } catch (error) {
                        console.error("Lỗi đăng xuất:", error);
                    }
                },
            },
        ]);
    };

    const handlePress = (screen: string) => {
        switch (screen) {
            case "Thông tin cá nhân":
                router.push("/SettingsUser/Profile");
                break;
            case "Đổi mật khẩu":
                router.push("/SettingsUser/ChangePassword");
                break;
            case "Chính sách bảo mật":
                router.push("/SettingsUser/PrivacyPolicy");
                break;
            case "Gửi phản hồi":
                router.push("/SettingsUser/Feedback");
                break;
            case "Quản lý quyền truy cập":
                router.push("/");
                break;
            case "Liên hệ hỗ trợ":
                router.push("/SettingsUser/Contact");
                break;
            default:
                Alert.alert("Thông báo", `Trang "${screen}" đang được phát triển`);
        }
    };

    // 🎨 Áp dụng giao diện sáng/tối
    const themeStyles = darkModeEnabled
        ? darkThemeStyles
        : lightThemeStyles;

    return (
        <ScrollView style={[styles.container, themeStyles.container]}>
            <Text style={[styles.title, themeStyles.text]}>Cài đặt</Text>
            <Text style={[styles.subtitle, themeStyles.subText]}>
                Tùy chỉnh ứng dụng của bạn
            </Text>

            {/* --- TÀI KHOẢN --- */}
            <View style={[styles.section, themeStyles.section]}>
                <Text style={[styles.sectionTitle, themeStyles.accentText]}>
                    Tài khoản
                </Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Thông tin cá nhân")}
                >
                    <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Thông tin cá nhân
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Đổi mật khẩu")}
                >
                    <Ionicons name="key-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Đổi mật khẩu
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- CÀI ĐẶT ỨNG DỤNG --- */}
            <View style={[styles.section, themeStyles.section]}>
                <Text style={[styles.sectionTitle, themeStyles.accentText]}>
                    Cài đặt ứng dụng
                </Text>

                <View style={styles.row}>
                    <Ionicons name="notifications-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Thông báo
                    </Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                </View>

                <View style={styles.row}>
                    <Ionicons
                        name={darkModeEnabled ? "moon" : "moon-outline"}
                        size={22}
                        color="#007AFF"
                    />
                    <Text style={[styles.rowText, themeStyles.text]}>Chế độ tối</Text>
                    <Switch
                        value={darkModeEnabled}
                        onValueChange={toggleDarkMode}
                        trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                </View>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Cho phép truy cập vị trí
                    </Text>
                    <Switch
                        value={locationEnabled}
                        onValueChange={handleToggleLocation}
                        trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                </View>
            </View>

            {/* --- BẢO MẬT --- */}
            <View style={[styles.section, themeStyles.section]}>
                <Text style={[styles.sectionTitle, themeStyles.accentText]}>
                    Bảo mật & Quyền riêng tư
                </Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Chính sách bảo mật")}
                >
                    <Ionicons name="shield-checkmark-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Chính sách bảo mật
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Quản lý quyền truy cập")}
                >
                    <Ionicons name="lock-closed-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Quản lý quyền truy cập
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- HỖ TRỢ --- */}
            <View style={[styles.section, themeStyles.section]}>
                <Text style={[styles.sectionTitle, themeStyles.accentText]}>
                    Hỗ trợ & Liên hệ
                </Text>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Gửi phản hồi")}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Gửi phản hồi
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => handlePress("Liên hệ hỗ trợ")}
                >
                    <Ionicons name="help-circle-outline" size={22} color="#007AFF" />
                    <Text style={[styles.rowText, themeStyles.text]}>
                        Liên hệ hỗ trợ
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- ĐĂNG XUẤT --- */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// --- 🌞 GIAO DIỆN SÁNG / 🌙 TỐI ---
const lightThemeStyles = StyleSheet.create({
    container: { backgroundColor: "#F8F9FA" },
    text: { color: "#222" },
    subText: { color: "#666" },
    accentText: { color: "#007AFF" },
    section: { backgroundColor: "#fff" },
});

const darkThemeStyles = StyleSheet.create({
    container: { backgroundColor: "#1E1E1E" },
    text: { color: "#fff" },
    subText: { color: "#aaa" },
    accentText: { color: "#5AA3FF" },
    section: { backgroundColor: "#2C2C2C" },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 60,
        marginHorizontal: 20,
    },
    subtitle: {
        fontSize: 15,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    section: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    rowText: {
        flex: 1,
        fontSize: 15,
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 20,
        padding: 14,
        backgroundColor: "#FF3B30",
        borderRadius: 10,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 6,
    },
});
