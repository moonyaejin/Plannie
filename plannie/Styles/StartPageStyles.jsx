import {StyleSheet} from "react-native";
import {Color, FontFamily, FontSize} from "../GlobalStyles";

const styles = StyleSheet.create({
    startPage: {
        backgroundColor: Color.colorBlueviolet,
        width: "100%",
        height: "100%",
    },
    plannie: {
        top: 562,
        left: 30,
        color: Color.backgroundDefaultDefault,
        textAlign: "left",
    },
    planniePosition: {
        position: "absolute",
    },
    text: {
        fontSize: 37,
        fontWeight: "700",
        fontFamily: FontFamily.interBold,
    },
    plannie1: {
        fontSize: 46,
        fontWeight: "800",
        fontFamily: FontFamily.interExtraBold,
    },
    spStartButton: {
        top: 747,
        borderRadius: 46,
        backgroundColor: Color.backgroundDefaultDefault,
        width: 330,
        height: 60,
        alignSelf: "center",
        // paddingHorizontal: 124,
        // paddingVertical: 18,
    },
    planit: {
        fontSize: FontSize.size_lg_4,
        fontWeight: "600",
        marginTop: 18,
        marginBottom: 18,
        alignSelf: "center",
        fontFamily: FontFamily.bodyStrong,
        color: Color.labelsPrimary,

    },
    plannieIcon: {
        marginTop: 250,
        alignSelf: "center",
        width: 185,
        height: 231,
    },
});

export default styles;