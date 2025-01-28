import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    StyleSheet, 
    ActivityIndicator 
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';

const DownloadedTicketsScreen = () => {
    const [downloadedEvents, setDownloadedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        loadDownloadedEvents();
    }, []);

    const loadDownloadedEvents = async () => {
        try {
            const fileUri = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            const eventFiles = fileUri.filter(filename => filename.startsWith('tickets_') && filename.endsWith('.json'));

            const events = [];
            for (const filename of eventFiles) {
                const eventId = filename.split('_')[1].split('.')[0];
                const filePath = `${FileSystem.documentDirectory}${filename}`;

                try {
                    const fileContent = await FileSystem.readAsStringAsync(filePath);
                    const jsonTickets = JSON.parse(fileContent);

                    if (Array.isArray(jsonTickets.eventTickets) && jsonTickets.eventTickets.length > 0) {
                        const eventName = jsonTickets?.name || 'Unknown Event';
                        events.push({ eventId, eventName, filePath });
                    }
                } catch (error) {
                    console.warn(`Error reading file for event ${eventId}:`, error);
                }
            }
            setDownloadedEvents(events);
        } catch (error) {
            Alert.alert('Error', 'Failed to load downloaded events');
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (filePath, eventId) => {
        Alert.alert(
            'Eliminar Evento',
            `¿Estás seguro de que deseas eliminar el evento con ID ${eventId}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(filePath);
                            setDownloadedEvents(prevEvents => prevEvents.filter(event => event.eventId !== eventId));
                            Alert.alert('Success', 'Event deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete event');
                        }
                    },
                },
            ],
        );
    };

    const navigateToQrCodeScanner = (eventId) => {
        navigation.navigate('TicketsScreen', { eventId });
    };

    const renderEventItem = ({ item }) => (
        <View style={styles.eventItemContainer}>
            <TouchableOpacity
                style={styles.eventItem}
                onPress={() => navigateToQrCodeScanner(item.eventId)}
            >
                <Text style={styles.eventName}>{item.eventName}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteEvent(item.filePath, item.eventId)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading downloaded tickets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {downloadedEvents.length > 0 ? (
                <FlatList
                    data={downloadedEvents}
                    keyExtractor={(item) => item.eventId}
                    renderItem={renderEventItem}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.noTicketsText}>No downloaded tickets found.</Text>
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
    listContainer: {
        paddingBottom: 20,
    },
    eventItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    eventItem: {
        flex: 1,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        marginRight: 10,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: '#ff4d4d',
        padding: 15,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    noTicketsText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
});

export default DownloadedTicketsScreen;