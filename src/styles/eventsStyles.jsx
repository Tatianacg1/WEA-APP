import { StyleSheet, TextInput } from "react-native-web";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d4fafd8f',
    },
    searchContainer: {	
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },

    searchContainerHover: {
        backgroundColor: '#e6f7ff', // Cambia el color al pasar el cursor
        borderColor: '#0080ff', // También puedes cambiar el color del borde
    },
    
    card: {
        padding: 10,
        margin: 10,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    cardCont: {
        flexDirection: "row",
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'stretch',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    description: {
        fontSize: 12,
        color: '#0000008f',
        marginBottom: 10,
    },
    date: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    location: {
        fontSize: 12,
        color: '#555',
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: '#181824',
        padding: 10,
        alignItems: 'center',
    },
    footerText: {
        color: '#0000008f',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Estilo para el TextInput
    searchInput: {
        height: 40,
        width: 300,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        margin: 10,
        backgroundColor: '#ffffff',
    },
});