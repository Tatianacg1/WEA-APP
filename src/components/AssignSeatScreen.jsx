import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { fetchPrivateEventDetails } from '../api/privateEventService';
import { BASE_URL } from '../api/config';
import { releaseChairFromTicket } from '../api/releaseChairFromTicket';

const AssignSeatScreen = () => {
    const route = useRoute();
    const { eventId, groupId, passCode } = route.params;

    const [parsedTablesAndChairs, setParsedTablesAndChairs] = useState([]);
    const [groupTickets, setGroupTickets] = useState([]);
    const [remainingTickets, setRemainingTickets] = useState([]);
    const [allEventTickets, setAllEventTickets] = useState([]); // Nuevo estado para almacenar todos los tickets

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

            // Guardar todos los tickets del evento
            setAllEventTickets(tickets);

            const groupTickets = tickets.filter(t => t.groupId === groupId);
            const unassignedTickets = groupTickets.filter(t => !t.tableId || !t.chairId);

            setGroupTickets(groupTickets);
            setRemainingTickets(unassignedTickets);
        } catch (error) {
            console.error('Error fetching group tickets:', error);
            Alert.alert('Error', 'No se pudo obtener los tickets del grupo.');
        }
    };

    // Función auxiliar para obtener el nombre del ocupante de la silla
    const getChairOccupantName = (usedByTicketId) => {
        const ticket = allEventTickets.find(t => t.id === usedByTicketId);
        return ticket ? ticket.firstName : '';
    };

    const removeChairFromTicket = async (tableId, chairId, usedByTicketId) => {
        try {
            console.log('[removeChairFromTicket] Attempting to release chair:', { tableId, chairId, usedByTicketId });
            const result = await releaseChairFromTicket(eventId, tableId, chairId);
            
            // Verificar si el mensaje indica éxito, independientemente de cómo se reciba
            if (result && result.message && result.message.toLowerCase().includes('successfully')) {
                console.log('[removeChairFromTicket] Chair released successfully:', result);
                await updateLocalTicketsAfterRelease(usedByTicketId);
                Alert.alert('Success', 'Chair released successfully.');
            } else {
                console.error('[removeChairFromTicket] Release failed:', result);
                Alert.alert('Error', result?.message || 'Failed to release chair.');
            }
        } catch (error) {
            console.error('[removeChairFromTicket] Error:', error);
            Alert.alert('Error', 'Failed to release chair.');
        }
    };
    
    const updateLocalTicketsAfterRelease = async (usedByTicketId) => {
        try {
            console.log('[updateLocalTicketsAfterRelease] Starting update for ticketId:', usedByTicketId);
            const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
            
            // Leer el archivo actual
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const jsonTickets = JSON.parse(fileContent);
            const tickets = jsonTickets.eventTickets || [];
    
            // Encontrar y loggear el ticket antes de la actualización
            const ticketBeforeUpdate = tickets.find(t => t.id === usedByTicketId);
            console.log('[updateLocalTicketsAfterRelease] Ticket before update:', ticketBeforeUpdate);
    
            // Actualizar el ticket
            const updatedTickets = tickets.map(ticket => {
                if (ticket.id === usedByTicketId) {
                    const updatedTicket = { ...ticket, tableId: null, chairId: null };
                    console.log('[updateLocalTicketsAfterRelease] Updated ticket:', updatedTicket);
                    return updatedTicket;
                }
                return ticket;
            });
    
            // Guardar los cambios
            await FileSystem.writeAsStringAsync(
                filePath,
                JSON.stringify({ ...jsonTickets, eventTickets: updatedTickets }, null, 2)
            );
    
            // Actualizar estados
            setAllEventTickets(updatedTickets);
            
            const updatedGroupTickets = updatedTickets.filter(t => t.groupId === groupId);
            const updatedUnassignedTickets = updatedGroupTickets.filter(t => !t.tableId || !t.chairId);
            
            console.log('[updateLocalTicketsAfterRelease] Updated counts:', {
                totalTickets: updatedTickets.length,
                groupTickets: updatedGroupTickets.length,
                unassignedTickets: updatedUnassignedTickets.length
            });
    
            setGroupTickets(updatedGroupTickets);
            setRemainingTickets(updatedUnassignedTickets);
    
            // Actualizar la vista de mesas y sillas
            await fetchTablesAndChairs();
    
        } catch (error) {
            console.error('[updateLocalTicketsAfterRelease] Error:', error);
            Alert.alert('Error', 'Failed to update local tickets after release.');
        }
    };

    const handleSeatSelection = (tableId, chairId, usedChair, usedByTicketId) => {
        if (usedChair) {
            const confirmRelease = Alert.alert(
                'Confirm Release',
                `Release the chair for ${getChairOccupantName(usedChair)} from the table?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Confirm',
                        onPress: () => removeChairFromTicket(tableId, chairId, usedByTicketId),
                    },
                ]
            );
                return;
        }

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

            // Actualizar todos los estados necesarios
            setAllEventTickets(updatedTickets);
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
            <Text style={styles.title}>Select Table and Chair</Text>
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
                            activeOpacity={0.7} // Esto da feedback táctil en móvil
                            onPress={() => handleSeatSelection(table.tableId, chair.chairId, chair.usedChair, chair.usedByTicketId)}
                        >
                            <Text 
                                style={[
                                    styles.chairText,
                                    chair.usedChair ? styles.chairTextOccupied : styles.chairTextAvailable,
                                ]}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                {chair.usedChair 
                                    ? getChairOccupantName(chair.usedByTicketId)
                                    : chair.description}
                            </Text>
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
        padding: 16,
        backgroundColor: '#f0f2f5',
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1a237e',
        textAlign: 'center',
    },
    counter: {
        fontSize: 16,
        marginBottom: 16,
        color: '#455a64',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    tableContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tableTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#37474f',
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 8,
    },
    chairsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    chairButton: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 4,
    },
    chairAvailable: {
        backgroundColor: '#4caf50',
    },
    chairOccupied: {
        backgroundColor: '#f44336',
    },
    chairText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
        width: '90%',
        paddingHorizontal: 2,
    },
    chairTextOccupied: {
        fontSize: 11,
        lineHeight: 14,
    },
    chairTextAvailable: {
        fontSize: 14,
    },
    chairButtonPressed: {
        opacity: 0.8,
    }
});

export default AssignSeatScreen;