import React, { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, PenLine, Sparkles, Check, ArrowRight, RotateCcw,
  Download, BookOpen, Feather, Layers, AlertTriangle, Search, Minus, Plus, UserCheck,
} from "lucide-react";
import { watchAuth, idToken, logout } from "./firebase";
import { api, setToken, authHeader } from "./lib/api";
import Pricing from "./Pricing";
import Login from "./Login";


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("UI Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#5C0F14' }}>
          <h2>Oops! Something went wrong rendering the result.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========= Backend API URL =========
// When the JSX is served by the FastAPI backend itself (local dev OR Oracle
// production), use a relative base so the URL follows the current host/port
// automatically. Set VYAS_DEV_API in the environment only when developing
// the frontend separately (e.g. Vite dev server at a different port).
const API_BASE = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE 
  ? import.meta.env.VITE_API_BASE 
  : ((typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3000") 
    ? "http://localhost:8000" 
    : "");

// ================= Brand tokens (locked palette) =================
const C = {
  maroon: "#5C0F14", maroonSoft: "#7A1B22", gold: "#C9A227", goldSoft: "#E0C766",
  cream: "#FBF3E6", creamDeep: "#F3E6CE", ink: "#3A2A22", inkSoft: "#6B5A4E", paper: "#FFFDF8",
};
const ACCEPT = "image/*,.pdf,.doc,.docx";

// ================= Exam configuration (one config per portal) =================
// A new PCS exam = a new block here. Each portal mounts <VyasUI examId="UPSC" /> etc.
const GS_UPSC = [
  { id: "m10", label: { en: "10 marks · 150 words", hi: "10 अंक · 150 शब्द" }, marks: 10, words: 150, rubric: "gs" },
  { id: "m15", label: { en: "15 marks · 250 words", hi: "15 अंक · 250 शब्द" }, marks: 15, words: 250, rubric: "gs" },
];
const GS_RAS = [
  { id: "m5", label: { en: "5 marks · 50 words", hi: "5 अंक · 50 शब्द" }, marks: 5, words: 50, rubric: "gs" },
  { id: "m10", label: { en: "10 marks · 100 words", hi: "10 अंक · 100 शब्द" }, marks: 10, words: 100, rubric: "gs" },
];

const EXAM_CONFIG = {
  UPSC: {
    id: "UPSC",
    name: { en: "UPSC Civil Services · Mains", hi: "UPSC सिविल सेवा · मुख्य" },
    portal: { en: "UPSC Portal", hi: "UPSC पोर्टल" },
    papers: [
      { id: "auto", label: { en: "Auto-detect Subject", hi: "विषय स्वतः पहचानें" }, rubric: "gs", fullMarks: 250, units: GS_UPSC },
      { id: "essay", label: { en: "Essay", hi: "निबंध" }, rubric: "essay", fullMarks: 250,
        units: [{ id: "e125", label: { en: "Essay · 125 marks", hi: "निबंध · 125 अंक" }, marks: 125, words: 1100, rubric: "essay" }] },
      { id: "gs1", label: { en: "GS-I · History · Geography · Society", hi: "GS-I · इतिहास · भूगोल · समाज" }, rubric: "gs", fullMarks: 250, units: GS_UPSC },
      { id: "gs2", label: { en: "GS-II · Polity · Governance · IR", hi: "GS-II · राजव्यवस्था · शासन · अंतर्राष्ट्रीय संबंध" }, rubric: "gs", fullMarks: 250, units: GS_UPSC },
      { id: "gs3", label: { en: "GS-III · Economy · Environment · Security", hi: "GS-III · अर्थव्यवस्था · पर्यावरण · सुरक्षा" }, rubric: "gs", fullMarks: 250, units: GS_UPSC },
      { id: "gs4", label: { en: "GS-IV · Ethics, Integrity & Aptitude", hi: "GS-IV · नीतिशास्त्र, सत्यनिष्ठा" }, rubric: "ethics", fullMarks: 250,
        units: [
          { id: "e10", label: { en: "10 marks · 150 words", hi: "10 अंक · 150 शब्द" }, marks: 10, words: 150, rubric: "ethics" },
          { id: "e15", label: { en: "15 marks · 250 words", hi: "15 अंक · 250 शब्द" }, marks: 15, words: 250, rubric: "ethics" },
          { id: "cs", label: { en: "Case study · 20 marks", hi: "केस स्टडी · 20 अंक" }, marks: 20, words: 300, rubric: "ethics" },
        ] },
    ],
  },
  RAS: {
    id: "RAS",
    name: { en: "RPSC RAS · Mains", hi: "RPSC RAS · मुख्य" },
    portal: { en: "RAS Portal", hi: "RAS पोर्टल" },
    papers: [
      { id: "auto", label: { en: "Auto-detect Subject", hi: "विषय स्वतः पहचानें" }, rubric: "gs", fullMarks: 200, units: GS_RAS },
      { id: "gs1", label: { en: "GS Paper I", hi: "GS प्रश्नपत्र I" }, rubric: "gs", fullMarks: 200, units: GS_RAS },
      { id: "gs2", label: { en: "GS Paper II", hi: "GS प्रश्नपत्र II" }, rubric: "gs", fullMarks: 200, units: GS_RAS },
      { id: "gs3", label: { en: "GS Paper III", hi: "GS प्रश्नपत्र III" }, rubric: "gs", fullMarks: 200, units: GS_RAS },
      { id: "p4", label: { en: "Paper IV · General Hindi & English", hi: "प्रश्नपत्र IV · सामान्य हिंदी व अंग्रेज़ी" }, rubric: "language", fullMarks: 200,
        units: [
          { id: "daily", label: { en: "Daily Answer Writing", hi: "दैनिक उत्तर लेखन" }, marks: 10, words: 150, rubric: "essay", daily: true },
          { id: "essay40", label: { en: "Essay · 40 marks", hi: "निबंध · 40 अंक" }, marks: 40, words: 600, rubric: "essay" },
          { id: "precis", label: { en: "Précis writing", hi: "संक्षेपण" }, marks: 15, words: 100, rubric: "language" },
          { id: "trans", label: { en: "Translation", hi: "अनुवाद" }, marks: 10, words: 80, rubric: "language" },
          { id: "letter", label: { en: "Letter / Composition", hi: "पत्र / रचना" }, marks: 15, words: 150, rubric: "language" },
          { id: "grammar", label: { en: "Grammar & Usage", hi: "व्याकरण व प्रयोग" }, marks: 10, words: 60, rubric: "language" },
        ] },
    ],
  },
};

// Maps a chosen paper to the subject label used in backend/data/qbank.json.
// Subjects present there: GS, Geography, Sociology, Anthropology, PSIR,
// History, Ethics. Keep these strings exactly as spelled in the qbank.
const SUBJECT_BY_PAPER = {
  "UPSC:auto": "Auto",
  "UPSC:gs4": "Ethics",
  "UPSC:gs1": "GS",
  "UPSC:gs2": "GS",
  "UPSC:gs3": "GS",
  "UPSC:essay": "GS",
  "RAS:auto": "Auto",
  "RAS:gs1": "GS",
  "RAS:gs2": "GS",
  "RAS:gs3": "GS",
  "RAS:p4": "GS",
};
const RUBRIC_SUBJECT = { ethics: "Ethics", gs: "GS", essay: "GS", language: "GS" };

// ================= Bilingual UI strings =================
const T = {
  en: {
    subtitle: "AI Mains Evaluator · TheMCQApp",
    modeTitle: "How should we check your answers?",
    modeSub: "Pick how you're submitting today.",
    fullTitle: "Full-length mock test", fullDesc: "Upload the question paper, then your full answer booklet.",
    customTitle: "Custom questions", customDesc: "Pick a paper and marks type, then upload your answers.",
    changeMode: "Change mode", continue: "Continue",
    choosePaper: "Choose paper", chooseType: "Question type", howMany: "How many questions to check?",
    questionsWord: "questions", questionWord: "question",
    fullSetup: "Full-length setup", customSetup: "Custom check setup",
    formats: "Image · PDF · Word accepted",
    qPaper: "Question paper", answerCopy: "Answer booklet",
    tapUpload: "Tap to upload", uploaded: "Uploaded",
    customUploadTitle: "Upload your answer copy", customUploadSub: "Write the question at the top of the page, then upload.",
    answerWithQ: "Answer copy — question on top", answerHint: "Keep the question at the top · handwritten is fine",
    previewNoQ: "Preview: what if no question is found",
    scanningTitle: "Looking for the question on your copy", scanningSub: "Reading the top of your answer…",
    noQTitle: "We couldn't find the question", noQDesc: "There's no readable question at the top of your copy. Add the question paper so we can score against what was actually asked.",
    uploadQSep: "Upload question paper", noHaveQ: "I don't have the question",
    deniedTitle: "We can't check without the question", deniedDesc: "A Mains answer is scored against its question — the directive word, the demand and the scope all come from it. Please add the question to continue.",
    addQuestion: "Add the question", startOver: "Start over",
    foundQ: "Question found on your copy", questionLabel: "QUESTION", marksLabel: "MARKS", wordsLabel: "WORDS",
    quickCheck: "QUICK CHECK", cushionTitle: "First, confirm your cushion",
    cushionDesc: "VYAS read the opening lines of your answer — the cushion that sets context before your main points. Handwriting can be misread, so please check it came through correctly.",
    detectedCushion: "DETECTED CUSHION", cushionYes: "Yes, that's correct — start checking", cushionEdit: "Not right — edit it",
    saveContinue: "Save & continue", resetOriginal: "Reset to original",
    whyStep: "Why this step? A wrong cushion throws off the whole evaluation. One quick confirmation keeps your score accurate.",
    evalTitle: "VYAS is reading your copy", evalSub: "This usually takes a few seconds",
    stepRead: "Reading your handwriting", stepUnderstand: "Understanding the question", stepDims: "Checking each dimension", stepFeedback: "Preparing your feedback",
    scorecard: "Your scorecard", didWell: "What you did well", gainMarks: "Where you can gain marks", onCopy: "On your copy",
    evalAnother: "Evaluate another answer", downloadPdf: "Download red-ink PDF",
    ofN: "of",
    dailyBadge: "DAILY",
    chooseEvalTitle: "Choose how to get evaluated", chooseEvalSub: "You can always try the other option later.",
    aiTitle: "Advanced AI Evaluation", aiDesc: "Instant, dimension-wise scorecard with copy annotations and next-mark tips.", aiTag: "Instant · Free",
    mentorTitle: "Mentor Evaluation (Human)", mentorDesc: "A subject expert reviews your copy personally and returns marks with detailed remarks.", mentorTag: "Expert · 24–48 hrs",
    mentorSentTitle: "Sent to your mentor", mentorSentDesc: "Your copy is in the review queue. You'll be notified here once your mentor completes the evaluation.",
    queueLabel: "Queue position", turnaround: "Expected in 24–48 hours", aiWhileWait: "Get instant AI feedback while you wait", doneBtn: "Done",
  },
  hi: {
    subtitle: "AI मुख्य परीक्षा मूल्यांकन · TheMCQApp",
    modeTitle: "आपके उत्तर कैसे जाँचें?",
    modeSub: "आज आप कैसे जमा कर रहे हैं, चुनें।",
    fullTitle: "पूर्ण मॉक टेस्ट", fullDesc: "प्रश्न-पत्र अपलोड करें, फिर अपनी पूरी उत्तर-पुस्तिका।",
    customTitle: "कस्टम प्रश्न", customDesc: "पेपर और अंक-प्रकार चुनें, फिर अपने उत्तर अपलोड करें।",
    changeMode: "मोड बदलें", continue: "आगे बढ़ें",
    choosePaper: "पेपर चुनें", chooseType: "प्रश्न प्रकार", howMany: "कितने प्रश्न जाँचें?",
    questionsWord: "प्रश्न", questionWord: "प्रश्न",
    fullSetup: "पूर्ण टेस्ट सेटअप", customSetup: "कस्टम जाँच सेटअप",
    formats: "इमेज · PDF · Word स्वीकार्य",
    qPaper: "प्रश्न-पत्र", answerCopy: "उत्तर-पुस्तिका",
    tapUpload: "अपलोड करने के लिए टैप करें", uploaded: "अपलोड हो गया",
    customUploadTitle: "अपनी उत्तर-पुस्तिका अपलोड करें", customUploadSub: "पृष्ठ के ऊपर प्रश्न लिखें, फिर अपलोड करें।",
    answerWithQ: "उत्तर-पुस्तिका — ऊपर प्रश्न लिखा हो", answerHint: "प्रश्न सबसे ऊपर रखें · हस्तलिखित चलेगा",
    previewNoQ: "पूर्वावलोकन: यदि प्रश्न न मिले",
    scanningTitle: "आपकी कॉपी पर प्रश्न ढूँढ रहे हैं", scanningSub: "आपके उत्तर का ऊपरी भाग पढ़ रहे हैं…",
    noQTitle: "हमें प्रश्न नहीं मिला", noQDesc: "आपकी कॉपी के ऊपर कोई पठनीय प्रश्न नहीं है। प्रश्न-पत्र जोड़ें ताकि वास्तव में पूछे गए के अनुसार मूल्यांकन हो सके।",
    uploadQSep: "प्रश्न-पत्र अपलोड करें", noHaveQ: "मेरे पास प्रश्न नहीं है",
    deniedTitle: "प्रश्न के बिना जाँच संभव नहीं", deniedDesc: "मुख्य परीक्षा का उत्तर उसके प्रश्न के अनुसार आँका जाता है — निर्देश शब्द, माँग और दायरा सब उसी से आते हैं। जारी रखने के लिए कृपया प्रश्न जोड़ें।",
    addQuestion: "प्रश्न जोड़ें", startOver: "फिर से शुरू करें",
    foundQ: "आपकी कॉपी पर मिला प्रश्न", questionLabel: "प्रश्न", marksLabel: "अंक", wordsLabel: "शब्द",
    quickCheck: "त्वरित जाँच", cushionTitle: "पहले, अपना कुशन पुष्टि करें",
    cushionDesc: "VYAS ने आपके उत्तर की शुरुआती पंक्तियाँ पढ़ीं — वह कुशन जो मुख्य बिंदुओं से पहले संदर्भ देता है। हस्तलेख गलत पढ़ा जा सकता है, इसलिए कृपया जाँच लें कि यह सही आया है।",
    detectedCushion: "पहचाना गया कुशन", cushionYes: "हाँ, यह सही है — जाँच शुरू करें", cushionEdit: "सही नहीं — संपादित करें",
    saveContinue: "सहेजें और आगे बढ़ें", resetOriginal: "मूल पर रीसेट करें",
    whyStep: "यह चरण क्यों? गलत कुशन पूरे मूल्यांकन को बिगाड़ देता है। एक त्वरित पुष्टि आपके अंक सटीक रखती है।",
    evalTitle: "VYAS आपकी कॉपी पढ़ रहा है", evalSub: "आमतौर पर कुछ सेकंड लगते हैं",
    stepRead: "आपका हस्तलेख पढ़ रहे हैं", stepUnderstand: "प्रश्न को समझ रहे हैं", stepDims: "हर आयाम जाँच रहे हैं", stepFeedback: "आपकी प्रतिक्रिया तैयार कर रहे हैं",
    scorecard: "आपका स्कोरकार्ड", didWell: "आपने क्या अच्छा किया", gainMarks: "यहाँ अंक बढ़ा सकते हैं", onCopy: "आपकी कॉपी पर",
    evalAnother: "दूसरा उत्तर जाँचें", downloadPdf: "रेड-इंक PDF डाउनलोड करें",
    ofN: "में से",
    dailyBadge: "दैनिक",
    chooseEvalTitle: "मूल्यांकन का तरीका चुनें", chooseEvalSub: "आप बाद में दूसरा विकल्प भी आज़मा सकते हैं।",
    aiTitle: "एडवांस AI मूल्यांकन", aiDesc: "तुरंत, आयाम-वार स्कोरकार्ड — कॉपी एनोटेशन व अंक बढ़ाने के सुझावों के साथ।", aiTag: "तुरंत · निःशुल्क",
    mentorTitle: "मेंटर मूल्यांकन (मानव)", mentorDesc: "विषय-विशेषज्ञ आपकी कॉपी स्वयं जाँचकर अंक व विस्तृत टिप्पणियों के साथ लौटाते हैं।", mentorTag: "विशेषज्ञ · 24–48 घंटे",
    mentorSentTitle: "आपके मेंटर को भेज दिया गया", mentorSentDesc: "आपकी कॉपी समीक्षा-कतार में है। मेंटर के मूल्यांकन पूरा करते ही आपको यहाँ सूचित किया जाएगा।",
    queueLabel: "कतार में स्थान", turnaround: "24–48 घंटे में अपेक्षित", aiWhileWait: "प्रतीक्षा में तुरंत AI प्रतिक्रिया लें", doneBtn: "पूर्ण",
  },
};

// ================= Sample results per rubric (bilingual, demo content) =================
const SAMPLES = {
  gs: {
    en: {
      question: "Examine the role of women's Self-Help Groups (SHGs) in rural empowerment in India.",
      cushion: "The 73rd Constitutional Amendment and flagship schemes like DAY-NRLM have placed rural women at the heart of grassroots development, with Self-Help Groups emerging as their most powerful vehicle for change.",
      note: { label: "Directive word:", value: "Examine", explain: "— the examiner wants you to weigh both sides, not just describe." },
      dimensions: [
        { name: "Content & Coverage", score: 7.5, note: "Good factual base, add a scheme link (DAY-NRLM)." },
        { name: "Structure & Flow", score: 6.5, note: "Intro–body–conclusion present; body needs sub-headings." },
        { name: "Analysis & Argument", score: 5.5, note: "More 'examine' — weigh strengths and limitations." },
        { name: "Presentation", score: 6.5, note: "Underline keywords; a small flow-diagram would help." },
        { name: "Language & Expression", score: 7.0, note: "Clear and readable. Trim two long sentences." },
      ],
      strengths: ["Strong opening line that defines SHGs before analysing them.", "Real examples — Kudumbashree and DAY-NRLM show application.", "Conclusion is forward-looking, not just a summary."],
      gains: ["Directive is 'Examine' — add 2 limitations (elite capture, over-indebtedness).", "Convert the second paragraph into 3 crisp points.", "Add a keyword the examiner looks for: 'financial inclusion'."],
      annotated: [
        { text: "Self-Help Groups are small voluntary associations of rural women formed to promote savings and mutual support.", note: "Clear definition — good start.", tone: "good" },
        { text: "They have improved the economic condition of women through microfinance and small enterprises.", note: "Add a data point or scheme name (DAY-NRLM).", tone: "improve" },
        { text: "Thus, SHGs are a powerful tool for empowerment and should be strengthened further.", note: "'Examine' needs balance — mention a limitation first.", tone: "improve" },
      ],
    },
    hi: {
      question: "भारत में ग्रामीण सशक्तिकरण में महिला स्वयं सहायता समूहों (SHGs) की भूमिका का परीक्षण कीजिए।",
      cushion: "73वें संविधान संशोधन और DAY-NRLM जैसी योजनाओं ने ग्रामीण महिलाओं को जमीनी विकास के केंद्र में ला दिया है, जहाँ स्वयं सहायता समूह बदलाव का सबसे सशक्त माध्यम बनकर उभरे हैं।",
      note: { label: "निर्देश शब्द:", value: "परीक्षण", explain: "— परीक्षक चाहता है कि आप दोनों पक्ष तौलें, केवल वर्णन न करें।" },
      dimensions: [
        { name: "विषय-वस्तु व कवरेज", score: 7.5, note: "तथ्यात्मक आधार अच्छा है, एक योजना जोड़ें (DAY-NRLM)।" },
        { name: "संरचना व प्रवाह", score: 6.5, note: "भूमिका–मुख्य भाग–निष्कर्ष मौजूद; उप-शीर्षक जोड़ें।" },
        { name: "विश्लेषण व तर्क", score: 5.5, note: "'परीक्षण' अधिक करें — गुण और सीमाएँ दोनों तौलें।" },
        { name: "प्रस्तुतिकरण", score: 6.5, note: "कीवर्ड रेखांकित करें; एक छोटा फ्लो-डायग्राम मदद करेगा।" },
        { name: "भाषा व अभिव्यक्ति", score: 7.0, note: "स्पष्ट और पठनीय। दो लंबे वाक्य छोटे करें।" },
      ],
      strengths: ["SHGs को परिभाषित करती मजबूत शुरुआती पंक्ति।", "वास्तविक उदाहरण — कुदुम्बश्री और DAY-NRLM।", "निष्कर्ष आगे की ओर देखने वाला है।"],
      gains: ["निर्देश 'परीक्षण' है — 2 सीमाएँ जोड़ें (एलीट कैप्चर, अति-ऋणग्रस्तता)।", "दूसरे अनुच्छेद को 3 सटीक बिंदुओं में बदलें।", "कीवर्ड जोड़ें: 'वित्तीय समावेशन'।"],
      annotated: [
        { text: "स्वयं सहायता समूह ग्रामीण महिलाओं के छोटे स्वैच्छिक संगठन हैं जो बचत को बढ़ावा देते हैं।", note: "स्पष्ट परिभाषा — अच्छी शुरुआत।", tone: "good" },
        { text: "इन्होंने माइक्रोफाइनेंस के माध्यम से महिलाओं की आर्थिक स्थिति सुधारी है।", note: "एक आँकड़ा या योजना जोड़ें (DAY-NRLM)।", tone: "improve" },
        { text: "अतः SHGs सशक्तिकरण का शक्तिशाली साधन हैं और इन्हें और मजबूत किया जाना चाहिए।", note: "'परीक्षण' हेतु संतुलन — पहले एक सीमा बताएँ।", tone: "improve" },
      ],
    },
  },
  ethics: {
    en: {
      question: "A colleague asks you to overlook a minor safety lapse to meet an urgent deadline. Examine the ethical issues and decide your course of action.",
      cushion: "Administration rests on both efficiency and integrity; when a deadline pushes an officer to ignore safety, the case tests whether urgent ends can justify unsafe means.",
      note: { label: "Core demand:", value: "Examine + decide", explain: "— state the dilemma, weigh the values, then commit to a defensible action." },
      dimensions: [
        { name: "Concept Clarity", score: 7.0, note: "Ethical terms used correctly; define 'conflict of interest'." },
        { name: "Ethical Reasoning", score: 6.0, note: "Weigh consequences vs duty more sharply." },
        { name: "Stakeholder Analysis", score: 6.5, note: "Name all affected — workers, public, organisation." },
        { name: "Case Application", score: 5.5, note: "Move from theory to a clear decision with steps." },
        { name: "Presentation", score: 7.0, note: "Readable; a values-vs-options table would lift it." },
      ],
      strengths: ["Names the core conflict (safety vs deadline) upfront.", "Invokes a real principle — public interest over expediency.", "Takes a stand instead of sitting on the fence."],
      gains: ["Add a short stakeholder map before deciding.", "Link one code or thinker (civil-service values).", "End with concrete steps, not just intent."],
      annotated: [
        { text: "Ignoring the lapse may save time but risks lives, which no deadline can justify.", note: "Strong ethical anchor.", tone: "good" },
        { text: "I would talk to my colleague and report the issue to my senior.", note: "Add the exact steps and safeguards.", tone: "improve" },
      ],
    },
    hi: {
      question: "एक सहकर्मी आपसे समय-सीमा पूरी करने हेतु एक छोटी सुरक्षा-चूक अनदेखी करने को कहता है। इसमें निहित नैतिक मुद्दों का परीक्षण कर अपनी कार्यवाही तय कीजिए।",
      cushion: "प्रशासन दक्षता और सत्यनिष्ठा दोनों पर टिका है; जब समय-सीमा किसी अधिकारी को सुरक्षा अनदेखी के लिए विवश करती है, तो यह परखता है कि क्या तात्कालिक साध्य असुरक्षित साधनों को उचित ठहरा सकता है।",
      note: { label: "मुख्य माँग:", value: "परीक्षण + निर्णय", explain: "— दुविधा बताएँ, मूल्यों को तौलें, फिर एक ठोस कार्यवाही तय करें।" },
      dimensions: [
        { name: "अवधारणा स्पष्टता", score: 7.0, note: "नैतिक शब्द सही; 'हितों का टकराव' परिभाषित करें।" },
        { name: "नैतिक तर्क", score: 6.0, note: "परिणाम बनाम कर्तव्य को अधिक स्पष्ट तौलें।" },
        { name: "हितधारक विश्लेषण", score: 6.5, note: "सभी प्रभावितों का नाम लें — श्रमिक, जनता, संगठन।" },
        { name: "केस अनुप्रयोग", score: 5.5, note: "सिद्धांत से स्पष्ट निर्णय व चरणों तक जाएँ।" },
        { name: "प्रस्तुतिकरण", score: 7.0, note: "पठनीय; मूल्य-बनाम-विकल्प तालिका बेहतर करेगी।" },
      ],
      strengths: ["मूल टकराव (सुरक्षा बनाम समय-सीमा) पहले बताया।", "वास्तविक सिद्धांत — लोकहित सर्वोपरि।", "पक्ष लिया, तटस्थ नहीं रहे।"],
      gains: ["निर्णय से पहले एक संक्षिप्त हितधारक मानचित्र जोड़ें।", "एक आचार-संहिता या विचारक जोड़ें।", "केवल आशय नहीं, ठोस चरणों से समाप्त करें।"],
      annotated: [
        { text: "चूक अनदेखी समय बचा सकती है पर जीवन जोखिम में डालती है, जिसे कोई समय-सीमा उचित नहीं ठहरा सकती।", note: "मजबूत नैतिक आधार।", tone: "good" },
        { text: "मैं सहकर्मी से बात कर वरिष्ठ को सूचित करूँगा।", note: "सटीक चरण व सुरक्षा-उपाय जोड़ें।", tone: "improve" },
      ],
    },
  },
  essay: {
    en: {
      question: "Essay: 'Technology is a useful servant but a dangerous master.'",
      cushion: "From fire to artificial intelligence, every tool has served humanity when guided by its values — and endangered it the moment it began to lead instead of follow.",
      note: { label: "Core demand:", value: "Balanced argument", explain: "— build a thesis, defend it across domains, and resolve the tension." },
      dimensions: [
        { name: "Thesis & Relevance", score: 7.0, note: "Clear stand; tie every paragraph back to it." },
        { name: "Structure & Flow", score: 6.0, note: "Add signposting between sections." },
        { name: "Depth & Examples", score: 6.5, note: "Add one example from history and one from ethics." },
        { name: "Language & Expression", score: 7.5, note: "Fluent and controlled." },
        { name: "Balance & Conclusion", score: 5.5, note: "Address the counter-view before concluding." },
      ],
      strengths: ["Opens with a vivid, thematic hook.", "Draws examples across science, society and economy.", "Holds one clear line of argument throughout."],
      gains: ["Give the opposing view a full paragraph before your verdict.", "Use the three-lens frame: India · world · philosophy.", "Tighten the conclusion into a forward-looking resolution."],
      annotated: [
        { text: "Technology has multiplied human capability beyond anything our ancestors imagined.", note: "Good — but narrow to your thesis faster.", tone: "improve" },
        { text: "Yet the same networks that connect us can quietly begin to govern our choices.", note: "Excellent turn into the 'master' idea.", tone: "good" },
      ],
    },
    hi: {
      question: "निबंध: 'तकनीक एक उपयोगी सेवक है परन्तु खतरनाक स्वामी।'",
      cushion: "आग से लेकर कृत्रिम बुद्धिमत्ता तक, हर उपकरण ने मानव-मूल्यों के मार्गदर्शन में सेवा की — और जैसे ही वह अनुसरण की जगह नेतृत्व करने लगा, संकट बन गया।",
      note: { label: "मुख्य माँग:", value: "संतुलित तर्क", explain: "— एक थीसिस बनाएँ, विभिन्न क्षेत्रों में उसका बचाव करें, और तनाव को सुलझाएँ।" },
      dimensions: [
        { name: "थीसिस व प्रासंगिकता", score: 7.0, note: "स्पष्ट पक्ष; हर अनुच्छेद को उससे जोड़ें।" },
        { name: "संरचना व प्रवाह", score: 6.0, note: "खंडों के बीच संकेत-सूत्र जोड़ें।" },
        { name: "गहराई व उदाहरण", score: 6.5, note: "इतिहास व नीतिशास्त्र से एक-एक उदाहरण जोड़ें।" },
        { name: "भाषा व अभिव्यक्ति", score: 7.5, note: "प्रवाहपूर्ण व नियंत्रित।" },
        { name: "संतुलन व निष्कर्ष", score: 5.5, note: "निष्कर्ष से पहले विपक्ष को स्थान दें।" },
      ],
      strengths: ["सजीव, विषयगत आरंभ।", "विज्ञान, समाज व अर्थव्यवस्था से उदाहरण।", "एक स्पष्ट तर्क-रेखा बनी रहती है।"],
      gains: ["निर्णय से पहले विपक्ष को पूरा अनुच्छेद दें।", "त्रि-दृष्टि ढाँचा: भारत · विश्व · दर्शन।", "निष्कर्ष को भविष्योन्मुखी बनाएँ।"],
      annotated: [
        { text: "तकनीक ने मानव-क्षमता को अकल्पनीय रूप से बढ़ाया है।", note: "अच्छा — पर थीसिस तक शीघ्र आएँ।", tone: "improve" },
        { text: "फिर भी जो नेटवर्क हमें जोड़ते हैं, वही चुपचाप हमारे निर्णयों पर शासन करने लगते हैं।", note: "'स्वामी' विचार की उत्कृष्ट ओर मुड़ाव।", tone: "good" },
      ],
    },
  },
  language: {
    en: {
      question: "Précis: Condense the given passage to one-third its length, keeping its central argument intact.",
      cushion: "",
      note: { label: "Task:", value: "Précis", explain: "— capture the core in your own words, within the word limit." },
      dimensions: [
        { name: "Accuracy of Meaning", score: 7.0, note: "Core idea retained; one supporting point dropped." },
        { name: "Compression", score: 6.0, note: "Slightly over length — trim examples, keep the argument." },
        { name: "Own Words / Paraphrase", score: 6.5, note: "Reduce phrases lifted from the passage." },
        { name: "Grammar & Usage", score: 7.5, note: "Clean; watch two tense shifts." },
        { name: "Coherence & Flow", score: 6.5, note: "Link sentences so it reads as one paragraph." },
      ],
      strengths: ["Central argument identified correctly.", "Mostly in your own words.", "Grammar is clean and controlled."],
      gains: ["Cut to one-third — you're ~15% over.", "Replace two lifted phrases with paraphrase.", "Add linking words for smoother flow."],
      annotated: [
        { text: "The author argues that unplanned urban growth strains both civic services and social trust.", note: "Accurate core — good.", tone: "good" },
        { text: "For example, in many rapidly growing cities the water supply falls short…", note: "A précis should drop examples to save words.", tone: "improve" },
      ],
    },
    hi: {
      question: "संक्षेपण: दिए गए अवतरण को उसके मूल तर्क को बनाए रखते हुए एक-तिहाई में संक्षिप्त कीजिए।",
      cushion: "",
      note: { label: "कार्य:", value: "संक्षेपण", explain: "— मूल भाव को अपने शब्दों में, शब्द-सीमा के भीतर पकड़ें।" },
      dimensions: [
        { name: "अर्थ की सटीकता", score: 7.0, note: "मूल भाव सुरक्षित; एक सहायक बिंदु छूटा।" },
        { name: "संक्षेपण", score: 6.0, note: "थोड़ा लंबा — उदाहरण हटाएँ, तर्क रखें।" },
        { name: "स्व-शब्द / भावानुवाद", score: 6.5, note: "अवतरण से उठाए वाक्यांश घटाएँ।" },
        { name: "व्याकरण व प्रयोग", score: 7.5, note: "स्वच्छ; दो काल-परिवर्तन देखें।" },
        { name: "सुसंगति व प्रवाह", score: 6.5, note: "वाक्यों को जोड़ें ताकि एक अनुच्छेद-सा पढ़े।" },
      ],
      strengths: ["मूल तर्क सही पहचाना।", "अधिकांशतः अपने शब्दों में।", "व्याकरण स्वच्छ व नियंत्रित।"],
      gains: ["एक-तिहाई तक घटाएँ — ~15% अधिक है।", "दो उठाए वाक्यांश भावानुवाद से बदलें।", "प्रवाह हेतु संयोजक शब्द जोड़ें।"],
      annotated: [
        { text: "लेखक तर्क देता है कि अनियोजित शहरी वृद्धि नागरिक सेवाओं व सामाजिक विश्वास दोनों पर दबाव डालती है।", note: "सटीक सार — अच्छा।", tone: "good" },
        { text: "उदाहरणतः, कई तेज़ी से बढ़ते शहरों में जल-आपूर्ति कम पड़ जाती है…", note: "संक्षेपण में उदाहरण हटाने चाहिए।", tone: "improve" },
      ],
    },
  },
};

function verdict(avg, lang) {
  if (lang === "hi") {
    if (avg >= 8) return "उत्कृष्ट — मॉडल उत्तर के करीब।";
    if (avg >= 6.5) return "अच्छा प्रयास — कुछ सुधार और अंक दिला सकते हैं।";
    if (avg >= 5) return "ठीक-ठाक — आधार मौजूद है, विश्लेषण को धार दें।";
    return "लगे रहें — पहले संरचना बनाते हैं।";
  }
  if (avg >= 8) return "Excellent — near model-answer level.";
  if (avg >= 6.5) return "Good attempt — a few tweaks unlock more marks.";
  if (avg >= 5) return "Fair — the base is there, sharpen the analysis.";
  return "Keep going — let's build the structure first.";
}

// ================= Brand logo (TheMCQApp) =================
function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="TheMCQApp">
      <defs>
        <linearGradient id="vg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0DB8A" /><stop offset="0.5" stopColor="#C9A227" /><stop offset="1" stopColor="#8F6E12" />
        </linearGradient>
        <radialGradient id="vg-maroon" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#7E1C24" /><stop offset="1" stopColor="#4A0B10" />
        </radialGradient>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#vg-maroon)" stroke="url(#vg-gold)" strokeWidth="4.5" />
      <circle cx="47" cy="53" r="26" fill="none" stroke="url(#vg-gold)" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M33 55 L45 68 L80 22" fill="none" stroke="url(#vg-gold)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Animated version used while a copy is being checked
function LogoLoader({ size = 100, label, ff }) {
  const LEN = 2 * Math.PI * 26;
  const CHK = 72;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <style>{`
        @keyframes vgBreathe { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.05);} }
        @keyframes vgSpin { to { transform: rotate(360deg);} }
        @keyframes vgTick { 0%{stroke-dashoffset:${CHK}; opacity:.25;} 45%{stroke-dashoffset:0; opacity:1;} 82%{stroke-dashoffset:0; opacity:1;} 100%{stroke-dashoffset:${CHK}; opacity:.25;} }
        @keyframes vgGlow { 0%,100%{ filter: drop-shadow(0 0 3px rgba(201,162,39,.35)); } 50%{ filter: drop-shadow(0 0 13px rgba(201,162,39,.85)); } }
        .vg-wrap { animation: vgBreathe 2.2s ease-in-out infinite, vgGlow 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .vg-comet { animation: vgSpin 1.35s linear infinite; transform-box: fill-box; transform-origin: center; }
        .vg-check { animation: vgTick 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .vg-wrap,.vg-comet,.vg-check{ animation: none !important; } }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 100 100" className="vg-wrap" role="img" aria-label="Checking your copy">
        <defs>
          <linearGradient id="vgl-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F0DB8A" /><stop offset="0.5" stopColor="#C9A227" /><stop offset="1" stopColor="#8F6E12" />
          </linearGradient>
          <radialGradient id="vgl-maroon" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#7E1C24" /><stop offset="1" stopColor="#4A0B10" />
          </radialGradient>
        </defs>
        <rect x="5" y="5" width="90" height="90" rx="22" fill="url(#vgl-maroon)" stroke="url(#vgl-gold)" strokeWidth="4.5" />
        <circle cx="47" cy="53" r="26" fill="none" stroke="#7A1B22" strokeWidth="8.5" />
        <circle className="vg-comet" cx="47" cy="53" r="26" fill="none" stroke="url(#vgl-gold)" strokeWidth="8.5" strokeLinecap="round" strokeDasharray={`34 ${LEN}`} />
        <path className="vg-check" d="M33 55 L45 68 L80 22" fill="none" stroke="url(#vgl-gold)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHK} />
      </svg>
      {label && <div style={{ fontFamily: ff ? ff.body : "'Poppins', sans-serif", fontSize: 13.5, color: C.inkSoft }}>{label}</div>}
    </div>
  );
}

// ================= Small components =================
function Medallion({ value, max, marksLabel, ff }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(value); return; }
    let raf; const start = performance.now(); const dur = 1100;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const pct = Math.max(0, Math.min(100, (shown / max) * 100));
  return (
    <div style={{ position: "relative", width: 168, height: 168, borderRadius: "50%",
      background: `conic-gradient(${C.gold} ${pct}%, ${C.maroonSoft} ${pct}% 100%)`,
      display: "grid", placeItems: "center", boxShadow: "0 10px 30px rgba(92,15,20,0.35)", flexShrink: 0 }}>
      <div style={{ width: 138, height: 138, borderRadius: "50%", background: C.maroon, display: "grid", placeItems: "center", border: `2px solid ${C.gold}` }}>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{ fontFamily: ff.display, fontSize: 40, fontWeight: 700, color: C.cream }}>{shown.toFixed(1)}</div>
          <div style={{ fontFamily: ff.body, fontSize: 11, letterSpacing: 1, color: C.goldSoft, marginTop: 4 }}>/ {max} {marksLabel}</div>
        </div>
      </div>
    </div>
  );
}

function DimBar({ dim, delay, ff }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setW((dim.score / 10) * 100), reduce ? 0 : delay);
    return () => clearTimeout(t);
  }, [dim.score, delay]);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: ff.body, fontSize: 14, fontWeight: 600, color: C.ink }}>{dim.name}</span>
        <span style={{ fontFamily: ff.display, fontSize: 15, fontWeight: 700, color: C.maroon }}>{dim.score.toFixed(1)}</span>
      </div>
      <div style={{ height: 9, borderRadius: 20, background: C.creamDeep, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: 20, background: `linear-gradient(90deg, ${C.maroon}, ${C.gold})`, transition: "width 900ms cubic-bezier(.2,.8,.2,1)" }} />
      </div>
      <div style={{ fontFamily: ff.body, fontSize: 12.5, color: C.inkSoft, marginTop: 6 }}>{dim.note}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, text, ff }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "4px 0 14px" }}>
      <Icon size={18} color={C.maroon} />
      <h2 style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 700, color: C.maroon, margin: 0 }}>{text}</h2>
    </div>
  );
}

function FeedbackCard({ title, items, accent, tone, ff }) {
  return (
    <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 16, padding: "18px 20px", borderTop: `4px solid ${accent}` }}>
      <div style={{ fontFamily: ff.display, fontSize: 15.5, fontWeight: 700, color: accent, marginBottom: 14 }}>{title}</div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: tone === "good" ? C.gold : "#FCEFE9", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
            {tone === "good" ? <Check size={13} color={C.maroon} /> : <ArrowRight size={13} color={C.maroon} />}
          </div>
          <span style={{ fontFamily: ff.body, fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

function FormatChips({ label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.inkSoft, marginTop: 8 }}>
      {["Image", "PDF", "Word"].map((f) => (
        <span key={f} style={{ padding: "2px 9px", borderRadius: 20, background: C.creamDeep, color: C.maroon, fontWeight: 600 }}>{f}</span>
      ))}
      <span style={{ marginLeft: 4 }}>{label}</span>
    </div>
  );
}

const primaryBtn = { background: C.maroon, color: C.cream, border: "none", borderRadius: 12, padding: "13px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 6px 18px rgba(92,15,20,0.28)" };
const outlineBtn = { background: C.paper, color: C.maroon, border: `1.5px solid ${C.gold}`, borderRadius: 12, padding: "13px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };


function useStickyState(defaultValue, key) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.sessionStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// ================= Main =================
function VyasUIInternal({ examId: initialExam = "UPSC", token = "" }) {
  const [examId, setExamId] = useState(initialExam);
  const [lang, setLang] = useState("en");
  const [stage, setStage] = useStickyState("mode", "vyas_stage");
  const [historyList, setHistoryList] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useStickyState(null, "vyas_mode");
  const [paperId, setPaperId] = useStickyState(null, "vyas_paperId");
  const [unitId, setUnitId] = useStickyState(null, "vyas_unitId");
  const [numQ, setNumQ] = useState(1);
  const [qUp, setQUp] = useState(false);
  const [aUp, setAUp] = useState(false);
  const [forceNoQ, setForceNoQ] = useState(false);
  const [step, setStep] = useState(0);
  const [cushionText, setCushionText] = useState("");
  const [editingCushion, setEditingCushion] = useState(false);
  
  const [evalType, setEvalType] = useState(null); // 'ai' | 'mentor'

  // ---- Firebase / credits state ----
  const [fbUser, setFbUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Firebase auth sync — runs once
  useEffect(() => watchAuth(async (u) => {
    if (u) {
      try {
        const tok = await u.getIdToken();
        setToken(tok);
        const s = await api("/api/firebase/session", { method: "POST" });
        setFbUser(s.user);
        setCredits(s.credits);
      } catch (e) { console.warn("[vyas] firebase session error:", e); }
    } else {
      setFbUser(null);
      setToken("");
    }
    setAuthReady(true);
  }), []);

  // Back button & Timing & Notifications
  const [evalStartTime, setEvalStartTime] = useState(null);
  const [evalTimeTaken, setEvalTimeTaken] = useStickyState(null, "vyas_evalTimeTaken");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const changeStage = (newStage) => {
    setStage(newStage);
    window.history.pushState({ stage: newStage }, "", `?stage=${newStage}`);
  };

  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.stage) setStage(e.state.stage);
      else setStage("mode");
    };
    window.addEventListener("popstate", handlePop);
    const currStage = window.sessionStorage.getItem("vyas_stage") ? JSON.parse(window.sessionStorage.getItem("vyas_stage")) : "mode";
    if (!window.history.state || !window.history.state.stage) {
      window.history.replaceState({ stage: currStage }, "", `?stage=${currStage}`);
    }
    return () => window.removeEventListener("popstate", handlePop);
  }, []);


  // ---- Real backend state ----
  const [jobId, setJobId] = useState(null);
  const [apiResult, setApiResult] = useStickyState(null, "vyas_apiResult");  // final payload from backend
  const [apiError, setApiError] = useState(null);    // error string
  const [apiProgress, setApiProgress] = useState(null); // {percent, message}
  const [pdfDownloadUrl, setPdfDownloadUrl] = useStickyState(null, "vyas_pdfUrl"); // real PDF URL
  const ansFileRef = useRef(null);   // File object for answer copy
  const qpFileRef  = useRef(null);   // File object for question paper
  const pollRef = useRef(null);      // setInterval handle
  const pendingSubmitRef = useRef(false); // To auto-resume evaluation after payment

  const cfg = EXAM_CONFIG[examId];
  const t = T[lang];
  const ff = lang === "hi"
    ? { display: "'Noto Serif Devanagari', serif", body: "'Noto Sans Devanagari', sans-serif" }
    : { display: "'Cinzel', serif", body: "'Poppins', sans-serif" };

  const paper = cfg.papers.find((p) => p.id === paperId) || null;
  const unit = paper && mode === "custom" ? paper.units.find((u) => u.id === unitId) || paper.units[0] : null;
  const rubric = unit ? unit.rubric : paper ? paper.rubric : "gs";
  const marks = unit ? unit.marks : paper ? paper.fullMarks : 10;
  const words = unit ? unit.words : null;
  const S = SAMPLES[rubric][lang];

  const evalSteps = [
    { icon: FileText, label: t.stepRead },
    { icon: BookOpen, label: t.stepUnderstand },
    { icon: PenLine, label: t.stepDims },
    { icon: Sparkles, label: t.stepFeedback },
  ];

  const chooseMode = (m) => {
    setMode(m);
    const first = cfg.papers[0];
    setPaperId(first.id);
    setUnitId(first.units[0].id);
    setNumQ(1); setQUp(false); setAUp(false);
    changeStage("config");
  };
  const choosePaper = (id) => {
    setPaperId(id);
    const p = cfg.papers.find((x) => x.id === id);
    setUnitId(p.units[0].id);
  };
  const proceedFromQuestion = () => {
    if (rubric === "language") { changeStage("evalChoice"); }
    else { setCushionText(S.cushion); setEditingCushion(false); changeStage("cushion"); }
  };
  const scanForQuestion = (noQ) => { setAUp(true); setForceNoQ(noQ); changeStage("scanning"); };
  const confirmCushion = () => changeStage("evalChoice");

  // ---- Real backend submission ----
  const startPolling = (jid) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let errorCount = 0;
    pollRef.current = setInterval(async () => {
      // NOTE: this used to decide "give up now" vs "keep trying" by
      // matching e.message against hard-coded English strings like
      // "Job not found" / "Access denied". That's fragile — if the
      // backend's wording ever changes (it did: it actually sends
      // "Unknown job."), the check silently stops doing what it says.
      // We now decide from the HTTP status code instead, which can't
      // drift out of sync with the backend.
      let httpStatus = null;
      try {
        const r = await fetch(`${API_BASE}/api/jobs/${jid}`, { headers: authHeader() });
        httpStatus = r.status;
        if (r.status === 404 || r.status === 403) {
          // The job genuinely doesn't exist for this user (or was swept
          // after 6h TTL). No amount of retrying fixes that — fail fast.
          let job = {};
          try { job = await r.json(); } catch (e) {}
          throw new Error(job.detail || job.error || (r.status === 404 ? "Job not found" : "Access denied"));
        }
        if (!r.ok) throw new Error("Temporary server error");
        const job = await r.json();
        errorCount = 0; // Reset on any successful, non-404/403 response
        if (job.percent !== undefined) setApiProgress({ percent: job.percent, message: job.message || "", queue_position: job.queue_position, eta_seconds: job.eta_seconds });
        if (job.status === "done") {
          clearInterval(pollRef.current);
          if (evalStartTime) setEvalTimeTaken(Math.round((Date.now() - evalStartTime) / 1000));

          if (Notification.permission === "granted") {
            new Notification("Evaluation Complete!", { body: "Your Vyas Mains evaluation is ready." });
          }

          if (job.result && job.result.success === false) {
            setApiError(job.result.reason || "Evaluation failed during processing");
            changeStage("apiError");
          } else {
            setApiResult(job.result);
            if (job.pdf_url) setPdfDownloadUrl(`${API_BASE}${job.pdf_url}`);
            changeStage("result");
          }
          sessionStorage.removeItem("vyas_active_job");
        } else if (job.status === "error") {
          clearInterval(pollRef.current);
          setApiError(job.error || "Evaluation failed");
          changeStage("apiError");
          sessionStorage.removeItem("vyas_active_job");
        }
      } catch (e) {
        if (httpStatus === 404 || httpStatus === 403) {
          // Real "this job is not yours / doesn't exist" — no point retrying.
          clearInterval(pollRef.current);
          setApiError(e.message);
          changeStage("apiError");
          sessionStorage.removeItem("vyas_active_job");
          return;
        }
        // Anything else (network drop, phone backgrounded, DNS hiccup,
        // temporary 5xx) — tolerate up to 300 consecutive failures
        // (~10 minutes at 2s/poll) before giving up.
        errorCount++;
        if (errorCount < 300) return;
        clearInterval(pollRef.current);
        setApiError(e.message);
        changeStage("apiError");
        sessionStorage.removeItem("vyas_active_job");
      }
    }, 2000);
  };

  const resumeJob = (jid) => {
    setJobId(jid);
    sessionStorage.setItem("vyas_active_job", jid);
    setShowHistory(false);
    changeStage("evaluating");
    startPolling(jid);
  };

  const submitToBackend = async (overrideCredits = false) => {
    setApiError(null);
    setApiResult(null);
    setApiProgress({ percent: 0, message: "Uploading…" });
    try {
      // ---- Credits gate ----
      if (fbUser && credits < 1 && !overrideCredits) {
        pendingSubmitRef.current = true;
        setShowPricing(true);
        setApiProgress(null);
        return;
      }
      
      pendingSubmitRef.current = false;
      // We only change the stage to evaluating AFTER we confirm they have credits.
      changeStage("evaluating");

      // Refresh Firebase token before each submit
      if (fbUser) {
        const freshTok = await idToken();
        if (freshTok) setToken(freshTok);
      }

      const form = new FormData();
      if (ansFileRef.current) form.append("answer", ansFileRef.current);
      if (mode === "custom" && qpFileRef.current) form.append("question_paper", qpFileRef.current);
      form.append("mode", mode);
      form.append("exam", examId);
      if (paperId) form.append("paper", paperId);
      // Without this the backend received subject=None and every evaluation ran
      // a subject-blind BM25 over all 30k topper rows — a GS-IV Ethics answer
      // could be graded against a History or Anthropology topper copy that
      // happened to share a few keywords.
      const subject = SUBJECT_BY_PAPER[`${examId}:${paperId}`] || RUBRIC_SUBJECT[rubric];
      if (subject) form.append("subject", subject);

      const headers = authHeader();
      const submitRes = await fetch(`${API_BASE}/api/submit`, { method: "POST", headers, body: form });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || submitData.detail || "Upload failed");
      const jid = submitData.job_id;
      setJobId(jid);
      sessionStorage.setItem("vyas_active_job", jid);
      // Deduct credit locally so UI is instant
      if (fbUser) setCredits(c => Math.max(0, c - 1));
      startPolling(jid);
    } catch (err) {
      setApiError(err.message);
      changeStage("apiError");
    }
  };

  const fetchHistory = async () => {
    try {
      const [subRes, activeRes] = await Promise.allSettled([
        api("/api/submissions"),
        api("/api/active"),
      ]);
      if (subRes.status === "fulfilled") setHistoryList(subRes.value.submissions || []);
      if (activeRes.status === "fulfilled") setActiveJobs(activeRes.value.active || []);
    } catch (e) {
      console.error(e);
    }
  };

  const startAIEval = () => {
    setEvalType("ai");
    setStep(0);
    setEvalStartTime(Date.now());
    setEvalTimeTaken(null);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    // If real files are attached, call the backend; otherwise alert the user
    if (ansFileRef.current) {
      submitToBackend();
    } else {
      alert("No answer copy found! Please go back and re-upload your file.");
      reset();
    }
  };
  const sendToMentor = () => { setEvalType("mentor"); changeStage("mentorSent"); };
  const reset = () => {
    changeStage("mode"); setMode(null); setPaperId(null); setUnitId(null);
    setNumQ(1); setQUp(false); setAUp(false); setForceNoQ(false); setStep(0); setEditingCushion(false); setEvalType(null);
    setJobId(null); setApiResult(null); setApiError(null); setApiProgress(null); setPdfDownloadUrl(null); setShowAnalysis(false);
    ansFileRef.current = null; qpFileRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    sessionStorage.removeItem("vyas_active_job");
  };

  // Resume job on reload
  useEffect(() => {
    const activeJid = sessionStorage.getItem("vyas_active_job");
    if (activeJid) {
      setJobId(activeJid);
      changeStage("evaluating");
      setEvalType("ai");
      setApiProgress({ percent: 0, message: "Reconnecting to your evaluation..." });
      startPolling(activeJid);
    }
  }, []); // eslint-disable-line

  useEffect(() => { if (stage === "cushion" && !editingCushion) setCushionText(S.cushion); }, [stage, lang]); // eslint-disable-line

  useEffect(() => {
    if (stage !== "scanning") return;
    const to = setTimeout(() => (forceNoQ ? changeStage("noQuestion") : proceedFromQuestion()), 1500);
    return () => clearTimeout(to);
  }, [stage, forceNoQ]); // eslint-disable-line

  // Sync step indicator with real API progress
  useEffect(() => {
    if (!apiProgress) return;
    const pct = apiProgress.percent || 0;
    const newStep = pct < 25 ? 0 : pct < 60 ? 1 : pct < 85 ? 2 : 3;
    setStep(newStep);
  }, [apiProgress]); // eslint-disable-line

  // Use real results if available, else sample data
  const activeResult = apiResult || null;
  const activeQuestions = Array.isArray(activeResult?.questions) 
    ? activeResult.questions 
    : (Array.isArray(activeResult?.data?.questions) ? activeResult.data.questions : []);
  const avg = S.dimensions.reduce((a, d) => a + d.score, 0) / S.dimensions.length;
  const awarded = Math.round((avg / 10) * marks * 10) / 10;
  const totalAwarded = activeResult
    ? (activeResult.total_marks ?? activeQuestions.reduce((a, q) => a + (parseFloat(q.awarded_marks) || 0), 0))
    : awarded;
  const totalOutOf = activeResult
    ? (activeResult.out_of ?? activeQuestions.reduce((a, q) => a + (parseFloat(q.max_marks) || 0), 0))
    : marks;
  const pdfUrl = pdfDownloadUrl || null;

  // job status message for evaluating screen
  const evalMessage = apiProgress?.message || t.evalSub;
  const evalPercent = apiProgress?.percent ?? 0;

  const ctxLine = paper
    ? `${cfg.id} · ${paper.label[lang]}${unit ? " · " + unit.label[lang] : ""}`
    : cfg.name[lang];

  // ---- Render gates (login / pricing) ----
  if (!authReady) return <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#FBF3E6", fontFamily:"'Poppins',sans-serif", color:"#5C0F14", fontSize:18 }}>Loading…</div>;
  if (!fbUser) return <Login />;
  if (showPricing) return <Pricing user={fbUser} onCredited={(c)=>{ 
    setCredits(c); 
    setShowPricing(false); 
    if (pendingSubmitRef.current) {
      pendingSubmitRef.current = false;
      submitToBackend(true);
    }
  }} onClose={()=>{
    pendingSubmitRef.current = false;
    setShowPricing(false);
  }} />;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: ff.body, color: C.ink, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        /* ---- base transitions ---- */
        .vyas-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s ease, background .18s ease, border-color .18s ease; }
        .vyas-btn:hover { transform: translateY(-3px); }
        .vyas-btn:active { transform: translateY(0px) scale(.97); }
        .vyas-btn:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; }
        .vyas-card:focus-visible { outline: 3px solid ${C.maroon}; outline-offset: 2px; }

        /* ---- page transitions ---- */
        .fade-in  { animation: fadeIn .5s cubic-bezier(.2,.8,.2,1) both; }
        .slide-up { animation: slideUp .45s cubic-bezier(.2,.8,.2,1) both; }
        .pop-in   { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes popIn   { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }

        /* ---- staggered children ---- */
        .stagger > * { animation: fadeIn .5s cubic-bezier(.2,.8,.2,1) both; }
        .stagger > *:nth-child(1){animation-delay:.05s}
        .stagger > *:nth-child(2){animation-delay:.13s}
        .stagger > *:nth-child(3){animation-delay:.21s}
        .stagger > *:nth-child(4){animation-delay:.29s}
        .stagger > *:nth-child(5){animation-delay:.37s}

        /* ---- dot pulse ---- */
        @keyframes pulseDot { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }

        /* ---- shimmer on cards ---- */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .shimmer-card::after {
          content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: shimmer 2.8s ease-in-out infinite;
        }

        /* ---- glow pulse for mode cards ---- */
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 4px 24px rgba(201,162,39,.08); }
          50%      { box-shadow: 0 8px 40px rgba(201,162,39,.22); }
        }
        .glow-card { animation: glowPulse 3s ease-in-out infinite; }
        .glow-card:hover { animation: none; box-shadow: 0 12px 48px rgba(92,15,20,.28) !important; transform: translateY(-5px) !important; }

        /* ---- page background ambient blobs ---- */
        .bg-blob {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          filter: blur(80px); opacity: .15;
        }

        /* ---- progress bar glow ---- */
        @keyframes progressGlow {
          0%,100% { box-shadow: 0 0 8px rgba(201,162,39,.4); }
          50%      { box-shadow: 0 0 20px rgba(201,162,39,.8); }
        }
        .progress-bar-fill { animation: progressGlow 1.8s ease-in-out infinite; }

        /* ---- spin ---- */
        @keyframes spin { to { transform: rotate(360deg);} }
        .spin { animation: spin 1.2s linear infinite; }

        /* ---- upload slot hover ---- */
        .upload-slot:hover { border-color: ${C.gold} !important; background: #FBF7EA !important; transform: translateY(-2px); }
        .upload-slot { transition: all .2s ease; }

        @media (prefers-reduced-motion: reduce){
          .fade-in,.slide-up,.pop-in,.stagger>*,.glow-card,.shimmer-card::after,.progress-bar-fill{animation:none !important;}
          .vyas-btn:hover,.glow-card:hover{transform:none !important;}
        }
      `}</style>

      {/* Ambient background blobs */}
      <div className="bg-blob" style={{ width: 600, height: 600, top: -200, left: -200, background: C.gold }} />
      <div className="bg-blob" style={{ width: 500, height: 500, bottom: -100, right: -150, background: C.maroon, opacity: .1 }} />
      <div className="bg-blob" style={{ width: 300, height: 300, top: "40%", left: "60%", background: C.gold, opacity: .08 }} />

      {/* ===== Glassmorphism Header ===== */}
      <header style={{
        background: `linear-gradient(135deg, ${C.maroon} 0%, #3A0A0E 60%, #5C0F14 100%)`,
        padding: "14px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        borderBottom: `2px solid ${C.gold}`,
        flexWrap: "wrap",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 32px rgba(92,15,20,.45)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}44 0%, transparent 70%)`, animation: "glowPulse 2s ease-in-out infinite" }} />
            <Logo size={46} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: C.cream, letterSpacing: 2,
              textShadow: `0 0 20px ${C.gold}55` }}>VYAS</div>
            <div style={{ fontFamily: ff.body, fontSize: 11, color: C.goldSoft, letterSpacing: 0.5 }}>{cfg.portal[lang]}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div role="group" aria-label="Portal" style={{ display: "inline-flex", background: "rgba(251,243,230,0.07)", borderRadius: 30, padding: 3, border: `1px solid rgba(201,162,39,.3)`, backdropFilter: "blur(8px)" }}>
            {Object.keys(EXAM_CONFIG).map((id) => {
              const active = examId === id;
              return (
                <button key={id} onClick={() => { setExamId(id); reset(); }} className="vyas-btn" aria-pressed={active}
                  style={{ border: "none", cursor: "pointer", borderRadius: 30, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                    background: active ? `linear-gradient(135deg, ${C.gold}, #A87E1A)` : "transparent",
                    color: active ? C.maroon : C.goldSoft,
                    boxShadow: active ? `0 2px 12px ${C.gold}55` : "none" }}>
                  {id}
                </button>
              );
            })}
          </div>

          {/* Credits pill + Buy */}
          <button onClick={() => setShowPricing(true)} className="vyas-btn"
            title="Buy more checks"
            style={{ border: `1.5px solid ${C.gold}`, cursor: "pointer", borderRadius: 30, padding: "7px 16px", fontSize: 13, fontWeight: 700,
              background: credits === 0 ? C.maroon : "rgba(201,162,39,0.15)",
              color: credits === 0 ? C.cream : C.goldSoft, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} />
            {credits} check{credits !== 1 ? "s" : ""} · Buy
          </button>

          {/* History */}
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} className="vyas-btn"
            style={{ border: `1px solid ${C.gold}55`, cursor: "pointer", borderRadius: 30, padding: "7px 16px", fontSize: 13, fontWeight: 700,
              background: showHistory ? `linear-gradient(135deg, ${C.gold}, #A87E1A)` : "transparent",
              color: showHistory ? C.maroon : C.goldSoft }}>
            <BookOpen size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            History
          </button>

          {/* Logout */}
          {fbUser && (
            <button onClick={() => { logout(); setFbUser(null); setCredits(0); }} className="vyas-btn"
              title={fbUser.email}
              style={{ border: `1px solid rgba(201,162,39,.3)`, cursor: "pointer", borderRadius: 30, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                background: "transparent", color: C.goldSoft }}>
              Logout
            </button>
          )}

          <div role="group" aria-label="Language" style={{ display: "inline-flex", background: "rgba(251,243,230,0.07)", borderRadius: 30, padding: 3, border: `1px solid rgba(201,162,39,.3)`, backdropFilter: "blur(8px)" }}>
            {[{ id: "en", label: "EN" }, { id: "hi", label: "हिं" }].map((o) => {
              const active = lang === o.id;
              return (
                <button key={o.id} onClick={() => setLang(o.id)} className="vyas-btn" aria-pressed={active}
                  style={{ border: "none", cursor: "pointer", borderRadius: 30, padding: "7px 16px", fontSize: 13, fontWeight: 700,
                    fontFamily: o.id === "hi" ? "'Noto Sans Devanagari', sans-serif" : "'Poppins', sans-serif",
                    background: active ? `linear-gradient(135deg, ${C.gold}, #A87E1A)` : "transparent",
                    color: active ? C.maroon : C.goldSoft,
                    boxShadow: active ? `0 2px 12px ${C.gold}55` : "none" }}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px", position: "relative", zIndex: 1 }}>
        <ErrorBoundary>
        {/* -------- HISTORY -------- */}
        {showHistory && (
          <div className="fade-in" style={{ background: C.paper, borderRadius: 24, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", marginBottom: 32, border: `1px solid ${C.gold}44` }}>
            <h2 style={{ color: C.maroon, marginTop: 0 }}>My Submissions</h2>

            {/* Live / Active jobs */}
            {activeJobs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, letterSpacing: 0.6, marginBottom: 10 }}>IN PROGRESS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeJobs.map(j => (
                    <div key={j.job_id} onClick={() => resumeJob(j.job_id)} className="vyas-btn" style={{ padding: "14px 18px", border: `1.5px solid ${C.gold}66`, borderRadius: 12, background: "#FFFDF4", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.ink, fontSize: 14 }}>{j.meta?.exam || "UPSC"} {j.meta?.paper ? `— ${j.meta.paper}` : ""}</div>
                        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{j.message || j.stage} · {j.percent}%{j.eta_seconds > 0 ? ` · ~${Math.ceil(j.eta_seconds / 60)} min left` : ""}</div>
                      </div>
                      <div style={{ width: 120, height: 6, background: "#E7D9BE", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${j.percent}%`, height: "100%", background: C.gold, borderRadius: 4, transition: "width .5s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed submissions */}
            {!historyList ? <p>Loading...</p> : historyList.length === 0 ? <p style={{ color: C.inkSoft }}>No completed submissions yet.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {historyList.map(sub => (
                  <div key={sub.code} style={{ padding: 16, border: `1px solid ${C.gold}33`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: C.ink }}>{sub.exam} {sub.paper && `— ${sub.paper}`}</div>
                      <div style={{ fontSize: 13, color: C.inkSoft }}>{new Date(sub.created * 1000).toLocaleString()} · {sub.total_marks} / {sub.out_of} marks</div>
                    </div>
                    {sub.pdf_url && (
                      <a href={`${API_BASE}${sub.pdf_url}`} target="_blank" rel="noreferrer" style={{ background: C.maroon, color: C.cream, border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                        <Download size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} /> PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------- MODE -------- */}
        {stage === "mode" && !showHistory && (
          <div className="fade-in">
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.maroon}15`, border: `1px solid ${C.maroon}30`, borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
                <Sparkles size={13} color={C.gold} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.maroon, letterSpacing: 0.8 }}>AI-POWERED EVALUATION</span>
              </div>
              <h1 style={{ fontFamily: ff.display, fontSize: 30, fontWeight: 700, color: C.maroon, margin: "0 0 10px",
                background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonSoft})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.modeTitle}</h1>
              <p style={{ color: C.inkSoft, fontSize: 15.5, margin: 0 }}>{t.modeSub} <b style={{ color: C.maroon }}>{cfg.name[lang]}</b>.</p>
            </div>
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[{ id: "full", icon: Layers, title: t.fullTitle, desc: t.fullDesc },
                { id: "custom", icon: PenLine, title: t.customTitle, desc: t.customDesc }].map((m) => {
                const Icon = m.icon;
                return (
                  <button key={m.id} className="vyas-btn vyas-card glow-card shimmer-card" onClick={() => chooseMode(m.id)}
                    style={{ textAlign: "left", background: C.paper, border: `1.5px solid ${C.creamDeep}`,
                      borderRadius: 22, padding: "28px 24px", cursor: "pointer", display: "flex",
                      flexDirection: "column", gap: 14,
                      borderTop: `4px solid ${C.gold}`,
                      position: "relative", overflow: "hidden" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14,
                      background: `linear-gradient(135deg, ${C.cream}, ${C.creamDeep})`,
                      display: "grid", placeItems: "center",
                      boxShadow: `0 4px 16px ${C.gold}30` }}>
                      <Icon size={26} color={C.maroon} />
                    </div>
                    <div>
                      <div style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 8 }}>{m.title}</div>
                      <div style={{ fontFamily: ff.body, fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>{m.desc}</div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: C.maroon, fontWeight: 700, fontSize: 14,
                      borderTop: `1px solid ${C.creamDeep}`, paddingTop: 14, marginTop: 4, width: "100%" }}>
                      {t.continue}
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.maroon, display: "grid", placeItems: "center", marginLeft: "auto" }}>
                        <ArrowRight size={15} color={C.cream} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -------- CONFIG -------- */}
        {stage === "config" && paper && (
          <div className="fade-in">
            <button onClick={reset} className="vyas-btn" style={{ background: "transparent", border: "none", color: C.maroon, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}>← {t.changeMode}</button>
            <h1 style={{ fontFamily: ff.display, fontSize: 23, fontWeight: 700, color: C.maroon, margin: "0 0 18px" }}>{mode === "full" ? t.fullSetup : t.customSetup}</h1>

            <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>{t.choosePaper}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
              {cfg.papers.map((p) => {
                const active = paperId === p.id;
                return (
                  <button key={p.id} className="vyas-btn" onClick={() => choosePaper(p.id)}
                    style={{ padding: "9px 16px", borderRadius: 12, border: `1.5px solid ${active ? C.maroon : C.creamDeep}`, background: active ? C.maroon : C.paper, color: active ? C.cream : C.ink, fontWeight: 600, fontSize: 13.5, cursor: "pointer", textAlign: "left" }}>
                    {p.label[lang]}
                  </button>
                );
              })}
            </div>

            <button className="vyas-btn" onClick={() => changeStage("upload")} style={primaryBtn}>{t.continue} <ArrowRight size={17} /></button>
          </div>
        )}

        {/* -------- UPLOAD -------- */}
        {stage === "upload" && paper && (
          <div className="fade-in">
            <button onClick={() => changeStage("config")} className="vyas-btn" style={{ background: "transparent", border: "none", color: C.maroon, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}>← {t.changeMode}</button>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: C.gold, letterSpacing: 0.5, marginBottom: 14 }}>{ctxLine}</div>

            {mode === "full" && (
              <>
                <UploadSlot index="1" label={t.qPaper} done={qUp} uploadedLabel={t.uploaded} tapLabel={t.tapUpload} inputId="up-q"
                  onPick={(id) => document.getElementById(id).click()}
                  onChange={(e) => { qpFileRef.current = e.target.files[0]; setQUp(true); }} ff={ff} />
                <UploadSlot index="2" label={t.answerCopy} done={aUp} uploadedLabel={t.uploaded} tapLabel={t.tapUpload} inputId="up-a"
                  onPick={(id) => document.getElementById(id).click()}
                  onChange={(e) => { ansFileRef.current = e.target.files[0]; setAUp(true); }} ff={ff} />
                <FormatChips label={t.formats} />
                <div>
                  <button className="vyas-btn" disabled={!(qUp && aUp)} onClick={proceedFromQuestion}
                    style={{ ...primaryBtn, marginTop: 16, opacity: qUp && aUp ? 1 : 0.4, cursor: qUp && aUp ? "pointer" : "not-allowed" }}>
                    {t.continue} <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}

            {mode === "custom" && (
              <>
                <h1 style={{ fontFamily: ff.display, fontSize: 23, fontWeight: 700, color: C.maroon, margin: "0 0 6px" }}>{t.customUploadTitle}</h1>
                <p style={{ color: C.inkSoft, fontSize: 14.5, margin: "0 0 18px" }}>{t.customUploadSub}</p>
                <button onClick={() => document.getElementById("up-ca").click()} className="vyas-btn"
                  style={{ width: "100%", border: `2px dashed ${C.gold}`, background: C.paper, borderRadius: 16, padding: "38px 20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", background: C.cream, display: "grid", placeItems: "center" }}><Upload size={25} color={C.maroon} /></div>
                  <div style={{ fontFamily: ff.body, fontWeight: 600, color: C.ink, fontSize: 15, textAlign: "center" }}>{aUp ? `✓ ${t.uploaded}` : t.answerWithQ}</div>
                  <div style={{ fontFamily: ff.body, fontSize: 13, color: C.inkSoft, textAlign: "center" }}>{t.answerHint}</div>
                  <input id="up-ca" type="file" accept={ACCEPT} hidden onChange={(e) => { ansFileRef.current = e.target.files[0]; scanForQuestion(false); }} />
                </button>
                <FormatChips label={t.formats} />
                <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="vyas-btn" onClick={() => document.getElementById("up-ca").click()} style={primaryBtn}>{t.continue} <ArrowRight size={17} /></button>
                </div>
              </>
            )}
          </div>
        )}

        {/* -------- SCANNING -------- */}
        {stage === "scanning" && (
          <div className="fade-in" style={{ paddingTop: 48, textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 20 }}><LogoLoader size={104} ff={ff} /></div>
            <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.maroon }}>{t.scanningTitle}</div>
            <div style={{ color: C.inkSoft, fontSize: 14, marginTop: 6 }}>{t.scanningSub}</div>
          </div>
        )}

        {/* -------- NO QUESTION -------- */}
        {stage === "noQuestion" && (
          <div className="fade-in" style={{ paddingTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FCEFE9", display: "grid", placeItems: "center", marginBottom: 16 }}><Search size={26} color={C.maroon} /></div>
            <h1 style={{ fontFamily: ff.display, fontSize: 25, fontWeight: 700, color: C.maroon, margin: "0 0 8px" }}>{t.noQTitle}</h1>
            <p style={{ color: C.inkSoft, fontSize: 15, margin: "0 0 22px", maxWidth: 560, lineHeight: 1.55 }}>{t.noQDesc}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="vyas-btn" onClick={() => document.getElementById("up-sep").click()} style={primaryBtn}><Upload size={17} /> {t.uploadQSep}</button>
              <input id="up-sep" type="file" accept={ACCEPT} hidden onChange={(e) => { qpFileRef.current = e.target.files[0]; proceedFromQuestion(); }} />
              <button className="vyas-btn" onClick={() => changeStage("denied")} style={outlineBtn}>{t.noHaveQ}</button>
            </div>
          </div>
        )}

        {/* -------- DENIED -------- */}
        {stage === "denied" && (
          <div className="fade-in" style={{ paddingTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FCEFE9", display: "grid", placeItems: "center", marginBottom: 16 }}><AlertTriangle size={26} color={C.maroon} /></div>
            <h1 style={{ fontFamily: ff.display, fontSize: 25, fontWeight: 700, color: C.maroon, margin: "0 0 8px" }}>{t.deniedTitle}</h1>
            <p style={{ color: C.inkSoft, fontSize: 15, margin: "0 0 22px", maxWidth: 580, lineHeight: 1.6 }}>{t.deniedDesc}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="vyas-btn" onClick={() => changeStage("noQuestion")} style={primaryBtn}><Upload size={17} /> {t.addQuestion}</button>
              <button className="vyas-btn" onClick={reset} style={outlineBtn}><RotateCcw size={16} /> {t.startOver}</button>
            </div>
          </div>
        )}

        {/* -------- CUSHION -------- */}
        {stage === "cushion" && (
          <div className="fade-in" style={{ paddingTop: 4 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.creamDeep, color: C.maroon, padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>{t.quickCheck}</div>
            <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: 0.5, marginBottom: 5 }}>
                {mode === "custom" ? t.foundQ : t.questionLabel} · {marks} {t.marksLabel}{words ? ` · ${words} ${t.wordsLabel}` : ""}
              </div>
              <div style={{ fontFamily: ff.body, fontSize: 14.5, color: C.ink, fontWeight: 500 }}>{S.question}</div>
            </div>
            <h1 style={{ fontFamily: ff.display, fontSize: 25, fontWeight: 700, color: C.maroon, margin: "0 0 8px" }}>{t.cushionTitle}</h1>
            <p style={{ color: C.inkSoft, fontSize: 15, margin: "0 0 20px", maxWidth: 580, lineHeight: 1.55 }}>{t.cushionDesc}</p>
            <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><BookOpen size={14} /> {t.detectedCushion}</div>
              {editingCushion ? (
                <textarea value={cushionText} onChange={(e) => setCushionText(e.target.value)} rows={4} aria-label="Edit cushion"
                  style={{ width: "100%", fontFamily: ff.body, fontSize: 15, color: C.ink, lineHeight: 1.6, border: `1.5px solid ${C.gold}`, borderRadius: 10, padding: "12px 14px", resize: "vertical", background: C.cream, outline: "none" }} />
              ) : (
                <p style={{ fontFamily: ff.body, fontSize: 15.5, color: C.ink, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>&ldquo;{cushionText}&rdquo;</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {editingCushion ? (
                <>
                  <button className="vyas-btn" onClick={() => setEditingCushion(false)} style={primaryBtn}><Check size={17} /> {t.saveContinue}</button>
                  <button className="vyas-btn" onClick={() => { setCushionText(S.cushion); setEditingCushion(false); }} style={outlineBtn}>{t.resetOriginal}</button>
                </>
              ) : (
                <>
                  <button className="vyas-btn" onClick={confirmCushion} style={primaryBtn}>{t.cushionYes} <ArrowRight size={17} /></button>
                  <button className="vyas-btn" onClick={() => setEditingCushion(true)} style={outlineBtn}><PenLine size={16} /> {t.cushionEdit}</button>
                </>
              )}
            </div>
            <div style={{ marginTop: 22, fontSize: 13, color: C.inkSoft, display: "flex", gap: 10, alignItems: "flex-start", maxWidth: 560 }}>
              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: C.gold, color: C.maroon, fontWeight: 700, fontSize: 12, display: "grid", placeItems: "center", marginTop: 1 }}>i</span>
              {t.whyStep}
            </div>
          </div>
        )}

        {/* -------- EVALUATION CHOICE -------- */}
        {stage === "evalChoice" && (
          <div className="fade-in">
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 12 }}>{ctxLine}</div>
            <h1 style={{ fontFamily: ff.display, fontSize: 25, fontWeight: 700, color: C.maroon, margin: "0 0 6px" }}>{t.chooseEvalTitle}</h1>
            <p style={{ color: C.inkSoft, fontSize: 15, margin: "0 0 22px" }}>{t.chooseEvalSub}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
              {[
                { onClick: startAIEval, icon: Sparkles, title: t.aiTitle, desc: t.aiDesc, tag: t.aiTag, accent: C.gold },
                { onClick: sendToMentor, icon: UserCheck, title: t.mentorTitle, desc: t.mentorDesc, tag: t.mentorTag, accent: C.maroon },
              ].map((o, i) => {
                const Icon = o.icon;
                return (
                  <button key={i} className="vyas-btn vyas-card" onClick={o.onClick}
                    style={{ textAlign: "left", background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 18, padding: "22px 20px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, borderTop: `4px solid ${o.accent}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: C.cream, display: "grid", placeItems: "center" }}><Icon size={23} color={C.maroon} /></div>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: o.accent === C.gold ? "#7A6410" : C.maroon, background: o.accent === C.gold ? "#FBF7EA" : "#FCEFE9", padding: "4px 10px", borderRadius: 20 }}>{o.tag}</span>
                    </div>
                    <div style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 700, color: C.maroon }}>{o.title}</div>
                    <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 }}>{o.desc}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.maroon, fontWeight: 600, fontSize: 14 }}>{t.continue} <ArrowRight size={16} /></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* -------- MENTOR SUBMITTED -------- */}
        {stage === "mentorSent" && (
          <div className="fade-in" style={{ textAlign: "center", paddingTop: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.gold, display: "grid", placeItems: "center", margin: "0 auto 18px", boxShadow: "0 8px 22px rgba(201,162,39,0.4)" }}>
              <UserCheck size={34} color={C.maroon} />
            </div>
            <h1 style={{ fontFamily: ff.display, fontSize: 25, fontWeight: 700, color: C.maroon, margin: "0 0 8px" }}>{t.mentorSentTitle}</h1>
            <p style={{ color: C.inkSoft, fontSize: 15, margin: "0 auto 22px", maxWidth: 480, lineHeight: 1.55 }}>{t.mentorSentDesc}</p>
            <div style={{ maxWidth: 360, margin: "0 auto 24px", background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{t.queueLabel}</div>
                <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.maroon }}>#3</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: C.maroon, fontWeight: 600, maxWidth: 160 }}>{t.turnaround}</div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="vyas-btn" onClick={startAIEval} style={primaryBtn}><Sparkles size={17} /> {t.aiWhileWait}</button>
              <button className="vyas-btn" onClick={reset} style={outlineBtn}>{t.doneBtn}</button>
            </div>
          </div>
        )}

        {/* -------- EVALUATING -------- */}
        {stage === "evaluating" && (
          <div className="fade-in" style={{ paddingTop: 22 }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}><LogoLoader size={108} ff={ff} /></div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: ff.display, fontSize: 24, fontWeight: 700, color: C.maroon }}>{t.evalTitle}</div>
              <div style={{ color: C.inkSoft, fontSize: 14, marginTop: 6 }}>{evalMessage}</div>
              {mode === "custom" && numQ > 1 && <div style={{ color: C.gold, fontSize: 13, fontWeight: 600, marginTop: 6 }}>1 {t.ofN} {numQ}</div>}
            </div>
            <div style={{ maxWidth: 440, margin: "0 auto 6px", display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkSoft }}>
              <span>
                {jobId ? evalMessage : t.evalSub}
                {apiProgress?.queue_position > 1 && ` (Queue: #${apiProgress.queue_position - 1})`}
              </span>
              {jobId && <span>{evalPercent}%</span>}
            </div>
            {apiProgress?.queue_position > 1 && (
              <div style={{ maxWidth: 440, margin: "0 auto 10px", fontSize: 13, color: C.gold, fontWeight: 600, textAlign: "center" }}>
                Estimated Wait Time: {Math.ceil(apiProgress.eta_seconds / 60)} min
              </div>
            )}
            <div style={{ maxWidth: 440, margin: "0 auto 20px", height: 6, borderRadius: 20, background: C.creamDeep, overflow: "hidden" }}>
              <div style={{ height: "100%",
                width: jobId ? `${evalPercent}%` : `${(step / evalSteps.length) * 100}%`,
                background: `linear-gradient(90deg, ${C.maroon}, ${C.gold})`, borderRadius: 20, transition: "width .5s ease" }} />
            </div>
            <div style={{ maxWidth: 440, margin: "0 auto" }}>
              {evalSteps.map((s, i) => {
                const done = i < step; const active = i === step; const Icon = s.icon;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", marginBottom: 10, borderRadius: 12, background: active ? C.paper : "transparent", border: `1.5px solid ${active ? C.gold : "transparent"}`, opacity: done || active ? 1 : 0.4, transition: "all .3s ease" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: done ? C.gold : C.cream, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {done ? <Check size={20} color={C.maroon} /> : <Icon size={19} color={C.maroon} />}
                    </div>
                    <span style={{ fontFamily: ff.body, fontWeight: 500, color: C.ink, fontSize: 15 }}>{s.label}</span>
                    {active && (
                      <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                        {[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: C.maroon, animation: `pulseDot 1s ${d * 0.2}s infinite` }} />)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <button className="vyas-btn" onClick={reset} style={{ background: "transparent", color: C.inkSoft, border: `1px solid ${C.creamDeep}`, padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <RotateCcw size={15} /> Cancel Evaluation
              </button>
            </div>
          </div>
        )}

        {/* -------- API ERROR -------- */}
        {stage === "apiError" && (
          <div className="fade-in" style={{ paddingTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FCEFE9", display: "grid", placeItems: "center", marginBottom: 16 }}><AlertTriangle size={26} color={C.maroon} /></div>
            <h1 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.maroon, margin: "0 0 8px" }}>Evaluation Error</h1>
            <p style={{ color: C.inkSoft, fontSize: 14, margin: "0 0 8px", maxWidth: 560, lineHeight: 1.6, fontFamily: "monospace", background: C.creamDeep, padding: "10px 14px", borderRadius: 10 }}>{apiError}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="vyas-btn" onClick={reset} style={primaryBtn}><RotateCcw size={16} /> {t.startOver}</button>
            </div>
          </div>
        )}

        {/* -------- RESULT -------- */}
        {stage === "result" && (
          <div className="fade-in">
            {!showAnalysis ? (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.gold, display: "grid", placeItems: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(201,162,39,0.3)" }}>
                  <Check size={40} color={C.maroon} strokeWidth={3} />
                </div>
                <h1 style={{ fontFamily: ff.display, fontSize: 28, fontWeight: 700, color: C.maroon, margin: "0 0 12px" }}>
                  Your copy checked successfully!
                </h1>
                
                <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 20, padding: "30px", margin: "24px auto", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Medallion value={totalAwarded} max={totalOutOf || marks} marksLabel={t.marksLabel} ff={ff} />
                  <div style={{ fontFamily: ff.display, fontSize: 26, fontWeight: 700, color: C.maroon, marginTop: 16 }}>
                    {activeResult ? `${totalAwarded.toFixed(1)} / ${totalOutOf}` : verdict(S.dimensions.reduce((a, d) => a + d.score, 0) / S.dimensions.length, lang)}
                  </div>
                  <div style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>Total Score</div>
                </div>

                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
                  <button className="vyas-btn" onClick={() => setShowAnalysis(true)} style={{ ...primaryBtn, padding: "14px 24px" }}>
                    <Sparkles size={18} /> View Detailed Analysis
                  </button>
                  {pdfUrl ? (
                    <button className="vyas-btn" onClick={() => window.open(pdfUrl, '_blank')} style={{ ...outlineBtn, textDecoration: "none", padding: "14px 24px" }}>
                      <Download size={18} /> {t.downloadPdf}
                    </button>
                  ) : (
                    <button className="vyas-btn" style={{ ...outlineBtn, opacity: 0.5, cursor: "not-allowed", padding: "14px 24px" }}>
                      <Download size={18} /> {t.downloadPdf}
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 24 }}>
                  <button className="vyas-btn" onClick={reset} style={{ background: "transparent", color: C.inkSoft, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    <RotateCcw size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Evaluate Another Copy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 12 }}>
                  <button onClick={() => setShowAnalysis(false)} style={{ background: C.cream, border: "none", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: C.maroon }}>
                    <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <h2 style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.maroon, margin: 0 }}>Detailed Analysis</h2>
                </div>

                {/* Score Header */}
                <div style={{ background: C.maroon, borderRadius: 20, padding: "28px 24px", display: "flex", gap: 26, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
                  <Medallion value={totalAwarded} max={totalOutOf || marks} marksLabel={t.marksLabel} ff={ff} />
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontFamily: ff.body, fontSize: 12, letterSpacing: 0.5, color: C.goldSoft, fontWeight: 600, marginBottom: 8 }}>{ctxLine}</div>
                    <div style={{ fontFamily: ff.display, fontSize: 22, fontWeight: 700, color: C.cream, lineHeight: 1.3, marginBottom: 8 }}>
                      {activeResult ? `${totalAwarded.toFixed(1)} / ${totalOutOf} marks` : verdict(S.dimensions.reduce((a, d) => a + d.score, 0) / S.dimensions.length, lang)}
                    </div>
                    {activeResult && activeResult.booklet_verdict && (
                      <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.goldSoft }}>{activeResult.booklet_verdict}</div>
                    )}
                    {!activeResult && <div style={{ fontFamily: ff.body, fontSize: 13.5, color: C.goldSoft }}>{S.note.label} <b style={{ color: C.cream }}>{S.note.value}</b> {S.note.explain}</div>}
                  </div>
                </div>

                {/* Macro comments */}
                {activeResult && activeResult.overall_macro_comments && Array.isArray(activeResult.overall_macro_comments) && activeResult.overall_macro_comments.length > 0 && (
                  <div style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
                    <div style={{ fontFamily: ff.display, fontSize: 16, fontWeight: 700, color: C.maroon, marginBottom: 12 }}>Overall Feedback</div>
                    {activeResult.overall_macro_comments.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.creamDeep, display: "grid", placeItems: "center", flexShrink: 0 }}><Sparkles size={12} color={C.maroon} /></div>
                        <span style={{ fontFamily: ff.body, fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per-question results */}
                {activeResult && activeQuestions.length > 0 && activeQuestions.map((q, qi) => {
                  const scorePercent = (parseFloat(q.awarded_marks || 0) / (parseFloat(q.max_marks) || 1)) * 100;
                  const borderCol = scorePercent >= 60 ? "#4CAF50" : scorePercent <= 40 ? "#F44336" : C.gold;
                  return (
                    <div key={qi} style={{ background: C.paper, border: `1.5px solid ${C.creamDeep}`, borderLeft: `5px solid ${borderCol}`, borderRadius: 16, padding: "20px 22px", marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                        <div style={{ fontFamily: ff.display, fontSize: 17, fontWeight: 700, color: C.maroon }}>Q{q.q_no}</div>
                        <div style={{ fontFamily: ff.display, fontSize: 20, fontWeight: 700, color: borderCol }}>{parseFloat(q.awarded_marks || 0).toFixed(1)} / {q.max_marks}</div>
                      </div>
                      <div style={{ fontFamily: ff.body, fontSize: 13, color: C.ink, marginBottom: 12, lineHeight: 1.5 }}>{q.detected_question}</div>
                      {q.grid && typeof q.grid === 'object' && Object.entries(q.grid).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, minWidth: 160, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                          <span style={{ fontSize: 12.5, color: C.ink }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
              </ErrorBoundary>
      </main>
    </div>
  );
}

// ---- Upload slot (full mode) ----
function UploadSlot({ index, label, done, uploadedLabel, tapLabel, inputId, onPick, onChange, ff }) {
  return (
    <>
      <button onClick={() => onPick(inputId)} className="vyas-btn"
        style={{ width: "100%", textAlign: "left", border: `2px dashed ${done ? C.gold : C.creamDeep}`, background: done ? "#FBF7EA" : C.paper, borderRadius: 14, padding: "18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: done ? C.gold : C.cream, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: ff.display, fontWeight: 700, color: C.maroon }}>
          {done ? <Check size={22} color={C.maroon} /> : index}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: ff.body, fontWeight: 600, color: C.ink, fontSize: 15 }}>{label}</div>
          <div style={{ fontFamily: ff.body, fontSize: 12.5, color: C.inkSoft }}>{done ? uploadedLabel : tapLabel}</div>
        </div>
        {!done && <Upload size={20} color={C.maroon} />}
      </button>
      <input id={inputId} type="file" accept={ACCEPT} hidden onChange={onChange} />
    </>
  );
}

export default function VyasUI(props) {
  return (
    <ErrorBoundary>
      <VyasUIInternal {...props} />
    </ErrorBoundary>
  );
}
