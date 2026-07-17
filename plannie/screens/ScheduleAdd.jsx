import * as React from "react";
import { Text, View, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../Styles/ScheduleAddStyles";
import ScheduleCreate from "./ScheduleCreate";
import axios from "axios";
import {fetchSchedulesByDate, updateCheckboxStatus} from "./api/planner";

const ScheduleAdd = ({ selectedDate }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [schedules, setSchedules] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
    const apiDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0].replace(/-/g, '.') : '';

    React.useEffect(() => {
        const fetchAndSetSchedules = async () => {
            setLoading(true);
            const data = await fetchSchedulesByDate(apiDate);
            setSchedules(data);
            setLoading(false);
        };
        fetchAndSetSchedules();
    }, [apiDate]);

    const toggleCheckbox = async (scheduleId, currentCheckBoxState) => {
        const success = await updateCheckboxStatus(scheduleId, currentCheckBoxState);
        if (success) {
            setSchedules(prevSchedules =>
                prevSchedules.map(schedule =>
                    schedule.id === scheduleId ? { ...schedule, check_box: !currentCheckBoxState } : schedule
                )
            );
        }
    };

    return (
        <View style={styles.scheduleAdd}>
            <Text style={[styles.schDate, styles.textTypo]}>{formattedDate}</Text>

            <ScrollView style={styles.schList}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : schedules.length > 0 ? (
                    schedules.map((schedule, index) => (
                        <View key={index} style={[styles.schList1, styles.schFlexBox]}>
                            <TouchableOpacity onPress={() => toggleCheckbox(schedule.id, schedule.check_box)}>
                                <Image
                                    style={styles.iconLayout}
                                    source={
                                        schedule.check_box
                                            ? require("../assets/nc_check.png") // 체크된 상태
                                            : require("../assets/Square.png")    // 체크되지 않은 상태
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={[styles.text, styles.textTypo]}>
                                {schedule.title} - {schedule.start_time.slice(0, 5)} ~ {schedule.end_time.slice(0, 5)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noScheduleText}>해당 날짜에 일정이 없습니다.</Text>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.schPlusIcon}
                onPress={() => setModalVisible(true)}
            >
                <Image
                    style={styles.iconLayout}
                    source={require("../assets/sch_plus.png")}
                />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.modalBackground}>
                    <ScheduleCreate selectedDate={selectedDate} closeModal={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

export default ScheduleAdd;
