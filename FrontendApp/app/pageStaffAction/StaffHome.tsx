import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Switch,
    Pressable,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";

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
    location: string;
    status: string;
    type: string;
    date: string;
    rating: number;
}

// Interface for User
interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    birthday: string;
    pictureUrl: string;
    role: string;
}

export default function StaffHome() {
    const [darkMode, setDarkMode] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [employeeName, setEmployeeName] = useState('Nhân viên');
    const [employeeId, setEmployeeId] = useState<number>(0);
    const [assignedIncidents, setAssignedIncidents] = useState<Incident[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0 });

    const slideAnim = useRef(new Animated.Value(-250)).current;
    const router = useRouter();

    const background = darkMode ? "#121212" : "#fafafa";
    const textColor = darkMode ? "#fff" : "#222";
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

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Hoàn thành': return '#66BB6A';
            case 'Đang xử lý': return '#FFA726';
            case 'Chờ xử lý': return '#EF5350';
            default: return '#007AFF';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Get current logged in user
    const getCurrentUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setEmployeeId(user.id);
                setEmployeeName(user.name || 'Nhân viên');
                return user.id;
            }
            return 0;
        } catch (error) {
            console.error('Error getting current user:', error);
            return 0;
        }
    };

    // Fetch incidents assigned to this employee
    const fetchAssignedIncidents = async (empId: number) => {
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

            // Filter incidents assigned to this employee
            const myIncidents = data.filter(item => item.employeeId === empId);

            // Calculate stats
            const newStats = {
                total: myIncidents.length,
                pending: myIncidents.filter(item => item.rating === 5).length,
                processing: myIncidents.filter(item => item.rating === 3).length,
                completed: myIncidents.filter(item => item.rating === 1).length,
            };
            setStats(newStats);

            // Map to display format and sort by date (newest first)
            const mappedIncidents: Incident[] = myIncidents
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(item => {
                    const typeLabel = incidentTypes.find(t => t.value === item.type)?.label || `Loại ${item.type}`;
                    return {
                        id: item.id,
                        title: item.title || 'Không có tiêu đề',
                        location: item.location,
                        status: getStatusFromRating(item.rating),
                        type: typeLabel,
                        date: formatDate(item.createdAt),
                        rating: item.rating,
                    };
                });

            setAssignedIncidents(mappedIncidents);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách sự cố');
        }
    };

    // Initial data load
    const loadData = async () => {
        setLoading(true);
        const empId = await getCurrentUser();
        if (empId) {
            await fetchAssignedIncidents(empId);
        }
        setLoading(false);
    };

    // Refresh data
    const onRefresh = async () => {
        setRefreshing(true);
        if (employeeId) {
            await fetchAssignedIncidents(employeeId);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

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
                    onPress: async () => {
                        await AsyncStorage.removeItem('currentUser');
                        router.replace("/Accounts/Login");
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
            case "Logout":
                handleLogout();
                break;
            default:
                break;
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: background }]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: background }}>
            {/* Sidebar */}
            <Animated.View
                style={[
                    styles.sidebar,
                    { backgroundColor: sidebarBg, transform: [{ translateX: slideAnim }] },
                ]}
            >
                <Text style={[styles.sidebarTitle, { color: textColor }]}>📁 Danh mục</Text>
                {[
                    { label: "Sự cố được giao", route: "AssignedIncidents" },
                    { label: "Đăng xuất", route: "Logout" }
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

            {/* Content */}
            <ScrollView
                style={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                    />
                }
            >
                {/* Welcome Section */}
                <Text style={[styles.welcome, { color: textColor }]}>
                    Xin chào, {employeeName} 👋
                </Text>
                <Text style={{ color: textColor, marginTop: 6 }}>
                    Bạn có {stats.total} sự cố được giao ({stats.pending + stats.processing} cần xử lý).
                </Text>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: darkMode ? "#222" : "#FFF3E0" }]}>
                        <Text style={[styles.statNumber, { color: '#EF5350' }]}>{stats.pending}</Text>
                        <Text style={[styles.statLabel, { color: textColor }]}>Chờ xử lý</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: darkMode ? "#222" : "#E3F2FD" }]}>
                        <Text style={[styles.statNumber, { color: '#FFA726' }]}>{stats.processing}</Text>
                        <Text style={[styles.statLabel, { color: textColor }]}>Đang xử lý</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: darkMode ? "#222" : "#E8F5E9" }]}>
                        <Text style={[styles.statNumber, { color: '#66BB6A' }]}>{stats.completed}</Text>
                        <Text style={[styles.statLabel, { color: textColor }]}>Hoàn thành</Text>
                    </View>
                </View>

                {/* Assigned Incidents Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Sự cố được giao</Text>
                    <TouchableOpacity onPress={() => router.push("/pageStaffAction/AssignedIncidents")}>
                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>

                {assignedIncidents.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: darkMode ? "#222" : "#fff" }]}>
                        <MaterialIcons name="inbox" size={48} color="#ccc" />
                        <Text style={[styles.emptyText, { color: textColor }]}>
                            Chưa có sự cố nào được giao
                        </Text>
                    </View>
                ) : (
                    assignedIncidents.slice(0, 5).map((incident) => (
                        <TouchableOpacity
                            key={incident.id}
                            style={[styles.card, { backgroundColor: darkMode ? "#222" : "#fff" }]}
                            onPress={() => router.push("/pageStaffAction/AssignedIncidents")}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
                                    {incident.title}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                                        {incident.status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardInfo}>
                                <MaterialIcons name="location-on" size={16} color="#666" />
                                <Text style={[styles.cardLocation, { color: darkMode ? '#aaa' : '#666' }]} numberOfLines={1}>
                                    {incident.location}
                                </Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <MaterialIcons name="category" size={16} color="#666" />
                                <Text style={[styles.cardType, { color: darkMode ? '#aaa' : '#666' }]}>
                                    {incident.type}
                                </Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <MaterialIcons name="schedule" size={16} color="#666" />
                                <Text style={[styles.cardDate, { color: darkMode ? '#888' : '#888' }]}>
                                    {incident.date}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyCard: {
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    cardLocation: {
        fontSize: 14,
        marginLeft: 6,
        flex: 1,
    },
    cardType: {
        fontSize: 13,
        marginLeft: 6,
    },
    cardDate: {
        fontSize: 12,
        marginLeft: 6,
    },
});