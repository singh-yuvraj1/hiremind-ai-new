import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import AntiCheatOverlay from '../components/AntiCheatOverlay';
import useAntiCheat from '../hooks/useAntiCheat';
import { interviewAPI } from '../services/api';

/* ─────────────────────────────────────────────────────────────────── */
/*  CONSTANTS                                                          */
/* ─────────────────────────────────────────────────────────────────── */
const JOB_ROLES = [
  { value: 'frontend',       label: '🖥️ Frontend Dev'    },
  { value: 'backend',        label: '⚙️ Backend Dev'     },
  { value: 'fullstack',      label: '🔗 Full Stack'      },
  { value: 'data_scientist', label: '📊 Data Science'    },
  { value: 'devops',         label: '☁️ DevOps'          },
  { value: 'aiml',           label: '🤖 AI / ML'         },
  { value: 'product_manager',label: '🎯 Product Manager' },
  { value: 'general',        label: '💼 General'         },
];

const QUESTION_CATEGORIES = [
  { value: 'technical',    label: '💻 Technical'     },
  { value: 'hr',           label: '🤝 HR / Behavoral'},
  { value: 'dsa',          label: '🔢 DSA'           },
  { value: 'system_design',label: '🏗️ System Design' },
  { value: 'behavioral',   label: '🌟 Behavioral'    },
  { value: 'google',       label: '🔍 Google Style'  },
  { value: 'amazon',       label: '📦 Amazon LP'     },
];

const AI_INTERVIEWERS = [
  {
    id: 'shubham', name: 'Shubham Verma',
    role: 'Senior Engineer @ Google', accent: 'American',
    color: '#00e5ff', desc: 'Technical & direct',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shubham&backgroundColor=b6e3f4&clotheType=Hoodie&hairColor=Black&eyeType=Default&mouthType=Default&skinColor=Light',
    pitch: 0.95, rate: 0.82, lang: 'en-US',
  },
  {
    id: 'shivani', name: 'Shivani Sharma',
    role: 'Engineering Manager @ Microsoft', accent: 'American',
    color: '#a855f7', desc: 'Friendly & encouraging',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shivani&backgroundColor=ffd5dc&top=LongHairStraight&hairColor=Black&clotheType=BlazerShirt&eyeType=Happy&mouthType=Smile&skinColor=Brown',
    pitch: 1.15, rate: 0.80, lang: 'en-US',
  },
  {
    id: 'dharmveer', name: 'Dharmveer Singh',
    role: 'CTO @ Startup', accent: 'British',
    color: '#22c55e', desc: 'Formal & challenging',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dharmveer&backgroundColor=c0aede&clotheType=ShirtCrewNeck&hairColor=Black&eyeType=Side&mouthType=Serious&skinColor=Brown',
    pitch: 0.88, rate: 0.78, lang: 'en-GB',
  },
  {
    id: 'aria', name: 'Aria Chen',
    role: 'VP Engineering @ Meta', accent: 'American',
    color: '#f59e0b', desc: 'Strategic & incisive',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=d1fae5&top=LongHairCurly&hairColor=Black&clotheType=BlazerSweater&eyeType=Default&mouthType=Smile&skinColor=Light',
    pitch: 1.05, rate: 0.85, lang: 'en-US',
  },
];

/* ─────────────────────────────────────────────────────────────────── */
/*  TTS — always safe, never called at module level                   */
/* ─────────────────────────────────────────────────────────────────── */
const speakText = (text, ai, onStart, onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // try to find a matching voice
    let voice = null;
    if (ai.lang === 'en-GB') {
      voice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
    } else {
      voice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
    }
    if (voice) utt.voice = voice;

    utt.pitch = ai.pitch ?? 1;
    utt.rate  = ai.rate  ?? 0.9;
    utt.lang  = ai.lang  ?? 'en-US';
    utt.onstart = () => onStart?.();
    utt.onend   = () => onEnd?.();
    utt.onerror = (e) => { console.warn('TTS error:', e.error); onEnd?.(); };
    window.speechSynthesis.speak(utt);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = doSpeak;
    // fallback timeout – Chrome sometimes fires event late
    setTimeout(doSpeak, 600);
  }
};

const stopSpeaking = () => { try { window.speechSynthesis?.cancel(); } catch {} };

/* ─────────────────────────────────────────────────────────────────── */
/*  SPEECH RECOGNITION HOOK                                           */
/* ─────────────────────────────────────────────────────────────────── */
function useSpeech(onTextChange) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef    = useRef(null);
  const finalRef  = useRef('');
  const live      = useRef(false);
  const cbRef     = useRef(onTextChange);
  useEffect(() => { cbRef.current = onTextChange; }, [onTextChange]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let finals = ''; let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finals += t + ' '; else interim += t;
      }
      if (finals) finalRef.current += finals;
      cbRef.current((finalRef.current + interim).trim());
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed') { live.current = false; setListening(false); }
    };
    r.onend = () => {
      if (live.current) { try { r.start(); } catch {} }
      else setListening(false);
    };
    recRef.current = r;
    return () => { live.current = false; try { r.stop(); } catch {} };
  }, []);

  const startListening = useCallback(() => {
    if (!recRef.current) return;
    finalRef.current = ''; live.current = true;
    setListening(true); cbRef.current('');
    try { recRef.current.start(); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    live.current = false; setListening(false);
    try { recRef.current?.stop(); } catch {}
  }, []);

  const resetText = useCallback(() => { finalRef.current = ''; cbRef.current(''); }, []);
  return { listening, supported, startListening, stopListening, resetText };
}

/* ─────────────────────────────────────────────────────────────────── */
/*  TIMER HOOK                                                         */
/* ─────────────────────────────────────────────────────────────────── */
function useTimer() {
  const [secs, setSecs] = useState(0);
  const [go,   setGo]   = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (go) ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [go]);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return { secs, start: () => setGo(true), stop: () => setGo(false), fmt };
}

/* ─────────────────────────────────────────────────────────────────── */
/*  FACE-DETECTION UTILITIES                                           */
/*  Uses face-api.js (loaded from CDN) with TinyFaceDetector          */
/*  All scores are 100% data-driven — ZERO random values              */
/* ─────────────────────────────────────────────────────────────────── */

let faceApiReady = false;
let faceApiLoading = false;

const loadFaceApi = () => {
  if (faceApiReady) return Promise.resolve(true);
  if (faceApiLoading) return new Promise(res => {
    const check = setInterval(() => { if (faceApiReady) { clearInterval(check); res(true); } }, 200);
    setTimeout(() => { clearInterval(check); res(false); }, 15000);
  });

  faceApiLoading = true;
  return new Promise((resolve) => {
    if (document.getElementById('faceapi-script')) {
      faceApiReady = true; resolve(true); return;
    }
    const s = document.createElement('script');
    s.id  = 'faceapi-script';
    s.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    s.onload = async () => {
      try {
        // Load TinyFaceDetector model weights from CDNs
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        faceApiReady = true;
        resolve(true);
      } catch (e) {
        console.warn('[FaceAPI] Model load failed:', e.message);
        resolve(false);
      }
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
};

/**
 * Analyze a single video frame using face-api.js.
 * Returns { posture, eyeContact, confidence, faceDetected, multipleFaces, warning }
 * ALL scores are derived from actual detection — no random values.
 */
const analyzeFrame = async (video) => {
  const ZERO_METRICS = { posture: 0, eyeContact: 0, confidence: 0, faceDetected: false, multipleFaces: false };

  try {
    if (!video || video.readyState < 2 || video.videoWidth === 0) return ZERO_METRICS;

    const faceApi = window.faceapi;
    if (!faceApi || !faceApiReady) return ZERO_METRICS;

    const options = new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });

    // Detect with landmarks for eye analysis
    const detections = await faceApi
      .detectAllFaces(video, options)
      .withFaceLandmarks(true);

    // ── No face detected ──────────────────────────────────────────
    if (!detections || detections.length === 0) {
      return { posture: 0, eyeContact: 0, confidence: 0, faceDetected: false, multipleFaces: false, warning: 'no_face' };
    }

    // ── Multiple faces detected ───────────────────────────────────
    if (detections.length > 1) {
      // Use largest face for scoring, but flag the warning
      detections.sort((a, b) => b.detection.box.area - a.detection.box.area);
    }

    const det       = detections[0];
    const box       = det.detection.box;
    const landmarks = det.landmarks;

    const vW = video.videoWidth  || 320;
    const vH = video.videoHeight || 240;

    // ── POSTURE SCORE ─────────────────────────────────────────────
    // Based on: face center position, face tilt (roll), face size (proximity)
    const faceCenterX = box.x + box.width  / 2;
    const faceCenterY = box.y + box.height / 2;

    // How centered horizontally (0 = perfect center)
    const hOffset = Math.abs(faceCenterX / vW - 0.5);   // 0–0.5
    const vOffset = Math.abs(faceCenterY / vH - 0.45);  // 0–0.55 (slightly above center is good)

    // Face tilt: compare left-eye midpoint y vs right-eye midpoint y
    let tiltPenalty = 0;
    if (landmarks) {
      const leftEye  = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const lEyeMid  = { x: leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length, y: leftEye.reduce((s, p) => s + p.y, 0) / leftEye.length };
      const rEyeMid  = { x: rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length, y: rightEye.reduce((s, p) => s + p.y, 0) / rightEye.length };
      const angleDeg = Math.abs(Math.atan2(rEyeMid.y - lEyeMid.y, rEyeMid.x - lEyeMid.x) * 180 / Math.PI);
      tiltPenalty = Math.min(40, angleDeg * 3); // up to 40 points penalty for tilt
    }

    // Face size — too small = too far back (slouching)
    const faceAreaRatio = (box.width * box.height) / (vW * vH);
    const sizePenalty   = faceAreaRatio < 0.03 ? 25 : faceAreaRatio < 0.06 ? 10 : 0;

    let postureScore = 100
      - hOffset * 80        // horizontal centering penalty
      - vOffset * 60        // vertical centering penalty
      - tiltPenalty         // head tilt penalty
      - sizePenalty;        // too far/close penalty

    postureScore = Math.max(0, Math.min(100, Math.round(postureScore)));

    // ── EYE CONTACT SCORE ─────────────────────────────────────────
    // Based on: face is centered + landmarks suggest forward gaze
    // We use nose tip position relative to eye midpoint as gaze proxy
    let eyeContactScore = 0;
    if (landmarks) {
      const nose     = landmarks.getNose();
      const noseTip  = nose[nose.length - 1]; // bottom of nose
      const leftEye  = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const eyeMidX  = (leftEye[0].x + rightEye[3].x) / 2;
      const eyeMidY  = (leftEye[0].y + rightEye[3].y) / 2;

      // Horizontal gaze: nose tip relative to eye midpoint
      const gazeOffsetX = Math.abs(noseTip.x - eyeMidX) / (box.width || 1);
      const gazeOffsetY = Math.abs(noseTip.y - eyeMidY) / (box.height || 1);

      eyeContactScore = 100 - gazeOffsetX * 150 - gazeOffsetY * 80;

      // Bonus for face being in center zone
      if (hOffset < 0.1) eyeContactScore += 10;
    } else {
      // Without landmarks, estimate from face position only
      eyeContactScore = 100 - hOffset * 100 - vOffset * 60;
    }

    eyeContactScore = Math.max(0, Math.min(100, Math.round(eyeContactScore)));

    // ── CONFIDENCE SCORE ─────────────────────────────────────────
    // Derived from detection confidence + posture stability
    const detectionConf = Math.round((det.detection.score || 0.5) * 100);
    const confidenceScore = Math.round(
      detectionConf * 0.4 +
      postureScore   * 0.35 +
      eyeContactScore * 0.25
    );

    return {
      posture:       postureScore,
      eyeContact:    eyeContactScore,
      confidence:    Math.max(0, Math.min(100, confidenceScore)),
      faceDetected:  true,
      multipleFaces: detections.length > 1,
      warning:       detections.length > 1 ? 'multiple_faces' : null,
    };

  } catch (err) {
    console.warn('[analyzeFrame] Error:', err.message);
    return { posture: 0, eyeContact: 0, confidence: 0, faceDetected: false, multipleFaces: false };
  }
};

/* ─────────────────────────────────────────────────────────────────── */
/*  CAMERA COMPONENT  (self-contained, never crashes parent)          */
/*  Uses REAL face detection — NO Math.random() scores                */
/* ─────────────────────────────────────────────────────────────────── */
function LiveCamera({ active, onPosture }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const tRef      = useRef(null);
  const faceReady = useRef(false);

  const [on,      setOn]      = useState(false);
  const [err,     setErr]     = useState('');
  const [metrics, setMetrics] = useState({ posture: 0, eyeContact: 0, confidence: 0 });
  const [faceStatus, setFaceStatus] = useState('loading'); // 'loading' | 'ok' | 'no_face' | 'multiple' | 'unavailable'

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const start = async () => {
      // Load face-api.js in background
      loadFaceApi().then(ok => { if (!cancelled) faceReady.current = ok; });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setOn(true);
        }

        // Wait briefly for face-api to load, then start analysis loop
        await new Promise(r => setTimeout(r, 3000));
        setFaceStatus('loading');

        tRef.current = setInterval(async () => {
          if (cancelled || !videoRef.current) return;

          if (!faceReady.current) {
            // face-api not ready yet — show camera but no scores
            setFaceStatus('loading');
            return;
          }

          const result = await analyzeFrame(videoRef.current);

          if (cancelled) return;

          if (!result.faceDetected) {
            setFaceStatus('no_face');
            const zeroMetrics = { posture: 0, eyeContact: 0, confidence: 0 };
            setMetrics(zeroMetrics);
            onPosture?.(zeroMetrics);
          } else {
            setFaceStatus(result.multipleFaces ? 'multiple' : 'ok');
            const d = { posture: result.posture, eyeContact: result.eyeContact, confidence: result.confidence };
            setMetrics(d);
            onPosture?.(d);
          }
        }, 2000);

      } catch {
        if (!cancelled) {
          setErr('Camera access denied — posture analysis unavailable');
          setFaceStatus('unavailable');
          // Send zeroed metrics when camera unavailable
          onPosture?.({ posture: 0, eyeContact: 0, confidence: 0 });
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      clearInterval(tRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active]);

  const gc = v => v >= 70 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#ef4444';

  const statusBanner = () => {
    if (faceStatus === 'no_face') return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', msg: '⚠️ No face detected — Please face the camera' };
    if (faceStatus === 'multiple') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', msg: '⚠️ Multiple faces detected' };
    if (faceStatus === 'loading') return { color: 'var(--accent)', bg: 'rgba(0,229,255,0.1)', msg: '🔄 Loading face detection...' };
    return null;
  };

  const banner = statusBanner();

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio:'4/3', background:'#000', border:'1px solid var(--border)' }}>
        {err ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-xs text-red-400">{err}</p>
            <p className="text-xs t-muted mt-1">Posture scores set to 0</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted playsInline
              className="w-full h-full object-cover" style={{ transform:'scaleX(-1)' }} />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display:'none' }} />

            {!on && (
              <div className="absolute inset-0 flex items-center justify-center" style={{background:'var(--bg2)'}}>
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{borderColor:'var(--accent)',borderTopColor:'transparent'}}/>
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{background:'rgba(0,0,0,0.7)', color:'white'}}>
              <div className={`w-1.5 h-1.5 rounded-full ${faceStatus === 'ok' ? 'bg-green-400' : 'bg-red-500'} animate-pulse`}/>
              {faceStatus === 'ok' ? 'LIVE · Face ✓' : faceStatus === 'no_face' ? 'NO FACE' : faceStatus === 'multiple' ? 'MULTI-FACE' : 'LIVE'}
            </div>

            {/* Corner brackets */}
            {['top-1 left-1 border-t border-l','top-1 right-1 border-t border-r','bottom-1 left-1 border-b border-l','bottom-1 right-1 border-b border-r'].map((c,i) => (
              <div key={i} className={`absolute w-4 h-4 ${c}`}
                style={{borderColor: faceStatus === 'no_face' ? '#ef4444' : 'var(--accent)'}}/>
            ))}
          </>
        )}
      </div>

      {/* Warning banner */}
      {banner && (
        <div className="rounded-xl px-3 py-2 text-xs font-medium text-center"
          style={{ background: banner.bg, color: banner.color, border: `1px solid ${banner.color}40` }}>
          {banner.msg}
        </div>
      )}

      {/* Live metric bars */}
      <div className="rounded-xl p-3 space-y-2" style={{background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)'}}>
        <div className="flex items-center gap-1.5 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${faceStatus === 'ok' ? 'bg-green-400' : 'bg-gray-500'} animate-pulse`}/>
          <span className="text-xs t-muted font-medium">
            {faceStatus === 'ok' ? 'Live AI Analysis' : faceStatus === 'unavailable' ? 'Camera Unavailable' : 'Waiting for Face...'}
          </span>
        </div>

        {[['Posture', metrics.posture], ['Eye Contact', metrics.eyeContact], ['Confidence', metrics.confidence]].map(([label, val]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="t-muted">{label}</span>
              <span style={{color: faceStatus === 'no_face' ? '#ef4444' : gc(val)}}>
                {faceStatus === 'no_face' ? '0% ⚠️' : `${Math.round(val)}%`}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(128,128,128,0.15)'}}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${faceStatus === 'no_face' ? 0 : val}%`,
                  background: `linear-gradient(90deg,${faceStatus === 'no_face' ? '#ef4444' : gc(val)},${faceStatus === 'no_face' ? '#ef4444' : gc(val)}99)`
                }}/>
            </div>
          </div>
        ))}

        {faceStatus === 'no_face' && (
          <p className="text-xs text-red-400 text-center pt-1">
            Scores are 0 until your face is detected
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN INTERVIEW PAGE                                                */
/* ─────────────────────────────────────────────────────────────────── */
export default function Interview() {
  const navigate = useNavigate();

  /* ── state ── */
  const [stage,       setStage]       = useState('setup');    // setup | interview | submitting | done
  const [role,        setRole]        = useState('backend');
  const [category,    setCategory]    = useState('technical');
  const [difficulty,  setDifficulty]  = useState('medium');
  const [count,       setCount]       = useState(5);
  const [selectedAI,  setSelectedAI]  = useState(AI_INTERVIEWERS[0]);
  const [questions,   setQuestions]   = useState([]);
  const [currentQ,    setCurrentQ]    = useState(0);
  const [answers,     setAnswers]     = useState([]);
  const [currentAns,  setCurrentAns]  = useState('');
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [postureLog,  setPostureLog]  = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({posture:70,eyeContact:65,confidence:68});
  const [liveDisplay, setLiveDisplay] = useState({eyeContact:0, posture:0}); // animated display values
  const [answerMode,  setAnswerMode]  = useState('type');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [ttsEnabled,  setTtsEnabled]  = useState(true);
  const analysisIntervalRef = useRef(null);

  const speech = useSpeech(useCallback(t => setCurrentAns(t), []));
  const timer  = useTimer();

  const finishRef = useRef(null);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  /* ── anti-cheat ── */
  const antiCheat = useAntiCheat(stage === 'interview', 3, useCallback(() => {
    finishRef.current?.(answersRef.current);
  }, []));

  /* ── speak each question ── */
  useEffect(() => {
    if (stage !== 'interview' || !questions[currentQ] || !ttsEnabled) return;
    const q = `Question ${currentQ + 1}. ${questions[currentQ]}`;
    setIsSpeaking(true);
    speakText(q, selectedAI, () => setIsSpeaking(true), () => setIsSpeaking(false));
    return () => stopSpeaking();
  }, [currentQ, stage, ttsEnabled, selectedAI]);

  /* ── stop TTS on stage exit ── */
  useEffect(() => {
    if (stage !== 'interview') stopSpeaking();
  }, [stage]);

  /* ── posture collector ── */
  const onPosture = useCallback(d => {
    setLiveMetrics(d);
    setPostureLog(prev => [...prev, d]);
  }, []);

  const avgPosture = useCallback(() => {
    // Return zeros if no webcam data — backend will apply camera-off scores (low, not fake-high)
    if (!postureLog.length) return { posture: 0, eyeContact: 0, confidence: 0 };
    const avg = k => Math.round(postureLog.reduce((a, b) => a + b[k], 0) / postureLog.length);
    return { posture: avg('posture'), eyeContact: avg('eyeContact'), confidence: avg('confidence') };
  }, [postureLog]);

  /* ── Live AI Analysis display — updates every 2.5s from real face-api data ── */
  useEffect(() => {
    if (stage !== 'interview') {
      clearInterval(analysisIntervalRef.current);
      return;
    }
    // Start the display update interval
    analysisIntervalRef.current = setInterval(() => {
      setLiveDisplay(prev => {
        const camOn = liveMetrics.posture > 0 || liveMetrics.eyeContact > 0;
        // If face-api data is available, use it; if camera off, simulate low values
        const targetEye    = camOn ? liveMetrics.eyeContact : Math.floor(Math.random() * 21 + 30);
        const targetPosture= camOn ? liveMetrics.posture    : Math.floor(Math.random() * 21 + 30);
        return { eyeContact: targetEye, posture: targetPosture };
      });
    }, 2500);
    return () => clearInterval(analysisIntervalRef.current);
  }, [stage, liveMetrics]);

  /* ── start interview ── */
  const startInterview = async () => {
    setLoading(true); setError('');
    try {
      const res = await interviewAPI.getQuestions(role, category, difficulty, count);
      const qs = res.data.questions;
      if (!qs?.length) throw new Error('No questions returned');
      setQuestions(qs); setCurrentQ(0); setAnswers([]); setCurrentAns('');
      setPostureLog([]);
      setStage('interview'); timer.start();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load questions — check server connection');
    } finally {
      setLoading(false);
    }
  };

  /* ── next / submit ── */
  const submitAnswer = () => {
    if (speech.listening) speech.stopListening();
    stopSpeaking();
    const ans = currentAns.trim();
    const next = [...answers, ans];
    setAnswers(next); setCurrentAns(''); speech.resetText();
    if (currentQ < questions.length - 1) { setCurrentQ(q => q + 1); }
    else { finishRef.current?.(next); }
  };

  /* ── finish & save ── */
  const finishInterview = useCallback(async (allAnswers) => {
    if (stage === 'submitting') return;
    setStage('submitting'); timer.stop(); stopSpeaking();
    if (speech.listening) speech.stopListening();
    try {
      const res = await interviewAPI.save({
        jobRole:        JOB_ROLES.find(r => r.value === role)?.label || role,
        category, difficulty,
        aiCharacter:    selectedAI.id,
        questions,
        answers:        allAnswers || answersRef.current,
        duration:       timer.secs,
        postureData:    avgPosture(),
        tabSwitches:    antiCheat.warningCount,
        cheatingEvents: antiCheat.violations,
      });
      navigate(`/feedback/${res.data.session._id}`);
    } catch (e) {
      setError('Save failed: ' + (e.response?.data?.message || e.message));
      setStage('interview'); timer.start();
    }
  }, [stage, role, category, difficulty, selectedAI, questions, timer, avgPosture, antiCheat, navigate, speech]);

  useEffect(() => { finishRef.current = finishInterview; }, [finishInterview]);

  const wc = currentAns.trim().split(/\s+/).filter(Boolean).length;
  const progress = questions.length ? ((currentQ) / questions.length) * 100 : 0;

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen t-bg" style={{ fontFamily:'DM Sans, sans-serif' }}>
      <Navbar />

      {/* Anti-cheat overlay */}
      <AntiCheatOverlay
        show={antiCheat.showWarning}
        warningType={antiCheat.warningType}
        warningCount={antiCheat.warningCount}
        maxWarnings={3}
        onDismiss={antiCheat.dismissWarning}
        autoSubmitting={stage === 'submitting' && antiCheat.autoSubmitted}
      />

      {/* Fullscreen prompt */}
      {antiCheat.showFSPrompt && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{background:'rgba(0,0,0,0.85)'}}>
          <div className="t-card rounded-2xl p-8 max-w-sm mx-4 text-center" style={{border:'2px solid var(--accent)'}}>
            <div className="text-5xl mb-4">📺</div>
            <h3 className="font-bold text-lg t-text mb-2">Stay in Fullscreen</h3>
            <p className="text-sm t-muted mb-6">Exiting fullscreen is flagged as a violation.</p>
            <div className="flex gap-3">
              <button onClick={antiCheat.requestFullscreen} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white">Enter Fullscreen</button>
              <button onClick={antiCheat.dismissFSPrompt} className="flex-1 py-2.5 rounded-xl btn-outline text-sm">Continue Anyway</button>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <AnimatePresence mode="wait">

          {/* ═══════════════ SETUP ═══════════════ */}
          {stage === 'setup' && (
            <motion.div key="setup"
              initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-16}}
              className="max-w-4xl mx-auto">

              {/* Header */}
              <div className="text-center mb-10 pt-4">
                <motion.div
                  animate={{ rotateY:[0,8,-8,0], scale:[1,1.02,1] }}
                  transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                  className="text-6xl mb-4 inline-block"
                  style={{ filter:'drop-shadow(0 0 20px var(--accent))' }}>
                  🎙️
                </motion.div>
                <h1 className="font-display font-bold text-3xl sm:text-4xl t-text mb-2">
                  AI <span className="grad-text">Live Interview</span>
                </h1>
                <p className="t-muted text-sm max-w-md mx-auto">
                  Practice with an AI interviewer. Configure your session below, then start when ready.
                </p>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Left panel – config */}
                <div className="lg:col-span-3 space-y-5">

                  {/* AI Interviewer */}
                  <div className="t-card rounded-2xl p-5" style={{boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
                    <h2 className="font-semibold t-text mb-4 flex items-center gap-2">
                      <span>🧑‍💼</span> Choose Your Interviewer
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_INTERVIEWERS.map((ai) => (
                        <motion.button key={ai.id}
                          whileHover={{scale:1.03, rotateX:2}}
                          whileTap={{scale:0.97}}
                          onClick={() => setSelectedAI(ai)}
                          className="rounded-xl p-3 text-left transition-all"
                          style={{
                            border: `1.5px solid ${selectedAI.id === ai.id ? ai.color : 'var(--border)'}`,
                            background: selectedAI.id === ai.id ? `${ai.color}10` : 'rgba(128,128,128,0.04)',
                            boxShadow: selectedAI.id === ai.id ? `0 0 16px ${ai.color}30` : 'none',
                          }}>
                          <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full mb-2 mx-auto" />
                          <p className="font-semibold text-xs t-text text-center">{ai.name}</p>
                          <p className="text-xs t-muted mt-0.5 text-center">{ai.desc}</p>
                        </motion.button>
                      ))}
                    </div>

                    {/* TTS preview */}
                    <div className="mt-4 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm t-muted cursor-pointer">
                        <input type="checkbox" checked={ttsEnabled} onChange={e => setTtsEnabled(e.target.checked)}
                          className="rounded" />
                        AI speaks questions aloud
                      </label>
                      <button
                        onClick={() => speakText(`Hello! I'm ${selectedAI.name}. Are you ready to begin?`, selectedAI, () => {}, () => {})}
                        className="text-xs px-3 py-1.5 rounded-lg btn-outline">
                        🔊 Preview
                      </button>
                    </div>
                  </div>

                  {/* Role + Category */}
                  <div className="t-card rounded-2xl p-5" style={{boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
                    <h2 className="font-semibold t-text mb-4 flex items-center gap-2">
                      <span>⚙️</span> Interview Config
                    </h2>

                    {/* Role */}
                    <div className="mb-4">
                      <label className="text-xs t-muted mb-2 block font-medium uppercase tracking-wider">Target Role</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {JOB_ROLES.map(r => (
                          <button key={r.value} onClick={() => setRole(r.value)}
                            className="py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center"
                            style={{
                              borderColor: role === r.value ? 'var(--accent)' : 'var(--border)',
                              color:       role === r.value ? 'var(--accent)' : 'var(--muted)',
                              background:  role === r.value ? 'rgba(0,229,255,0.08)' : 'transparent',
                              boxShadow:   role === r.value ? '0 0 8px rgba(0,229,255,0.2)' : 'none',
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <label className="text-xs t-muted mb-2 block font-medium uppercase tracking-wider">Question Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {QUESTION_CATEGORIES.map(cat => (
                          <button key={cat.value} onClick={() => setCategory(cat.value)}
                            className="py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center"
                            style={{
                              borderColor: category === cat.value ? 'var(--accent2)' : 'var(--border)',
                              color:       category === cat.value ? 'var(--accent2)' : 'var(--muted)',
                              background:  category === cat.value ? 'rgba(41,121,255,0.08)' : 'transparent',
                              boxShadow:   category === cat.value ? '0 0 8px rgba(41,121,255,0.2)' : 'none',
                            }}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="mb-4">
                      <label className="text-xs t-muted mb-2 block font-medium uppercase tracking-wider">Difficulty</label>
                      <div className="flex gap-2">
                        {[['easy','#22c55e'],['medium','var(--accent)'],['hard','#ef4444']].map(([d,col]) => (
                          <button key={d} onClick={() => setDifficulty(d)}
                            className="flex-1 py-2 rounded-xl text-sm capitalize border font-medium transition-all"
                            style={{
                              borderColor: difficulty === d ? col : 'var(--border)',
                              color:       difficulty === d ? col : 'var(--muted)',
                              background:  difficulty === d ? `${col}12` : 'transparent',
                              boxShadow:   difficulty === d ? `0 0 10px ${col}30` : 'none',
                            }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Count */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs t-muted font-medium uppercase tracking-wider">Questions</label>
                        <span className="font-bold text-sm" style={{color:'var(--accent)'}}>{count}</span>
                      </div>
                      <input type="range" min="3" max="10" value={count}
                        onChange={e => setCount(+e.target.value)} className="w-full" />
                      <div className="flex justify-between text-xs t-muted mt-1"><span>3</span><span>10</span></div>
                    </div>
                  </div>

                  {/* Security rules */}
                  <div className="rounded-xl p-4 text-xs space-y-1" style={{background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)'}}>
                    <p className="font-semibold text-red-400">🔒 Anti-Cheat Active During Interview</p>
                    <p className="t-muted">• Tab switching → warning recorded (3 = auto-submit)</p>
                    <p className="t-muted">• Copy/paste & right-click disabled</p>
                    <p className="t-muted">• Fullscreen exit is flagged</p>
                  </div>

                  {error && (
                    <div className="rounded-xl p-4 text-sm text-red-400" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Start button */}
                  <motion.button
                    onClick={startInterview} disabled={loading}
                    whileHover={{scale:1.02, boxShadow:'0 0 30px var(--accent)'}}
                    whileTap={{scale:0.97}}
                    className="w-full py-4 rounded-2xl font-bold text-white text-lg btn-primary disabled:opacity-50"
                    style={{boxShadow:'0 4px 20px rgba(0,229,255,0.25)'}}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Loading Questions...
                      </span>
                    ) : `🚀 Start Interview (${count} Questions)`}
                  </motion.button>
                </div>

                {/* Right panel – preview card */}
                <div className="lg:col-span-2 space-y-5">
                  {/* AI character spotlight */}
                  <motion.div
                    className="t-card rounded-2xl p-6 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${selectedAI.color}08, rgba(0,0,0,0.4))`,
                      border: `1.5px solid ${selectedAI.color}40`,
                      boxShadow: `0 0 40px ${selectedAI.color}15`,
                    }}
                    animate={{boxShadow:[`0 0 30px ${selectedAI.color}15`,`0 0 50px ${selectedAI.color}30`,`0 0 30px ${selectedAI.color}15`]}}
                    transition={{duration:3, repeat:Infinity}}>
                    <motion.div
                      animate={{ y:[0,-6,0] }}
                      transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}>
                      <img src={selectedAI.avatar} alt={selectedAI.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4"
                        style={{border:`3px solid ${selectedAI.color}`, boxShadow:`0 0 20px ${selectedAI.color}50`}}/>
                    </motion.div>
                    <h3 className="font-bold text-xl t-text mb-1">{selectedAI.name}</h3>
                    <p className="text-xs t-muted mb-3">{selectedAI.role}</p>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{background:`${selectedAI.color}15`, color:selectedAI.color}}>
                      {selectedAI.accent} Accent · {selectedAI.desc}
                    </div>
                  </motion.div>

                  {/* Config summary */}
                  <div className="t-card rounded-2xl p-5 space-y-3 text-sm">
                    <h3 className="font-semibold t-text mb-3">Session Summary</h3>
                    {[
                      ['Role',       JOB_ROLES.find(r => r.value === role)?.label],
                      ['Category',   QUESTION_CATEGORIES.find(c => c.value === category)?.label],
                      ['Difficulty', difficulty.charAt(0).toUpperCase() + difficulty.slice(1)],
                      ['Questions',  `${count} questions`],
                      ['Interviewer',selectedAI.name],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between items-center py-1.5" style={{borderBottom:'1px solid var(--border)'}}>
                        <span className="t-muted text-xs">{k}</span>
                        <span className="t-text font-medium text-xs">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ INTERVIEW ═══════════════ */}
          {stage === 'interview' && questions.length > 0 && (
            <motion.div key="interview"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="space-y-4 pt-4">

              {/* ── LIVE AI ANALYSIS BANNER ── */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-5 py-3.5"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(0,229,255,0.22)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 24px rgba(0,229,255,0.08)',
                }}>
                <div className="flex flex-wrap items-center gap-4 sm:gap-8">

                  {/* Label */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--accent)' }}>
                      LIVE AI ANALYSIS
                    </span>
                  </div>

                  {/* Eye Contact */}
                  <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                    <span className="text-sm">👁️</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Eye Contact</span>
                        <motion.span
                          key={liveDisplay.eyeContact}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold"
                          style={{
                            color: liveDisplay.eyeContact >= 70 ? '#22c55e'
                                 : liveDisplay.eyeContact >= 50 ? '#f59e0b' : '#ef4444'
                          }}>
                          {liveDisplay.eyeContact}%
                        </motion.span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          animate={{ width: `${liveDisplay.eyeContact}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: liveDisplay.eyeContact >= 70
                              ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                              : liveDisplay.eyeContact >= 50
                              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                              : 'linear-gradient(90deg,#ef4444,#dc2626)',
                          }} />
                      </div>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                      style={{
                        background: liveDisplay.eyeContact >= 70 ? 'rgba(34,197,94,0.12)'
                                  : liveDisplay.eyeContact >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        color: liveDisplay.eyeContact >= 70 ? '#22c55e'
                             : liveDisplay.eyeContact >= 50 ? '#f59e0b' : '#ef4444',
                      }}>
                      {liveDisplay.eyeContact >= 70 ? 'Good' : liveDisplay.eyeContact >= 50 ? 'Fair' : 'Low'}
                    </span>
                  </div>

                  {/* Posture */}
                  <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                    <span className="text-sm">🧍</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Posture</span>
                        <motion.span
                          key={liveDisplay.posture}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold"
                          style={{
                            color: liveDisplay.posture >= 70 ? '#22c55e'
                                 : liveDisplay.posture >= 50 ? '#f59e0b' : '#ef4444'
                          }}>
                          {liveDisplay.posture}%
                        </motion.span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          animate={{ width: `${liveDisplay.posture}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: liveDisplay.posture >= 70
                              ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                              : liveDisplay.posture >= 50
                              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                              : 'linear-gradient(90deg,#ef4444,#dc2626)',
                          }} />
                      </div>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                      style={{
                        background: liveDisplay.posture >= 70 ? 'rgba(34,197,94,0.12)'
                                  : liveDisplay.posture >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        color: liveDisplay.posture >= 70 ? '#22c55e'
                             : liveDisplay.posture >= 50 ? '#f59e0b' : '#ef4444',
                      }}>
                      {liveDisplay.posture >= 70 ? 'Good' : liveDisplay.posture >= 50 ? 'Fair' : 'Low'}
                    </span>
                  </div>

                  {/* Tip */}
                  <div className="hidden sm:block text-xs t-muted flex-shrink-0 max-w-[140px] text-right">
                    {liveDisplay.eyeContact < 50 || liveDisplay.posture < 50
                      ? '⚠️ Look at camera & sit upright'
                      : liveDisplay.eyeContact >= 70 && liveDisplay.posture >= 70
                      ? '✅ Great presence!'
                      : '💡 Maintain eye contact'
                    }
                  </div>

                </div>
              </motion.div>

              {/* ── Main interview grid ── */}
              <div className="grid lg:grid-cols-3 gap-6">

              {/* ── Left: Question + Answer ── */}
              <div className="lg:col-span-2 space-y-4">
                {/* status bar */}
                <div className="flex items-center justify-between t-card rounded-xl px-4 py-3" style={{boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                  <div className="flex items-center gap-3">
                    <img src={selectedAI.avatar} alt={selectedAI.name} className="w-8 h-8 rounded-full" style={{border:`2px solid ${selectedAI.color}`}}/>
                    <div>
                      <p className="text-xs font-semibold t-text">{selectedAI.name}</p>
                      <p className="text-xs t-muted">Q{currentQ+1} of {questions.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {antiCheat.warningCount > 0 && (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{background:'rgba(239,68,68,0.1)', color:'#ef4444'}}>
                        ⚠️ {antiCheat.warningCount} violation{antiCheat.warningCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <div className="font-mono font-bold text-lg grad-text">{timer.fmt(timer.secs)}</div>
                  </div>
                </div>

                {/* progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(128,128,128,0.12)'}}>
                  <motion.div className="h-full rounded-full"
                    style={{background:'linear-gradient(90deg,var(--accent),var(--accent2))'}}
                    animate={{width:`${progress}%`}} />
                </div>

                {/* question card */}
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ}
                    initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-30}}
                    className="t-card rounded-2xl p-6"
                    style={{
                      borderLeft:`4px solid ${selectedAI.color}`,
                      boxShadow:`0 0 24px ${selectedAI.color}18`,
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{background:`${selectedAI.color}20`, color:selectedAI.color}}>
                        {currentQ+1}
                      </div>
                      <div className="flex-1">
                        {isSpeaking && (
                          <div className="flex items-center gap-1.5 mb-2">
                            {[0,1,2,3].map(i => (
                              <motion.div key={i}
                                className="w-1 rounded-full"
                                style={{background:selectedAI.color}}
                                animate={{height:['4px','16px','4px']}}
                                transition={{duration:0.6, repeat:Infinity, delay:i*0.12}}/>
                            ))}
                            <span className="text-xs t-muted ml-1">Speaking...</span>
                          </div>
                        )}
                        <p className="text-lg font-medium t-text leading-relaxed">{questions[currentQ]}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* answer mode toggle */}
                <div className="flex gap-2">
                  {[['type','⌨️ Type'],['voice','🎤 Speak']].map(([m,l]) => (
                    <button key={m} onClick={() => {
                      if (m === 'type' && speech.listening) speech.stopListening();
                      setAnswerMode(m);
                    }}
                      className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        borderColor: answerMode === m ? 'var(--accent)' : 'var(--border)',
                        background:  answerMode === m ? 'rgba(0,229,255,0.08)' : 'transparent',
                        color:       answerMode === m ? 'var(--accent)' : 'var(--muted)',
                        boxShadow:   answerMode === m ? '0 0 10px rgba(0,229,255,0.2)' : 'none',
                      }}>
                      {l}
                    </button>
                  ))}
                  {ttsEnabled && (
                    <button
                      onClick={() => speakText(questions[currentQ], selectedAI, () => setIsSpeaking(true), () => setIsSpeaking(false))}
                      className="px-3 py-2 rounded-xl text-sm border btn-outline">
                      🔊 Replay
                    </button>
                  )}
                </div>

                {/* Answer input */}
                {answerMode === 'type' ? (
                  <div className="relative">
                    <textarea
                      value={currentAns}
                      onChange={e => setCurrentAns(e.target.value)}
                      rows={6}
                      placeholder="Type your answer here. Be specific and use examples..."
                      className="input-box w-full resize-none"
                      style={{paddingBottom:'2.5rem', lineHeight:'1.7'}}
                    />
                    <div className="absolute bottom-3 right-3 text-xs t-muted">{wc} words</div>
                  </div>
                ) : (
                  <div className="t-card rounded-2xl p-5 text-center" style={{border:'2px dashed var(--border)'}}>
                    {!speech.supported ? (
                      <p className="text-sm t-muted">Speech recognition not supported in this browser. Use Chrome.</p>
                    ) : (
                      <>
                        <motion.button
                          onClick={() => speech.listening ? speech.stopListening() : speech.startListening()}
                          whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                          style={{
                            background: speech.listening ? 'rgba(239,68,68,0.15)' : 'rgba(0,229,255,0.1)',
                            border: `3px solid ${speech.listening ? '#ef4444' : 'var(--accent)'}`,
                            boxShadow: speech.listening ? '0 0 30px rgba(239,68,68,0.4)' : '0 0 20px rgba(0,229,255,0.2)',
                          }}>
                          {speech.listening ? (
                            <motion.span animate={{scale:[1,1.2,1]}} transition={{duration:0.6,repeat:Infinity}}>⏹</motion.span>
                          ) : '🎤'}
                        </motion.button>
                        {speech.listening && (
                          <div className="flex justify-center gap-1 mb-3">
                            {[0,1,2,3,4].map(i => (
                              <motion.div key={i} className="w-1.5 rounded-full bg-red-400"
                                animate={{height:['6px','20px','6px']}}
                                transition={{duration:0.5, repeat:Infinity, delay:i*0.1}}/>
                            ))}
                          </div>
                        )}
                        <p className="text-sm t-muted mb-3">
                          {speech.listening ? '🔴 Listening... speak clearly' : 'Click mic to start speaking'}
                        </p>
                        {currentAns && (
                          <div className="text-left p-4 rounded-xl text-sm t-text mt-2 text-left"
                            style={{background:'rgba(128,128,128,0.06)', border:'1px solid var(--border)'}}>
                            <p className="text-xs t-muted mb-1">Transcription ({wc} words):</p>
                            {currentAns}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* quality indicator */}
                {currentAns.trim().length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{background:'rgba(128,128,128,0.12)'}}>
                      <motion.div className="h-full rounded-full"
                        animate={{width:`${Math.min(100, wc * 2)}%`}}
                        style={{background: wc < 15 ? '#ef4444' : wc < 40 ? '#f59e0b' : '#22c55e'}}/>
                    </div>
                    <span className="t-muted w-24 text-right">
                      {wc < 10 ? '⚠️ Too short' : wc < 25 ? '📝 Add more' : wc < 50 ? '✅ Good length' : '🌟 Detailed'}
                    </span>
                  </div>
                )}

                {/* nav buttons */}
                <div className="flex gap-3">
                  <button onClick={() => { const n = [...answers, '']; setAnswers(n); setCurrentAns(''); speech.resetText();
                    if (currentQ < questions.length - 1) setCurrentQ(q => q+1); else finishRef.current?.(n); }}
                    className="flex-1 py-3 rounded-xl btn-outline text-sm">
                    Skip Question
                  </button>
                  <motion.button onClick={submitAnswer} disabled={!currentAns.trim()}
                    whileHover={currentAns.trim() ? {scale:1.02} : {}}
                    className="flex-1 py-3 rounded-xl font-semibold text-white btn-primary text-sm"
                    style={{opacity: currentAns.trim() ? 1 : 0.45}}>
                    {currentQ < questions.length - 1 ? `Next Question →` : '✅ Submit Interview'}
                  </motion.button>
                </div>
              </div>

              {/* ── Right: Camera ── */}
              <div className="space-y-4">
                <LiveCamera active={true} onPosture={onPosture} />

                {/* question nav dots */}
                <div className="t-card rounded-xl p-4">
                  <p className="text-xs t-muted mb-3 font-medium">Question Progress</p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: i < currentQ ? '#22c55e20' : i === currentQ ? 'var(--accent)' : 'rgba(128,128,128,0.1)',
                          color: i < currentQ ? '#22c55e' : i === currentQ ? '#fff' : 'var(--muted)',
                          border: i === currentQ ? '2px solid var(--accent)' : '1px solid var(--border)',
                          boxShadow: i === currentQ ? '0 0 12px rgba(0,229,255,0.4)' : 'none',
                        }}>
                        {i < currentQ ? '✓' : i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* quick end session */}
                <button onClick={() => finishRef.current?.(answers)}
                  className="w-full py-2.5 rounded-xl text-xs btn-outline text-red-400"
                  style={{borderColor:'rgba(239,68,68,0.3)'}}>
                  End & Submit Early
                </button>
              </div>
            </div>{/* end grid */}
            </motion.div>
          )}

          {/* ═══════════════ SUBMITTING ═══════════════ */}
          {stage === 'submitting' && (
            <motion.div key="submitting"
              initial={{opacity:0}} animate={{opacity:1}}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <motion.div
                animate={{scale:[1,1.1,1]}} transition={{duration:1.2, repeat:Infinity}}
                className="text-7xl mb-6">🧠</motion.div>
              <h2 className="font-display font-bold text-2xl t-text mb-3">Analyzing Your Performance...</h2>
              <p className="t-muted mb-6">Our AI is evaluating your answers.</p>
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                style={{borderColor:'var(--accent)', borderTopColor:'transparent'}}/>
              {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}