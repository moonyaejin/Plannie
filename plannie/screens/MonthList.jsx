import * as React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import styles from "../Styles/MonthListStyles";
import { API_URL } from '@env';
import BackButton from '../nav/BackButton';

const MonthList = () => {
    const [schedules, setSchedules] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [currentDate] = React.useState(new Date());

    React.useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const response = await axios.get(
                    `${API_URL}/api/schedules/month/${year}/${month}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSchedules(response.data);
            } catch (err) {
                console.error("일정 조회 오류:", err);
                setError("일정 조회 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <View style={styles.monthList}>
            <BackButton />
            <View style={[styles.bg, styles.bgPosition]} />
            <Text style={styles.mlTitle}>이 달의 일정</Text>
            <View style={styles.scrollContainer}>
                <ScrollView contentContainerStyle={styles.mlContent}>
                    {schedules.map((schedule, index) => (
                        <View key={index} style={styles.mlDate}>
                            <Text style={[styles.day, styles.dayTypo]}>
                                {new Date(schedule.startDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short' })}
                            </Text>
                            <View style={styles.mlDateList}>
                                <View style={styles.listFlexBox}>
                                    <Text style={[styles.todo, styles.dayTypo]}>{schedule.title}</Text>
                                    <Text style={styles.todoTime}>{`${schedule.startTime} - ${schedule.endTime}`}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default MonthList;
