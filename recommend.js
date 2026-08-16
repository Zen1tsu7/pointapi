export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { category } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const prompt = `여행자를 위한 '${category}' 테마 추천 장소 2곳을 추천해줘. 마크다운 없이 JSON 배열 데이터만 출력해줘. 예시: [{"name":"장소명","desc":"이유","rating":"★ 4.8"}]`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const aiRawText = data.candidates[0].content.parts[0].text;
    const cleanJsonText = aiRawText.replace(/```json|```/g, '').trim();

    return res.status(200).json(JSON.parse(cleanJsonText));
  } catch (error) {
    return res.status(500).json({ error: 'AI 분석 실패' });
  }
}

