import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `今日のひとことを生成してください。以下の要件を満たしてください：

1. 100文字以内の印象的な一言
4. SNSでシェアしたくなるようなエモい一言
5. さりげない気づきをあたえる一言
6. 古臭くならないように、現代的な軽い言葉遣いで
2. メタファーやトポロジーも使って
3. 簡単な言葉なんだけど詩的に

一言のみを返答してください。タイトルや説明は不要です。`
        }
      ]
    });

    const episode = message.content[0].text;

    res.status(200).json({ episode });
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({ error: 'ひとことの生成に失敗しました' });
  }
}