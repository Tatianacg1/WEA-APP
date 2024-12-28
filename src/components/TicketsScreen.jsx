import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

const TicketsScreen = ({ route, navigation }) => {
    const { eventId, ticketsData: initialTicketsData } = route.params || {};
    const [tickets, setTickets] = useState(initialTicketsData || []);
    const [loading, setLoading] = useState(!initialTicketsData);
    const [filter, setFilter] = useState('all'); // Estado del filtro: 'all', 'checkIn', 'noCheckIn', 'checkOut'

    useEffect(() => {
        if (!initialTicketsData) {
            loadTicketsFromFile();
        }
    }, [eventId, initialTicketsData]);

    const loadTicketsFromFile = async () => {
        const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;

        try {
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);

            setTickets(jsonTickets?.eventTickets || []);
        } catch (error) {
            console.error('Error loading tickets from file:', error);
            Alert.alert('Error', 'Failed to load tickets from file');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleScanQrCode = () => {
        navigation.navigate('QrCodeScanner', { eventId });
    };

    // Filtro de tickets basado en el estado del check-in y check-out
    const getFilteredTickets = () => {
        switch (filter) {
            case 'checkIn':
                return tickets.filter((ticket) => ticket.checkIn); // Tickets con check-in
            case 'noCheckIn':
                return tickets.filter((ticket) => !ticket.checkIn); // Tickets sin check-in
            case 'checkOut':
                return tickets.filter((ticket) => ticket.checkOut); // Tickets con check-out
            default:
                return tickets; // Todos los tickets
        }
    };

    const renderTicketItem = ({ item }) => (
        <View style={styles.ticketItem}>
            <Text style={styles.ticketTitle}>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
            <Text style={styles.ticketDetails}>Email: {item.email || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Phone: {item.phone || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Check-In: {item.checkIn ? 'Yes' : 'No'}</Text>
            <Text style={styles.ticketDetails}>Check-Out: {item.checkOut ? 'Yes' : 'No'}</Text>
            <Text style={styles.ticketDetails}>Group Quantity: {item.groupQty || 'N/A'}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => handleAssignSeat(item)}
            >
                <Text style={styles.buttonText}>Assign Table/Chair</Text>
            </TouchableOpacity>
        </View>
    );

    const handleAssignSeat = (item) => {
        const eventId = item.eventId;
        if (!eventId) {
            Alert.alert('Error', 'No se encontró el ID del evento');
            return;
        }

        navigation.navigate('AssignSeatScreen', {
            eventId,
            groupId: item.groupId,
            passCode: '1234',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading tickets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Título y botón para escanear QR */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={handleScanQrCode}
                >
                    <Text style={styles.qrButtonText}>Scan QR</Text>
                </TouchableOpacity>
            </View>

            {/* Botones para alternar el filtro */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={styles.filterText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'checkIn' && styles.filterButtonActive]}
                    onPress={() => setFilter('checkIn')}
                >
                    <Text style={styles.filterText}>Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'noCheckIn' && styles.filterButtonActive]}
                    onPress={() => setFilter('noCheckIn')}
                >
                    <Text style={styles.filterText}>No Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'checkOut' && styles.filterButtonActive]}
                    onPress={() => setFilter('checkOut')}
                >
                    <Text style={styles.filterText}>Check-Out</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={getFilteredTickets()}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderTicketItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#d4fafd8f',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    qrButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    filterButton: {
        flex: 1,
        marginHorizontal: 1,
        padding: 2,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007BFF',
    },
    filterText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    ticketItem: {
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    ticketTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    ticketDetails: {
        fontSize: 14,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default TicketsScreen;
