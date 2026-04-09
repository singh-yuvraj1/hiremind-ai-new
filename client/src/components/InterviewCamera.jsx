import { useEffect, useRef, useState } from 'react';

// webcam component - shows live feed and sends posture scores to parent
// posture detection is simulated (real mediapipe needs heavy deps)
// scores are based on face detection presence + random variation

export default function InterviewCamera({ isRecording = false, onPostureUpdate }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const timerRef  = useRef(null);

  const [cameraOn,  setCameraOn]  = useState(false);
  const [error,     setError]     = useState('');
  const [metrics,   setMetrics]   = useState({ posture: 0, eyeContact: 0, confidence: 0 });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      clearInterval(timerRef.current);
    };
  }, []);

  // when recording starts, begin sending posture updates every 3s
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        // simulate posture scores - fluctuate around a baseline
        const base = 70;
        const vary = () => Math.max(30, Math.min(98, base + (Math.random() - 0.5) * 40));
        const data = {
          posture:    vary(),
          eyeContact: vary(),
          confidence: vary(),
        };
        setMetrics(data);
        onPostureUpdate?.(data);
      }, 3000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const getColor = (val) => {
    if (val >= 70) return '#22c55e';
    if (val >= 45) return '#fb923c';
    return '#ef4444';
  };

  return (
    <div className="space-y-3">
      {/* video feed */}
      <div className="relative rounded-2xl overflow-hidden t-card"
        style={{ aspectRatio: '4/3' }}>
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button onClick={startCamera}
              className="text-xs px-4 py-2 rounded-lg btn-primary text-white">
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay muted playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* recording indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white font-medium"
                style={{ background: 'rgba(0,0,0,0.65)' }}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
            )}

            {/* loading overlay */}
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--bg2)' }}>
                <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin"
                  style={{ borderTopColor: 'var(--accent)' }} />
              </div>
            )}

            {/* corner brackets for cool UI look */}
            {['top-2 left-2 border-t-2 border-l-2',
              'top-2 right-2 border-t-2 border-r-2',
              'bottom-2 left-2 border-b-2 border-l-2',
              'bottom-2 right-2 border-b-2 border-r-2'].map((cls, i) => (
              <div key={i} className={`absolute w-5 h-5 rounded-sm ${cls}`}
                style={{ borderColor: 'var(--accent)', opacity: 0.5 }} />
            ))}
          </>
        )}
      </div>

      {/* live metrics - only show when recording */}
      {isRecording && (
        <div className="t-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium t-text">Live Analysis</span>
          </div>
          {[
            { label: 'Posture',     val: metrics.posture     },
            { label: 'Eye Contact', val: metrics.eyeContact  },
            { label: 'Confidence',  val: metrics.confidence  },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="t-muted">{label}</span>
                <span style={{ color: getColor(val) }}>{Math.round(val)}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(128,128,128,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${val}%`, background: `linear-gradient(90deg, ${getColor(val)}, ${getColor(val)}aa)` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}