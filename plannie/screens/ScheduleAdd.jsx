import * as React from "react";
import { Text, View, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator } from "react-native";
import styles from "../Styles/ScheduleAddStyles";
import { Color } from '../GlobalStyles';
import ScheduleCreate from "./ScheduleCreate";
import {fetchSchedulesByDate, updateCheckboxStatus} from "./api/planner";

const ScheduleAdd = ({ selectedDate }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [schedules, setSchedules] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
    const apiDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '';

    React.useEffect(() => {
        const fetchAndSetSchedules = async () => {
            setLoading(true);
            const data = await fetchSchedulesByDate(apiDate);
            setSchedules(data);
            setLoading(false);
        };
        fetchAndSetSchedules();
    }, [apiDate]);

    const toggleCheckbox = async (scheduleId, currentCompleted) => {
        const success = await updateCheckboxStatus(scheduleId);
        if (success) {
            setSchedules(prevSchedules =>
                prevSchedules.map(schedule =>
                    schedule.id === scheduleId ? { ...schedule, completed: !currentCompleted } : schedule
                )
            );
        }
    };

    return (
        <View style={styles.scheduleAdd}>
            <Text style={[styles.schDate, styles.textTypo]}>{formattedDate}</Text>

            <ScrollView style={styles.schList}>
                {loading ? (
                    <ActivityIndicator size="large" color={Color.colorLightskyblue_100} />
                ) : schedules.length > 0 ? (
                    schedules.map((schedule, index) => (
                        <View key={index} style={[styles.schList1, styles.schFlexBox]}>
                            <TouchableOpacity onPress={() => toggleCheckbox(schedule.id, schedule.completed)}>
                                <Image
                                    style={styles.iconLayout}
                                    source={
                                        schedule.completed
                                            ? require("../assets/nc_check.png")
                                            : require("../assets/Square.png")
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={[styles.text, styles.textTypo]}>
                                {schedule.title} - {schedule.startTime?.slice(0, 5)} ~ {schedule.endTime?.slice(0, 5)}
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
