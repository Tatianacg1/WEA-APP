import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { fetchPrivateEventDetails } from '../api/privateEventService';
import { BASE_URL } from '../api/config';

const AssignSeatScreen = () => {
    const route = useRoute();
    const { eventId, groupId, passCode } = route.params;

    const [parsedTablesAndChairs, setParsedTablesAndChairs] = useState([]);
    const [groupTickets, setGroupTickets] = useState([]);
    const [remainingTickets, setRemainingTickets] = useState([]);

    useEffect(() => {
        fetchTablesAndChairs();
        fetchGroupTickets();
    }, [eventId, groupId]);

    const fetchTablesAndChairs = async () => {
        try {
            const eventDetails = await fetchPrivateEventDetails(eventId);
            const parsedData = JSON.parse(eventDetails.tablesAndChairs);
            
            setParsedTablesAndChairs(parsedData);
        } catch (error) {
            console.error('Error fetching or parsing tablesAndChairs:', error);
            Alert.alert('Error', 'No se pudo obtener la información actualizada de mesas y sillas.');
        }
    };

    const fetchGroupTickets = async () => {
        try {
            const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
            const fileExists = await FileSystem.getInfoAsync(filePath);

            if (!fileExists.exists) {
                throw new Error('Archivo de tickets no encontrado');
            }

            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);
            const tickets = jsonTickets.eventTickets || [];

            const groupTickets = tickets.filter(t => t.groupId === groupId);

            const unassignedTickets = groupTickets.filter(t => !t.tableId || !t.chairId);

            setGroupTickets(groupTickets);
            setRemainingTickets(unassignedTickets);
        } catch (error) {
            console.error('Error fetching group tickets:', error);
            Alert.alert('Error', 'No se pudo obtener los tickets del grupo.');
        }
    };

    const handleSeatSelection = (tableId, chairId) => {
        if (remainingTickets.length === 0) {
            Alert.alert('Error', 'All chairs have been assigned to the group.');
            return;
        }

        const currentTicket = remainingTickets[0];

        Alert.alert(
            'Confirm Assignment',
            `Assign the chair for ${currentTicket.firstName} ${currentTicket.lastName}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: () => assignSeatToTicket(tableId, chairId, currentTicket.id),
                },
            ]
        );
    };

    const assignSeatToTicket = async (tableId, chairId, ticketId) => {


        const endpoint = `${BASE_URL}/PublicTicket/AssignChairToTicket`;
        const payload = {
            eventId,
            passCode,
            tables: [
                {
                    tableId,
                    chairs: [
                        {
                            chairId,
                            usedByTicketId: ticketId,
                        },
                    ],
                },
            ],
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Seat assigned successfully.');
                updateLocalTickets(tableId, chairId, ticketId);
            } else {
                Alert.alert('Error', result.message || 'Failed to assign seat.');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            Alert.alert('Error', 'Failed to assign seat.');
        }
    };

    const updateLocalTickets = async (tableId, chairId, ticketId) => {
        try {
            const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);

            const tickets = jsonTickets.eventTickets || [];
            const updatedTickets = tickets.map(ticket => {
                if (ticket.id === ticketId) {
                    return { ...ticket, tableId, chairId };
                }
                return ticket;
            });

            await FileSystem.writeAsStringAsync(
                filePath,
                JSON.stringify({ ...jsonTickets, eventTickets: updatedTickets }, null, 2)
            );

            const unassignedTickets = updatedTickets.filter(t => t.groupId === groupId && (!t.tableId || !t.chairId));
            setRemainingTickets(unassignedTickets);


            // Fetch updated tablesAndChairs
            fetchTablesAndChairs();
        } catch (error) {
            console.error('Error updating local tickets:', error);
            Alert.alert('Error', 'Failed to update local tickets.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Seleccionar Mesa y Silla</Text>
                <Text style={styles.counter}>Group Tickets: {groupTickets.length} &nbsp;&nbsp;&nbsp;&nbsp;Remaining Tickets: {remainingTickets.length}</Text>

            {parsedTablesAndChairs.map((table) => (
                <View key={table.tableId} style={styles.tableContainer}>
                    <Text style={styles.tableTitle}>{table.name}</Text>

                    <View style={styles.chairsContainer}>
                        {table.chairs.map((chair) => (
                            <TouchableOpacity
                                key={chair.chairId}
                                style={[
                                    styles.chairButton,
                                    chair.usedChair ? styles.chairOccupied : styles.chairAvailable,
                                ]}
                                disabled={chair.usedChair}
                                onPress={() => handleSeatSelection(table.tableId, chair.chairId)}
                            >
                                <Text style={styles.chairText}>{chair.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    counter: {
        fontSize: 16,
        marginBottom: 10,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tableContainer: {
        marginBottom: 20,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    chairsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chairButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        margin: 5,
    },
    chairAvailable: {
        backgroundColor: 'green',
    },
    chairOccupied: {
        backgroundColor: 'red',
    },
    chairText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AssignSeatScreen;