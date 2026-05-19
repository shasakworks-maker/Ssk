/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TournamentDetail from './pages/TournamentDetail';
import Tournaments from './pages/Tournaments';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import FAQ from './pages/FAQ';

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/" />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={profile?.isAdmin ? <Admin /> : <Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
