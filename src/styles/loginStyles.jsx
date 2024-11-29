import { StyleSheet } from "react-native-web";

export default StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#ffffff',
    },
    logo: {
      width: 300,
      height: 100,
      marginBottom: 50,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#cccccc',
      borderRadius: 5,
    },
    button: {
      backgroundColor: '#2786fb',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      width: '50%',
      marginTop: 20,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
    },
  });