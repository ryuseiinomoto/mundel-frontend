# Mundel

> Learn FX through macroeconomics — not intuition.

**Live Demo**: https://mundel-frontend-490996932437.europe-west1.run.app

---

## Why I built this

大学でマクロ経済学を学ぶ中で、FX初心者が陥りやすい問題に気づきました。

- 根拠のないトレードで損失を出す
- 情報商材に頼り、経済の仕組みを理解しないまま売買する
- 経済ニュースが為替にどう影響するかがわからない

「大学で学んだIS-LM-BPモデルをプロダクトに落とし込めば、根拠を持ってトレードできる人を増やせるのではないか」という発想から開発をスタートしました。

スキャルピングではなく、**スイング・ポジショントレードに必要なマクロ経済の読み方**を、実際のニュースを通じて鍛えることをコンセプトにしています。

---

## What you can do

| ステップ | 内容 |
|---------|------|
| 📰 ニュースを入力 | 経済ニュースを入力するとAIがIS・LM・BPの各曲線がどう動くかを解析 |
| 📊 グラフで確認 | IS-LM-BPモデルのグラフがリアルタイムでシフトし、経済変化を視覚的に理解 |
| 🤖 AIシグナル | BUY / SELL / HOLD のシグナルと、その根拠を日本語で解説 |
| 💹 模擬トレード | 分析した根拠をもとに模擬トレードを実践。損益で理解度を確認 |
| 📚 学習コース | 為替の基礎からIS-LM-BPまで、11ステップで体系的に学習 |

---

## Tech Stack

### Frontend
- **Next.js** (App Router / TypeScript)
- **Tailwind CSS**
- **Framer Motion** — ページ遷移・アニメーション
- **Recharts** — IS-LM-BPグラフの描画
- **i18next** — 多言語対応（日本語 / English / 中文）

### Backend
- **FastAPI** (Python)
- **Gemini API** — ニュースのマクロ経済分析
- **NewsAPI** — FX関連ニュースの取得
- **FRED API** — 米国・日本のマクロ指標（金利・CPI）
- **yfinance** — USD/JPY リアルタイムレート

### Infrastructure
- **Google Cloud Run** — フロントエンド・バックエンド両方をコンテナデプロイ

---

## Architecture

```
User
 │
 ├─ /news        ニュース入力 → POST /api/analyze
 │                               │
 │                    Gemini API（IS/LM/BPシフト量を生成）
 │                    + NewsAPI / FRED / yfinance（市場データ）
 │
 ├─ /model       IS-LM-BPグラフの表示（localStorageから読み込み）
 ├─ /signal      AIシグナル + マクロ影響の詳細
 ├─ /trade       模擬トレード（SQLiteで残高・ポジション管理）
 └─ /learn       11ステップ学習コース（進捗をlocalStorageで管理）
```

---

## Background

経済学部での学習がきっかけで、IS-LM-BPモデルが「理論」で終わらせるには惜しいと感じていました。このモデルは、金利・為替・所得の相互関係を一つの図で説明できる強力なフレームワークです。

それをFXトレードの「予習ツール」として使えないかと考えたのが、Mundelの出発点です。

---

## Japanese Overview

**Mundel（マンデル）** は、マクロ経済学をベースにFXの判断根拠を鍛えるための学習アプリです。

経済ニュースをAIが分析し、IS-LM-BPモデルのグラフをリアルタイムで更新。「なぜ今ドル円が動いているのか」を理論から理解することを目標としています。情報商材に頼らず、経済の仕組みから根拠のあるトレードができる人を増やしたいという思いで開発しました。
