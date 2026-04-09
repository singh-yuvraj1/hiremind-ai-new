/** Score color by value (0-100) */
export const scoreColor = (score) => {
  if (score >= 75) return '#22c55e';  // green
  if (score >= 50) return '#f59e0b';  // amber
  if (score >= 25) return '#ef4444';  // red
  return '#6b7280';                   // grey
};

/** Letter grade */
export const scoreGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
};

/** Descriptive label */
export const scoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 35) return 'Below Average';
  return 'Needs Work';
};

/** Format seconds → mm:ss */
export const fmtTime = (secs) =>
  `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

/** Format date */
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Progress ring path */
export const ringDashArray = (score, radius = 36) => {
  const circumference = 2 * Math.PI * radius;
  return { strokeDasharray: circumference, strokeDashoffset: circumference * (1 - score / 100) };
};
