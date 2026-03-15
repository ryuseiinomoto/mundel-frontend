# Mundel Frontend 📈

マクロ経済理論をリアルタイムに可視化する、経済学部生ならではの FX 分析ターミナル。

##  Concept
「ニュースの一行が、経済モデルをどう動かすのか？」
このプロジェクトは、マクロ経済学の「マンデル＝フレミング・モデル（IS-LM-BP）」をコードで表現し、投資判断に論理的な根拠を与えるために開発しました。

##  Key Features & Engineering
- **Mundel-Fleming Model Visualization**:
  - `Recharts` を高度にカスタマイズし、IS/LM/BP 曲線の動的なシフトを実装。
  - **SVG Vector Drawing**: 均衡点の移動をベクトル（矢印）で描画し、経済の変化の方向性を直感的に理解できる UX を実現。
- **Responsive Terminal UI**:
  - `Tailwind CSS` を使用し、情報の密度が高い「プロ向けターミナル」の質感を追求。
  - 複雑なグラフと AI インサイトを 1 画面に収める情報設計。
- **Environment Synchronization**:
  - 開発環境（Local/Network）における HMR や CORS の問題をクリアし、堅牢なフロントエンド構成を構築。

##  Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Visualization**: Recharts, Lucide React
- **Styling**: Tailwind CSS, Shadcn UI
- **Language**: TypeScript

##  Technical Challenge: "The Ghost in the Network"
**課題**: 開発中、特定のネットワーク経由で古いコードが配信され続けるキャッシュ問題が発生。
**解決策**: ポートのプロセス管理（`lsof`, `kill`）の徹底と、環境変数による API URL の動的切り替えを実装。インフラレベルでのデバッグ能力を養いました。
