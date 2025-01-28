import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/eventsStyles';
import { Ionicons } from '@expo/vector-icons';
import { fetchEventsDetails } from '../api/eventsService';

// Mover la función formatDate fuera del componente para que esté disponible globalmente
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const EventsScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(true);
    const [ownerEmail, setOwnerEmail] = useState('');
    const [filteredByEmail, setFilteredByEmail] = useState([]);

    useEffect(() => {
        const getEventsDetails = async () => {
            try {
                const data = await fetchEventsDetails();
                if (data && data.length > 0) {
                    setEvents(data);
                    setFilteredByEmail(data); // Inicializar filteredByEmail con todos los eventos
                } else {
                    Alert.alert('No Events', 'No events are currently available.', [{ text: 'OK' }]);
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
                Alert.alert('Error', 'Could not load events. Please try again.', [{ text: 'OK' }]);
            }
        };
        getEventsDetails();
    }, []);

    const handleEmailFilter = () => {
        const filteredEvents = events.filter(event => 
            event.organizerEmail?.toLowerCase() === ownerEmail.trim().toLowerCase()
        );
        setFilteredByEmail(filteredEvents);
        setShowEmailModal(false);
    };

    const handleSkipEmail = () => {
        setFilteredByEmail(events);
        setShowEmailModal(false);
    };

    const filteredEvents = filteredByEmail.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(event.eventStartDate).includes(searchTerm) ||
        formatDate(event.eventEndDate).includes(searchTerm)
    );

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setSearchTerm(formatDate(currentDate));
    };

    // Resto del código del componente permanece igual...
    return (
        <View style={styles.container}>
            {/* Email Modal */}
            <Modal visible={showEmailModal} transparent animationType="slide">
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.modalContainer}>
                        <Text style={modalStyles.title}>Enter Owner Email</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Enter email..."
                            value={ownerEmail}
                            onChangeText={setOwnerEmail}
                            keyboardType="email-address"
                        />
                        <View style={modalStyles.buttonContainer}>
                            <TouchableOpacity style={modalStyles.button} onPress={handleEmailFilter}>
                                <Text style={modalStyles.buttonText}>Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={modalStyles.button} onPress={handleSkipEmail}>
                                <Text style={modalStyles.buttonText}>Skip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Search Container */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search events by name or date..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={24} color="gray" style={styles.calendarIcon} />
                </TouchableOpacity>
            </View>

            {/* Native Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour
                    display="default"
                    onChange={onDateChange}
                />
            )}
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() => setShowEmailModal(true)}
                >
                    <Text style={styles.ticketButtonText}>Enter Owner Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() => navigation.navigate('DownloadedTicketsScreen')}
                >
                    <Text style={styles.ticketButtonText}>Tickets Descargados</Text>
                </TouchableOpacity>
            </View>

            {/* Events List */}
            <ScrollView>
                {filteredEvents.map(event => (
                    <View key={event.id} style={styles.card}>
                        <View style={styles.cardCont}>
                            <TouchableOpacity onPress={() => navigation.navigate('EventDetailsScreen', { eventId: event.id })}>
                                <Image
                                    source={{
                                        uri: `https://new-api.worldeventaccess.com/api/PublicEventLogo/${event.id}`
                                    }}
                                    style={styles.logo}
                                    defaultSource={require('../../assets/WEA.png')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('EventDetailsScreen', { eventId: event.id })}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{event.name}</Text>
                                    <Text style={styles.subtitle}>{event.organizer}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.description}>{event.description}</Text>
                            <Text style={styles.date}>Starts: {formatDate(event.eventStartDate)}</Text>
                            <Text style={styles.date}>Ends: {formatDate(event.eventEndDate)}</Text>
                            <Text style={styles.location}>Location: {event.address}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 Events Management System</Text>
            </View>
        </View>
    );
};

const modalStyles = StyleSheet.create({
    // Los estilos permanecen iguales...
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default EventsScreen;