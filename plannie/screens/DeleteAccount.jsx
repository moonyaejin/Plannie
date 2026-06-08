import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { styles } from '../Styles/DeleteAccountStyles';
import { deleteUser } from './api/user';
import BackButton from '../nav/BackButton';

function DeleteAccount({ navigation }) {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');

    const handleDelete = async () => {
        if (!email || !nickname || !password) {
            Alert.alert('오류', '이메일, 닉네임, 비밀번호를 모두 입력해주세요.');
            return;
        }
        const { success } = await deleteUser();
        if (success) {
            Alert.alert('탈퇴 완료', '회원 탈퇴가 완료되었습니다.');
            navigation.navigate('StartPage');
        } else {
            Alert.alert('오류', '회원 탈퇴 중 오류가 발생했습니다.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <BackButton />
                <Text style={styles.title}>회원 탈퇴</Text>
                
                <View style={styles.formContainer}>
                    <View style={styles.formRow}>
                        <Text style={styles.label}>닉네임</Text>
                        <TextInput
                            onChangeText={setNickname}
                            value={nickname}
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.label}>이메일</Text>
                        <TextInput
                            onChangeText={setEmail}
                            value={email}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.label}>비밀번호</Text>
                        <TextInput
                            onChangeText={setPassword}
                            value={password}
                            style={styles.input}
                            secureTextEntry // 비밀번호 입력 가리기
                        />
                    </View>
                    <View style={styles.formRow}>
                        <TextInput
                            placeholder="탈퇴 이유를 입력해주세요."
                            onChangeText={setReason}
                            value={reason}
                            style={styles.submitInput}
                            multiline 
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleDelete}>
                    <Text style={styles.submitButtonText}>탈퇴하기</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default DeleteAccount;
