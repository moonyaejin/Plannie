import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { Image } from "expo-image";
import axios from 'axios';
import { FontFamily, Color, FontSize } from "../GlobalStyles";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env';

const ChatMain = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: '안녕하세요! 플래니입니다 😊\n\n날짜, 과목명, 시험명, 시간 등 구체적인 요청을 해 주시면 계획을 제안해드리고 생성해드립니다.\n\n📅 일정 추가\n"내일 오후 3시에 영어 회화 2시간"\n"6월 5일 오전 10시 치과 예약"\n\n📚 학습 계획 생성\n"오늘부터 2월 9일까지 토익 공부할거야. 매일 오후 2시부터 6시까지 공부할건데 공부 계획 짜줘"\n\n🗑️ 일정 삭제\n"5월 일정 전체 삭제해줘"\n"모든 일정 삭제"\n\n💬 그 외 궁금한 것도 편하게 물어보세요!',
            sender: 'bot'
        }
    ]);
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef(null);

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const extractDeleteParams = (text) => {
        const deleteKeywords = ['삭제', '지워', '없애', '지워줘', '삭제해줘'];
        if (!deleteKeywords.some(kw => text.includes(kw))) return null;

        const monthMatch = text.match(/(\d{1,2})월/);
        const yearMatch = text.match(/(\d{4})년/);
        const now = new Date();

        if (monthMatch) {
            return {
                year: yearMatch ? parseInt(yearMatch[1]) : now.getFullYear(),
                month: parseInt(monthMatch[1]),
            };
        }
        if (text.includes('전체') || text.includes('모든') || text.includes('모두') || text.includes('다')) {
            return { all: true };
        }
        return null;
    };

    const handleBulkDelete = (params) => {
        const label = params.all
            ? '전체 일정'
            : `${params.year}년 ${params.month}월 일정`;

        return new Promise((resolve) => {
            Alert.alert(
                '일정 삭제',
                `${label}을 모두 삭제할까요?`,
                [
                    { text: '취소', style: 'cancel', onPress: () => resolve(false) },
                    { text: '삭제', style: 'destructive', onPress: () => resolve(true) },
                ]
            );
        });
    };

    const showStudyPlanResult = (plan) => {
        const preview = plan.schedules.slice(0, 3).map(s => `• ${s.startDate} ${s.startTime?.slice(0, 5)} ${s.title}`).join('\n');
        const more = plan.totalSchedules > 3 ? `\n외 ${plan.totalSchedules - 3}개 일정` : '';
        setMessages(prev => [...prev, {
            id: String(Date.now()),
            text: `학습 계획이 생성되었습니다! 총 ${plan.totalSchedules}개 일정\n\n${plan.planSummary}\n\n${preview}${more}`,
            sender: 'bot',
        }]);
    };

    const sendMessage = async () => {
        const text = inputText.trim().normalize('NFC');
        if (text.length === 0) return;

        setMessages(prev => [...prev, { id: String(Date.now() + Math.random()), text, sender: 'user' }]);
        setInputText("");

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error("토큰 없음");
            const headers = { Authorization: `Bearer ${token}` };
            const history = messages.slice(-8).map(m => ({ sender: m.sender, text: m.text }));

            // ── 삭제 의도 ──
            const deleteParams = extractDeleteParams(text);
            if (deleteParams) {
                const confirmed = await handleBulkDelete(deleteParams);
                if (!confirmed) {
                    setMessages(prev => [...prev, { id: String(Date.now()), text: '삭제를 취소했습니다.', sender: 'bot' }]);
                    return;
                }
                const query = deleteParams.all ? '' : `?year=${deleteParams.year}&month=${deleteParams.month}`;
                await axios.delete(`${API_URL}/api/schedules/bulk${query}`, { headers });
                const label = deleteParams.all ? '전체 일정' : `${deleteParams.year}년 ${deleteParams.month}월 일정`;
                setMessages(prev => [...prev, { id: String(Date.now()), text: `${label}을 삭제했습니다.`, sender: 'bot' }]);
                return;
            }

            // ── 학습 계획 요청이 아닌 단순 일정 생성만 parse 엔드포인트로 처리 ──
            // 시험/공부 관련 키워드가 없고 생성 키워드가 있을 때만 parse 시도
            const creationKeywords = ['생성해줘', '생성해', '만들어줘', '만들어', '추가해줘', '추가해', '등록해줘', '등록해', '넣어줘'];
            const examKeywords = ['토익', '토플', 'TOEIC', 'TOEFL', '수능', '공무원', '한국사', '정보처리', '자격증', '공부', '학습', '계획'];
            const hasCreationIntent = creationKeywords.some(kw => text.includes(kw));
            const hasExamContext = examKeywords.some(kw => text.includes(kw));

            if (hasCreationIntent && !hasExamContext) {
                try {
                    const response = await axios.post(`${API_URL}/api/schedules/parse`, { text }, { headers });
                    const schedule = response.data;
                    setMessages(prev => [...prev, {
                        id: String(Date.now()),
                        text: `일정이 생성되었습니다!\n제목: ${schedule.title}\n날짜: ${schedule.startDate}\n시간: ${schedule.startTime} ~ ${schedule.endTime}${schedule.memo ? `\n메모: ${schedule.memo}` : ''}`,
                        sender: 'bot',
                    }]);
                    return;
                } catch (parseError) {
                    if (parseError.response?.status !== 400) throw parseError;
                    // 400이면 AI 채팅으로 계속
                }
            }

            // ── 나머지 모두 AI 채팅으로 처리 (학습 계획 흐름, 확인 응답, 일반 대화) ──
            const chatResponse = await axios.post(`${API_URL}/api/ai/chat`, { text, history }, { headers });
            const { reply, plan } = chatResponse.data;

            if (plan) {
                // 계획 생성 완료 시 reply 메시지는 건너뛰고 결과만 표시
                // (연속 봇 메시지 방지 → 다음 요청의 AI 컨텍스트 혼란 예방)
                showStudyPlanResult(plan);
            } else {
                setMessages(prev => [...prev, { id: String(Date.now()), text: reply, sender: 'bot' }]);
            }

        } catch (error) {
            console.error("Error:", error.response ? error.response.data : error.message);
            setMessages(prev => [...prev, {
                id: String(Date.now() + Math.random()),
                text: "오류가 발생했습니다. 다시 시도해주세요.",
                sender: 'bot',
            }]);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer]}>
            <View style={item.sender === 'user' ? styles.userMessage : styles.aiMessage}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.chatChatting}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.bg} />
            <View style={styles.chatPlannie}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        style={styles.arrowBackIcon}
                        contentFit="cover"
                        source={require("../assets/arrow_back.png")}
                    />
                </TouchableOpacity>
                <Text style={styles.plannie}>Plannie</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatting}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                style={styles.flatList}
            />
            <View style={styles.chatBar}>
                <View style={styles.chatWindow}>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={setInputText}
                        value={inputText}
                        placeholder="정보를 입력해주세요"
                        placeholderTextColor={Color.colorDarkgray}
                        multiline
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Image
                            style={styles.sendIcon}
                            contentFit="cover"
                            source={require("../assets/arrow_front.png")}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    chatChatting: {
        flex: 1,
        backgroundColor: Color.colorLavender,
    },
    bg: {
        top: 95,
        left: 0,
        borderTopLeftRadius: 37,
        borderTopRightRadius: 37,
        bottom: 0,
        width: "100%",
        backgroundColor: Color.backgroundDefaultDefault,
        position: "absolute",
    },
    chatPlannie: {
        height: 100,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
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
        textAlign: "center",
    },
    flatList: {
        flex: 1,
    },
    chatting: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingBottom: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 13,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: '100%',
    },
    aiMessageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
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
    chatBar: {
        backgroundColor: Color.colorAliceblue,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    chatWindow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        backgroundColor: Color.backgroundDefaultDefault,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 46,
    },
    textInput: {
        flex: 1,
        fontFamily: FontFamily.m3BodyLarge,
        fontSize: FontSize.m3BodyLarge_size,
        color: Color.labelsPrimary,
        maxHeight: 100,
        textAlignVertical: 'center',
    },
    sendButton: {
        marginLeft: 8,
        padding: 4,
    },
    sendIcon: {
        width: 22,
        height: 22,
        overflow: "hidden",
    },
});

export default ChatMain;
