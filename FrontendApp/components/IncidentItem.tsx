import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Incident {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'received' | 'resolved';
    createdAt: string;
    updatedAt?: string;
}

interface IncidentItemProps {
    incident: Incident;
}

export default function IncidentItem({ incident }: IncidentItemProps) {
    const getStatusText = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'Đã xử lý';
            case 'received':
                return 'Đã tiếp nhận';
            case 'pending':
            default:
                return 'Đang chờ';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return '#4CAF50';
            case 'received':
                return '#2196F3';
            case 'pending':
            default:
                return '#FF9800';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{incident.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(incident.status)}</Text>
                </View>
            </View>

            <View style={styles.dateContainer}>
                <Text style={styles.date}>{incident.createdAt}</Text>
                {incident.updatedAt && incident.status !== 'resolved' && (
                    <Text style={styles.date}> → {incident.updatedAt}</Text>
                )}
            </View>

            <Text style={styles.description}>{incident.description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 70,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});