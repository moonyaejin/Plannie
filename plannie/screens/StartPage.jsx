import * as React from "react";
import {Text, View, TouchableOpacity} from "react-native";
import { Image } from "expo-image";
import styles from '../Styles/StartPageStyles';
import {useNavigation} from "@react-navigation/native";

const StartPage = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.startPage}>
            <Text style={[styles.plannie, styles.planniePosition]}>
                <Text style={styles.text}>{`계획 세우는 게
어려울 땐?
`}</Text>
                <Text style={styles.plannie1}>Plannie</Text>
            </Text>
            <TouchableOpacity  onPress = {() => navigation.navigate('Login')}
                               style = {[styles.spStartButton, styles.planniePosition]}>
                <Text style={styles.planit}>Plannie 시작하기</Text>
            </TouchableOpacity>
            <Image
                style={[styles.plannieIcon, styles.planniePosition]}
                contentFit="cover"
                source={require("../assets/Plannie_icon.png")}
            />
        </View>
    );
};



export default StartPage;
