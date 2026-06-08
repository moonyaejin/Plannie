import axios from 'axios';
import { API_URL } from '@env';

export const checkEmailAvailability = async () => {
    // 이메일 중복 확인은 회원가입 요청 시 서버에서 처리됩니다
    return { available: true };
};

export const signUpUser = async ({ email, password, nickname }) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/auth/register`,
            { email, password, nickname },
            { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.status === 201) {
            return { success: true, message: '회원가입이 완료되었습니다.' };
        }
    } catch (error) {
        if (error.response?.status === 409) {
            return { success: false, error: '이미 사용 중인 이메일입니다.' };
        }
        if (error.response?.status === 400) {
            return { success: false, error: error.response.data?.message || '입력 정보를 확인해주세요.' };
        }
        console.error('회원가입 오류:', error);
        return { success: false, error: '회원가입 중 알 수 없는 오류가 발생했습니다.' };
    }
};
