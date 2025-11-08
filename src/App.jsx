import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Importaciones de Páginas y Layouts
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage'; 
import PerfilPage from './pages/PerfilPage';
import PetDetailPage from './pages/PetDetailPage';
import DashboardRoutes from './pages/admin/DashboardRoutes'; 

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const USER_STATUS_ENDPOINT = '/user-status'; 

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
        localStorage.removeItem('lastDashboardPath');
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate('/', { replace: true });
    };

    const handleLoginSuccess = async (payload) => {
        try {
            let token = null;
            let user = null;

            if (!payload) {
                console.warn('⚠️ [Auth] Payload vacío en login.');
                return;
            }

            if (typeof payload === 'string') {
                token = payload;
            } else if (payload.token && payload.user) {
                token = payload.token;
                user = payload.user;
            } else if (payload.token) {
                token = payload.token;
            } else {
                user = payload;
            }

            if (token) localStorage.setItem('authToken', token);
            if (!user && token) user = await fetchUserData(token);

            if (!user) {
                console.error('❌ [Auth] No se pudo obtener el usuario tras iniciar sesión.');
                return;
            }

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

    const fetchUserData = async (token) => {
        try {
            const response = await axios.get(`${API_URL_BACKEND}${USER_STATUS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ¡Esto ya funciona perfecto con tu nueva API!
            return response.data.usuario; 
        } catch (error) {
            console.error('⚠️ [Auth] Token inválido o expirado:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('lastDashboardPath');
            setIsAuthenticated(false);
            return null;
        }
    };

    useEffect(() => {
        if (isAuthenticated && currentUser && canSeeDashboard(currentUser) && !location.pathname.startsWith('/dashboard')) {
            const lastPath = localStorage.getItem('lastDashboardPath');
            navigate(lastPath || '/dashboard', { replace: true });
        }
    }, [isAuthenticated, currentUser, navigate, location.pathname]);

    useEffect(() => {
        if (initialCheckDone.current) return;
        initialCheckDone.current = true;

        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            let user = null;

            if (token) {
                user = await fetchUserData(token);
                if (user) {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                }
            }

            if (user && canSeeDashboard(user) && !location.pathname.startsWith('/dashboard')) {
                const lastPath = localStorage.getItem('lastDashboardPath');
                navigate(lastPath || '/dashboard', { replace: true });
            }

            setAppLoading(false);
        };
        
        checkAuth();
    }, []);

    if (appLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Verificando autenticación...</Typography>
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