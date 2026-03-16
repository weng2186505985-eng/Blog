import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';

// Frontend Pages
import { Home } from './pages/Home';
import { BlogList } from './pages/BlogList';
import { BlogDetail } from './pages/BlogDetail';
import { Quests } from './pages/Quests';
import { Skills } from './pages/Skills';
import { Achievements } from './pages/Achievements';
import { Login } from './pages/Login';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { PostList } from './pages/admin/PostList';
import { PostEditor } from './pages/admin/PostEditor';
import { QuestManager } from './pages/admin/QuestManager';
import { AchievementManager } from './pages/admin/AchievementManager';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Frontend Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:id" element={<BlogDetail />} />
              <Route path="quests" element={<Quests />} />
              <Route path="skills" element={<Skills />} />
              <Route path="achievements" element={<Achievements />} />
            </Route>

            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="posts" element={<PostList />} />
              <Route path="posts/new" element={<PostEditor />} />
              <Route path="posts/:id/edit" element={<PostEditor />} />
              <Route path="quests" element={<QuestManager />} />
              <Route path="achievements" element={<AchievementManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
