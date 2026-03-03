import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳リソースの定義
const resources = {
  en: {
    translation: {
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
    }
  },
  ja: {
    translation: {
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
    }
  }
};

i18n
  .use(LanguageDetector) // 言語を自動検出
  .use(initReactI18next) // react-i18nextに渡す
  .init({
    resources,
    lng: "ja",
    fallbackLng: "ja", // 検出できなかった場合の言語
    interpolation: {
      escapeValue: false // エスケープを行わない
    }
  });

export default i18n;
