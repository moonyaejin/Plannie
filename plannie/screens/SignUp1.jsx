import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Alert } from 'react-native';
import { checkEmailAvailability } from './api/signup';
import BackButton from '../nav/BackButton';

const SignUp1 = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleNext = async () => {
        if (!email) {
            Alert.alert('오류', '이메일을 입력해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('오류', '비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        const { available, message } = await checkEmailAvailability(email);
        if (available) {
            navigation.navigate('SignUp2', { email, password });
        } else {
            Alert.alert('오류', message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <BackButton />
                <Text style={styles.header}>Let's join the Plannie</Text>
                <Text style={styles.requiredText}>* 필수입력항목</Text>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>이메일 *</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.inputText}
                                placeholder="plannie@mission.com"
                                placeholderTextColor="#878787"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>비밀번호 *</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.inputText}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>비밀번호 확인 *</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.inputText}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    <Text style={styles.passwordRequirement}>* 8자 이상의 영문자, 숫자, 특수문자 포함</Text>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>다음</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(228, 239, 255, 0.86)',
        alignItems: 'center',
        paddingTop: 60,
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        color: '#8FBEFF',
        marginTop: 30,
    },
    requiredText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4183F3',
        position: 'absolute',
        top: 160,
        right: 30,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 37,
        width: 340,
        paddingVertical: 40,
        alignItems: 'center',
        marginTop: 60,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    inputBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginHorizontal: 20,
    },
    inputText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    passwordRequirement: {
        fontSize: 13,
        fontWeight: '500',
        color: '#000',
        marginBottom: 20,
    },
    nextButton: {
        backgroundColor: '#4183F3',
        borderRadius: 5,
        width: '90%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default SignUp1;
