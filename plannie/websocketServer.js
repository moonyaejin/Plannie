const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ ws://13.124.163.3: 8080 });

wss.on('connection', function connection(ws) {
  console.log('클라이언트가 연결되었습니다.');

  ws.on('message', async function incoming(message) {
    console.log('받은 메시지:', message);

    // OpenAI API에 메시지 전달 및 응답 받기
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "ft:gpt-3.5-turbo-0125:personal:A6712sq4",
        messages: [{ role: "user", content: message }],
      }, {
        headers: {
          'Authorization': ``,
          'Content-Type': 'application/json',
        },
      });

      // OpenAI 응답을 클라이언트로 전송
      ws.send(response.data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      ws.send('에러가 발생했습니다.');
    }
  });

  ws.send('웹 소켓 서버에 연결되었습니다.');
});

