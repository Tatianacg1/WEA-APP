import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

const TicketsScreen = ({ route, navigation }) => {
    const { eventId, ticketsData: initialTicketsData } = route.params || {};
    const [tickets, setTickets] = useState(initialTicketsData || []);
    const [loading, setLoading] = useState(!initialTicketsData);
    const [tablesAndChairs, setTablesAndChairs] = useState(initialTicketsData?.tablesAndChairs);

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
            setTablesAndChairs(jsonTickets.tablesAndChairs);

            const ticketsArray = jsonTickets || [];

            if (ticketsArray) {
                setTickets(ticketsArray);
            } else {
                console.warn('No tickets found in the file');
                setTickets([]);
            }
        } catch (error) {
            console.error('Error loading tickets from file:', error);
            Alert.alert('Error', 'Failed to load tickets from file');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const renderTicketItem = ({ item }) => (
        item.groupMain && (
            <View style={styles.ticketItem}>
                <Text style={styles.ticketTitle}>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
                <Text style={styles.ticketDetails}>Email: {item.email || 'N/A'}</Text>
                <Text style={styles.ticketDetails}>Phone: {item.phone || 'N/A'}</Text>
                <Text style={styles.ticketDetails}>Ticket Status: {item.ticketStatus === 1 ? 'Active' : 'Inactive'}</Text>
                <Text style={styles.ticketDetails}>Group Quantity: {item.groupQty || 'N/A'}</Text>
                <Text style={styles.ticketDetails}>Payment Type: {item.paymentType || 'N/A'}</Text>
                <Text style={styles.ticketDetails}>Event: {item.title || 'N/A'}</Text>
                <Text style={styles.ticketDetails}>Total Amount: ${item.totalAmount || '0.00'}</Text>
                {item.qrCode && (
                    <Image
                        source={{ uri: `data:image/png;base64,${item.qrCode}` }}
                        style={styles.ticketImage}
                        resizeMode="contain"
                    />
                )}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleAssignSeat(item)}
                >
                    <Text style={styles.buttonText}>Assign Table/Chair</Text>
                </TouchableOpacity>

            </View>
        )
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
            passCode: "1234",
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
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QrCodeScanner', { eventId, tablesAndChairs })}
            >
                <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
            <FlatList
                data={tickets.eventTickets.filter(item => item.groupMain)}
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
    listContainer: {
        paddingBottom: 20,
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
    ticketImage: {
        width: 150,
        height: 150,
        marginTop: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    }
});

export default TicketsScreen;
