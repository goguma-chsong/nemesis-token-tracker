import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { playClick, playDraw, playReveal, playAlarm, playPneumatic, setMuted } from './audio';

// Detailed descriptions and properties for each intruder type with bilingual support (Korean updated as requested)
const INTRUDER_TYPES = [
  {
    id: 'blank',
    name: { en: 'Blank', ko: '공허 (Blank)' },
    threat: { en: 'SAFE (FOR NOW)', ko: '안전 (현재는...)' },
    description: {
      en: 'No immediate threat. Evolve during development phases.',
      ko: '즉각적인 위협은 없습니다. 주머니 개발 단계에서 성체 추가의 매개체가 됩니다.'
    },
    color: 'var(--color-gray)',
    glow: 'var(--color-gray-glow)',
    colorClass: 'blank'
  },
  {
    id: 'larva',
    name: { en: 'Larva', ko: '애벌레 (Larva)' },
    threat: { en: 'LOW', ko: '낮음' },
    description: {
      en: 'Small parasite. Infests characters or evolves into an Adult.',
      ko: '기생충. 캐릭터 몸속에 침투하거나 주머니 개발 시 성체로 진화합니다.'
    },
    color: 'var(--color-purple)',
    glow: 'var(--color-purple-glow)',
    colorClass: 'purple'
  },
  {
    id: 'creeper',
    name: { en: 'Creeper', ko: '아성체 (Creeper)' },
    threat: { en: 'MEDIUM', ko: '보통' },
    description: {
      en: 'Highly agile juvenile. Evolve to Breeder in bag development.',
      ko: '날렵한 유년기 괴수. 주머니 개발 시 완성체로 진화합니다.'
    },
    color: 'var(--color-amber)',
    glow: 'var(--color-amber-glow)',
    colorClass: 'amber'
  },
  {
    id: 'adult',
    name: { en: 'Adult', ko: '성체 (Adult)' },
    threat: { en: 'HIGH', ko: '높음' },
    description: {
      en: 'The standard alien horror. Fast, aggressive, and numerous.',
      ko: '가장 흔하고 포악한 인트루더. 속도가 빠르고 개체 수가 많습니다.'
    },
    color: 'var(--color-red)',
    glow: 'var(--color-red-glow)',
    colorClass: 'red'
  },
  {
    id: 'breeder',
    name: { en: 'Breeder', ko: '완성체 (Breeder)' },
    threat: { en: 'EXTREME', ko: '매우 높음' },
    description: {
      en: 'Massive armored bulk. Tough to wound, lethal close combat.',
      ko: '거대하고 육중한 인트루더. 공격 강도가 강력하며 쓰러뜨리기 어렵습니다.'
    },
    color: 'var(--color-red)',
    glow: 'var(--color-red-glow)',
    colorClass: 'red'
  },
  {
    id: 'queen',
    name: { en: 'Queen', ko: '여왕 (Queen)' },
    threat: { en: 'LETHAL', ko: '치명적' },
    description: {
      en: 'Intruder matriarch. Nest encounters spawn her immediately.',
      ko: '인류의 천적 인트루더 여왕. 플레이어가 둥지에 있는 경우 즉시 마주치게 됩니다.'
    },
    color: 'var(--color-green)',
    glow: 'var(--color-green-glow)',
    colorClass: 'green'
  }
];

const TOKEN_LIMITS = {
  blank: 1,
  larva: 8,
  creeper: 3,
  adult: 12,
  breeder: 2,
  queen: 1
};

const TRANSLATIONS = {
  en: {
    title: "SYSTEM INTERFACE",
    subtitle: "CSS-CONTAINED INTRUDER BAG TELEMETRY",
    shipStatus: "SHIP STATUS",
    nominal: "NOMINAL",
    reactorTemp: "REACTOR TEMP",
    secTimer: "SEC TIMER",
    manual: "MANUAL",
    audio: "AUDIO",
    muted: "MUTED",
    undo: "UNDO",
    reset: "RESET",
    initTitle: "INTRUDER TELEMETRY INITIALIZATION",
    initDesc: "Configure players to compute the standard Intruder Bag density matrix.",
    selectPlayers: "1. SELECT CURRENT PLAYER DENSITY",
    startingBag: "2. ESTIMATED STARTING BAG DENSITY",
    initBtn: "INITIALIZE BAG CONTAINMENT",
    chamberTitle: "CONTAINMENT CHAMBER",
    drawsRemaining: "DRAWS REMAINING",
    analyzing: "ANALYZING...",
    contained: "CONTAINED",
    encounterBadge: "INTRUDER ENCOUNTER",
    devBadge: "BAG DEVELOPMENT DRAW",
    threat: "THREAT STATUS",
    telemetry: "CHAMBER TELEMETRY",
    evoRules: "BAG EVOLUTION RULES",
    applyEvo: "APPLY EVOLUTION",
    nestSafe: "NEST SAFE: Add Egg & Return Queen",
    returnToken: "RETURN TOKEN TO BAG",
    keepOut: "KEEP OUT OF BAG (Spawn / Remove)",
    drawIntruder: "DRAW INTRUDER",
    bagDev: "BAG DEVELOPMENT",
    densityTitle: "BAG DENSITY MATRIX",
    densityDesc: "SYSTEM QUANTITIES AND REAL-TIME DECAY",
    totalTokens: "TOTAL CONCEALED TOKENS",
    stability: "SYSTEM STABILITY",
    logHeader: "SHIP TELEMETRY CONSOLE LOG",
    clearBuffer: "CLEAR BUFFER",
    emptyBuffer: "[CONSOLE BUFFER EMPTY - AWAITING INTRUDER ENCOUNTER]",
    confirmReset: "Reset current game? Bag configuration and draw history will be cleared.",
    confirmEmpty: "WARNING: The containment bag is empty. Manual token configuration required.",
    rulesManualTitle: "📙 SHIP CLASSIFIED MANUAL: BAG SYSTEM",
    rulesSection1: "1. Intruder bag starting density",
    rulesSection1Text: "For a standard campaign game of Nemesis, set the containment matrix as follows:",
    rulesSection2: "2. Development Phase rules",
    rulesSection2Text: "During the End Phase, draw 1 token from the bag. Resolve the rules based on the token and perform evolution steps:",
    rulesSection3: "3. Encounter Spawn rules",
    rulesSection3Text: "When you trigger an encounter and draw a token, players compare the intruder threat with their current Hand size:",
    rulesEncounter1: "If the drawn intruder's value is greater than the player's current hand size, the intruder performs a Surprise Attack.",
    rulesEncounter2: "If the intruder spawned, remove its token from the bag (keep it out).",
    rulesEncounter3: "If you draw a Blank token, place a Noise marker in all corridors connected to the room. Return the Blank token to the bag."
  },
  ko: {
    title: "시스템 인터페이스",
    subtitle: "CSS 함입 인트루더 주머니 원격 분석기",
    shipStatus: "선체 상태",
    nominal: "정상",
    reactorTemp: "원자로 온도",
    secTimer: "시간 기록",
    manual: "설명서",
    audio: "오디오",
    muted: "음소거",
    undo: "실행 취소",
    reset: "초기화",
    initTitle: "인트루더 원격 분석 초기화",
    initDesc: "플레이어 인원수를 선택하여 표준 인트루더 주머니 밀도 매트릭스를 계산하십시오.",
    selectPlayers: "1. 플레이어 수 선택",
    startingBag: "2. 예상 시작 주머니 밀도",
    initBtn: "인트루더 주머니 격리 시스템 초기화",
    chamberTitle: "격리실 (Chamber)",
    drawsRemaining: "남은 토큰 수",
    analyzing: "원격 분석 중...",
    contained: "격리됨",
    encounterBadge: "인트루더 조우 드로우",
    devBadge: "인트루더 주머니 성장 단계 드로우",
    threat: "위협 상태",
    telemetry: "원격 격리실 분석",
    evoRules: "주머니 진화 규칙",
    applyEvo: "진화 적용",
    nestSafe: "둥지 안전: 알 추가 & 여왕 회수",
    returnToken: "토큰 주머니로 회수",
    keepOut: "주머니에서 제외 (보드판 스폰/제거)",
    drawIntruder: "인트루더 드로우",
    bagDev: "인트루더 주머니 성장",
    densityTitle: "주머니 밀도 매트릭스",
    densityDesc: "시스템 수량 및 실시간 분해율",
    totalTokens: "주머니 내 총 토큰 수",
    stability: "시스템 안정도",
    logHeader: "우주선 원격 분석 콘솔 로그",
    clearBuffer: "버퍼 지우기",
    emptyBuffer: "[콘솔 버퍼 비어 있음 - 인트루더 조우 대기 중]",
    confirmReset: "현재 게임을 초기화하시겠습니까? 주머니 설정과 드로우 기록이 모두 소멸됩니다.",
    confirmEmpty: "경고: 주머니 격리실이 비어 있습니다. 수동 토큰 추가가 필요합니다.",
    rulesManualTitle: "📙 우주선 연합 기밀 메뉴얼: 인트루더 주머니 시스템",
    rulesSection1: "1. 인트루더 주머니 시작 설정",
    rulesSection1Text: "네메시스 기본 캠페인 기준, 주머니 격리 매트릭스는 다음과 같이 구성됩니다.",
    rulesSection2: "2. 인트루더 주머니 성장 단계 규칙 (Bag Development)",
    rulesSection2Text: "매 라운드 종료 시(이벤트 단계), 주머니에서 토큰을 1개 뽑아 나온 유형에 따라 아래 처리를 실행합니다.",
    rulesSection3: "3. 인트루더 조우 규칙 (Encounter)",
    rulesSection3Text: "소음 주사위 등으로 인트루더 조우가 활성화되어 토큰을 뽑는 경우, 위협치와 손패 장수를 비교합니다.",
    rulesEncounter1: "뽑힌 인트루더의 고유 수치(전투력)가 해당 플레이어의 현재 손패 장수보다 크면, 인트루더가 즉시 습격(Surprise Attack)을 가합니다.",
    rulesEncounter2: "인트루더가 보드판에 출현하는 경우 해당 토큰은 주머니에 넣지 않고 주머니 밖(제거)에 둡니다.",
    rulesEncounter3: "공허(Blank) 토큰을 뽑은 경우 해당 방과 연결된 모든 통로에 소음 마커를 1개씩 추가하고 공허 토큰은 주머니에 되돌려놓습니다."
  }
};

// Reusable custom SVG icons for each token type
function TokenIcon({ id }) {
  switch (id) {
    case 'blank':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
        </svg>
      );
    case 'larva':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 25 C38 25, 30 35, 30 48 C30 58, 38 68, 48 68 C53 68, 58 64, 58 58 C58 52, 48 50, 48 42 C48 38, 52 35, 56 35 C60 35, 63 38, 63 42 C63 46, 58 48, 58 52 C58 58, 64 62, 70 58 C76 54, 75 42, 70 35 C65 28, 58 25, 50 25 Z" fill="currentColor" />
          <circle cx="48" cy="42" r="3" fill="#000" />
        </svg>
      );
    case 'creeper':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 20 C42 20, 38 32, 42 42 C35 42, 25 48, 28 58 C30 65, 36 62, 38 52 C42 58, 40 78, 43 78 C45 78, 46 65, 48 58 C52 58, 54 65, 57 78 C59 78, 60 78, 58 58 C60 62, 68 65, 70 58 C72 48, 63 42, 57 42 C62 32, 58 20, 50 20 Z" fill="currentColor" />
          <circle cx="46" cy="36" r="3" fill="#000" />
          <circle cx="54" cy="36" r="3" fill="#000" />
        </svg>
      );
    case 'adult':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 45 C25 32, 75 22, 78 38 C78 45, 68 50, 58 53 C48 56, 42 66, 40 72 C38 76, 33 76, 35 68 C37 62, 38 56, 32 52 C26 48, 25 46, 25 45 Z" fill="currentColor" />
          <path d="M38 42 L65 37" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M41 48 L60 44" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M28 44 C26 44, 25 40, 28 38" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'breeder':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 45 C20 28, 75 16, 80 34 C82 46, 68 50, 56 54 C44 57, 40 68, 38 75 C35 80, 28 80, 32 70 C35 62, 35 56, 28 52 C20 47, 20 46, 20 45 Z" fill="currentColor" />
          <path d="M72 23 L82 19 M63 19 L71 13 M54 18 L60 11 M46 19 L50 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 40 L60 34 M36 48 L56 42" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'queen':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 35 L20 18 L38 12 L50 20 L62 12 L80 18 L85 35 L75 38 L68 28 L50 34 L32 28 L25 38 Z" fill="currentColor" />
          <path d="M30 40 C30 40, 45 38, 48 52 C48 52, 42 68, 40 74 C38 78, 32 78, 35 68 C37 60, 37 56, 28 52 C20 47, 24 45, 30 40 Z" fill="currentColor" />
          <path d="M70 40 C70 40, 55 38, 52 52 C52 52, 58 68, 60 74 C62 78, 68 78, 65 68 C63 60, 63 56, 72 52 C80 47, 76 45, 70 40 Z" fill="currentColor" />
          <circle cx="50" cy="46" r="3" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

export default function App() {
  // Main states
  const [gameState, setGameState] = useState('SETUP'); // SETUP or PLAYING
  const [playerCount, setPlayerCount] = useState(4);
  const [language, setLanguage] = useState('ko'); // 'en' or 'ko' default
  const [bag, setBag] = useState({
    blank: 1,
    larva: 4,
    creeper: 1,
    adult: 7,
    breeder: 0,
    queen: 1
  });
  const [history, setHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [drawnToken, setDrawnToken] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [drawMode, setDrawMode] = useState('STANDARD'); // STANDARD or DEVELOPMENT
  const [shipTime, setShipTime] = useState('12:00:00');

  const logContainerRef = useRef(null);

  // Translate utility
  const t = (key) => TRANSLATIONS[language]?.[key] || key;

  // Helper to fetch translated name by token ID
  const getTokenKoName = (id) => INTRUDER_TYPES.find(t => t.id === id)?.name.ko || id;

  // Update Ship time indicator every second
  useEffect(() => {
    const updateShipTime = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      setShipTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateShipTime();
    const interval = setInterval(updateShipTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autoscroll terminal log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [history]);

  const totalTokens = Object.values(bag).reduce((sum, val) => sum + val, 0);

  const getProbability = (id) => {
    if (totalTokens === 0) return 0;
    return ((bag[id] / totalTokens) * 100).toFixed(1);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ko' : 'en');
    playClick();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setMuted(nextMuted);
    playClick();
  };

  // Push state to undo stack before editing
  const saveStateForUndo = (currentBag, currentHistory) => {
    setUndoStack(prev => [
      ...prev,
      {
        bag: { ...currentBag },
        history: [...currentHistory]
      }
    ]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setBag(previous.bag);
    setHistory(previous.history);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setDrawnToken(null);
    playClick();
  };

  // Set standard startup bag
  const handleInitializeGame = () => {
    const startBag = {
      blank: 1,
      larva: 4,
      creeper: 1,
      adult: 3 + playerCount,
      breeder: 0,
      queen: 1
    };
    setBag(startBag);
    setUndoStack([]);
    
    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    
    setHistory([
      {
        time: timestamp,
        text: isKorean 
          ? `로그 활성화: ${playerCount}인 기준 주머니 표준 밀도 설정됨.` 
          : `LOG INITIALIZED: Standard Bag configured for ${playerCount} Players.`,
        type: 'setup'
      },
      {
        time: timestamp,
        text: isKorean 
          ? `시작 토큰 구성: 공허 1, 애벌레 4, 아성체 1, 성체 ${3 + playerCount}, 여왕 1.` 
          : `Starting bag: 1 Blank, 4 Larva, 1 Creeper, ${3 + playerCount} Adult, 1 Queen.`,
        type: 'setup'
      }
    ]);
    setGameState('PLAYING');
    setDrawnToken(null);
    playPneumatic();
  };

  const handleDrawToken = (mode = 'STANDARD') => {
    if (totalTokens === 0) {
      alert(t('confirmEmpty'));
      return;
    }

    setIsDrawing(true);
    setDrawnToken(null);
    setDrawMode(mode);
    playDraw();

    // Store state for undo
    saveStateForUndo(bag, history);

    setTimeout(() => {
      // Build a flat bag list based on current counts
      const flatBag = [];
      Object.entries(bag).forEach(([token, count]) => {
        for (let i = 0; i < count; i++) {
          flatBag.push(token);
        }
      });

      const randomIndex = Math.floor(Math.random() * flatBag.length);
      const selectedToken = flatBag[randomIndex];

      // Remove the token from the bag
      setBag(prev => ({
        ...prev,
        [selectedToken]: Math.max(0, prev[selectedToken] - 1)
      }));

      setDrawnToken(selectedToken);
      setIsDrawing(false);

      // Play dangerous trigger sounds
      const isDangerous = ['adult', 'breeder', 'queen'].includes(selectedToken);
      playReveal(isDangerous);
      if (isDangerous) {
        playAlarm();
      }

      const timestamp = new Date().toLocaleTimeString();
      const isKorean = language === 'ko';
      
      const actionLabel = mode === 'DEVELOPMENT' 
        ? (isKorean ? '인트루더 주머니 성장 드로우' : 'SYSTEM DEV DRAW') 
        : (isKorean ? '조우 인트루더 드로우' : 'HUD INTRUDER DRAW');
      
      const tokenDisplayName = isKorean ? getTokenKoName(selectedToken) : selectedToken.toUpperCase();
      const logText = isKorean 
        ? `${actionLabel}: [${tokenDisplayName}] 토큰 드로우 완료.` 
        : `${actionLabel}: Drawn ${selectedToken.toUpperCase()} token.`;

      setHistory(prev => [
        ...prev,
        { time: timestamp, text: logText, type: 'draw' }
      ]);
    }, 850);
  };

  // Actions for drawn token resolutions
  const handleReturnToBag = () => {
    if (!drawnToken) return;

    saveStateForUndo(bag, history);
    setBag(prev => ({
      ...prev,
      [drawnToken]: prev[drawnToken] + 1
    }));

    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    const tokenDisplayName = isKorean ? getTokenKoName(drawnToken) : drawnToken.toUpperCase();
    
    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `결과: [${tokenDisplayName}] 토큰을 다시 주머니로 회수.` 
          : `RESOLUTION: Returned ${drawnToken.toUpperCase()} token back to bag.`, 
        type: 'edit' 
      }
    ]);
    setDrawnToken(null);
    playClick();
  };

  const handleKeepOut = () => {
    if (!drawnToken) return;

    saveStateForUndo(bag, history);
    // Token is already deducted, just clear drawn state
    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    const tokenDisplayName = isKorean ? getTokenKoName(drawnToken) : drawnToken.toUpperCase();
    
    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `결과: [${tokenDisplayName}] 보드판에 피규어로 출현. 주머니에서 제외.` 
          : `RESOLUTION: ${drawnToken.toUpperCase()} spawned on board. Removed from bag.`, 
        type: 'edit' 
      }
    ]);
    setDrawnToken(null);
    playClick();
  };

  // Evolution Rules
  const handleEvolveLarva = () => {
    if (bag.adult >= TOKEN_LIMITS.adult) {
      alert(language === 'ko'
        ? `경고: 성체 토큰 개수가 컴포넌트 제한(최대 ${TOKEN_LIMITS.adult}개)을 초과하므로 더 이상 추가할 수 없습니다. (피규어가 보드판에서 철수했을 가능성이 있습니다.)`
        : `WARNING: Adult token count cannot exceed the component limit of ${TOKEN_LIMITS.adult}.`
      );
      setDrawnToken(null);
      return;
    }
    saveStateForUndo(bag, history);
    // Larva is already out, we just add 1 Adult
    setBag(prev => ({
      ...prev,
      adult: prev.adult + 1
    }));

    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    
    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `진화: 애벌레가 성체로 성장. 애벌레 제거, 성체 토큰 +1.` 
          : `EVOLVE: Larva token evolved. Removed Larva, added 1 ADULT to bag.`, 
        type: 'evolve' 
      }
    ]);
    setDrawnToken(null);
    playPneumatic();
  };

  const handleEvolveCreeper = () => {
    if (bag.breeder >= TOKEN_LIMITS.breeder) {
      alert(language === 'ko'
        ? `경고: 완성체 토큰 개수가 컴포넌트 제한(최대 ${TOKEN_LIMITS.breeder}개)을 초과하므로 더 이상 추가할 수 없습니다.`
        : `WARNING: Breeder token count cannot exceed the component limit of ${TOKEN_LIMITS.breeder}.`
      );
      setDrawnToken(null);
      return;
    }
    saveStateForUndo(bag, history);
    // Creeper is already out, we just add 1 Breeder
    setBag(prev => ({
      ...prev,
      breeder: prev.breeder + 1
    }));

    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    
    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `진화: 아성체가 완성체로 성장. 아성체 제거, 완성체 토큰 +1.` 
          : `EVOLVE: Creeper token evolved. Removed Creeper, added 1 BREEDER to bag.`, 
        type: 'evolve' 
      }
    ]);
    setDrawnToken(null);
    playPneumatic();
  };

  const handleBlankDevelopment = () => {
    saveStateForUndo(bag, history);
    const hasRoomForAdult = bag.adult < TOKEN_LIMITS.adult;
    
    setBag(prev => ({
      ...prev,
      blank: prev.blank + 1,
      adult: hasRoomForAdult ? prev.adult + 1 : prev.adult
    }));

    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    
    if (!hasRoomForAdult) {
      alert(isKorean
        ? `경고: 성체 토큰 개수가 컴포넌트 제한(최대 ${TOKEN_LIMITS.adult}개)에 도달하여 추가하지 않고 공허 토큰만 주머니로 회수합니다.`
        : `WARNING: Adult token limit reached. Blank returned but no Adult added.`
      );
    }

    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `성장단계: 공허 토큰 발생. 공허 회수${hasRoomForAdult ? ', 성체 토큰 +1' : ' (성체 토큰 제한으로 추가 실패)'}.` 
          : `DEVELOPMENT: Blank token. Returned Blank${hasRoomForAdult ? ', added 1 ADULT to bag' : ' (Adult limit reached)'}.`, 
        type: 'evolve' 
      }
    ]);
    setDrawnToken(null);
    playPneumatic();
  };

  const handleQueenEggDevelopment = () => {
    saveStateForUndo(bag, history);
    // Queen is returned to bag, Egg is placed on board
    setBag(prev => ({
      ...prev,
      queen: prev.queen + 1
    }));

    const timestamp = new Date().toLocaleTimeString();
    const isKorean = language === 'ko';
    
    setHistory(prev => [
      ...prev,
      { 
        time: timestamp, 
        text: isKorean 
          ? `성장단계: 여왕 토큰 발생. 여왕 주머니 회수, 인트루더 알 +1.` 
          : `DEVELOPMENT: Queen token. Returned Queen to bag, added 1 Egg to board.`, 
        type: 'evolve' 
      }
    ]);
    setDrawnToken(null);
    playClick();
  };

  // Adjust quantities manually (+ / -)
  const handleUpdateQuantity = (token, delta) => {
    if (delta > 0 && bag[token] >= TOKEN_LIMITS[token]) {
      const isKorean = language === 'ko';
      alert(isKorean 
        ? `경고: [${getTokenKoName(token)}] 토큰은 컴포넌트 제한(최대 ${TOKEN_LIMITS[token]}개)을 초과해 주머니에 추가할 수 없습니다.` 
        : `WARNING: [${token.toUpperCase()}] token count cannot exceed the physical limit of ${TOKEN_LIMITS[token]} in the bag.`
      );
      return;
    }
    if (bag[token] + delta < 0) return;
    saveStateForUndo(bag, history);
    setBag(prev => ({
      ...prev,
      [token]: prev[token] + delta
    }));

    const timestamp = new Date().toLocaleTimeString();
    const direction = delta > 0 ? '+' : '-';
    const isKorean = language === 'ko';
    const tokenDisplayName = isKorean ? getTokenKoName(token) : token.toUpperCase();
    
    setHistory(prev => [
      ...prev,
      {
        time: timestamp,
        text: isKorean 
          ? `수동 조정: [${tokenDisplayName}] ${direction}${Math.abs(delta)} (최종 잔량: ${bag[token] + delta}개)`
          : `MANUAL OVERRIDE: ${direction}${Math.abs(delta)} ${token.toUpperCase()} (Total: ${bag[token] + delta})`,
        type: 'edit'
      }
    ]);
    playClick();
  };

  const handleResetGame = () => {
    if (confirm(t('confirmReset'))) {
      setGameState('SETUP');
      setUndoStack([]);
      setHistory([]);
      setDrawnToken(null);
      playPneumatic();
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar HUD */}
      <header className="ship-header">
        <div className="title-area">
          <h1><span>NEMESIS</span> // {t('title')}</h1>
          <div className="title-subtitle">{t('subtitle')}</div>
        </div>

        <div className="hud-system-stats">
          <div className="stat-box">
            <span className="label">{t('shipStatus')}:</span>
            <span className="value nominal">{t('nominal')}</span>
          </div>
          <div className="stat-box">
            <span className="label">{t('reactorTemp')}:</span>
            <span className="value">415°C</span>
          </div>
          <div className="stat-box">
            <span className="label">{t('secTimer')}:</span>
            <span className="value">{shipTime}</span>
          </div>
        </div>

        <div className="hud-controls-toolbar">
          <button className="btn-hud-tool" onClick={toggleLanguage}>
            🌐 {language === 'en' ? '한국어' : 'ENGLISH'}
          </button>
          <button className="btn-hud-tool" onClick={() => setIsRulesOpen(true)}>
            📖 {t('manual')}
          </button>
          <button className={`btn-hud-tool ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
            {isMuted ? `🔇 ${t('muted')}` : `🔊 ${t('audio')}`}
          </button>
          {gameState === 'PLAYING' && (
            <>
              <button 
                className="btn-hud-tool" 
                onClick={handleUndo} 
                disabled={undoStack.length === 0}
                title="Undo last action"
              >
                ↩️ {t('undo')} ({undoStack.length})
              </button>
              <button className="btn-hud-tool" onClick={handleResetGame} title="Reset telemetry">
                ⚠️ {t('reset')}
              </button>
            </>
          )}
        </div>
      </header>

      {/* SETUP PHASE SCREEN */}
      {gameState === 'SETUP' ? (
        <main className="setup-panel">
          <h2>{t('initTitle')}</h2>
          <p className="setup-description">{t('initDesc')}</p>

          <div className="setup-section">
            <h3>{t('selectPlayers')}</h3>
            <div className="player-selector-grid">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`btn-player-select ${playerCount === num ? 'active' : ''}`}
                  onClick={() => { setPlayerCount(num); playClick(); }}
                >
                  {num}P
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <h3>{t('startingBag')}</h3>
            <div className="starting-bag-preview">
              <div className="starting-bag-grid">
                <div className="preview-item" style={{ color: 'var(--color-gray)' }}>
                  <div className="preview-dot" />
                  <span>1x {language === 'ko' ? '공허' : 'Blank'}</span>
                </div>
                <div className="preview-item" style={{ color: 'var(--color-purple)' }}>
                  <div className="preview-dot" />
                  <span>4x {language === 'ko' ? '애벌레' : 'Larva'}</span>
                </div>
                <div className="preview-item" style={{ color: 'var(--color-amber)' }}>
                  <div className="preview-dot" />
                  <span>1x {language === 'ko' ? '아성체' : 'Creeper'}</span>
                </div>
                <div className="preview-item" style={{ color: 'var(--color-red)' }}>
                  <div className="preview-dot" />
                  <span>{3 + playerCount}x {language === 'ko' ? '성체' : 'Adult'}</span>
                </div>
                <div className="preview-item" style={{ color: 'var(--color-red)' }}>
                  <div className="preview-dot" style={{ backgroundColor: '#ff0055' }} />
                  <span>0x {language === 'ko' ? '완성체' : 'Breeder'}</span>
                </div>
                <div className="preview-item" style={{ color: 'var(--color-green)' }}>
                  <div className="preview-dot" />
                  <span>1x {language === 'ko' ? '여왕' : 'Queen'}</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-initialize-game" onClick={handleInitializeGame}>
            {t('initBtn')}
          </button>
        </main>
      ) : (
        /* PLAYING PHASE SCREEN */
        <>
          <main className="dashboard-grid">
            {/* LEFT CONTAINER: CONTAINMENT BAG CHAMBER */}
            <section className="hud-panel">
              <div className="panel-header">
                <h2>{t('chamberTitle')}</h2>
                <div className="panel-sub">{t('drawsRemaining')}: {totalTokens}</div>
              </div>

              <div className="chamber-container">
                {/* Visual Bag Representation */}
                {!drawnToken && (
                  <div className={`containment-chamber ${isDrawing ? 'drawing' : ''}`}>
                    <div className="chamber-ring-outer" />
                    <div className="chamber-ring-inner" />
                    <div className="chamber-core">
                      <div className="chamber-icon-wrapper">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M50 20 L25 35 V75 L50 90 L75 75 V35 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
                          <circle cx="50" cy="52" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                      </div>
                      <div className="chamber-status-text">
                        {isDrawing ? t('analyzing') : t('contained')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Drawn Token Detail Card */}
                {drawnToken && !isDrawing && (
                  <div className="drawn-result-card">
                    <div className={`drawn-type-badge ${drawMode === 'DEVELOPMENT' ? 'dev-phase' : 'standard'}`}>
                      {drawMode === 'DEVELOPMENT' ? t('devBadge') : t('encounterBadge')}
                    </div>

                    {/* Physical style glowing token */}
                    <div
                      className="token-circle"
                      style={{
                        backgroundColor: INTRUDER_TYPES.find(t => t.id === drawnToken).color,
                        boxShadow: `0 0 25px ${INTRUDER_TYPES.find(t => t.id === drawnToken).glow}`
                      }}
                    >
                      <div className="token-circle-inner">
                        <TokenIcon id={drawnToken} />
                      </div>
                    </div>

                    <h3 className="drawn-token-title" style={{ color: INTRUDER_TYPES.find(t => t.id === drawnToken).color }}>
                      {INTRUDER_TYPES.find(t => t.id === drawnToken).name[language].toUpperCase()}
                    </h3>
                    <div className="drawn-token-threat">
                      {t('threat')}: <span style={{ color: INTRUDER_TYPES.find(t => t.id === drawnToken).color }}>
                        {INTRUDER_TYPES.find(t => t.id === drawnToken).threat[language] || INTRUDER_TYPES.find(t => t.id === drawnToken).threat}
                      </span>
                    </div>

                    {/* Standard details */}
                    <div className="drawn-rule-box" style={{ borderLeftColor: INTRUDER_TYPES.find(t => t.id === drawnToken).color }}>
                      <h4>{t('telemetry')}</h4>
                      <p>{INTRUDER_TYPES.find(t => t.id === drawnToken).description[language]}</p>
                    </div>

                    {/* Development Phase Special Rule Text overlay */}
                    {drawMode === 'DEVELOPMENT' && (
                      <div className="drawn-rule-box dev-rule">
                        <h4>{t('evoRules')}</h4>
                        {drawnToken === 'blank' && <p>{language === 'ko' ? '공허 토큰: 주머니에 성체 토큰 1개를 추가하고 공허는 회수합니다.' : 'Add 1 Adult token to the bag. Return the Blank token to the bag.'}</p>}
                        {drawnToken === 'larva' && <p>{language === 'ko' ? '애벌레 진화: 애벌레를 제거하고 성체 토큰 1개를 주머니에 추가합니다.' : 'Evolve Larva: Remove Larva from bag. Add 1 Adult token to the bag.'}</p>}
                        {drawnToken === 'creeper' && <p>{language === 'ko' ? '아성체 진화: 아성체를 제거하고 완성체 토큰 1개를 주머니에 추가합니다.' : 'Evolve Creeper: Remove Creeper from bag. Add 1 Breeder token to the bag.'}</p>}
                        {['adult', 'breeder'].includes(drawnToken) && <p>{language === 'ko' ? '성체/완성체: 토큰을 주머니로 회수합니다. 전투 중이 아닌 모든 플레이어들은 주사위를 굴려 소음 판정을 수행하십시오.' : 'Return the token to the bag. All players NOT in combat perform a Noise Roll.'}</p>}
                        {drawnToken === 'queen' && <p>{language === 'ko' ? '여왕: 캐릭터가 둥지(Nest) 방에 있다면 여왕 조우를 시작합니다. 둥지에 아무도 없거나 이미 여왕이 밖으로 나와 있다면 알 1개를 추가하고 여왕은 주머니로 회수합니다.' : 'If there is any Character in the Nest room, spawn Queen encounter. Otherwise, add 1 Egg to board and return Queen to bag.'}</p>}
                      </div>
                    )}

                    {/* Interactive Tactical buttons for drawn tokens */}
                    <div className="drawn-decision-actions">
                      {/* Special development buttons */}
                      {drawMode === 'DEVELOPMENT' && drawnToken === 'blank' && (
                        <button className="btn-decision primary" onClick={handleBlankDevelopment}>
                          ⚙️ {t('applyEvo')} (공허 ➕ 성체)
                        </button>
                      )}
                      {drawMode === 'DEVELOPMENT' && drawnToken === 'larva' && (
                        <button className="btn-decision primary" onClick={handleEvolveLarva}>
                          ⚙️ {t('applyEvo')} (애벌레 ➡️ 성체)
                        </button>
                      )}
                      {drawMode === 'DEVELOPMENT' && drawnToken === 'creeper' && (
                        <button className="btn-decision primary" onClick={handleEvolveCreeper}>
                          ⚙️ {t('applyEvo')} (아성체 ➡️ 완성체)
                        </button>
                      )}
                      {drawMode === 'DEVELOPMENT' && drawnToken === 'queen' && (
                        <button className="btn-decision primary" onClick={handleQueenEggDevelopment}>
                          🥚 {language === 'ko' ? '둥지 안전: 알 추가 & 여왕 회수' : 'NEST SAFE: Add Egg & Return Queen'}
                        </button>
                      )}

                      {/* Standard Options */}
                      <button className="btn-decision warning-action" onClick={handleReturnToBag}>
                        🔄 {t('returnToken')}
                      </button>
                      <button className="btn-decision" onClick={handleKeepOut}>
                        👾 {t('keepOut')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary draw actions buttons */}
                {!drawnToken && !isDrawing && (
                  <div className="draw-actions-row">
                    <button
                      className="btn-main-action btn-draw-token"
                      onClick={() => handleDrawToken('STANDARD')}
                      disabled={totalTokens === 0}
                    >
                      ☠️ {t('drawIntruder')}
                    </button>
                    <button
                      className="btn-main-action btn-dev-bag"
                      onClick={() => handleDrawToken('DEVELOPMENT')}
                      disabled={totalTokens === 0}
                    >
                      ⚙️ {t('bagDev')}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT CONTAINER: DENSITY MATRIX (BAG INVENTORY & PROBABILITY BARS) */}
            <section className="hud-panel">
              <div className="panel-header">
                <h2>{t('densityTitle')}</h2>
                <div className="panel-sub">{t('densityDesc')}</div>
              </div>

              <div className="inventory-list">
                {INTRUDER_TYPES.map((type) => {
                  const qty = bag[type.id];
                  const prob = getProbability(type.id);

                  return (
                    <div key={type.id} className="inventory-row" style={{ borderLeft: `3px solid ${type.color}` }}>
                      {/* Glowing preview circle */}
                      <div className="inventory-mini-token" style={{ color: type.color, boxShadow: qty > 0 ? `0 0 8px ${type.glow}` : 'none' }}>
                        <div className="inventory-mini-token-inner">
                          <TokenIcon id={type.id} />
                        </div>
                      </div>

                      {/* Token details */}
                      <div className="token-info">
                        <span className="token-name-label">{type.name[language]}</span>
                        <span className="token-threat-label">{t('threat')}: {type.threat[language] || type.threat}</span>
                      </div>

                      {/* Edit Quantity buttons */}
                      <div className="token-edit-controls">
                        <button className="btn-edit-qty" onClick={() => handleUpdateQuantity(type.id, -1)} disabled={qty === 0}>
                          -
                        </button>
                        <span className={`qty-val ${qty === 0 ? 'zero' : ''}`}>{qty}</span>
                        <button className="btn-edit-qty" onClick={() => handleUpdateQuantity(type.id, 1)}>
                          +
                        </button>
                      </div>

                      {/* Probability bars */}
                      <div className="probability-wrapper">
                        <div className="probability-bar-bg">
                          <div
                            className="probability-bar-fill"
                            style={{
                              width: `${prob}%`,
                              backgroundColor: type.color,
                              color: type.color
                            }}
                          />
                        </div>
                        <span className={`probability-pct ${qty === 0 ? 'zero' : ''}`}>{prob}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Footer */}
              <div className="bag-summary-footer">
                <span>{t('totalTokens')}: <span>{totalTokens}</span></span>
                <span>{t('stability')}: <span>{totalTokens > 0 ? '99.8%' : 'OFFLINE'}</span></span>
              </div>
            </section>
          </main>

          {/* SYSTEM CONSOLE TERMINAL LOGS */}
          <footer className="terminal-panel">
            <div className="terminal-header">
              <span><div className="terminal-blinker" /> {t('logHeader')}</span>
              <button className="btn-clear-terminal" onClick={() => setHistory([])}>
                [ {t('clearBuffer')} ]
              </button>
            </div>
            <div className="terminal-logs" ref={logContainerRef}>
              {history.length === 0 ? (
                <div className="log-entry" style={{ color: 'var(--text-muted)' }}>
                  {t('emptyBuffer')}
                </div>
              ) : (
                history.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="timestamp">[{log.time}]</span>
                    <span className={`action ${log.type || ''}`}>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </footer>
        </>
      )}

      {/* RULES REFERENCE MODAL OVERLAY */}
      {isRulesOpen && (
        <div className="rules-reference-overlay" onClick={() => setIsRulesOpen(false)}>
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rules-modal-header">
              <h3>{t('rulesManualTitle')}</h3>
              <button className="btn-close-modal" onClick={() => setIsRulesOpen(false)}>
                &times;
              </button>
            </div>
            <div className="rules-modal-content">
              <section>
                <h4>{t('rulesSection1')}</h4>
                <p>{t('rulesSection1Text')}</p>
                <ul>
                  <li>1x <span className="highlight-cyan">{language === 'ko' ? '공허(Blank)' : 'Blank'}</span></li>
                  <li>4x <span style={{ color: 'var(--color-purple)' }}>{language === 'ko' ? '애벌레(Larva)' : 'Larva'}</span></li>
                  <li>1x <span className="highlight-amber">{language === 'ko' ? '아성체(Creeper)' : 'Creeper'}</span></li>
                  <li>1x <span className="highlight-green">{language === 'ko' ? '여왕(Queen)' : 'Queen'}</span></li>
                  <li>{3 + playerCount}x <span className="highlight-red">{language === 'ko' ? '성체(Adult)' : 'Adult'}</span> ({language === 'ko' ? `기본 3개 + 플레이어 인원수 ${playerCount}개` : `3 + player count ${playerCount}`})</li>
                </ul>
              </section>

              <section>
                <h4>{t('rulesSection2')}</h4>
                <p>{t('rulesSection2Text')}</p>
                <ul>
                  <li><strong className="highlight-cyan">{language === 'ko' ? '공허(Blank):' : 'Blank:'}</strong> {language === 'ko' ? '성체 토큰 1개를 주머니에 추가하고, 뽑은 공허 토큰을 주머니로 되돌려놓습니다.' : 'Add 1 Adult token to the bag. Return the Blank token to the bag.'}</li>
                  <li><strong style={{ color: 'var(--color-purple)' }}>{language === 'ko' ? '애벌레(Larva):' : 'Larva:'}</strong> {language === 'ko' ? '애벌레를 제거하고 성체 토큰 1개를 주머니에 추가합니다.' : 'Evolve Larva. Remove the Larva token from the bag and add 1 Adult token to the bag.'}</li>
                  <li><strong className="highlight-amber">{language === 'ko' ? '아성체(Creeper):' : 'Creeper:'}</strong> {language === 'ko' ? '아성체를 제거하고 완성체 토큰 1개를 주머니에 추가합니다.' : 'Evolve Creeper. Remove the Creeper token from the bag and add 1 Breeder token to the bag.'}</li>
                  <li><strong className="highlight-red">{language === 'ko' ? '성체(Adult) / 완성체(Breeder):' : 'Adult / Breeder:'}</strong> {language === 'ko' ? '토큰을 주머니로 회수합니다. 전투 중이 아닌 모든 플레이어들은 주사위를 굴려 소음 판정을 수행합니다.' : 'Return the token to the bag. All players who are not in Combat must immediately perform a Noise Roll.'}</li>
                  <li><strong className="highlight-green">{language === 'ko' ? '여왕(Queen):' : 'Queen:'}</strong> {language === 'ko' ? '전투원 중 누구라도 둥지(Nest) 방에 있다면 여왕 조우를 시작합니다. 둥지에 아무도 없거나 이미 여왕이 밖으로 나와 있다면 알 1개를 추가하고 여왕은 주머니로 회수합니다.' : 'Return the Queen to the bag. If any character is inside the Nest room, spawn the Queen. Otherwise, add 1 Egg token to the board.'}</li>
                </ul>
              </section>

              <section>
                <h4>{t('rulesSection3')}</h4>
                <p>{t('rulesSection3Text')}</p>
                <ul>
                  <li>{t('rulesEncounter1')}</li>
                  <li>{t('rulesEncounter2')}</li>
                  <li>{t('rulesEncounter3')}</li>
                </ul>
              </section>

              <section>
                <h4>{language === 'ko' ? '4. 컴포넌트 공급처 제한 (Component Limits)' : '4. Component Supply Limits'}</h4>
                <p>
                  {language === 'ko' 
                    ? '네메시스는 박스에 동봉된 물리 토큰 구성품 개수로 총량이 엄격히 제한됩니다. 규칙상 토큰을 주머니에 추가해야 하지만 공급처에 남은 토큰이 없다면 추가하지 않고 단계를 스킵합니다.' 
                    : 'Nemesis tokens are strictly limited by physical component limits. If a rule instructs you to add a token but none are available in the supply, that step is skipped.'}
                </p>
                <ul>
                  <li>{language === 'ko' ? '공허 토큰: 최대 1개' : 'Blank token: Max 1'}</li>
                  <li>{language === 'ko' ? '애벌레 토큰: 최대 8개' : 'Larva token: Max 8'}</li>
                  <li>{language === 'ko' ? '아성체 토큰: 최대 3개' : 'Creeper token: Max 3'}</li>
                  <li>{language === 'ko' ? '성체 토큰: 최대 12개' : 'Adult token: Max 12'}</li>
                  <li>{language === 'ko' ? '완성체 토큰: 최대 2개' : 'Breeder token: Max 2'}</li>
                  <li>{language === 'ko' ? '여왕 토큰: 최대 1개' : 'Queen token: Max 1'}</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
