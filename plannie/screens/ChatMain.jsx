import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, Animated } from "react-native";
import { Image } from "expo-image";
import axios from 'axios';
import { FontFamily, Color, FontSize } from "../GlobalStyles";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import uuid from 'react-native-uuid';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatChatting = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([
        { id: '1', text: '안녕하세요. 플래니입니다. 당신의 효율적인 공부 계획을 도와드리겠습니다.', sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const keyboardHeight = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
            Animated.timing(keyboardHeight, {
                duration: 300,
                toValue: event.endCoordinates.height,
                useNativeDriver: false
            }).start();
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            Animated.timing(keyboardHeight, {
                duration: 100,
                toValue: 0,
                useNativeDriver: false
            }).start();
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        // 메시지가 추가될 때마다 FlatList를 맨 아래로 스크롤
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (inputText.trim().length > 0) {
            const newMessage = {
                id: uuid.v4(),
                text: inputText,
                sender: 'user'
            };

            setMessages(prevMessages => [...prevMessages, newMessage]);
            setInputText("");

            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    throw new Error("사용자 인증 토큰을 찾을 수 없습니다. 다시 로그인해 주세요.");
                }

                const response = await axios.post(
                    'http://localhost:3000/chat/send-message2',
                    {
                        senderId: "chanhyuck10@naver.com",
                        message: inputText,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                const gptMessage = {
                    id: uuid.v4(),
                    text: `GPT 응답: ${response.data.originalReply}`,
                    sender: 'bot',
                };

                setMessages(prevMessages => [...prevMessages, gptMessage]);

                const parsedData = response.data.parsedData;
                const actionResult = response.data.actionResult;

                if (parsedData) {
                    let actionMessage;
                    switch (parsedData.action) {
                        case '조회':
                            actionMessage = {
                                id: uuid.v4(),
                                text: `${parsedData.date}의 일정을 조회했습니다! : ${JSON.stringify(actionResult, null, 2)}`,
                                sender: 'bot'
                            };
                            break;
                        case '생성':
                            actionMessage = {
                                id: uuid.v4(),
                                text: `일정을 생성했습니다! : ${JSON.stringify(parsedData, null, 2)}`,
                                sender: 'bot'
                            };
                            break;
                        case '수정':
                            actionMessage = {
                                id: uuid.v4(),
                                text: `수정을 완료했습니다! 기존 데이터와 신규 데이터 : ${JSON.stringify(actionResult, null, 2)}`,
                                sender: 'bot'
                            };
                            break;
                        case '삭제':
                            actionMessage = {
                                id: uuid.v4(),
                                text: `말씀하신 일정을 삭제했습니다! : ${JSON.stringify(parsedData, null, 2)}`,
                                sender: 'bot'
                            };
                            break;
                        default:
                            actionMessage = {
                                id: uuid.v4(),
                                text: `파싱된 데이터: ${JSON.stringify(parsedData, null, 2)}`,
                                sender: 'bot'
                            };
                    }
                    setMessages(prevMessages => [...prevMessages, actionMessage]);
                } else {
                    const followUpMessage = {
                        id: uuid.v4(),
                        text: "무엇을 도와드릴까요? 일정 생성, 조회, 수정, 삭제 중 하나를 선택해주세요.",
                        sender: 'bot',
                    };
                    setMessages(prevMessages => [...prevMessages, followUpMessage]);
                }

                setTimeout(() => {
                    if (flatListRef.current) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            } catch (error) {
                console.error("Error:", error.response ? error.response.data : error.message);

                const errorMessage = {
                    id: uuid.v4(),
                    text: "오류가 발생했습니다. 다시 시도해주세요.",
                    sender: 'bot'
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer]}>
            <View style={item.sender === 'user' ? styles.userMessage : styles.aiMessage}>
                <Text style={styles.messageText}>
                    {item.text}
                </Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.chatChatting}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={50}
        >
            <View style={styles.bg} />
            <View style={[styles.chatPlannie, styles.chatFlexBox]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        style={styles.arrowBackIcon}
                        contentFit="cover"
                        source={require("../assets/arrow_back.png")}
                    />
                </TouchableOpacity>
                <Text style={styles.plannie}>Plannie</Text>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.chatting, { paddingBottom: 40 }]}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            />

            <Animated.View style={[styles.chatBar, { bottom: keyboardHeight }]}>
                <View style={styles.fabFlexBox}>
                    <TouchableOpacity style={[styles.fab, styles.fabFlexBox]}>
                        <Image
                            style={styles.plusIcon}
                            contentFit="cover"
                            source={require("../assets/sch_plus.png")}
                        />
                    </TouchableOpacity>
                    <View style={[styles.chatWindow, styles.chatFlexBox]}>
                        <TextInput
                            style={[styles.text2, styles.textTypo]}
                            onChangeText={setInputText}
                            value={inputText}
                            placeholder="정보를 입력해주세요"
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity onPress={sendMessage}>
                            <Image
                                style={styles.gravityUimagnifierIcon}
                                contentFit="cover"
                                source={require("../assets/sch_plus.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 13,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: '100%',
        height: "auto"
    },
    aiMessageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        height: "auto"
    },
    aiMessage: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 10,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#D3D3D3',
        borderRadius: 10,
        padding: 10,
        maxWidth: '80%',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    chatFlexBox: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    chatBarPosition: {
        left: 0,
        width: "100%",
        position: "absolute",
    },
    chatPosition: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 18,
        top: 0,
        justifyContent: "center",
        left: 0,
        alignItems: "center",
        flexDirection: "row",
        position: "absolute",
    },
    textTypo: {
        fontFamily: FontFamily.m3BodyLarge,
        textAlign: "left",
    },
    chatChildLayout: {
        height: 35,
        width: 37,
        top: 29,
        position: "absolute",
    },
    fabFlexBox: {
        paddingTop: 15,
        alignItems: "center",
        flexDirection: "row",
    },
    //채팅 하얀 배경
    bg: {
        top: 95,
        left: 0,
        borderTopLeftRadius: 37,
        borderTopRightRadius: 37,
        height: 779,
        width: "100%",
        backgroundColor: Color.backgroundDefaultDefault,
        position: "absolute",
    },
    arrowBackIcon: {
        width: 28,
        height: 28,
        overflow: "hidden",
    },
    plannie: {
        fontSize: FontSize.size_3xl,
        fontWeight: "600",
        fontFamily: FontFamily.bodyStrong,
        color: Color.colorLightskyblue_100,
        textAlign: "centers",
    },
    chatPlannie: {
        height: 100,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    text: {
        fontSize: FontSize.size_mini_7,
        letterSpacing: 0,
        lineHeight: 22,
        color: Color.labelsPrimary,
    },
    chatUserBox: {
        backgroundColor: Color.colorLavender,
        alignItems: "right",
        justifyContent: "right",
        borderRadius: 20,
    },
    chatUserChild: {
        right: 0,
    },
    chatUser: {
        width: 235,
        height: 64,
    },
    chatUserFrame: {
        alignSelf: "flex-end",
        justifyContent: "center",
        paddingRight: 14,
        marginTop: 10,
    },
    chatAiBox: {
        backgroundColor: "#e7e7e7",
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderRadius: 20,
    },
    chatAiChild: {
        left: 0,
    },
    chatAi: {
        width: 239,
        height: 64,
    },
    chatAiFrame: {
        alignSelf: "flex-start",
        justifyContent: "center",
        paddingLeft: 14,
        marginTop: 10,
    },
    chatting: {
        flexGrow: 1,
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingBottom: 60,
    },

    plusIcon: {
        width: 30,
        height: 30,
        marginBottom: 20
    },
    fab: {
        padding: 14,
        justifyContent: "center",
    },
    text2: {
        fontSize: FontSize.m3BodyLarge_size,
        letterSpacing: 1,
        color: Color.colorDarkgray_200,
    },
    //전송버튼
    gravityUimagnifierIcon: {
        width: 18,
        height: 18,
        overflow: "hidden",
    },
    chatWindow: {
        borderRadius: 28,
        width: 321,
        height: 50,
        paddingHorizontal: 23,
        paddingVertical: 6,
        marginLeft: 1,
        marginBottom: 20,
        backgroundColor: Color.backgroundDefaultDefault,
        justifyContent: "space-between",
    },
    chatBar: {
        height: 80,
        backgroundColor: Color.colorAliceblue,
        width: "100%",
        justifyContent: "center",
        position: "absolute",
    },
    chatChatting: {
        backgroundColor: Color.colorLavender,
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: 'stretch',
        justifyContent: 'center',
    },
});

export default ChatChatting;
