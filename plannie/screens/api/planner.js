import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL } from '@env';
import moment from "moment";

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        Alert.alert("로그인 필요", "다시 로그인해주세요.");
        throw new Error("No token");
    }
    return { Authorization: `Bearer ${token}` };
};

export const fetchMonthSchedules = async (year, month) => {
    try {
        const headers = await getAuthHeader();
        const response = await axios.get(`${API_URL}/api/schedules/month/${year}/${month}`, { headers });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Failed to fetch schedules:", error);
        return [];
    }
};

export const updateCheckboxStatus = async (scheduleId) => {
    try {
        const headers = await getAuthHeader();
        await axios.patch(`${API_URL}/api/schedules/${scheduleId}/toggle`, null, { headers });
        return true;
    } catch (error) {
        console.error("Failed to toggle schedule:", error);
        Alert.alert("오류", "일정 상태 업데이트에 실패했습니다.");
        return false;
    }
};

export const fetchSchedulesByDate = async (apiDate) => {
    if (!apiDate) return [];
    try {
        const headers = await getAuthHeader();
        const response = await axios.get(`${API_URL}/api/schedules/date`, {
            headers,
            params: { date: apiDate },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return [];
        }
        console.error("일정 가져오기 오류:", error);
        Alert.alert("오류", "일정을 불러오는 데 실패했습니다.");
        return [];
    }
};

const notificationToMinutes = (notification) => {
    const map = { "5분 전": 5, "10분 전": 10, "30분 전": 30 };
    return map[notification] ?? null;
};

const repeatToFields = (repeat) => {
    const dayMap = { "월": "MON", "화": "TUE", "수": "WED", "목": "THU", "금": "FRI", "토": "SAT", "일": "SUN" };
    if (!repeat || repeat === "안 함") return { repeatType: "NONE", repeatDays: null };
    return { repeatType: "WEEKLY", repeatDays: dayMap[repeat] ?? null };
};

export const updateSchedule = async (scheduleId, { title, memo, startDate, startTime, endTime }) => {
    try {
        const headers = await getAuthHeader();
        const fmt = (t) => t.length === 5 ? `${t}:00` : t; // "HH:mm" → "HH:mm:00"
        await axios.put(`${API_URL}/api/schedules/${scheduleId}`, {
            title,
            memo: memo || null,
            startDate,
            endDate: startDate,
            startTime: fmt(startTime),
            endTime: fmt(endTime),
            repeatType: 'NONE',
            repeatDays: null,
            repeatEndDate: null,
            reminderMinutes: null,
        }, { headers });
        return true;
    } catch (error) {
        console.error('일정 수정 오류:', error);
        Alert.alert('오류', '일정 수정에 실패했습니다.');
        return false;
    }
};

export const deleteSchedule = async (scheduleId) => {
    try {
        const headers = await getAuthHeader();
        await axios.delete(`${API_URL}/api/schedules/${scheduleId}`, { headers });
        return true;
    } catch (error) {
        console.error('일정 삭제 오류:', error);
        Alert.alert('오류', '일정 삭제에 실패했습니다.');
        return false;
    }
};

export const createSchedule = async ({
    selectedDate,
    title,
    startTime,
    endTime,
    memo,
    notification,
    repeat,
    closeModal,
}) => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    const formattedStartTime = moment(startTime).format("HH:mm:ss");
    const formattedEndTime = moment(endTime).format("HH:mm:ss");
    const { repeatType, repeatDays } = repeatToFields(repeat);

    try {
        const headers = await getAuthHeader();
        const response = await axios.post(
            `${API_URL}/api/schedules`,
            {
                title,
                memo,
                startDate: formattedDate,
                endDate: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                repeatType,
                repeatDays,
                reminderMinutes: notificationToMinutes(notification),
            },
            { headers }
        );

        if (response.status === 201) {
            Alert.alert("성공", "일정이 생성되었습니다.");
            closeModal();
        }
    } catch (error) {
        console.error("일정 생성 오류:", error);
        Alert.alert("오류", "일정 생성에 실패했습니다.");
    }
};
