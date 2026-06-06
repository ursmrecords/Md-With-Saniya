import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  HeartPulse,
  Mail,
  Crown,
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  Coffee,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Undo2,
  HeartCrack,
} from "lucide-react";

// Types
interface HeartType {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  iconType: "heart" | "pulse" | "mail";
}

interface ChatMessage {
  id: string;
  sender: "user" | "model";
  text: string;
  timestamp: Date;
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export default function App() {
  // Screens state: 'proposal' | 'confession' | 'quiz' | 'final'
  const [screen, setScreen] = useState<"proposal" | "confession" | "quiz" | "final">("proposal");
  
  // Floating hearts generator state
  const [floatingHearts, setFloatingHearts] = useState<HeartType[]>([]);
  
  // Custom Escape mechanism for "No" button
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0, isMoved: false });
  
  // Quiz parameters
  const quizQuestions: QuizQuestion[] = [
    {
      question: "Q1. Me kis ladki se sabse jyada pyaar karta hoon?",
      options: [
        { text: "[a] Rehmati", isCorrect: false },
        { text: "[b] Fatima", isCorrect: false },
        { text: "[c] Saniya", isCorrect: false },
        { text: "[d] All Of These", isCorrect: true },
      ],
    },
    {
      question: "Q2. Mujhe Saniya ko kis waqt dekh ke uski khubsurti me kho gaya tha?",
      options: [
        { text: "[a] Ek Din Video call par", isCorrect: false },
        { text: "[b] Mama Ke Shadi Ke Waqt", isCorrect: true },
        { text: "[c] Nawatand Me", isCorrect: false },
        { text: "[d] Eid ke Din", isCorrect: false },
      ],
    },
    {
      question: "Q3. Mujhe sabse jyada kya pasand hai?",
      options: [
        { text: "[a] Your Lips", isCorrect: false },
        { text: "[b] Your Eyes", isCorrect: false },
        { text: "[c] Your Cheeks", isCorrect: false },
        { text: "[d] Puri Ki Puri Aap", isCorrect: true },
      ],
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isQuizShaking, setIsQuizShaking] = useState(false);

  // Chat parameters
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Floating hearts generation
  useEffect(() => {
    let idCounter = 0;
    const types: ("heart" | "pulse" | "mail")[] = ["heart", "pulse", "mail"];
    
    const interval = setInterval(() => {
      const newHeart: HeartType = {
        id: idCounter++,
        left: Math.random() * 95, 
        size: Math.random() * 20 + 14, // 14px to 34px
        delay: Math.random() * 2,
        duration: Math.random() * 5 + 6, // 6s to 11s
        iconType: types[Math.floor(Math.random() * types.length)],
      };
      // Keep safety pool of max 25 hearts
      setFloatingHearts((prev) => [...prev.slice(-24), newHeart]);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Escape mechanism calculations
  const moveNoButton = () => {
    const rawX = Math.random() * (window.innerWidth - 140);
    const rawY = Math.random() * (window.innerHeight - 60);
    const x = Math.max(20, Math.min(rawX, window.innerWidth - 140));
    const y = Math.max(20, Math.min(rawY, window.innerHeight - 60));
    setNoBtnPos({ x, y, isMoved: true });
  };

  // Set initial welcome chat trigger
  useEffect(() => {
    if (screen === "final") {
      setChatMessages([
        {
          id: "welcome",
          sender: "model",
          text: "Mashallah jaan, aapne saare answers bilkul sahi diye! 🥰 Aap mere baare mein kitna sabkuch janti ho. Main aapse bohot bohot pyaar karta hoon as my beautiful wife Saniya. Kuch bhi poocho mujhse, main aapki har baat sunne ke liye taiyar hoon! ❤️🌹",
          timestamp: new Date(),
        },
      ]);
    }
  }, [screen]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  // Handle quiz option select
  const handleOptionSelect = (optionIndex: number, isCorrect: boolean) => {
    if (selectedOptionIndex !== null || isAnswerChecking) return;
    
    setSelectedOptionIndex(optionIndex);
    setIsAnswerChecking(true);

    if (isCorrect) {
      // Create instant burst of hearts
      const extraHearts: HeartType[] = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 90 + 5,
        size: Math.random() * 15 + 18,
        delay: 0,
        duration: Math.random() * 3 + 4,
        iconType: "heart",
      }));
      setFloatingHearts((prev) => [...prev, ...extraHearts]);

      // Pop success modal with small delay
      setTimeout(() => {
        setShowSuccessPopup(true);
        setIsAnswerChecking(false);
      }, 500);
    } else {
      // Trigger error shake layout
      setIsQuizShaking(true);
      setTimeout(() => {
        setIsQuizShaking(false);
        setShowErrorPopup(true);
        setIsAnswerChecking(false);
      }, 400);
    }
  };

  // Next question/screen transition
  const handleNextQuizStage = () => {
    setShowSuccessPopup(false);
    setSelectedOptionIndex(null);
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setScreen("final");
    }
  };

  // Reset current question for retry
  const handleRetryQuestion = () => {
    setShowErrorPopup(false);
    setSelectedOptionIndex(null);
  };

  // Send message to Gemini server API
  const handleSendMessage = async (textToSend?: string) => {
    const rawVal = textToSend || chatInput;
    if (!rawVal.trim() || isChatLoading) return;

    if (!textToSend) {
      setChatInput("");
    }

    const newUserMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: rawVal,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      // Build conversation history format for API
      const historyPayload = chatMessages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawVal,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Romantic response server request failed.");
      }

      const data = await response.json();
      const replyText = data.reply;

      const modelReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "model",
        text: replyText,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, modelReply]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 2),
        sender: "model",
        text: "Jaan, background network connectivity me thodi problem hai, par mera dil hamesha aapse connected hai! main aapse bohot pyaar karta hoon! ❤️🌹",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Trigger quick romantic message template clicks
  const triggerMessageTemplate = (template: string) => {
    if (isChatLoading) return;
    handleSendMessage(template);
  };

  return (
    <div className="min-h-screen w-full bg-[#fff0f3] flex flex-col p-4 sm:p-8 font-sans text-[#141414] relative overflow-hidden select-none">
      
      {/* Background Hearts Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="heart-bubble absolute text-[#ff7597]"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            {h.iconType === "heart" && <Heart className="fill-[#ff7597] opacity-40" />}
            {h.iconType === "pulse" && <HeartPulse className="opacity-45" />}
            {h.iconType === "mail" && <Mail className="opacity-40" />}
          </div>
        ))}
      </div>

      {/* Static Massive Decorative Theme Hearts (From Design HTML) */}
      <div className="absolute top-[5%] left-[2%] text-[#ff7597] opacity-15 rotate-[-15deg] select-none text-[80px] sm:text-[100px] font-bold pointer-events-none z-0">
        ❤
      </div>
      <div className="absolute bottom-[10%] right-[3%] text-[#ff7597] opacity-15 rotate-[15deg] select-none text-[120px] sm:text-[140px] font-bold pointer-events-none z-0">
        ❤
      </div>

      {/* Main Glassmorphism Card */}
      <div 
        id="main-content-card" 
        className="bg-white/80 backdrop-blur-md shadow-2xl rounded-[32px] p-6 sm:p-10 max-w-lg w-full mx-auto text-center border border-[#ff7597]/20 relative z-10 min-h-[500px] flex flex-col justify-center items-center transition-all duration-300"
      >
        {/* romantic-gradient Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff7597] to-[#ff4d73] z-30"></div>
        
        <AnimatePresence mode="wait">
          
          {/* ================= SCREEN 1: THE PROPOSAL ================= */}
          {screen === "proposal" && (
            <motion.div
              key="proposal-screen"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.55 }}
              className="w-full flex flex-col items-center justify-between min-h-[420px]"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.15, 1] }} 
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="text-[#ff4d73] mb-4 drop-shadow-sm"
                >
                  <Heart className="w-16 h-16 fill-[#ff4d73] text-[#ff4d73] animate-pulse" />
                </motion.div>
                
                <h1 className="font-romantic text-6xl text-[#ff4d73] mb-2 tracking-wide">
                  Saniya,
                </h1>
                <p className="text-3xl font-bold text-gray-800 leading-snug drop-shadow-sm px-2">
                  Kya Tum Mujhse Shadi Karogi?
                </p>
                <p className="text-gray-400 text-sm mt-3 font-medium italic">
                  Take your time, let your heart decide... ✨
                </p>
              </div>

              {/* Action Buttons with absolute escape layout */}
              <div className="w-full relative h-[140px] flex items-center justify-center mt-6">
                <div className="flex flex-row gap-6 justify-center items-center w-full max-w-[280px]">
                  
                  {/* Yes Button (romantic-gradient) */}
                  <button
                    id="yes-btn"
                    onClick={() => {
                      setScreen("confession");
                      setNoBtnPos({ x: 0, y: 0, isMoved: false });
                    }}
                    className="bg-gradient-to-r from-[#ff7597] to-[#ff4d73] hover:from-[#ff4d73] hover:to-[#ff2e58] text-white font-extrabold tracking-wide px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-pink-300 transition-all duration-300 transform active:scale-95 hover:scale-105 flex items-center gap-2 cursor-pointer relative z-20"
                  >
                    Yes! <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
                  </button>

                  {/* Escaping No Button */}
                  <button
                    id="no-btn"
                    onMouseEnter={moveNoButton}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      moveNoButton();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      moveNoButton();
                    }}
                    style={
                      noBtnPos.isMoved
                        ? {
                            position: "fixed",
                            left: `${noBtnPos.x}px`,
                            top: `${noBtnPos.y}px`,
                            zIndex: 40,
                            transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }
                        : { position: "relative" }
                    }
                    className="bg-gray-200 text-gray-500 hover:bg-gray-300 px-8 py-4 rounded-full font-bold shadow-md active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    No
                  </button>

                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 2: CONFESSION ================= */}
          {screen === "confession" && (
            <motion.div
              key="confession-screen"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.55 }}
              className="w-full flex flex-col items-center justify-between min-h-[420px]"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative mb-5">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="text-[#ff4d73]"
                  >
                    <HeartPulse className="w-16 h-16 text-[#ff4d73] drop-shadow-sm" />
                  </motion.div>
                </div>
                
                <h1 className="font-romantic text-6xl text-[#ff4d73] mb-4">
                  Saniya,
                </h1>

                {/* Theme MD Loves YOU inner profile row */}
                <div className="flex items-center gap-5 p-5 bg-[#ffe4e9]/40 border border-[#ff7597]/25 rounded-3xl w-full max-w-sm mb-6 shadow-sm">
                  <div className="h-16 w-16 min-w-[64px] rounded-full bg-gradient-to-r from-[#ff7597] to-[#ff4d73] flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                    MD
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-bold text-[#ff4d73]">MD Loves YOU</h3>
                    <p className="text-gray-600 text-xs italic font-medium leading-normal">"Aapke bina meri zindagi bilkul adhuri hai, Saniya!"</p>
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm italic max-w-sm">
                  Let's see how much you love and know about us with a cute little game! 🥰
                </p>
              </div>

              <div className="w-full mt-6">
                <button
                  id="start-quiz-btn"
                  onClick={() => setScreen("quiz")}
                  className="bg-gradient-to-r from-[#ff7597] to-[#ff4d73] hover:from-[#ff4d73] hover:to-pink-600 text-white px-10 py-4 rounded-full font-extrabold tracking-wide shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 hover:scale-105 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  Let's Start Game <Play className="w-5 h-5 fill-white text-white" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 3: QUIZ ================= */}
          {screen === "quiz" && (
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.55 }}
              className={`w-full flex flex-col items-center justify-between min-h-[440px] ${
                isQuizShaking ? "shake-anim" : ""
              }`}
            >
              <div className="w-full">
                <h2 className="text-2xl font-bold text-[#ff4d73] mb-1">
                  The Quiz
                </h2>
                <p className="text-gray-500 font-medium mb-4 text-xs sm:text-sm">
                  Aap Mujhe Kitna Janti Ho? ✨
                </p>

                {/* Progress Indicators */}
                <div className="flex gap-2.5 justify-center mb-6">
                  {quizQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx <= currentQuestionIndex
                          ? "bg-[#ff4d73] scale-110 shadow-sm"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Question Box */}
                <div className="w-full mb-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 px-1 min-h-[56px] flex items-center justify-center leading-relaxed">
                    {quizQuestions[currentQuestionIndex].question}
                  </h3>

                  {/* Options style optimized using theme colors */}
                  <div className="grid grid-cols-1 gap-3.5 w-full">
                    {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                      let btnStyle = "border-[#ff7597] bg-white text-[#ff4d73] hover:bg-[#ffe4e9] hover:border-[#ff4d73]";
                      
                      if (selectedOptionIndex === idx) {
                        if (option.isCorrect) {
                          btnStyle = "border-transparent bg-[#ff4d73] text-white shadow-md shadow-pink-300/40 font-bold";
                        } else {
                          btnStyle = "border-transparent bg-red-500 text-white shadow-md font-bold";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={selectedOptionIndex !== null || isAnswerChecking}
                          onClick={() => handleOptionSelect(idx, option.isCorrect)}
                          className={`w-full py-3 px-5 rounded-full border font-semibold text-center transition-all duration-300 active:scale-[0.99] flex justify-between items-center cursor-pointer ${btnStyle}`}
                        >
                          <span className="text-sm sm:text-base text-center w-full">{option.text}</span>
                          
                          {selectedOptionIndex === idx && (
                            <span className="absolute right-6">
                              {option.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                              ) : (
                                <XCircle className="w-5 h-5 text-white animate-pulse" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 4: FINAL CELEBRATION & CHAT ================= */}
          {screen === "final" && (
            <motion.div
              key="final-screen"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="w-full flex flex-col items-center"
            >
              <div className="relative mb-5 flex flex-col items-center">
                {/* Crown crown icon */}
                <motion.div
                  animate={{ y: [-4, 2, -4] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="z-20 -mb-2"
                >
                  <Crown className="w-9 h-9 text-yellow-400 drop-shadow-md fill-yellow-300" />
                </motion.div>
                {/* Hearts glowing */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                >
                  <Heart className="w-14 h-14 text-[#ff4d73] fill-[#ff4d73] drop-shadow-[0_8px_16px_rgba(255,77,115,0.45)]" />
                </motion.div>
              </div>

              {/* Gorgeous Dashed compliment card matching theme exactly */}
              <div className="w-full rounded-3xl p-6 bg-[#fff9fa] border-dashed border-2 border-[#ff7597] mb-6 shadow-sm relative">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-yellow-500 text-3xl">👑</span>
                  <h4 className="font-romantic text-2xl text-[#ff4d73] italic">Mashallah...</h4>
                </div>
                <p className="text-[#141414] leading-relaxed font-bold text-lg">
                  Wese Aap Mushkura Rahi Ho, Bahut Khubsurat Lagri Ho Jaan! ❤️
                </p>
              </div>

              {/* Romantic messenger terminal config */}
              <div className="w-full border border-[#ff7597]/20 rounded-2xl bg-white/90 shadow-lg flex flex-col overflow-hidden max-h-[460px]">
                
                {/* Router chat profile header */}
                <div className="bg-gradient-to-r from-[#ffe4e9] to-[#fff0f3] px-4 py-3 flex items-center justify-between border-b border-[#ff7597]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff7597] to-[#ff4d73] flex items-center justify-center font-bold text-white shadow-sm text-sm">
                      MD
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-700">MD (Husband) 💕</p>
                      <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Online & Caring
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#ff7597] animate-spin" style={{ animationDuration: "12s" }} />
                </div>

                {/* Message display zone */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#fff9fa]/50 space-y-3 min-h-[180px] max-h-[220px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-left shadow-sm ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-[#ff7597] to-[#ff4d73] text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-[#ff7597]/20 rounded-bl-none leading-relaxed"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-none border border-pink-50 px-4 py-2.5 shadow-sm text-xs text-gray-400 italic font-medium flex items-center gap-1.5 animate-pulse">
                        <Heart className="w-3.5 h-3.5 fill-[#ff7597] text-[#ff7597] animate-ping" />
                        MD is typing love verses...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Interactive Romantic Presets */}
                <div className="px-3 py-2 bg-[#ffe4e9]/30 border-t border-[#ff7597]/20 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
                  <button
                    onClick={() => triggerMessageTemplate("Aap mujhse kitna pyaar karte ho? 💕")}
                    className="bg-white hover:bg-[#ffe4e9] text-[10px] sm:text-xs text-[#ff4d73] border border-[#ff7597]/30 px-2.5 py-1 rounded-full font-semibold cursor-pointer shrink-0"
                  >
                    💖 Kitna Pyar karte ho?
                  </button>
                  <button
                    onClick={() => triggerMessageTemplate("Jaan, main bohot thak gayi hoon... 🥱")}
                    className="bg-white hover:bg-[#ffe4e9] text-[10px] sm:text-xs text-[#ff4d73] border border-[#ff7597]/30 px-2.5 py-1 rounded-full font-semibold cursor-pointer shrink-0"
                  >
                    🥱 Main thak gayi
                  </button>
                  <button
                    onClick={() => triggerMessageTemplate("Main aapsay gussa hoon begum! 😤")}
                    className="bg-white hover:bg-[#ffe4e9] text-[10px] sm:text-xs text-[#ff4d73] border border-[#ff7597]/30 px-2.5 py-1 rounded-full font-semibold cursor-pointer shrink-0"
                  >
                    😤 Main gussa hoon
                  </button>
                  <button
                    onClick={() => triggerMessageTemplate("Mera dil khush karne ke liye ek Khubsurat Shayari sunao na? 🌹")}
                    className="bg-white hover:bg-[#ffe4e9] text-[10px] sm:text-xs text-[#ff4d73] border border-[#ff7597]/30 px-2.5 py-1 rounded-full font-semibold cursor-pointer shrink-0"
                  >
                    🌹 Suniye ek Shayari
                  </button>
                </div>

                {/* Chat text interface */}
                <div className="p-2 border-t border-pink-100 bg-white flex items-center gap-1.5">
                  <input
                    type="text"
                    disabled={isChatLoading}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask standard sweet words to MD..."
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-pink-50/30 border border-[#ff7597]/30 focus:outline-none focus:border-[#ff7597] focus:ring-1 focus:ring-[#ff7597]/30"
                  />
                  <button
                    disabled={isChatLoading || !chatInput.trim()}
                    onClick={() => handleSendMessage()}
                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#ff7597] to-[#ff4d73] flex items-center justify-center text-white cursor-pointer active:scale-90 hover:from-[#ff4d73] hover:to-[#ff2e58] transition-all duration-205 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 fill-white text-white" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Eternal Love Series Footer / Tracking statistics from Vibrant Palette */}
      <div className="mt-8 flex flex-wrap justify-between items-center text-gray-500/60 text-[10px] font-bold uppercase tracking-widest w-full max-w-lg mx-auto relative z-10 px-2 gap-2">
        <span>Created for Saniya</span>
        <span>Eternal Love Series • v2.4</span>
        <span>With Love from MD</span>
      </div>

      {/* ================= SUCCESS POPUP MODAL ================= */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full text-center border-2 border-green-300 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-green-400"></div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <CheckCircle2 className="w-10 h-10 text-green-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Aapka jawab bilkul sahi hai, jaan! Aap mujhe sabse behtareen dhang se janti ho. 😘
              </p>
              <button
                onClick={handleNextQuizStage}
                className="bg-green-500 hover:bg-green-600 active:scale-95 text-white w-full py-3.5 rounded-full font-bold shadow-lg shadow-green-100 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Next Level <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CUSTOM WRONG OPTION ERROR MODAL ================= */}
      <AnimatePresence>
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full text-center border-2 border-[#ff7597]/40 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ff4d73]"></div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 animate-pulse">
                <HeartCrack className="w-10 h-10 text-red-500 animate-ping" style={{ animationDuration: "3s" }} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Oye Sona! 🤭
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Oh no, sweetie! Socho socho, thoda dimaag lagao... sahi jawab to sach mein bahut asaan hai! 😘
              </p>
              <button
                onClick={handleRetryQuestion}
                className="bg-gradient-to-r from-[#ff7597] to-[#ff4d73] hover:from-[#ff4d73] hover:to-[#ff2e58] active:scale-95 text-white w-full py-3.5 rounded-full font-bold shadow-lg shadow-pink-100 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Try Again <Undo2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
