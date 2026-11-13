import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthView } from './views/auth/AuthView';

// Student Views
import { StudentDashboard } from './views/student/StudentDashboard';
import { AskDoubtView } from './views/student/AskDoubtView';
import { DoubtsHistoryView } from './views/student/DoubtsHistoryView';
import { StudentGapsView } from './views/student/StudentGapsView';
import { StudentClassroomsView } from './views/student/StudentClassroomsView';

// Teacher Views
import { TeacherDashboard } from './views/teacher/TeacherDashboard';
import { ClassroomGapsView } from './views/teacher/ClassroomGapsView';
import { TeacherDoubtsView } from './views/teacher/TeacherDoubtsView';

import { GraduationCap } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const { isDark, activePalette } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetClassroomId, setTargetClassroomId] = useState('');

  // Reset tab to dashboard on role change
  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.role]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center space-y-4 transition-colors ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
        }`}
      >
        <div
          className="w-12 h-12 rounded-2xl border flex items-center justify-center animate-pulse"
          style={{
            backgroundColor: `${activePalette.primaryHex}15`,
            borderColor: `${activePalette.primaryHex}30`,
            color: activePalette.primaryHex,
          }}
        >
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold tracking-wide">
          Connecting to KNOWRA Learning Engine...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const isTeacher = user.role === 'teacher';

  const renderStudentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard onNavigate={setActiveTab} />;
      case 'ask':
        return <AskDoubtView onNavigate={setActiveTab} />;
      case 'history':
        return <DoubtsHistoryView onNavigate={setActiveTab} />;
      case 'gaps':
        return <StudentGapsView onNavigate={setActiveTab} />;
      case 'classrooms':
        return <StudentClassroomsView />;
      default:
        return <StudentDashboard onNavigate={setActiveTab} />;
    }
  };

  const renderTeacherView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <TeacherDashboard
            onNavigate={setActiveTab}
            onSelectClassroomForGaps={(classId) => {
              setTargetClassroomId(classId);
              setActiveTab('gaps');
            }}
          />
        );
      case 'gaps':
        return <ClassroomGapsView initialClassroomId={targetClassroomId} />;
      case 'doubts':
        return <TeacherDoubtsView />;
      default:
        return (
          <TeacherDashboard
            onNavigate={setActiveTab}
            onSelectClassroomForGaps={(classId) => {
              setTargetClassroomId(classId);
              setActiveTab('gaps');
            }}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isTeacher ? renderTeacherView() : renderStudentView()}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
