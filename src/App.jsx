import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Importaciones de Páginas y Layouts
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage'; 
import DashboardRoutes from './pages/admin/DashboardRoutes'; 

const API_BASE_URL = 'http://localhost:3000'; 
const USER_STATUS_ENDPOINT = '/user-status'; 
const EMPLOYEES_ROLES = ['admin', 'director', 'veterinario', 'empleado'];

const shouldSeeDashboard = (role) => EMPLOYEES_ROLES.includes(role);

// ----------------------------------------------------------------------
// 🔑 Componente para proteger rutas del dashboard
// ----------------------------------------------------------------------
const ProtectedDashboardRoute = ({ children, isAuthenticated, currentUser }) => {
    if (!isAuthenticated) return <Navigate to="/" replace />;
    const userRole = currentUser?.nombre_rol;
    if (!shouldSeeDashboard(userRole)) return <Navigate to="/" replace />;
    return children;
};

// ----------------------------------------------------------------------
// 1. Lógica Central de la Aplicación (Manejador de Auth y Roles)
// ----------------------------------------------------------------------
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

            const userRole = user.nombre_rol;
            if (shouldSeeDashboard(userRole)) {
                const lastPath = localStorage.getItem('lastDashboardPath');
                navigate(lastPath || '/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('[Auth] Error en handleLoginSuccess:', err);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}${USER_STATUS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        if (isAuthenticated && currentUser && shouldSeeDashboard(currentUser.nombre_rol) && !location.pathname.startsWith('/dashboard')) {
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

            if (user && shouldSeeDashboard(user.nombre_rol) && !location.pathname.startsWith('/dashboard')) {
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

// ----------------------------------------------------------------------
// 3. Componente Raíz que envuelve con BrowserRouter
// ----------------------------------------------------------------------
const App = () => (
    <BrowserRouter>
        <AppCore />
    </BrowserRouter>
);

export default App;
