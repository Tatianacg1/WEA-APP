import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';

const TicketsScreen = ({ route, navigation }) => {
    const { eventId, ticketsData: initialTicketsData } = route.params || {};
    const [tickets, setTickets] = useState(initialTicketsData || []);
    const [loading, setLoading] = useState(!initialTicketsData);

    useEffect(() => {
        if (!initialTicketsData) {
            loadTicketsFromFile();
        }
    }, [eventId, initialTicketsData]);

    const loadTicketsFromFile = async () => {
        const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
        console.log("Loading tickets from file:", filePath);
        
        try {
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);
            
            if (!Array.isArray(jsonTickets) && typeof jsonTickets === 'object') {
                const ticketsArray = jsonTickets.tickets || jsonTickets.data || Object.values(jsonTickets)[0];
                if (Array.isArray(ticketsArray)) {
                    setTickets(ticketsArray);
                } else {
                    setTickets([jsonTickets]);
                }
            } else if (Array.isArray(jsonTickets)) {
                setTickets(jsonTickets);
            }
        } catch (error) {
            console.error('Error loading tickets from file:', error);
            Alert.alert('Error', 'Failed to load tickets from file');
        } finally {
            setLoading(false);
        }
    };

    const renderTicketItem = ({ item }) => (
        <View style={styles.ticketItem}>
            <Text style={styles.ticketTitle}>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
            <Text style={styles.ticketDetails}>Email: {item.email || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Phone: {item.phone || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Ticket Status: {item.ticketStatus === 1 ? 'Active' : 'Inactive'}</Text>
            <Text style={styles.ticketDetails}>Group Quantity: {item.paymentType || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Event: {item.event?.name || 'N/A'}</Text>
            <Text style={styles.ticketDetails}>Total Amount: ${item.totalAmount || '0.00'}</Text>
            {item.qrCode && (
                <Image
                    source={{ uri: `data:image/png;base64,${item.qrCode}` }}
                    style={styles.ticketImage}
                    resizeMode="contain"
                />
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading tickets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Button
                title="Scan QR Code"
                onPress={() => navigation.navigate('QrCodeScanner', { eventId })}
            />
            <FlatList
                data={tickets}
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
});

export default TicketsScreen;
