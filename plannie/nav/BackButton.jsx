import { TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Image
                style={styles.icon}
                contentFit="cover"
                source={require('../assets/arrow_back.png')}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 52,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    icon: {
        width: 28,
        height: 28,
    },
});

export default BackButton;
