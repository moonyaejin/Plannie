import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { Alert } from "react-native";

export const loginUser = async (email, password, navigation) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.status === 200) {
            const { accessToken, nickname } = response.data;
            await AsyncStorage.setItem('userToken', accessToken);
            await AsyncStorage.setItem('userNickname', nickname ?? '');
            Alert.alert('로그인 성공', '환영합니다!');
            navigation.navigate('Calendar');
        }
    } catch (error) {
        if (error.response?.status === 401) {
            Alert.alert('로그인 실패', '아이디 또는 비밀번호가 일치하지 않습니다.');
        } else {
            console.error('로그인 오류:', error);
            Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
        }
    }
};

export const deleteUser = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        await axios.delete(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        await AsyncStorage.multiRemove(['userToken', 'userNickname']);
        return { success: true };
    } catch (error) {
        console.error('탈퇴 오류:', error);
        return { success: false };
    }
};

export const fetchUserProfile = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('프로필 조회 오류:', error);
        return null;
    }
};

export const updateUserProfile = async (formData) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const body = {
            nickname: formData.nickname,
            phone: formData.phone || null,
            address: formData.address || null,
            birth: formData.birth || null,
            gender: formData.gender || null,
            password: formData.password || null,
        };
        await axios.put(`${API_URL}/api/users/me`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (formData.nickname) {
            await AsyncStorage.setItem('userNickname', formData.nickname);
        }
        return { success: true };
    } catch (error) {
        console.error('프로필 수정 오류:', error);
        return { success: false };
    }
};

export const fetchNickname = async (navigation) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            Alert.alert("로그인 정보가 없습니다.", "다시 로그인 해주세요.");
            navigation.navigate('Login');
            return null;
        }
        return await AsyncStorage.getItem('userNickname');
    } catch (error) {
        console.error("Error fetching nickname:", error);
        return null;
    }
};

export const handleLogout = async (navigation) => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userNickname');
        Alert.alert("로그아웃 되었습니다.");
        navigation.navigate('Login');
    } catch (error) {
        console.error("Logout error:", error);
        Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
};
