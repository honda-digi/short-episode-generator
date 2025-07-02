import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [episode, setEpisode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // ページ読み込み時に使用回数をチェック
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('episodeUsage');
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        setUsageCount(data.count);
      } else {
        // 日付が変わった場合はリセット
        localStorage.setItem('episodeUsage', JSON.stringify({ date: today, count: 0 }));
        setUsageCount(0);
      }
    } else {
      localStorage.setItem('episodeUsage', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const generateEpisode = async () => {
    if (usageCount >= 10) {
      setError('今日の生成回数上限（3回）に達しました。明日また試してください。');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-episode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('エピソードの生成に失敗しました');
      }

      const data = await response.json();
      setEpisode(data.episode);

      // 使用回数を更新
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      const today = new Date().toDateString();
      localStorage.setItem('episodeUsage', JSON.stringify({ date: today, count: newCount }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToTwitter = () => {
    if (!episode) return;
    const text = encodeURIComponent(`今日のひとこと：\n\n${episode}\n\n#今日のひとこと`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const copyToClipboard = () => {
    if (!episode) return;
    navigator.clipboard.writeText(episode);
    alert('エピソードをクリップボードにコピーしました');
  };

  return (
    <>
      <Head>
        <title>今日のひとこと</title>
        <meta name="description" content="毎日新しいひとことを生成・シェアしよう" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <h1 className="title">今日のひとこと</h1>
          <p className="subtitle">なんかいいひとことを毎日お届けします</p>
        </header>

        <main className="main">
          <div className="usage-info">
            <span className="usage-count">今日の残り回数: {10 - usageCount}/10</span>
          </div>

          <button 
            className={`generate-btn ${isLoading ? 'loading' : ''}`}
            onClick={generateEpisode}
            disabled={isLoading || usageCount >= 10}
          >
            {isLoading ? '生成中...' : usageCount >= 10 ? '本日の上限に達しました' : 'ひとことを生成する'}
          </button>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {episode && (
            <div className="episode-container">
              <div className="episode-box" id="episode-content">
                <p className="episode-text">{episode}</p>
              </div>
              
              <div className="share-buttons">
                <button className="share-btn" onClick={shareToTwitter}>
                  Xでシェア
                </button>
                <button className="share-btn" onClick={copyToClipboard}>
                  コピー
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <div className="donation-section">
            <p className="donation-text">このサービスが気に入ったら</p>
            <a 
              href="https://qr.paypay.ne.jp/p2p01_JRi5DzyMHr0mkWKa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="donation-link"
            >
              paypayで応援する ☕
            </a>
          </div>
        </footer>

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-family: 'Noto Serif JP', serif;
            font-weight: 200;
            background: #fefefe;
            color: #2a2a2a;
            line-height: 1.8;
          }

          .header {
            text-align: center;
            padding: 80px 40px 60px;
            border-bottom: 1px solid #e8e8e8;
          }

          .title {
            font-size: 2.5rem;
            font-weight: 300;
            margin: 0 0 20px;
            letter-spacing: 0.05em;
          }

          .subtitle {
            font-size: 1rem;
            color: #666;
            margin: 0;
            font-weight: 200;
          }

          .main {
            flex: 1;
            max-width: 600px;
            margin: 0 auto;
            padding: 60px 40px;
            width: 100%;
            box-sizing: border-box;
          }

          .usage-info {
            text-align: center;
            margin-bottom: 40px;
          }

          .usage-count {
            font-size: 0.9rem;
            color: #888;
            background: #f8f8f8;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
          }

          .generate-btn {
            width: 100%;
            max-width: 300px;
            display: block;
            margin: 0 auto 40px;
            padding: 16px 32px;
            font-size: 1.1rem;
            font-family: 'Noto Serif JP', serif;
            font-weight: 300;
            background: #2a2a2a;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.05em;
          }

          .generate-btn:hover:not(:disabled) {
            background: #1a1a1a;
            transform: translateY(-1px);
          }

          .generate-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
          }

          .generate-btn.loading {
            opacity: 0.7;
          }

          .error {
            background: #ffe6e6;
            color: #d63031;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 30px;
            font-weight: 300;
          }

          .episode-container {
            margin-top: 50px;
          }

          .episode-box {
            background: white;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 50px;
            margin-bottom: 30px;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            aspect-ratio: 1;
          }

          .episode-text {
            font-size: 1.2rem;
            line-height: 2;
            text-align: center;
            margin: 0;
            color: #2a2a2a;
            font-weight: 300;
            letter-spacing: 0.02em;
          }

          .share-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
          }

          .share-btn {
            padding: 12px 24px;
            font-size: 0.95rem;
            font-family: 'Noto Serif JP', serif;
            font-weight: 300;
            background: transparent;
            color: #2a2a2a;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.03em;
          }

          .share-btn:hover {
            background: #f5f5f5;
            border-color: #999;
          }

          .footer {
            background: #f8f8f8;
            padding: 60px 40px;
            text-align: center;
            border-top: 1px solid #e8e8e8;
            margin-top: auto;
          }

          .donation-section {
            max-width: 400px;
            margin: 0 auto;
          }

          .donation-text {
            font-size: 1rem;
            color: #666;
            margin: 0 0 20px;
            font-weight: 300;
          }

          .donation-link {
            display: inline-block;
            padding: 14px 28px;
            background: #2a2a2a;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 300;
            transition: all 0.3s ease;
            letter-spacing: 0.03em;
          }

          .donation-link:hover {
            background: #1a1a1a;
            transform: translateY(-1px);
          }

          .donation-note {
            font-size: 0.8rem;
            color: #999;
            margin: 15px 0 0;
            font-weight: 200;
          }

          @media (max-width: 768px) {
            .title {
              font-size: 2rem;
            }
            
            .main {
              padding: 40px 20px;
            }
            
            .episode-box {
              padding: 30px 25px;
              min-height: 250px;
            }
            
            .episode-text {
              font-size: 1.1rem;
            }
            
            .header {
              padding: 60px 20px 40px;
            }
            
            .footer {
              padding: 40px 20px;
            }
          }
        `}</style>
      </div>
    </>
  );
}