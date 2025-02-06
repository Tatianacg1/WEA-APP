import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const TicketsScreen = ({ route, navigation }) => {
    const { eventId, ticketsData: initialTicketsData } = route.params || {};
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTickets();
    }, [eventId]);

    const loadTickets = async () => {
        setLoading(true);

        try {
            // Si hay datos iniciales, úsalos
            if (initialTicketsData && initialTicketsData.length > 0) {
                setTickets(initialTicketsData);
                return;
            }

            // Si no hay datos iniciales, intenta cargar desde el archivo
            const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
            const fileExists = await FileSystem.getInfoAsync(filePath);

            if (!fileExists.exists) {
                setTickets([]);
                return;
            }

            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);

            if (jsonTickets?.eventTickets) {
                setTickets(jsonTickets.eventTickets);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
            Alert.alert(
                'Error',
                'No se pudieron cargar los tickets. Por favor, intente nuevamente.',
                [{ text: 'OK' }]
            );
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleScanQrCode = () => {
        navigation.navigate('QrCodeScanner', { eventId });
    };

    const getFilteredTickets = () => {
        switch (filter) {
            case 'checkIn':
                return tickets.filter((ticket) => ticket.checkIn);
            case 'noCheckIn':
                return tickets.filter((ticket) => !ticket.checkIn);
            case 'checkOut':
                return tickets.filter((ticket) => ticket.checkOut);
            default:
                return tickets;
        }
    };

    const exportTicketsToCSV = async () => {
        if (tickets.length === 0) {
            Alert.alert('No hay tickets para exportar.');
            return;
        }

        const csvHeaders = [
            'Ticket Buyer', 'Ticket Status', 'First Name', 'Last Name', 'Email', 'Phone', 'Dates',
            'Parking Method', 'Parking Slot', 'Key Slot', 'Payment By', 'Created By', 'Created At', 'Check-In',
            'Check-In Date', 'Check-Out', 'Check-Out Date', 'Group Quantity', 'Rooms', 'Has Combo', 'Combo Name',
            'Combo Description', 'Coupon Code Used', 'Ticket Price', 'Total Amount'
        ].join(';');

        const csvRows = tickets.map(ticket => [
            ticket.groupMain ? 'Yes' : 'No',
            ticket.ticketStatus === 1 ? 'Active' : 'Inactive',
            `"${ticket.firstName || ''}"`,
            `"${ticket.lastName || ''}"`,
            `"${ticket.email || ''}"`,
            `"${ticket.phone || ''}"`,
            `"${ticket.dates || ''}"`,
            `"${ticket.parkingMethod || ''}"`,
            `"${ticket.parkingSlot || ''}"`,
            `"${ticket.keySlot || ''}"`,
            `"${ticket.paymentType || ''}"`,
            `"${ticket.createdBy || ''}"`,
            `"${ticket.createdAt || ''}"`,
            ticket.checkIn ? 'Yes' : 'No',
            `"${ticket.checkIn || ''}"`,
            ticket.checkOut ? 'Yes' : 'No',
            `"${ticket.checkOut || ''}"`,
            `"${ticket.groupQty || '1'}"`,
            `"${ticket.rooms || ''}"`,
            ticket.hasCombo ? 'Yes' : 'No',
            `"${ticket.selectedComboName || ''}"`,
            `"${ticket.selectedComboDescription || ''}"`,
            `"${ticket.paymentRecordId || ''}"`,
            `"${ticket.ticketPrice || ''}"`,
            `"${ticket.totalAmount || ''}"`
        ].join(';'));

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        const eventName = tickets[0]?.title?.replace(/\s+/g, '_') || 'Event';
        const filePath = `${FileSystem.documentDirectory}${eventName}_tickets_export.csv`;

        try {
            await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('No se puede compartir el archivo en este dispositivo.');
                return;
            }

            await Sharing.shareAsync(filePath);
        } catch (error) {
            console.error('Error exportando CSV:', error);
            Alert.alert('Error', 'No se pudo exportar el archivo CSV.');
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
        if (!item.eventId) {
            Alert.alert('Error', 'No se encontró el ID del evento');
            return;
        }

        navigation.navigate('AssignSeatScreen', {
            eventId: item.eventId,
            groupId: item.groupId,
            passCode: '1234',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Cargando tickets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={handleScanQrCode}
                >
                    <Text style={styles.qrButtonText}>Scan QR</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={exportTicketsToCSV}>
                    <Text style={styles.buttonText}>Export Data</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'checkIn' && styles.filterButtonActive]}
                    onPress={() => setFilter('checkIn')}
                >
                    <Text style={[styles.filterText, filter === 'checkIn' && styles.filterTextActive]}>Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'noCheckIn' && styles.filterButtonActive]}
                    onPress={() => setFilter('noCheckIn')}
                >
                    <Text style={[styles.filterText, filter === 'noCheckIn' && styles.filterTextActive]}>No Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'checkOut' && styles.filterButtonActive]}
                    onPress={() => setFilter('checkOut')}
                >
                    <Text style={[styles.filterText, filter === 'checkOut' && styles.filterTextActive]}>Check-Out</Text>
                </TouchableOpacity>
            </View>

            {tickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay tickets disponibles</Text>
                </View>
            ) : (
                <FlatList
                    data={getFilteredTickets()}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderTicketItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
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
    filterTextActive: {
        color: '#ffffff',
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