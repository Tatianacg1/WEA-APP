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
import { Ionicons } from '@expo/vector-icons';
import { fetchEventsDetails } from '../api/eventsService';

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
    const [noEventsMessage, setNoEventsMessage] = useState('');

    useEffect(() => {
        const getEventsDetails = async () => {
            try {
                const data = await fetchEventsDetails();
                if (data && data.length > 0) {
                    setEvents(data);
                } else {
                    setShowEmailModal(false);
                    setNoEventsMessage('No events are currently available.');
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
                setShowEmailModal(false);
                Alert.alert('Error', 'Could not load events. Please try again.', [{ text: 'OK' }]);
            }
        };
        getEventsDetails();
    }, []);

    const handleEmailFilter = () => {
        if (!ownerEmail.trim()) {
            Alert.alert('Error', 'Please enter an email address', [{ text: 'OK' }]);
            return;
        }
        
        const filteredEvents = events.filter(event => 
            event.organizerEmail?.toLowerCase() === ownerEmail.trim().toLowerCase()
        );
        
        if (filteredEvents.length === 0) {
            setFilteredByEmail([]);
            setNoEventsMessage(`No active events found for ${ownerEmail}`);
        } else {
            setFilteredByEmail(filteredEvents);
            setNoEventsMessage('');
        }
        setShowEmailModal(false);
    };

    const filteredEvents = filteredByEmail.length > 0 
        ? filteredByEmail.filter(event =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatDate(event.eventStartDate).includes(searchTerm) ||
            formatDate(event.eventEndDate).includes(searchTerm)
        )
        : [];

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setSearchTerm(formatDate(currentDate));
    };

    return (
        <View style={styles.container}>
            {/* Email Modal */}
            <Modal visible={showEmailModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Enter Owner Email</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter email..."
                            value={ownerEmail}
                            onChangeText={setOwnerEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.singleButton]} 
                                onPress={handleEmailFilter}
                            >
                                <Text style={styles.modalButtonText}>Filter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Search Container - Solo visible si hay eventos */}
            {!noEventsMessage && (
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
            )}

            {/* Date Picker */}
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
                    onPress={() => {
                        setShowEmailModal(true);
                        setNoEventsMessage('');
                    }}
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

            {/* Mensaje de No Eventos o Lista de Eventos */}
            {noEventsMessage ? (
                <View style={styles.noEventsWrapper}>
                    <View style={styles.noEventsContainer}>
                        <View style={styles.noEventsCard}>
                            <Ionicons name="alert-circle-outline" size={50} color="#666" />
                            <Text style={styles.noEventsText}>{noEventsMessage}</Text>
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={() => {
                                    setShowEmailModal(true);
                                    setNoEventsMessage('');
                                }}
                            >
                                <Text style={styles.retryButtonText}>Try Another Email</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : (
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
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 Events Management System</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    calendarIcon: {
        padding: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#F0F2F5',
        marginBottom: 10,
    },
    ticketButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        flex: 0.45,
    },
    ticketButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardCont: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: 'gray',
    },
    description: {
        fontSize: 14,
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    footer: {
        padding: 10,
        backgroundColor: '#F0F2F5',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
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
        borderRadius: 15,
        width: '80%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    modalButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    singleButton: {
        width: '100%',
    },
    modalButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    noEventsWrapper: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    noEventsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noEventsCard: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 15,
        width: '90%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginVertical: 20,
    },
    noEventsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default EventsScreen;