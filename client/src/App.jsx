import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home           from './pages/Home';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import Dashboard      from './pages/Dashboard';
import Interview      from './pages/Interview';
import MockTest       from './pages/MockTest';
import Feedback       from './pages/Feedback';
import Profile        from './pages/Profile';
import History        from './pages/History';
import Jobs           from './pages/Jobs';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center t-bg">
      <div className="w-10 h-10 border-2 border-transparent rounded-full animate-spin"
        style={{ borderTopColor: 'var(--accent)' }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/"       element={<Home />} />
            <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Private — dashboard pages (use DashboardLayout internally) */}
            <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/jobs"           element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/resume-analyzer"element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
            <Route path="/history"        element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/feedback/:id"   element={<PrivateRoute><Feedback /></PrivateRoute>} />

            {/* Private — fullscreen pages (no sidebar — better for anti-cheat) */}
            <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
            <Route path="/mock-test" element={<PrivateRoute><MockTest /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}