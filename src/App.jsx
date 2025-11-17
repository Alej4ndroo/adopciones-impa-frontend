import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Box, CircularProgress, Typography, CssBaseline,
    // 🔑 1. IMPORTA LOS COMPONENTES DEL MODAL
    Modal, Fade, IconButton 
    // 'Avatar' ya no se usa aquí
} from '@mui/material';
import { Close, Pets } from '@mui/icons-material'; // 'Login' (icon) ya no se usa aquí
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 🔑 2. IMPORTA EL COMPONENTE DE LOGIN
import AuthModalContent from './components/auth/AuthModalContent';

import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage'; 
import PerfilPage from './pages/PerfilPage';
import PetsPage from './pages/PetsPage';
import PetDetailPage from './pages/PetDetailPage';
import AdoptionRequestPage from './pages/AdoptionRequestPage';
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

   const handleProfileUpdate = (updatedUserData) => {
    if (!updatedUserData) {
      console.warn("[Auth] handleProfileUpdate fue llamado sin un usuario.");
      return;
    }

    const mergedUser = {
        ...currentUser,
        ...updatedUserData
    };

    setCurrentUser(mergedUser);
    
    localStorage.setItem('userData', JSON.stringify(mergedUser));
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
                onProfileUpdate={handleProfileUpdate}
              />
            </ProtectedDashboardRoute>
          }
        >
          {DashboardRoutes()}
        </Route>

        <Route
          path="/mascotas"
          element={
            <PetsPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
              onOpenLoginModal={handleOpenLoginModal}
            />
          }
        />

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
          path="/solicitar-adopcion/:petId"
          element={
            <AdoptionRequestPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
              onOpenLoginModal={handleOpenLoginModal}
            />
          }
        />

        <Route
          path="/perfil"
          element={
            <PerfilPage
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onProfileUpdate={handleProfileUpdate}
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
                    width: { xs: '90%', sm: 450 }, // Ancho ajustado
                    bgcolor: 'background.paper',
                    boxShadow: 24, // Sombra predefinida de MUI
                    borderRadius: 4, // Bordes más redondeados
                    p: 4,
                    outline: 'none' // Quita el borde azul al hacer click
                }}
            >
                {/* Botón de cerrar flotante */}
                <IconButton
                    onClick={handleCloseLoginModal}
                    sx={{ 
                        position: 'absolute', 
                        right: 16, 
                        top: 16,
                        color: 'text.secondary'
                    }}
                >
                    <Close />
                </IconButton>

                {/* ⬇️ ESTA ES LA LÍNEA NUEVA ⬇️ */}
                <AuthModalContent 
                    onLoginSuccess={handleLoginSuccess} 
                    onClose={handleCloseLoginModal}
                />
                
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