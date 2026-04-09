import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWebcam — manage webcam stream and basic posture metrics
 * Returns stream, video ref, and simulated posture metrics
 */
export default function useWebcam(enabled = true) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(null); // null=pending, true, false
  const [metrics, setMetrics] = useState({ posture: 0, eyeContact: 0, confidence: 0 });
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!enabled) return;

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasPermission(true);

        // Start metric simulation (replace with real face detection if ML model available)
        const base = { posture: 65, eyeContact: 60, confidence: 62 };
        intervalRef.current = setInterval(() => {
          setMetrics({
            posture:    Math.max(30, Math.min(100, base.posture    + (Math.random() * 20 - 10))),
            eyeContact: Math.max(30, Math.min(100, base.eyeContact + (Math.random() * 24 - 12))),
            confidence: Math.max(30, Math.min(100, base.confidence + (Math.random() * 18 - 9))),
          });
        }, 2500);
      })
      .catch(err => {
        setHasPermission(false);
        setError(err.name === 'NotAllowedError'
          ? 'Camera access denied. Allow camera in browser settings.'
          : 'Camera not available: ' + err.message
        );
        // provide placeholder metrics so interview still works
        setMetrics({ posture: 62, eyeContact: 58, confidence: 60 });
      });

    return () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [enabled]);

  const stopWebcam = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return { videoRef, hasPermission, metrics, error, stopWebcam };
}
