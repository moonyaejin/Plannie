import * as React from "react";
import { Image } from "expo-image";
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import styles from "../Styles/MyPageProfileStyles";
import MyPageTopNav from "../nav/MyPageTopNav";
import BottomNav from "../nav/BottomNav";
import { fetchUserProfile } from "./api/user";

const MyPageProfile = () => {
    const navigation = useNavigation();
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const load = async () => {
                setLoading(true);
                const data = await fetchUserProfile();
                setProfile(data);
                setLoading(false);
            };
            load();
        }, [])
    );

    const Row = ({ label, value }) => (
        <View style={[styles.mppGName, styles.mppSpaceBlock]}>
            <Text style={[styles.text, styles.textPosition]}>{label}</Text>
            <View style={[styles.mppLine, styles.mppPosition]} />
            <Text style={[styles.text3, styles.textTypo]}>{value || '미입력'}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.mypageProfile, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#8FBEFF" />
            </View>
        );
    }

    return (
        <View style={styles.mypageProfile}>
            <MyPageTopNav />
            <View style={styles.mppContentBox}>
                <View style={styles.mppContent}>
                    <Row label="닉네임" value={profile?.nickname} />
                    <Row label="이름" value={profile?.name} />
                    <Row label="휴대폰" value={profile?.phone} />
                    <Row label="이메일" value={profile?.email} />
                    <Row label="생일" value={profile?.birth} />
                    <Row label="주소" value={profile?.address} />
                    <Row label="성별" value={profile?.gender} />
                </View>
            </View>
            <View style={styles.mppPhoto}>
                <Image
                    style={styles.mppPFrameIcon}
                    contentFit="cover"
                    source={require("../assets/MPP_P_frame.png")}
                />
            </View>
            <TouchableOpacity
                style={editButtonStyles.editButton}
                onPress={() => navigation.navigate('ProfileEdit')}
            >
                <Text style={editButtonStyles.editButtonText}>회원정보 수정</Text>
            </TouchableOpacity>
            <BottomNav />
        </View>
    );
};

const editButtonStyles = StyleSheet.create({
    editButton: {
        backgroundColor: '#4183F3',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 40,
        alignSelf: 'center',
        marginBottom: 16,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MyPageProfile;
