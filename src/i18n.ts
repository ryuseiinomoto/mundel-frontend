import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Dashboard
      "NEWS_INPUT_TITLE": "NEWS INPUT",
      "NEWS_INPUT_PLACEHOLDER": "Paste macroeconomic news here...",
      "NEWS_INPUT_BUTTON": "ANALYZE",
      "NEWS_INPUT_BUTTON_LOADING": "ANALYZING...",
      "ECONOMIC_CALENDAR_TITLE": "ECONOMIC CALENDAR",
      "ECONOMIC_CALENDAR_SUBTITLE": "(Trading Economics)",
      "ANALYSIS_TITLE": "AI ANALYSIS",
      "ANALYSIS_SUBTITLE": "(Gemini)",
      "IS_LM_BP_MODEL": "IS-LM-BP MODEL",
      "BACKEND_ERROR": "BACKEND ERROR",
      "READY": "READY",
      "NEWS_SENTIMENT_TITLE": "NEWS SENTIMENT",
      // Landing
      "LANDING_TAGLINE": "MUNDEL",
      "LANDING_HERO_1": "Trade with conviction.",
      "LANDING_HERO_2": "Grounded in macro.",
      "LANDING_DESC": "Mundel trains your ability to read macro economics through real news — a daily practice tool for swing and position traders who want to understand why markets move.",
      "LANDING_CTA_ANALYSIS": "Start Analysis",
      "LANDING_CTA_TRADE": "Paper Trading",
      "FEATURE_1_TITLE": "News Analysis",
      "FEATURE_1_DESC": "Analyze news through the IS-LM-BP model and learn the macro rationale behind FX movements.",
      "FEATURE_2_TITLE": "IS-LM-BP Model",
      "FEATURE_2_DESC": "Visualize how macro economic shifts affect exchange rates. Build intuition, not just reflexes.",
      "FEATURE_3_TITLE": "AI Signal",
      "FEATURE_3_DESC": "See BUY / SELL / HOLD signals with full reasoning. The goal is understanding the 'why', not just the signal.",
      "FEATURE_4_TITLE": "Paper Trading",
      "FEATURE_4_DESC": "Execute trades based on your analysis. Practice the full cycle from research to entry to close.",
    }
  },
  ja: {
    translation: {
      // Dashboard
      "NEWS_INPUT_TITLE": "ニュース入力",
      "NEWS_INPUT_PLACEHOLDER": "マクロ経済ニュースを貼り付けてください...",
      "NEWS_INPUT_BUTTON": "分析",
      "NEWS_INPUT_BUTTON_LOADING": "分析中...",
      "ECONOMIC_CALENDAR_TITLE": "経済指標カレンダー",
      "ECONOMIC_CALENDAR_SUBTITLE": "(Trading Economics)",
      "ANALYSIS_TITLE": "AI分析",
      "ANALYSIS_SUBTITLE": "(Gemini)",
      "IS_LM_BP_MODEL": "IS-LM-BPモデル",
      "BACKEND_ERROR": "バックエンドエラー",
      "READY": "準備完了",
      "NEWS_SENTIMENT_TITLE": "ニュースセンチメント",
      // Landing
      "LANDING_TAGLINE": "MUNDEL",
      "LANDING_HERO_1": "根拠を持って、トレードする。",
      "LANDING_HERO_2": "マクロ経済から読み解く。",
      "LANDING_DESC": "スイング・ポジショントレードに必要なマクロ経済の読み方を、実際のニュースで鍛えるトレーニングツールです。なぜ為替が動くかを理解してから、取引する。",
      "LANDING_CTA_ANALYSIS": "分析を始める",
      "LANDING_CTA_TRADE": "模擬トレード",
      "FEATURE_1_TITLE": "ニュース分析",
      "FEATURE_1_DESC": "経済ニュースをIS-LM-BPモデルで分析。なぜ為替が動くかの根拠を学べます。",
      "FEATURE_2_TITLE": "IS-LM-BPモデル",
      "FEATURE_2_DESC": "マクロ経済の変化が為替に与える影響をグラフで視覚化。直感ではなく、理論で理解する。",
      "FEATURE_3_TITLE": "AIシグナル",
      "FEATURE_3_DESC": "BUY / SELL / HOLDの根拠をAIが解説。シグナルより「なぜそうなるか」を理解することが目的です。",
      "FEATURE_4_TITLE": "模擬トレード",
      "FEATURE_4_DESC": "分析した根拠をもとに模擬トレード。エントリーからクローズまで、実践的に学べます。",
    }
  },
  zh: {
    translation: {
      // Dashboard
      "NEWS_INPUT_TITLE": "新闻输入",
      "NEWS_INPUT_PLACEHOLDER": "请粘贴宏观经济新闻...",
      "NEWS_INPUT_BUTTON": "分析",
      "NEWS_INPUT_BUTTON_LOADING": "分析中...",
      "ECONOMIC_CALENDAR_TITLE": "经济日历",
      "ECONOMIC_CALENDAR_SUBTITLE": "(Trading Economics)",
      "ANALYSIS_TITLE": "AI分析",
      "ANALYSIS_SUBTITLE": "(Gemini)",
      "IS_LM_BP_MODEL": "IS-LM-BP模型",
      "BACKEND_ERROR": "后端错误",
      "READY": "就绪",
      "NEWS_SENTIMENT_TITLE": "新闻情绪",
      // Landing
      "LANDING_TAGLINE": "MUNDEL",
      "LANDING_HERO_1": "有根据地交易。",
      "LANDING_HERO_2": "从宏观经济出发。",
      "LANDING_DESC": "Mundel 通过真实新闻训练您解读宏观经济的能力——专为想理解市场背后原因的波段与持仓交易者设计。",
      "LANDING_CTA_ANALYSIS": "开始分析",
      "LANDING_CTA_TRADE": "模拟交易",
      "FEATURE_1_TITLE": "新闻分析",
      "FEATURE_1_DESC": "用IS-LM-BP模型分析经济新闻，学习汇率变动背后的宏观逻辑。",
      "FEATURE_2_TITLE": "IS-LM-BP模型",
      "FEATURE_2_DESC": "可视化宏观经济变化对汇率的影响。用理论理解，而非直觉反应。",
      "FEATURE_3_TITLE": "AI信号",
      "FEATURE_3_DESC": "AI解析买入/卖出/持有的理由。目标是理解「为什么」，而不只是跟随信号。",
      "FEATURE_4_TITLE": "模拟交易",
      "FEATURE_4_DESC": "基于分析结果进行模拟交易。从入场到平仓，完整体验实战流程。",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "ja",
    fallbackLng: "ja",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
