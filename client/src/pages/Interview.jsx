import { useState, useEffect, useRef, useCallback, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import AntiCheatOverlay from '../components/AntiCheatOverlay';
import useAntiCheat from '../hooks/useAntiCheat';
import { interviewAPI } from '../services/api';
import InterviewerAvatar from '../components/InterviewerAvatar';

const AI_INTERVIEWERS = [
  {
    id: 'shubham', name: 'Shubham Verma',
    role: 'Senior Engineer @ Google', accent: 'American',
    color: '#00e5ff', desc: 'Technical & direct',
    emoji: '👨🏻‍💻', avatar: '👨🏻‍💻',
    pitch: 0.95, rate: 0.82, lang: 'en-US',
  },
  {
    id: 'shivani', name: 'Shivani Sharma',
    role: 'Engineering Manager @ Microsoft', accent: 'American',
    color: '#a855f7', desc: 'Friendly & encouraging',
    emoji: '👩🏻‍💻', avatar: '👩🏻‍💻',
    pitch: 1.15, rate: 0.80, lang: 'en-US',
  },
  {
    id: 'dharmveer', name: 'Dharmveer Singh',
    role: 'CTO @ Startup', accent: 'British',
    color: '#22c55e', desc: 'Formal & challenging',
    emoji: '👨🏽‍💼', avatar: '👨🏽‍💼',
    pitch: 0.88, rate: 0.78, lang: 'en-GB',
  },
  {
    id: 'aria', name: 'Aria Chen',
    role: 'VP Engineering @ Meta', accent: 'American',
    color: '#f59e0b', desc: 'Strategic & incisive',
    emoji: '👩🏻‍🔬', avatar: '👩🏻‍🔬',
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
/*  POSTURE STATUS FORMATTER                                           */
/* ─────────────────────────────────────────────────────────────────── */
const getPostureStatus = (score) => {
  if (score === null || score === undefined) {
    return { label: 'Analyzing posture...', color: 'var(--muted)', tips: ['Sit upright facing the camera'] };
  }
  if (score >= 80) {
    return { label: 'Excellent Posture', color: '#22c55e', tips: ['Great posture and alignment maintained.'] };
  }
  if (score >= 60) {
    return { label: 'Good Posture', color: '#3b82f6', tips: ['Good alignment. Keep shoulders level.'] };
  }
  if (score >= 40) {
    return { label: 'Fair Posture', color: '#f59e0b', tips: ['Try sitting slightly more upright and centered in frame.'] };
  }
  return { label: 'Needs Improvement', color: '#ef4444', tips: ['Please sit upright and look directly at the camera.'] };
};

/* ─────────────────────────────────────────────────────────────────── */
/*  ERROR BOUNDARY (Guards against blank screens)                      */
/* ─────────────────────────────────────────────────────────────────── */
class InterviewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[InterviewErrorBoundary caught error]:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen t-bg flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="card max-w-md w-full p-6 text-center space-y-4" style={{ border: '1px solid var(--border)' }}>
            <div className="text-5xl">⚠️</div>
            <h2 className="text-lg font-bold t-text">Interview Session Recovery</h2>
            <p className="text-xs text-red-400 font-mono bg-[rgba(239,68,68,0.1)] p-3 rounded-xl text-left overflow-auto max-h-28">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <p className="text-xs t-muted">
              We prevented a blank screen. You can recover your session or restart setup.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-semibold text-white">
                Reload Session
              </button>
              <button
                onClick={() => {
                  try { sessionStorage.removeItem('hiremind_active_interview'); } catch {}
                  window.location.href = '/interview';
                }}
                className="flex-1 py-2.5 rounded-xl btn-outline text-xs">
                Reset Setup
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/*  CAMERA COMPONENT  (self-contained, never crashes parent)          */
/*  Performs BODY POSTURE analysis — NO eye contact / confidence     */
/* ─────────────────────────────────────────────────────────────────── */
function LiveCamera({ active, onPosture }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const tRef      = useRef(null);
  const faceReady = useRef(false);

  const [on,          setOn]          = useState(false);
  const [err,         setErr]         = useState('');
  const [postureScore, setPostureScore] = useState(null); // null = not yet analyzed
  // 'initializing' | 'loading_model' | 'no_person' | 'analyzing' | 'unavailable'
  const [poseStatus,  setPoseStatus]  = useState('initializing');

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const start = async () => {
      setPoseStatus('initializing');
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

        // Wait briefly for face-api to load
        await new Promise(r => setTimeout(r, 3000));
        setPoseStatus('loading_model');

        tRef.current = setInterval(async () => {
          if (cancelled || !videoRef.current) return;

          if (!faceReady.current) {
            setPoseStatus('loading_model');
            return;
          }

          const result = await analyzeFrame(videoRef.current);

          if (cancelled) return;

          if (!result.faceDetected) {
            setPoseStatus('no_face');
            setPostureScore(null);
            onPosture?.({ posture: 0, faceDetected: false, multipleFaces: false });
          } else if (result.multipleFaces) {
            setPoseStatus('multiple_faces');
            setPostureScore(result.posture);
            onPosture?.({ posture: result.posture, faceDetected: true, multipleFaces: true });
          } else {
            setPoseStatus('analyzing');
            setPostureScore(result.posture);
            onPosture?.({ posture: result.posture, faceDetected: true, multipleFaces: false });
          }
        }, 2000);

      } catch {
        if (!cancelled) {
          setErr('Camera access denied — posture analysis unavailable');
          setPoseStatus('unavailable');
          onPosture?.({ posture: 0, faceDetected: false, multipleFaces: false });
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

  const postureInfo = getPostureStatus(postureScore);

  const statusBanner = () => {
    if (poseStatus === 'no_face')        return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    msg: '⚠️ No face detected — Please look directly at the camera' };
    if (poseStatus === 'multiple_faces') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', msg: '⚠️ Multiple faces detected — Only one candidate allowed' };
    if (poseStatus === 'loading_model')  return { color: 'var(--accent)', bg: 'rgba(0,229,255,0.1)', msg: '🔄 Loading face detection model...' };
    if (poseStatus === 'initializing')   return { color: 'var(--accent)', bg: 'rgba(0,229,255,0.1)', msg: '⏳ Initializing camera...' };
    if (poseStatus === 'unavailable')    return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    msg: '⚠️ Camera access denied — posture analysis unavailable' };
    return null;
  };

  const banner = statusBanner();
  const gc = v => v >= 70 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio:'4/3', background:'#000', border:'1px solid var(--border)' }}>
        {err ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-xs text-red-400">{err}</p>
            <p className="text-xs t-muted mt-1">Posture score set to 0</p>
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
              <div className={`w-1.5 h-1.5 rounded-full ${
                poseStatus === 'analyzing' ? 'bg-green-400'
                : poseStatus === 'multiple_faces' ? 'bg-amber-400'
                : poseStatus === 'no_face' ? 'bg-red-500'
                : 'bg-yellow-400'
              } animate-pulse`}/>
              {poseStatus === 'analyzing' ? 'FACE DETECTED'
                : poseStatus === 'multiple_faces' ? 'MULTIPLE FACES'
                : poseStatus === 'no_face' ? 'NO FACE'
                : poseStatus === 'loading_model' ? 'LOADING MODEL'
                : 'INITIALIZING'}
            </div>

            {/* Corner brackets */}
            {['top-1 left-1 border-t border-l','top-1 right-1 border-t border-r','bottom-1 left-1 border-b border-l','bottom-1 right-1 border-b border-r'].map((c,i) => (
              <div key={i} className={`absolute w-4 h-4 ${c}`}
                style={{borderColor: poseStatus === 'no_face' ? '#ef4444' : poseStatus === 'multiple_faces' ? '#f59e0b' : 'var(--accent)'}}/>
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

      {/* Live posture metric */}
      <div className="rounded-xl p-3 space-y-2" style={{background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)'}}>
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full ${
            poseStatus === 'analyzing' ? 'bg-green-400' : 'bg-gray-500'
          } animate-pulse`}/>
          <span className="text-xs t-muted font-medium">
            {poseStatus === 'analyzing' ? 'Posture Analysis Active'
              : poseStatus === 'unavailable' ? 'Camera Unavailable'
              : poseStatus === 'loading_model' ? 'Loading Face Detection Model...'
              : poseStatus === 'multiple_faces' ? 'Multiple Candidates Detected'
              : poseStatus === 'no_face' ? 'Looking for candidate face...'
              : 'Initializing...'}
          </span>
        </div>

        {/* Posture score bar */}
        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="t-muted">🧘 Body Posture</span>
            <span style={{color: postureScore === null ? 'var(--muted)' : gc(postureScore)}}>
              {postureScore === null
                ? (poseStatus === 'no_face' ? 'No face detected' : 'Analyzing...')
                : `${postureScore}%`}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(128,128,128,0.15)'}}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${postureScore ?? 0}%`,
                background: postureScore === null ? 'rgba(128,128,128,0.3)'
                  : `linear-gradient(90deg,${gc(postureScore)},${gc(postureScore)}99)`,
              }}/>
          </div>
        </div>

        {/* Posture status label + tips */}
        {poseStatus === 'analyzing' && postureScore !== null && (
          <div className="pt-1 space-y-1">
            <span className="text-xs font-semibold" style={{color: postureInfo.color}}>
              {postureInfo.label}
            </span>
            {postureInfo.tips.map((tip, i) => (
              <p key={i} className="text-xs" style={{color: postureInfo.color}}>{tip}</p>
            ))}
          </div>
        )}

        {poseStatus === 'no_face' && (
          <p className="text-xs text-red-400 text-center pt-1">
            Posture analysis paused — sit upright and look directly into the camera
          </p>
        )}

        {poseStatus === 'multiple_faces' && (
          <p className="text-xs text-amber-400 text-center pt-1">
            Multiple faces detected — ensure only the candidate is visible
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN INTERVIEW PAGE                                                */
/* ─────────────────────────────────────────────────────────────────── */
/*  PRIMARY JOB ROLES & BACKEND TECHNOLOGIES                           */
/* ─────────────────────────────────────────────────────────────────── */
const PRIMARY_JOB_ROLES = [
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: '🔗',
    color: '#00e5ff',
    desc: 'React, Node.js, Express, databases, REST APIs & full-stack web integration',
    skills: ['React', 'Node.js', 'Express', 'MongoDB/SQL', 'REST APIs', 'Web Security'],
  },
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: '🖥️',
    color: '#3b82f6',
    desc: 'React, JavaScript, HTML/CSS, UI performance, hooks, state & browser fundamentals',
    skills: ['React', 'JavaScript', 'CSS/Flexbox', 'DOM', 'Performance', 'Hooks'],
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    icon: '⚙️',
    color: '#10b981',
    desc: 'Server architectures, concurrency, databases, microservices, APIs & caching',
    skills: ['Node.js/Python/Java/C++', 'REST APIs', 'Databases', 'Auth', 'Scalability'],
  },
  {
    id: 'aiml',
    name: 'AI / ML Engineer',
    icon: '🤖',
    color: '#a855f7',
    desc: 'Machine Learning, Deep Learning, Transformers, LLMs, RAG & Vector DBs',
    skills: ['Python', 'PyTorch/TensorFlow', 'LLMs', 'RAG', 'Vector DBs', 'Deep Learning'],
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    icon: '📊',
    color: '#f59e0b',
    desc: 'Statistical modeling, A/B testing, feature engineering, predictive models & EDA',
    skills: ['Python', 'Pandas/NumPy', 'Statistics', 'A/B Testing', 'Feature Engineering'],
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    icon: '📈',
    color: '#ec4899',
    desc: 'SQL Joins & Window Functions, Excel, Power BI, Tableau, Dashboards & KPIs',
    skills: ['Advanced SQL', 'Window Functions', 'Power BI/Tableau', 'Dashboards', 'KPIs'],
  },
  {
    id: 'hr',
    name: 'HR / Behavioral Interview',
    icon: '🤝',
    color: '#f97316',
    desc: 'STAR behavioral stories, leadership, conflict resolution & career motivation',
    skills: ['STAR Method', 'Leadership', 'Conflict Resolution', 'Communication', 'Ownership'],
  },
];

/* ─────────────────────────────────────────────────────────────────── */
/*  ROLE-BASED TECHNOLOGY TAXONOMY                                     */
/* ─────────────────────────────────────────────────────────────────── */
const ROLE_TAXONOMY = {
  frontend: {
    questionPrompt: 'Which frontend technologies do you want to prepare for?',
    groups: [
      {
        name: 'Core Web Technologies',
        items: [
          { id: 'html', name: 'HTML', icon: '🌐' },
          { id: 'css', name: 'CSS', icon: '🎨' },
          { id: 'javascript', name: 'JavaScript', icon: '⚡' },
          { id: 'typescript', name: 'TypeScript', icon: '📘' },
        ],
      },
      {
        name: 'CSS Frameworks',
        items: [
          { id: 'tailwind', name: 'Tailwind CSS', icon: '💨' },
          { id: 'bootstrap', name: 'Bootstrap', icon: '🅱️' },
          { id: 'sass', name: 'Sass', icon: '💅' },
        ],
      },
      {
        name: 'Libraries & Frameworks',
        items: [
          { id: 'react', name: 'React', icon: '⚛️' },
          { id: 'angular', name: 'Angular', icon: '🅰️' },
          { id: 'vue', name: 'Vue.js', icon: '💚' },
          { id: 'nextjs', name: 'Next.js', icon: '▲' },
        ],
      },
      {
        name: 'Frontend Tools',
        items: [
          { id: 'vite', name: 'Vite', icon: '⚡' },
          { id: 'webpack', name: 'Webpack', icon: '📦' },
          { id: 'git', name: 'Git & GitHub', icon: '🐙' },
          { id: 'testing', name: 'Testing', icon: '🧪' },
        ],
      },
    ],
    presets: [
      { id: 'core', label: 'HTML + CSS + JS', techs: ['html', 'css', 'javascript'] },
      { id: 'react_tw', label: 'React + Tailwind + TS', techs: ['react', 'typescript', 'tailwind'] },
      { id: 'angular_ts', label: 'Angular + TypeScript', techs: ['angular', 'typescript'] },
      { id: 'vue_modern', label: 'Vue.js + TypeScript', techs: ['vue', 'typescript'] },
      { id: 'nextjs_app', label: 'Next.js + React Full', techs: ['nextjs', 'react', 'typescript', 'tailwind'] },
    ],
  },
  backend: {
    questionPrompt: 'Choose your backend language and technology stack.',
    groups: [
      {
        name: 'Languages',
        items: [
          { id: 'javascript', name: 'JavaScript', icon: '🟨' },
          { id: 'typescript', name: 'TypeScript', icon: '📘' },
          { id: 'python', name: 'Python', icon: '🐍' },
          { id: 'java', name: 'Java', icon: '☕' },
          { id: 'cpp', name: 'C++', icon: '⚡' },
          { id: 'csharp', name: 'C# / .NET', icon: '🔷' },
        ],
      },
      {
        name: 'Frameworks & Ecosystems',
        items: [
          { id: 'nodejs', name: 'Node.js', icon: '🟩' },
          { id: 'expressjs', name: 'Express.js', icon: '🚂' },
          { id: 'nestjs', name: 'NestJS', icon: '🦁' },
          { id: 'fastapi', name: 'FastAPI', icon: '⚡' },
          { id: 'django', name: 'Django', icon: '🎸' },
          { id: 'flask', name: 'Flask', icon: '🧪' },
          { id: 'spring_boot', name: 'Spring Boot', icon: '🌱' },
          { id: 'aspnet', name: 'ASP.NET Core', icon: '💠' },
        ],
      },
      {
        name: 'Databases & Caching',
        items: [
          { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
          { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
          { id: 'mysql', name: 'MySQL', icon: '🐬' },
          { id: 'redis', name: 'Redis', icon: '🔴' },
          { id: 'sqlserver', name: 'SQL Server', icon: '🗄️' },
        ],
      },
    ],
    presets: [
      { id: 'node_express_mongo', label: 'Node.js + Express + MongoDB', techs: ['javascript', 'nodejs', 'expressjs', 'mongodb'] },
      { id: 'python_fastapi_pg', label: 'Python + FastAPI + PostgreSQL', techs: ['python', 'fastapi', 'postgresql'] },
      { id: 'java_spring_mysql', label: 'Java + Spring Boot + MySQL', techs: ['java', 'spring_boot', 'mysql'] },
      { id: 'cpp_fundamentals', label: 'Modern C++ Fundamentals', techs: ['cpp'] },
      { id: 'csharp_aspnet', label: 'C# + ASP.NET Core', techs: ['csharp', 'aspnet', 'sqlserver'] },
    ],
  },
  fullstack: {
    questionPrompt: 'Configure your Full Stack combination (Frontend + Backend + DB).',
    groups: [
      {
        name: 'Section A: Frontend Stack',
        items: [
          { id: 'react', name: 'React', icon: '⚛️' },
          { id: 'nextjs', name: 'Next.js', icon: '▲' },
          { id: 'angular', name: 'Angular', icon: '🅰️' },
          { id: 'vue', name: 'Vue.js', icon: '💚' },
          { id: 'typescript', name: 'TypeScript', icon: '📘' },
          { id: 'tailwind', name: 'Tailwind CSS', icon: '💨' },
        ],
      },
      {
        name: 'Section B: Backend Stack',
        items: [
          { id: 'nodejs', name: 'Node.js', icon: '🟩' },
          { id: 'expressjs', name: 'Express.js', icon: '🚂' },
          { id: 'fastapi', name: 'FastAPI', icon: '⚡' },
          { id: 'django', name: 'Django', icon: '🎸' },
          { id: 'spring_boot', name: 'Spring Boot', icon: '🌱' },
          { id: 'csharp', name: 'ASP.NET Core', icon: '🔷' },
        ],
      },
      {
        name: 'Section C: Database',
        items: [
          { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
          { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
          { id: 'mysql', name: 'MySQL', icon: '🐬' },
          { id: 'redis', name: 'Redis', icon: '🔴' },
        ],
      },
    ],
    presets: [
      { id: 'mern', label: 'MERN Stack (React + Node + Mongo)', techs: ['react', 'nodejs', 'expressjs', 'mongodb'] },
      { id: 'pern', label: 'PERN Stack (React + Node + Postgres)', techs: ['react', 'nodejs', 'expressjs', 'postgresql'] },
      { id: 'mean', label: 'MEAN Stack (Angular + Node + Mongo)', techs: ['angular', 'nodejs', 'expressjs', 'mongodb'] },
      { id: 'spring_react', label: 'React + Spring Boot + Postgres', techs: ['react', 'spring_boot', 'postgresql'] },
      { id: 'fastapi_react', label: 'React + FastAPI + Postgres', techs: ['react', 'fastapi', 'postgresql'] },
    ],
  },
  aiml: {
    questionPrompt: 'Choose your AI / ML technologies and specializations.',
    groups: [
      {
        name: 'Languages & Libraries',
        items: [
          { id: 'python', name: 'Python', icon: '🐍' },
          { id: 'scikit_learn', name: 'Scikit-learn', icon: '🔬' },
          { id: 'pytorch', name: 'PyTorch', icon: '🔥' },
          { id: 'tensorflow', name: 'TensorFlow', icon: '🟧' },
          { id: 'numpy', name: 'NumPy', icon: '🔢' },
          { id: 'pandas', name: 'Pandas', icon: '🐼' },
        ],
      },
      {
        name: 'Specializations & Infrastructure',
        items: [
          { id: 'machine_learning', name: 'Machine Learning', icon: '🤖' },
          { id: 'deep_learning', name: 'Deep Learning', icon: '🧠' },
          { id: 'genai', name: 'Generative AI', icon: '✨' },
          { id: 'rag', name: 'RAG & Vector DBs', icon: '📚' },
          { id: 'llm', name: 'LLMs & Transformers', icon: '💬' },
          { id: 'nlp', name: 'Natural Language Processing', icon: '🗣️' },
          { id: 'computer_vision', name: 'Computer Vision', icon: '👁️' },
          { id: 'ai_agents', name: 'AI Agents', icon: '🕵️' },
        ],
      },
    ],
    presets: [
      { id: 'python_sklearn', label: 'Python + Scikit-Learn (ML)', techs: ['python', 'scikit_learn', 'machine_learning'] },
      { id: 'pytorch_dl', label: 'PyTorch + Deep Learning', techs: ['python', 'pytorch', 'deep_learning'] },
      { id: 'genai_rag', label: 'Generative AI + RAG + LLMs', techs: ['python', 'genai', 'rag', 'llm'] },
      { id: 'nlp_transformers', label: 'Transformers & NLP', techs: ['python', 'pytorch', 'llm', 'nlp'] },
    ],
  },
  data_scientist: {
    questionPrompt: 'Choose your Data Science tools, algorithms & topics.',
    groups: [
      {
        name: 'Core Analysis & SQL',
        items: [
          { id: 'python', name: 'Python', icon: '🐍' },
          { id: 'pandas', name: 'Pandas', icon: '🐼' },
          { id: 'numpy', name: 'NumPy', icon: '🔢' },
          { id: 'sql', name: 'SQL', icon: '🗄️' },
          { id: 'data_viz', name: 'Data Visualization', icon: '📊' },
        ],
      },
      {
        name: 'Statistics, Modeling & Testing',
        items: [
          { id: 'statistics', name: 'Statistics & Probability', icon: '📈' },
          { id: 'scikit_learn', name: 'Scikit-learn', icon: '🔬' },
          { id: 'machine_learning', name: 'Machine Learning', icon: '🤖' },
          { id: 'ab_testing', name: 'A/B Testing & EDA', icon: '🧪' },
        ],
      },
    ],
    presets: [
      { id: 'py_pandas_stats', label: 'Python + Pandas + Statistics', techs: ['python', 'pandas', 'statistics'] },
      { id: 'ml_scientist', label: 'Scikit-learn + ML Modeling', techs: ['python', 'scikit_learn', 'statistics', 'machine_learning'] },
      { id: 'sql_ab_analytics', label: 'SQL + A/B Testing & Inference', techs: ['sql', 'statistics', 'ab_testing'] },
    ],
  },
  data_analyst: {
    questionPrompt: 'Choose your Data Analytics stack & business intelligence tools.',
    groups: [
      {
        name: 'SQL & Querying',
        items: [
          { id: 'sql', name: 'SQL (Queries & Window Functions)', icon: '🗄️' },
          { id: 'postgresql', name: 'PostgreSQL / Relational DBs', icon: '🐘' },
        ],
      },
      {
        name: 'BI & Dashboard Tools',
        items: [
          { id: 'power_bi', name: 'Power BI & DAX', icon: '📊' },
          { id: 'tableau', name: 'Tableau LOD', icon: '📈' },
          { id: 'excel', name: 'Excel & Power Query', icon: '📗' },
        ],
      },
      {
        name: 'Analysis & Metrics',
        items: [
          { id: 'python', name: 'Python for Analytics', icon: '🐍' },
          { id: 'pandas', name: 'Pandas', icon: '🐼' },
          { id: 'statistics', name: 'Statistics & KPIs', icon: '📉' },
        ],
      },
    ],
    presets: [
      { id: 'sql_powerbi', label: 'SQL + Power BI (DAX)', techs: ['sql', 'power_bi'] },
      { id: 'excel_tableau', label: 'Excel + Tableau', techs: ['excel', 'tableau'] },
      { id: 'sql_excel_bi', label: 'SQL + Excel Business Analytics', techs: ['sql', 'excel', 'statistics'] },
      { id: 'py_sql_analytics', label: 'Python + SQL Analytics', techs: ['python', 'pandas', 'sql'] },
    ],
  },
  hr: {
    questionPrompt: 'Select Behavioral & HR Interview Topics.',
    groups: [
      {
        name: 'Core Screening & Self-Pitch',
        items: [
          { id: 'self_intro', name: 'Self Introduction', icon: '🙋' },
          { id: 'strengths_weaknesses', name: 'Strengths & Weaknesses', icon: '⚖️' },
          { id: 'career_goals', name: 'Career Goals & 5-Yr Vision', icon: '🎯' },
        ],
      },
      {
        name: 'STAR Behavioral Scenarios',
        items: [
          { id: 'teamwork', name: 'Teamwork & Collaboration', icon: '🤝' },
          { id: 'leadership', name: 'Leadership & Initiative', icon: '🏆' },
          { id: 'conflict_resolution', name: 'Conflict Resolution', icon: '🕊️' },
          { id: 'situational', name: 'Failure, Ownership & Stress', icon: '🛡️' },
        ],
      },
    ],
    presets: [
      { id: 'screening', label: 'Standard Screening Round', techs: ['self_intro', 'strengths_weaknesses', 'career_goals'] },
      { id: 'star_leadership', label: 'Behavioral & Leadership (STAR)', techs: ['teamwork', 'leadership', 'conflict_resolution', 'situational'] },
      { id: 'comprehensive_hr', label: 'Comprehensive HR Round', techs: ['self_intro', 'strengths_weaknesses', 'teamwork', 'leadership', 'conflict_resolution', 'situational'] },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────── */
/*  MAIN INTERVIEW PAGE                                                */
/* ─────────────────────────────────────────────────────────────────── */
export default function Interview() {
  const navigate = useNavigate();

  /* ── state ── */
  const [stage,            setStage]            = useState('setup'); // setup | interview | submitting | done
  const [selectedRole,     setSelectedRole]     = useState('fullstack');
  const [selectedTechs,    setSelectedTechs]    = useState(['react', 'nodejs', 'expressjs', 'mongodb']);
  const [difficulty,       setDifficulty]       = useState('medium'); // 'easy' | 'medium' | 'hard' | 'adaptive'
  const [count,            setCount]            = useState(5); // 5, 10, 15, 20
  const [answerMode,       setAnswerMode]       = useState('type'); // 'type' | 'voice'
  const [selectedAI,       setSelectedAI]       = useState(AI_INTERVIEWERS[0]);
  const [questions,        setQuestions]        = useState([]);
  const [currentQ,         setCurrentQ]         = useState(0);
  const [answers,          setAnswers]          = useState([]);
  const [currentAns,       setCurrentAns]       = useState('');
  const [isSpeaking,       setIsSpeaking]       = useState(false);
  const [postureLog,       setPostureLog]       = useState([]);
  const [liveMetrics,      setLiveMetrics]      = useState({ posture: 0 });
  const [livePosture,      setLivePosture]      = useState(null); // null = not yet measured
  const [error,            setError]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [ttsEnabled,       setTtsEnabled]       = useState(true);

  const currentRoleObj = PRIMARY_JOB_ROLES.find(r => r.id === selectedRole) || PRIMARY_JOB_ROLES[0];
  const roleTaxonomy   = ROLE_TAXONOMY[selectedRole] || ROLE_TAXONOMY.fullstack;

  // Handle role switch & set initial preset techs
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    const tax = ROLE_TAXONOMY[roleId] || ROLE_TAXONOMY.fullstack;
    if (tax.presets?.length) {
      setSelectedTechs(tax.presets[0].techs);
    } else {
      setSelectedTechs([]);
    }
  };

  // Toggle individual technology item
  const toggleTech = (techId) => {
    setSelectedTechs(prev => {
      if (prev.includes(techId)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter(t => t !== techId);
      }
      return [...prev, techId];
    });
  };

  const speech = useSpeech(useCallback(t => setCurrentAns(t), []));
  const timer  = useTimer();

  const finishRef = useRef(null);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  /* ── anti-cheat ── */
  const antiCheat = useAntiCheat(stage === 'interview', 3, useCallback(() => {
    finishRef.current?.(answersRef.current);
  }, []));

  /* ── restore active interview from sessionStorage on mount ── */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('hiremind_active_interview');
      if (saved) {
        const data = JSON.parse(saved);
        if (data?.stage === 'interview' && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          setCurrentQ(data.currentQ || 0);
          setAnswers(data.answers || []);
          if (data.selectedRole) setSelectedRole(data.selectedRole);
          if (data.selectedTechs) setSelectedTechs(data.selectedTechs);
          if (data.difficulty) setDifficulty(data.difficulty);
          if (data.count) setCount(data.count);
          if (data.selectedAI) setSelectedAI(data.selectedAI);
          setStage('interview');
          timer.start();
        }
      }
    } catch (err) {
      console.warn('[Session restore error]:', err);
    }
  }, []);

  /* ── sync active interview to sessionStorage ── */
  useEffect(() => {
    if (stage === 'interview' && questions.length > 0) {
      sessionStorage.setItem('hiremind_active_interview', JSON.stringify({
        stage: 'interview',
        questions,
        currentQ,
        answers,
        selectedRole,
        selectedTechs,
        difficulty,
        count,
        selectedAI,
      }));
    } else if (stage === 'submitting' || stage === 'done') {
      sessionStorage.removeItem('hiremind_active_interview');
    }
  }, [stage, questions, currentQ, answers, selectedRole, selectedTechs, difficulty, count, selectedAI]);

  /* ── speak each question ── */
  useEffect(() => {
    if (stage !== 'interview' || !questions[currentQ] || !ttsEnabled) return;
    const rawQ = questions[currentQ];
    const qText = typeof rawQ === 'string' ? rawQ : (rawQ?.question || '');
    if (!qText) return;
    const q = `Question ${currentQ + 1}. ${qText}`;
    setIsSpeaking(true);
    speakText(q, selectedAI, () => setIsSpeaking(true), () => setIsSpeaking(false));
    return () => stopSpeaking();
  }, [currentQ, stage, ttsEnabled, selectedAI, questions]);

  /* ── stop TTS on stage exit ── */
  useEffect(() => {
    if (stage !== 'interview') stopSpeaking();
  }, [stage]);

  /* ── posture collector ── */
  const onPosture = useCallback(d => {
    setLiveMetrics(d);
    if (d.posture > 0) {
      setLivePosture(d.posture);
      setPostureLog(prev => [...prev, d.posture]);
    }
  }, []);

  const avgPosture = useCallback(() => {
    if (!postureLog.length) return { posture: 0 };
    const avg = Math.round(postureLog.reduce((a, b) => a + b, 0) / postureLog.length);
    return { posture: avg };
  }, [postureLog]);

  /* ── Live posture display ── */
  useEffect(() => {
    if (stage !== 'interview') return;
    if (liveMetrics.posture > 0) {
      setLivePosture(liveMetrics.posture);
    }
  }, [stage, liveMetrics]);

  /* ── start interview ── */
  const startInterview = async () => {
    setLoading(true); setError('');
    try {
      const fetchDiff = difficulty === 'adaptive' ? 'medium' : difficulty;
      const res = await interviewAPI.getQuestions(
        selectedRole,
        selectedTechs[0] || '',
        fetchDiff,
        count,
        selectedRole === 'hr' ? 'hr' : 'technical',
        undefined,
        undefined,
        selectedTechs
      );
      const qs = res.data?.questions;
      if (!qs || !qs.length) throw new Error('No questions returned for this configuration.');
      setQuestions(qs); setCurrentQ(0); setAnswers([]); setCurrentAns('');
      setPostureLog([]);
      setStage('interview'); timer.start();
    } catch (e) {
      console.error('[startInterview Error]', e);
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
      const techDisplay = selectedTechs.length ? ` (${selectedTechs.join(', ')})` : '';
      const title = `${currentRoleObj.name}${techDisplay}`;

      const res = await interviewAPI.save({
        jobRole:        title,
        role:           selectedRole,
        technology:     selectedTechs[0] || '',
        technologies:   selectedTechs,
        category:       selectedRole === 'hr' ? 'hr' : 'technical',
        difficulty:     difficulty === 'adaptive' ? 'medium' : difficulty,
        aiCharacter:    selectedAI.id,
        questions,
        answers:        allAnswers || answersRef.current,
        duration:       timer.secs,
        postureData:    avgPosture(),
        tabSwitches:    antiCheat.warningCount,
        cheatingEvents: antiCheat.violations,
      });

      sessionStorage.removeItem('hiremind_active_interview');
      const sessionId = res.data?.session?._id || res.data?._id;
      if (sessionId) {
        setStage('done');
        navigate(`/feedback/${sessionId}`);
      } else {
        throw new Error('Session saved but ID not returned.');
      }
    } catch (e) {
      console.error('[finishInterview Error]', e);
      setError('Save failed: ' + (e.response?.data?.message || e.message));
      setStage('interview'); timer.start();
    }
  }, [stage, selectedRole, selectedTechs, currentRoleObj, difficulty, selectedAI, questions, timer, avgPosture, antiCheat, navigate, speech]);

  useEffect(() => { finishRef.current = finishInterview; }, [finishInterview]);

  const wc = currentAns.trim().split(/\s+/).filter(Boolean).length;
  const progress = questions.length ? ((currentQ) / questions.length) * 100 : 0;

  /* ══════════════════════════════════════════════════════════ */
  return (
    <InterviewErrorBoundary>
      <div className="min-h-screen t-bg" style={{ fontFamily:'Inter, sans-serif' }}>
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
          <div className="card rounded-2xl p-8 max-w-sm mx-4 text-center" style={{border:'2px solid var(--accent)'}}>
            <div className="text-5xl mb-4">📺</div>
            <h3 className="font-bold text-lg t-text mb-2">Stay in Fullscreen</h3>
            <p className="text-sm t-muted mb-6">Exiting fullscreen is flagged as a proctoring violation.</p>
            <div className="flex gap-3">
              <button onClick={antiCheat.requestFullscreen} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white">Enter Fullscreen</button>
              <button onClick={antiCheat.dismissFSPrompt} className="flex-1 py-2.5 rounded-xl btn-outline text-sm">Continue Anyway</button>
            </div>
          </div>
        </motion.div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <AnimatePresence mode="wait">

          {/* ═══════════════ CLEAN ROLE-BASED SETUP ═══════════════ */}
          {stage === 'setup' && (
            <motion.div key="setup"
              initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-12}}
              className="space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold mb-1"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                    <span>🎯</span> AI Role-Based Interview Simulator
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold t-text tracking-tight">
                    Role-Based Interview Configuration
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs t-muted">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Webcam Proctoring Armed
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">Adaptive Evaluation</span>
                </div>
              </div>

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: Role & Settings (7 cols) */}
                <div className="lg:col-span-7 space-y-4">

                  {/* 1. Job Role Selection Grid */}
                  <div className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👔</span>
                        <h2 className="text-sm font-semibold t-text">1. Choose Your Target Job Role</h2>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium t-muted" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {PRIMARY_JOB_ROLES.length} Primary Roles
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRIMARY_JOB_ROLES.map(r => {
                        const isSelected = selectedRole === r.id;
                        return (
                          <button key={r.id} onClick={() => handleRoleChange(r.id)}
                            className="p-3 rounded-xl text-left border transition-all flex flex-col justify-between"
                            style={{
                              borderColor: isSelected ? (r.color || 'var(--accent)') : 'var(--border)',
                              background:  isSelected ? `${r.color || '#3b82f6'}15` : 'rgba(255,255,255,0.02)',
                              boxShadow:   isSelected ? `0 0 14px ${r.color || '#3b82f6'}25` : 'none',
                            }}>
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-lg">{r.icon}</span>
                              {isSelected && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                  style={{ background: r.color, color: '#000' }}>
                                  Selected
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs t-text mb-0.5">{r.name}</p>
                              <p className="text-[11px] t-muted line-clamp-2 leading-snug">{r.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Dynamic Technology & Stack Selector */}
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="card p-4 space-y-4"
                    style={{ border: `1.5px solid ${currentRoleObj.color}35`, background: `${currentRoleObj.color}05` }}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[var(--border)]">
                      <div>
                        <h2 className="text-sm font-semibold t-text flex items-center gap-2">
                          <span>🛠️</span> 2. {roleTaxonomy.questionPrompt}
                        </h2>
                        <p className="text-[11px] t-muted mt-0.5">
                          Selected stack determines the exact questions loaded in your interview.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                          style={{ background: `${currentRoleObj.color}25`, color: currentRoleObj.color }}>
                          {selectedTechs.length} Selected
                        </span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    {roleTaxonomy.presets?.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] t-muted uppercase tracking-wider font-semibold">
                          ⚡ Quick Stack Presets
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {roleTaxonomy.presets.map(p => {
                            const isPresetActive = p.techs.length === selectedTechs.length && p.techs.every(t => selectedTechs.includes(t));
                            return (
                              <button key={p.id} onClick={() => setSelectedTechs(p.techs)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                                style={{
                                  borderColor: isPresetActive ? currentRoleObj.color : 'var(--border)',
                                  background:  isPresetActive ? `${currentRoleObj.color}20` : 'rgba(255,255,255,0.03)',
                                  color:       isPresetActive ? currentRoleObj.color : 'var(--text-2)',
                                  fontWeight:  isPresetActive ? '600' : '500',
                                }}>
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grouped Technology Items */}
                    <div className="space-y-3 pt-1">
                      {roleTaxonomy.groups.map((grp, gIdx) => (
                        <div key={gIdx} className="space-y-1.5">
                          <span className="text-[11px] font-semibold t-muted block">
                            {grp.name}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {grp.items.map(item => {
                              const isChecked = selectedTechs.includes(item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleTech(item.id)}
                                  className="p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5"
                                  style={{
                                    borderColor: isChecked ? currentRoleObj.color : 'var(--border)',
                                    background:  isChecked ? `${currentRoleObj.color}18` : 'rgba(255,255,255,0.02)',
                                    boxShadow:   isChecked ? `0 0 8px ${currentRoleObj.color}20` : 'none',
                                  }}>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-sm">{item.icon}</span>
                                    <span className="text-xs font-semibold t-text truncate">{item.name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: isChecked ? currentRoleObj.color : 'var(--muted)' }}>
                                    {isChecked ? '✓' : '+'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                  </motion.div>

                  {/* 3. Consolidated Parameters (Difficulty, Count, Answer Mode) */}
                  <div className="card p-4 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚙️</span>
                      <h2 className="text-sm font-semibold t-text">
                        3. Session Parameters
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Difficulty */}
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <label className="text-[11px] t-muted font-medium block uppercase tracking-wider mb-2">Difficulty</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            ['easy',   '#22c55e', 'Easy'],
                            ['medium', 'var(--accent)', 'Medium'],
                            ['hard',   '#ef4444', 'Hard'],
                            ['adaptive','#a855f7', 'Auto ⚡'],
                          ].map(([d, col, lbl]) => (
                            <button key={d} onClick={() => setDifficulty(d)}
                              className="py-1.5 rounded-lg text-xs font-semibold border transition-all text-center"
                              style={{
                                borderColor: difficulty === d ? col : 'var(--border)',
                                color:       difficulty === d ? col : 'var(--muted)',
                                background:  difficulty === d ? `${col}15` : 'transparent',
                              }}>
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Question Count */}
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] t-muted font-medium uppercase tracking-wider">Question Count</label>
                          <span className="font-bold text-xs" style={{ color: 'var(--accent)' }}>{count} Qs</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[5, 10, 15, 20].map(preset => (
                            <button key={preset} onClick={() => setCount(preset)}
                              className="flex-1 py-1 rounded-lg text-xs font-medium border transition-all"
                              style={{
                                borderColor: count === preset ? 'var(--accent)' : 'var(--border)',
                                background:  count === preset ? 'var(--accent-bg)' : 'transparent',
                                color:       count === preset ? 'var(--accent)' : 'var(--muted)',
                              }}>
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input type="range" min="3" max="20" value={count}
                          onChange={e => setCount(+e.target.value)} className="w-full h-1 accent-[var(--accent)]" />
                      </div>

                      {/* Answer Mode */}
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <label className="text-[11px] t-muted font-medium block uppercase tracking-wider mb-2">Input Mode</label>
                        <div className="flex flex-col gap-1.5">
                          {[
                            ['type',  '⌨️ Typing Input'],
                            ['voice', '🎤 Speech-to-Text'],
                          ].map(([m, lbl]) => (
                            <button key={m} onClick={() => setAnswerMode(m)}
                              className="py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between"
                              style={{
                                borderColor: answerMode === m ? 'var(--accent)' : 'var(--border)',
                                background:  answerMode === m ? 'var(--accent-bg)' : 'transparent',
                                color:       answerMode === m ? 'var(--accent)' : 'var(--muted)',
                              }}>
                              <span>{lbl}</span>
                              {answerMode === m && <span className="text-[10px]">●</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. AI Interviewer Selection */}
                  <div className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧑‍💼</span>
                        <h2 className="text-sm font-semibold t-text">
                          4. Choose AI Interviewer
                        </h2>
                      </div>
                      <button
                        onClick={() => speakText(`Hello! I am ${selectedAI.name}. I will be conducting your ${currentRoleObj.name} interview today.`, selectedAI, () => {}, () => {})}
                        className="text-xs px-2.5 py-1 rounded-lg btn-outline flex items-center gap-1">
                        <span>🔊</span> Test Voice
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AI_INTERVIEWERS.map(ai => {
                        const isSelected = selectedAI.id === ai.id;
                        return (
                          <button key={ai.id} onClick={() => setSelectedAI(ai)}
                            className="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center"
                            style={{
                              borderColor: isSelected ? ai.color : 'var(--border)',
                              background:  isSelected ? `${ai.color}12` : 'rgba(255,255,255,0.02)',
                              boxShadow:   isSelected ? `0 0 12px ${ai.color}25` : 'none',
                            }}>
                            <div className="mb-1">
                              <InterviewerAvatar interviewer={ai} size={36} />
                            </div>
                            <p className="font-bold text-xs t-text truncate w-full">{ai.name}</p>
                            <p className="text-[10px] t-muted truncate w-full">{ai.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                      <label className="flex items-center gap-2 t-muted cursor-pointer">
                        <input type="checkbox" checked={ttsEnabled} onChange={e => setTtsEnabled(e.target.checked)}
                          className="rounded accent-[var(--accent)]" />
                        AI speaks questions aloud
                      </label>
                      <span className="text-[11px] t-muted">{selectedAI.accent} Accent</span>
                    </div>
                  </div>

                </div>

                {/* Right Column: Sticky Summary & Action (5 cols) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">

                  {/* Interviewer Spotlight Banner */}
                  <div className="card p-4 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${selectedAI.color}10, rgba(255,255,255,0.02))`,
                      border: `1.5px solid ${selectedAI.color}35`,
                    }}>
                    <div className="flex items-center gap-3">
                      <InterviewerAvatar interviewer={selectedAI} size={52} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm t-text truncate">{selectedAI.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{ background: `${selectedAI.color}20`, color: selectedAI.color }}>
                            {selectedAI.accent}
                          </span>
                        </div>
                        <p className="text-xs t-muted truncate">{selectedAI.role}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: selectedAI.color }}>Style: {selectedAI.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Compact Configuration Summary */}
                  <div className="card p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                      <span className="font-semibold text-sm t-text">Session Overview</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                        Ready to Start
                      </span>
                    </div>

                    {[
                      ['Target Role',  currentRoleObj.name, '🎯'],
                      ['Difficulty',   difficulty.toUpperCase() + (difficulty === 'adaptive' ? ' (Smart Trajectory)' : ''), '⚙️'],
                      ['Question Count', `${count} Questions`, '🔢'],
                      ['Answer Mode',  answerMode === 'voice' ? 'Speech-to-Text' : 'Typing', '⌨️'],
                    ].map(([k, v, icon]) => (
                      <div key={k} className="flex justify-between items-center py-1">
                        <span className="t-muted flex items-center gap-1.5">
                          <span className="text-[11px]">{icon}</span>
                          <span>{k}</span>
                        </span>
                        <span className="font-semibold t-text truncate max-w-[180px] text-right">{v}</span>
                      </div>
                    ))}

                    {/* Selected Technologies Chips */}
                    <div className="pt-2 border-t border-[var(--border)]">
                      <p className="text-[10px] t-muted font-medium mb-1.5 uppercase tracking-wider">
                        Active Technology Stack ({selectedTechs.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTechs.map((techId, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                            style={{ background: `${currentRoleObj.color}20`, color: currentRoleObj.color, border: `1px solid ${currentRoleObj.color}40` }}>
                            {techId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Proctoring & Webcam Pre-Flight Status */}
                  <div className="card p-3.5 space-y-2 text-xs" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center justify-between font-semibold text-red-400">
                      <span className="flex items-center gap-1.5"><span>🔒</span> Pre-Flight Proctoring</span>
                      <span className="text-[10px] uppercase tracking-wider">Active</span>
                    </div>
                    <div className="space-y-1 t-muted text-[11px]">
                      <p className="flex items-center gap-1.5">
                        <span className="text-green-400">✓</span> Single-candidate face monitoring armed via webcam
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="text-green-400">✓</span> Fullscreen lock & tab-switch tracker (3 violation limit)
                      </p>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="rounded-xl p-3 text-xs text-red-400 flex items-center gap-2"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <span>⚠️</span>
                      <span className="flex-1">{error}</span>
                    </div>
                  )}

                  {/* Start Interview Action Button */}
                  <motion.button
                    onClick={startInterview} disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-base btn-primary disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                      boxShadow: '0 4px 20px var(--accent-bg)',
                    }}>
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Initializing Session...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Start Interview ({count} Questions)</span>
                      </>
                    )}
                  </motion.button>

                </div>

              </div>
            </motion.div>
          )}


          {/* ═══════════════ INTERVIEW (EMPTY RECOVERY) ═══════════════ */}
          {stage === 'interview' && (!questions || questions.length === 0) && (
            <motion.div key="empty-session"
              initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}}
              className="card p-8 max-w-md mx-auto my-12 text-center space-y-4"
              style={{ border: '1px solid var(--border)' }}>
              <div className="text-5xl">📋</div>
              <h3 className="text-lg font-bold t-text">No Interview Questions Loaded</h3>
              <p className="text-xs t-muted leading-relaxed">
                The interview session is empty. You can return to configuration to choose your questions or re-initialize.
              </p>
              <div className="flex gap-2.5 justify-center pt-2">
                <button
                  onClick={() => {
                    try { sessionStorage.removeItem('hiremind_active_interview'); } catch {}
                    setStage('setup');
                  }}
                  className="btn-primary py-2.5 px-5 rounded-xl text-xs font-semibold text-white">
                  Back to Setup
                </button>
                <button onClick={startInterview} className="btn-outline py-2.5 px-5 rounded-xl text-xs">
                  Retry Loading
                </button>
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

                  {/* Body Posture */}
                  <div className="flex items-center gap-3 flex-1 min-w-[160px]">
                    <span className="text-sm">🧘</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Body Posture</span>
                        <motion.span
                          key={livePosture}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold"
                          style={{
                            color: livePosture === null ? 'var(--muted)'
                                 : livePosture >= 70 ? '#22c55e'
                                 : livePosture >= 50 ? '#f59e0b' : '#ef4444'
                          }}>
                          {livePosture === null ? 'Analyzing...' : `${livePosture}%`}
                        </motion.span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          animate={{ width: `${livePosture ?? 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: livePosture === null ? 'rgba(128,128,128,0.3)'
                              : livePosture >= 70
                              ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                              : livePosture >= 50
                              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                              : 'linear-gradient(90deg,#ef4444,#dc2626)',
                          }} />
                      </div>
                    </div>
                    {livePosture !== null && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                        style={{
                          background: livePosture >= 70 ? 'rgba(34,197,94,0.12)'
                                    : livePosture >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: livePosture >= 70 ? '#22c55e'
                               : livePosture >= 50 ? '#f59e0b' : '#ef4444',
                        }}>
                        {livePosture >= 90 ? 'Excellent'
                          : livePosture >= 75 ? 'Good'
                          : livePosture >= 60 ? 'Fair'
                          : livePosture >= 40 ? 'Poor' : 'Very Poor'}
                      </span>
                    )}
                  </div>

                  {/* Tip */}
                  <div className="hidden sm:block text-xs t-muted flex-shrink-0 max-w-[160px] text-right">
                    {livePosture === null
                      ? '🔄 Loading posture model...'
                      : livePosture < 50
                      ? '⚠️ Sit upright & centre yourself'
                      : livePosture >= 75
                      ? '✅ Great posture!'
                      : '💡 Keep shoulders level'
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
                    <InterviewerAvatar interviewer={selectedAI} size={34} isSpeaking={isSpeaking} />
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
                        <p className="text-lg font-medium t-text leading-relaxed">
                          {typeof questions[currentQ] === 'string' ? questions[currentQ] : (questions[currentQ]?.question || '')}
                        </p>
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
                      onClick={() => {
                        const qStr = typeof questions[currentQ] === 'string' ? questions[currentQ] : (questions[currentQ]?.question || '');
                        if (qStr) speakText(qStr, selectedAI, () => setIsSpeaking(true), () => setIsSpeaking(false));
                      }}
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
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
              <motion.div
                animate={{scale:[1,1.1,1]}} transition={{duration:1.2, repeat:Infinity}}
                className="text-7xl mb-2">🧠</motion.div>
              <h2 className="font-display font-bold text-2xl t-text">Analyzing Your Performance...</h2>
              <p className="t-muted text-sm max-w-sm">Our AI is evaluating your technical answers and RAG concept coverage.</p>
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                style={{borderColor:'var(--accent)', borderTopColor:'transparent'}}/>
              {error && (
                <div className="card p-4 rounded-xl border border-red-500/30 bg-red-500/10 max-w-sm mx-auto text-left space-y-3">
                  <p className="text-red-400 text-xs font-mono">{error}</p>
                  <button
                    onClick={() => { setStage('interview'); setError(''); }}
                    className="w-full py-2 rounded-lg btn-outline text-xs text-white">
                    Back to Interview
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════ DONE ═══════════════ */}
          {stage === 'done' && (
            <motion.div key="done"
              initial={{opacity:0}} animate={{opacity:1}}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
              <motion.div
                animate={{scale:[1,1.15,1]}} transition={{duration:1, repeat:Infinity}}
                className="text-7xl mb-2">🎉</motion.div>
              <h2 className="font-display font-bold text-2xl t-text">Interview Completed!</h2>
              <p className="t-muted text-sm">Opening your performance assessment and detailed feedback report...</p>
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                style={{borderColor:'var(--accent)', borderTopColor:'transparent'}}/>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
    </InterviewErrorBoundary>
  );
}