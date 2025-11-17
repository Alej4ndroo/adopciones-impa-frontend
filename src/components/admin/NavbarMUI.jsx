import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, IconButton, Box, Button, Avatar,
    Badge, Menu, MenuItem, Divider, CircularProgress
} from '@mui/material';
import { UserCircle, LogOut, Menu as MenuIcon } from 'lucide-react';
import { Notifications } from '@mui/icons-material'; // 1. Icono de MUI

// 2. Añadimos la variable de entorno
const VITE_API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const NavbarMUI = ({ sidebarWidth, currentUser, onLogout, onDrawerToggle }) => {
    const navigate = useNavigate();
    const [fotoPerfil, setFotoPerfil] = useState(null);

    // 3. Estados para Notificaciones
    const [anchorElNotif, setAnchorElNotif] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const badgeContent = notifications.length; // Contador dinámico
    const openNotif = Boolean(anchorElNotif);

    // Efecto para la foto de perfil (sin cambios)
    useEffect(() => {
        if (currentUser?.foto_perfil_base64) {
            const fotoRaw = currentUser.foto_perfil_base64;
            const fotoURI = fotoRaw.startsWith('data:')
                ? fotoRaw.replace(/\s+/g, '')
                : `data:image/jpeg;base64,${fotoRaw.replace(/\s+/g, '')}`;
            setFotoPerfil(fotoURI);
        } else {
            setFotoPerfil(null);
        }
    }, [currentUser]);

    const userName = currentUser?.nombre || 'Empleado';
    const greeting = `Bienvenid@, ${userName}`;
    // Se elimina 'notificationCount' estático

    const handleProfileClick = () => navigate('/dashboard/perfil');

    // -----------------------------------------------------------------
    // 4. Lógica de Notificaciones (FETCH)
    // -----------------------------------------------------------------
    const fetchNotifications = useCallback(async (showSpinner = false) => {
        // Adaptación: Verificamos con currentUser
        if (!currentUser || !currentUser.id_usuario) return;

        if (showSpinner) {
            setLoadingNotif(true);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("No se encontró token. No se pueden cargar notificaciones.");
            return;
        }

        try {
            const response = await fetch(`${VITE_API_URL_BACKEND}/notificaciones/${currentUser.id_usuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar notificaciones');
            }

            const data = await response.json();
            setNotifications(data);

        } catch (error) {
            console.error("Fallo al obtener notificaciones:", error);
            setNotifications([]);
        } finally {
            if (showSpinner) {
                setLoadingNotif(false);
            }
        }
    }, [currentUser]); // Depende de currentUser


    // -----------------------------------------------------------------
    // 5. useEffect para Polling (Auto-refresco)
    // -----------------------------------------------------------------
    useEffect(() => {
        // Adaptación: Verificamos con currentUser
        if (currentUser && currentUser.id_usuario) {
            // 1. Carga inicial
            fetchNotifications(false);

            // 2. Intervalo de refresco
            const intervalId = setInterval(() => {
                fetchNotifications(false);
            }, 30000); // 30 segundos

            // 3. Limpieza
            return () => clearInterval(intervalId);
        } else {
            // Limpia notificaciones si el usuario se desloguea
            setNotifications([]);
        }
    }, [currentUser, fetchNotifications]);


    // 6. Handlers para el Menú de Notificaciones
    const handleNotifOpen = (event) => {
        setAnchorElNotif(event.currentTarget);
        fetchNotifications(true); // Carga y muestra spinner al hacer clic
    };

    const handleNotifClose = () => {
        setAnchorElNotif(null);
    };


    return (
        <AppBar
            position="fixed"
            sx={{
                height: 70,
                width: { sm: `calc(100% - ${sidebarWidth}px)` },
                ml: { sm: `${sidebarWidth}px` },
                backgroundColor: '#1565C0', // Color de fondo de tu Navbar
                boxShadow: 2,
                color: 'white',
                zIndex: 1200,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onDrawerToggle}
                        sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                        {greeting}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    
                    {/* 7. JSX de Notificaciones Implementado */}
                    <IconButton
                        size="large"
                        aria-label={`show ${badgeContent} new notifications`}
                        color="inherit" // Se mantiene 'inherit' para el fondo azul
                        onClick={handleNotifOpen}
                    >
                        <Badge
                            badgeContent={badgeContent}
                            color="error"
                            max={99}
                        >
                            <Notifications />
                        </Badge>
                    </IconButton>

                    {/* Menú de Notificaciones */}
                    <Menu
                        anchorEl={anchorElNotif}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={openNotif}
                        onClose={handleNotifClose}
                        PaperProps={{
                            sx: { width: 320, maxHeight: 400, mt: 1.5 }
                        }}
                    >
                        <MenuItem disabled sx={{ fontWeight: 'bold' }}>
                            Notificaciones ({badgeContent})
                        </MenuItem>
                        <Divider />
                        {loadingNotif ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Cargando...
                                </Typography>
                            </Box>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <MenuItem
                                    key={notif.id_notificacion}
                                    onClick={handleNotifClose}
                                    sx={{ whiteSpace: 'normal', display: 'block', py: 1.5, px: 2 }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {notif.titulo}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {notif.mensaje}
                                    </Typography>
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">
                                    No tienes notificaciones nuevas.
                                </Typography>
                            </MenuItem>
                        )}
                    </Menu>

                    {/* Botones de Perfil y Salir (Sin cambios) */}
                    <IconButton color="inherit" sx={{ p: 0 }} onClick={handleProfileClick}>
                        {fotoPerfil ? (
                            <Avatar
                                src={fotoPerfil}
                                alt={userName}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    border: '2px solid rgba(255,255,255,0.18)',
                                }}
                            />
                        ) : (
                            <UserCircle size={30} color="#ffffffff" />
                        )}
                    </IconButton>

                    <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<LogOut size={18} />}
                        onClick={onLogout}
                        sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                    >
                        Salir
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarMUI;