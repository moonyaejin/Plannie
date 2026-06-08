import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Alert, ScrollView, TextInput } from "react-native";
import { Image } from "expo-image";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../Styles/CalendarStyles';
import BottomNav from "../nav/BottomNav";
import ScheduleAdd from "./ScheduleAdd";
import { useNavigation } from "@react-navigation/native";
import { fetchMonthSchedules, updateSchedule, deleteSchedule } from "./api/planner";
const Calendar = () => {
    const navigation = useNavigation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [schedules, setSchedules] = useState([]);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editSchedule, setEditSchedule] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editMemo, setEditMemo] = useState('');

    const openEditModal = (schedule) => {
        setEditSchedule(schedule);
        setEditTitle(schedule.title || '');
        setEditStartTime((schedule.startTime || '00:00:00').slice(0, 5));
        setEditEndTime((schedule.endTime || '01:00:00').slice(0, 5));
        setEditMemo(schedule.memo || '');
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(editStartTime) || !timeRegex.test(editEndTime)) {
            Alert.alert('오류', '시간 형식이 올바르지 않습니다. (예: 09:00)');
            return;
        }
        if (editStartTime >= editEndTime) {
            Alert.alert('오류', '종료 시간은 시작 시간보다 늦어야 합니다.');
            return;
        }
        const ok = await updateSchedule(editSchedule.id, {
            title: editTitle,
            memo: editMemo,
            startDate: editSchedule.startDate,
            startTime: editStartTime,
            endTime: editEndTime,
        });
        if (ok) {
            setEditModalVisible(false);
            const data = await fetchMonthSchedules(currentDate.getFullYear(), currentDate.getMonth() + 1);
            setSchedules(data);
        }
    };

    const handleDeleteEdit = () => {
        Alert.alert('일정 삭제', `"${editSchedule.title}" 일정을 삭제할까요?`, [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제', style: 'destructive', onPress: async () => {
                    const ok = await deleteSchedule(editSchedule.id);
                    if (ok) {
                        setEditModalVisible(false);
                        const data = await fetchMonthSchedules(currentDate.getFullYear(), currentDate.getMonth() + 1);
                        setSchedules(data);
                    }
                }
            },
        ]);
    };

    // 토큰 검사 함수
    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert("세션 만료", "다시 로그인해주세요.");
                    navigation.navigate('Login');
                }
            } catch (error) {
                console.error("Error retrieving token:", error);
            }
        };
        checkToken();
    }, []);

    // Monthly schedule fetching
    useEffect(() => {
        fetchMonthSchedules(currentDate.getFullYear(), currentDate.getMonth() + 1)
            .then((data) => setSchedules(data))
            .catch(() => setSchedules([]));
    }, [currentDate]);

    const handleDatePress = (date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        setSelectedDate(utcDate);
        setModalVisible(true);
    };

    // 월 이동 이벤트
    const handlePreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // 달력 렌더링
    const renderDays = () => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = [];

        for (let i = 0; i < firstDayOfMonth.getDay(); i++) daysInMonth.push(<View style={styles.day} key={`empty-${i}`} />);
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const isScheduled = schedules.some(schedule => new Date(schedule.startDate).getDate() === i);
            daysInMonth.push(
                <TouchableOpacity
                    style={styles.day}
                    key={i}
                    onPress={() => handleDatePress(date)}
                >
                    <View style={[styles.dayCircle, isScheduled ? styles.scheduledDay : null]}>
                        <Text style={styles.date1}>{i}</Text>
                    </View>
                </TouchableOpacity>
            );
        }
        while (daysInMonth.length % 7 !== 0) daysInMonth.push(<View style={styles.day} key={`empty-end-${daysInMonth.length}`} />);

        const weeks = [];
        for (let i = 0; i < daysInMonth.length; i += 7) {
            weeks.push(
                <View style={styles.weekSpaceBlock} key={`week-${i}`}>
                    {daysInMonth.slice(i, i + 7)}
                </View>
            );
        }

        return weeks;
    };

    return (
        <View style={styles.calendar}>
            <View style={[styles.calPlannie, styles.calFlexBox]}>
                <Text style={styles.calLogo}>Plannie</Text>
                <Image style={styles.calSearch} contentFit="cover" source={require("../assets/search.png")} />
            </View>
            <View style={styles.calendar_bg}></View>
            <View style={styles.calCalender}>
                <View style={[styles.calHeader, styles.calFlexBox]}>
                    <View style={[styles.calHeaderFrame, styles.calFlexBox]}>
                        <TouchableOpacity onPress={handlePreviousMonth}>
                            <Image style={styles.arrowBackIcon} contentFit="cover" source={require("../assets/arrow_back.png")} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.monthAndYear} onPress={() => navigation.navigate('MonthList')}>
                            <Text style={styles.monthYyyy}>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNextMonth}>
                            <Image style={styles.arrowBackIcon} contentFit="cover" source={require("../assets/arrow_front.png")} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.dateHeader, styles.weekSpaceBlock]}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <Text style={styles.sun} key={index}>{day}</Text>
                    ))}
                </View>
                <View style={styles.calendar1}>
                    {renderDays()}
                </View>
            </View>
            <BottomNav />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={modalStyles.modalBackground}>
                        <TouchableWithoutFeedback>
                            <View>
                                <ScheduleAdd selectedDate={selectedDate} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Monthly Schedule List Section */}
            <View style={styles.scheduleContainer}>
                <Text style={styles1.scheduleTitle}>이 달의 일정</Text>
                <MonthlyScheduleList schedules={schedules} onPressSchedule={openEditModal} />
            </View>

            {/* Edit Modal */}
            <Modal animationType="slide" transparent visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
                    <View style={editModalStyles.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={editModalStyles.container}>
                                <Text style={editModalStyles.heading}>일정 수정</Text>
                                <Text style={editModalStyles.label}>제목</Text>
                                <TextInput style={editModalStyles.input} value={editTitle} onChangeText={setEditTitle} />
                                <Text style={editModalStyles.label}>시작 시간 (HH:mm)</Text>
                                <TextInput style={editModalStyles.input} value={editStartTime} onChangeText={setEditStartTime} placeholder="09:00" keyboardType="numbers-and-punctuation" />
                                <Text style={editModalStyles.label}>종료 시간 (HH:mm)</Text>
                                <TextInput style={editModalStyles.input} value={editEndTime} onChangeText={setEditEndTime} placeholder="10:00" keyboardType="numbers-and-punctuation" />
                                <Text style={editModalStyles.label}>메모</Text>
                                <TextInput style={[editModalStyles.input, editModalStyles.memoInput]} value={editMemo} onChangeText={setEditMemo} multiline />
                                <TouchableOpacity style={editModalStyles.saveBtn} onPress={handleSaveEdit}>
                                    <Text style={editModalStyles.saveBtnText}>저장</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={editModalStyles.deleteBtn} onPress={handleDeleteEdit}>
                                    <Text style={editModalStyles.deleteBtnText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

// Monthly Schedule List Component
const MonthlyScheduleList = ({ schedules, onPressSchedule }) => {
    if (schedules.length === 0) return <Text style={styles1.noScheduleText}>이번 달에 등록된 일정이 없습니다.</Text>;

    return (
        <ScrollView style={styles1.scheduleListContainer}>
            {schedules.map((schedule, index) => (
                <TouchableOpacity key={index} style={styles1.scheduleItem} onPress={() => onPressSchedule(schedule)}>
                    <Text style={styles1.scheduleDate}>{schedule.startDate}</Text>
                    <Text style={styles1.scheduleTime}>
                        {(schedule.startTime || '').slice(0, 5)} - {(schedule.endTime || '').slice(0, 5)}
                    </Text>
                    <Text style={styles1.scheduleTitleText}>{schedule.title}</Text>
                    {schedule.memo ? <Text style={styles1.scheduleMemo}>{schedule.memo}</Text> : null}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};
const styles1 = StyleSheet.create({
    scheduleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
    scheduleListContainer: {
        paddingHorizontal: 20,
        maxHeight: 270,
        marginTop: 10,
        backgroundColor: '#f4f4f4',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    scheduleItem: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    scheduleDate: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    scheduleTime: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
        fontStyle: 'italic',
    },
    scheduleTitleText: {
        fontSize: 15,
        color: '#333',
        marginTop: 8,
    },
    noScheduleText: {
        textAlign: 'center',
        marginTop: 10,
        color: '#888',
    },
    scheduleMemo: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
        fontStyle: 'italic',
    },
});

const editModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '88%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 13,
        color: '#555',
        marginBottom: 4,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        backgroundColor: '#fafafa',
    },
    memoInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    saveBtn: {
        marginTop: 20,
        backgroundColor: '#8FBEFF',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    deleteBtn: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FF6B6B',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#FF6B6B',
        fontWeight: '600',
        fontSize: 15,
    },
});


const modalStyles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});

export default Calendar;
