import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Box, CircularProgress, Typography, CssBaseline,
    // 🔑 1. IMPORTA LOS COMPONENTES DEL MODAL
    Modal, Fade, IconButton, Avatar 
} from '@mui/material';
import { Login, Close } from '@mui/icons-material'; // 🔑 Importa iconos del modal
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 🔑 2. IMPORTA EL COMPONENTE DE LOGIN
import LoginMUI from './components/auth/LoginMUI'; // Ajusta esta ruta si es necesario

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
  
  // 🔑 3. DEFINE EL ESTADO DEL MODAL AQUÍ
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const initialCheckDone = useRef(false);

  // 🔑 4. DEFINE LOS HANDLERS DEL MODAL AQUÍ
  const handleOpenLoginModal = () => setOpenModal(true);
  const handleCloseLoginModal = () => setOpenModal(false);

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

      // 🔑 5. CIERRA EL MODAL AL HACER LOGIN EXITOSO
      handleCloseLoginModal();

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
  }, []); // Dependencia vacía intencional para que solo corra una vez

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
              {/* 🔑 6. PASA LA PROP AL MAINLAYOUT (QUE USA EL NAVBAR INTERNO) */}
              <MainLayout 
                currentUser={currentUser} 
                onLogout={handleLogout}
                onOpenLoginModal={handleOpenLoginModal} 
              />
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
              onOpenLoginModal={handleOpenLoginModal} // 🔑 7. PASA LA PROP AQUÍ
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
              onOpenLoginModal={handleOpenLoginModal} // 🔑 7. PASA LA PROP AQUÍ
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
              onOpenLoginModal={handleOpenLoginModal} // 🔑 7. PASA LA PROP AQUÍ
            />
          }
        />
      </Routes>

      {/* 🔑 8. RENDERIZA EL MODAL AQUÍ, EN EL NIVEL SUPERIOR */}
      <Modal open={openModal} onClose={handleCloseLoginModal}>
        <Fade in={openModal}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400 },
                    bgcolor: 'background.paper',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    borderRadius: 3,
                    p: 4
                }}
            >
                <IconButton
                    onClick={handleCloseLoginModal}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <Close />
                </IconButton>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                        <Login />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Acceder al Sistema
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Para empleados y clientes registrados
                    </Typography>
                </Box>
                {/* Pasa la función de login de AppCore a LoginMUI */}
                <LoginMUI onLoginSuccess={handleLoginSuccess} />
            </Box>
        </Fade>
      </Modal>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppCore />
  </BrowserRouter>
);

export default App;