export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message } = req.body; // 사용자가 입력한 고민/질문
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 고민 해결 상담원 페르소나 부여
    const systemPrompt = `너는 앱 이용자의 고민과 궁금증을 친절하고 다정하게 해결해 주는 AI 전문 상담원이야. 상대방의 고민을 경청하고 명쾌한 해결책을 제시해줘.\n\n사용자 질문: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    // AI의 대화 답변 전달
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'AI 답변 생성 실패' });
  }
}