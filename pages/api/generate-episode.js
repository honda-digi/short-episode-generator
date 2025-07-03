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
          content: `今日のひとことを生成してください。以下の条件をランダムに組み合わせて創作してください：
視点（1つ選択）：

物の視点（本、椅子、雲、信号機など）
時間の概念（昨日、来週、3秒後など）
感情の擬人化（嫉妬、安堵、驚きなど）
抽象概念（重力、沈黙、速度など）

文体（1つ選択）：

疑問文で終わる
感嘆符で終わる
体言止め
命令形
「〜らしい」調

必須要素（2つ以上含む）：

数字または数学的概念
色の名前
天気・自然現象
身体の部位
時間の単位
音に関する表現

禁止ワード：
心、人生、今日、毎日、大切、きっと、思う、感じる
文字数： 150文字以内
その他：

メタファーを1つ以上使用
SNSでシェアしたくなる現代的な軽さ
一言のみ回答（説明不要）`
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