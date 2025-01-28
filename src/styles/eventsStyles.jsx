import { StyleSheet, TextInput } from "react-native-web";

export default StyleSheet.create({
    container: {
        flex: 1
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    calendarIcon: {
        marginRight: 10,
    },
    ticketButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    ticketButtonText: {
        color: 'white',
        fontSize: 16,
    },
    card: {
        backgroundColor: 'white',
        marginBottom: 10,
        marginHorizontal: 10,
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardCont: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
        marginTop: 5,
    },
    description: {
        color: '#333',
        marginBottom: 10,
    },
    date: {
        color: '#666',
        marginBottom: 5,
    },
    location: {
        color: '#666',
        fontStyle: 'italic',
    },
    footer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    footerText: {
        color: '#888',
        fontSize: 12,
    },
});