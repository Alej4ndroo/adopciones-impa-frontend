import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage'; 
import PerfilPage from './pages/PerfilPage';
import PetDetailPage from './pages/PetDetailPage';
import DashboardRoutes from './pages/admin/DashboardRoutes'; 

const canSeeDashboard = (user) => {
  if (!user || !user.permisos) return false;
  return user.permisos.includes('acceso_dashboard'); 
};

const ProtectedDashboardRoute = ({ children, isAuthenticated, currentUser }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!canSeeDashboard(currentUser)) return <Navigate to="/" replace />;
  return children;
};

const AppCore = () => { 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const initialCheckDone = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('lastDashboardPath');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/', { replace: true });
  };

  const handleLoginSuccess = (payload) => {
    try {
      if (!payload || !payload.token || !payload.user) {
        console.error('❌ [Auth] Estructura inválida en payload de login:', payload);
        return;
      }

      const { token, user } = payload;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));

      setIsAuthenticated(true);
      setCurrentUser(user);

      if (canSeeDashboard(user)) {
        const lastPath = localStorage.getItem('lastDashboardPath');
        navigate(lastPath || '/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[Auth] Error en handleLoginSuccess:', err);
    }
  };

  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);

        if (canSeeDashboard(user) && !location.pathname.startsWith('/dashboard')) {
          const lastPath = localStorage.getItem('lastDashboardPath');
          navigate(lastPath || '/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('⚠️ Error al leer usuario almacenado:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }

    setAppLoading(false);
  }, []);

  if (appLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <ProtectedDashboardRoute
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            >
              <MainLayout currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedDashboardRoute>
          }
        >
          {DashboardRoutes()}
        </Route>

        <Route
          path="/mascota/:petId"
          element={
            <PetDetailPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/perfil"
          element={
            <PerfilPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="*"
          element={
            <LandingPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppCore />
  </BrowserRouter>
);

export default App;