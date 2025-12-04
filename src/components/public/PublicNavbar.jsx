import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, Box, Avatar, Fade, 
    IconButton, Modal, Menu, MenuItem, Badge, Divider, CircularProgress
} from '@mui/material';
import { Login, Close, Logout, Notifications, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IMPALogo from '../../assets/img/logo_impa_azul.png'; 
import { sanitizeBase64Image } from '../../utils/base64';
import { mergeNotificationsLists } from '../../utils/notifications';

// ⚙️ 1. Añadimos la variable de entorno para la URL de la API
const VITE_API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const stringToColor = (string) => {
// ... (tu función stringToColor sin cambios) ...
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${(value).toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
};

// ⚙️ 2. 'onOpenLoginModal' añadido de nuevo
const PublicNavbar = ({ isAuthenticated, currentUser, onLogout, onOpenLoginModal }) => {
    const [anchorElMenu, setAnchorElMenu] = useState(null); // Menú de Perfil
    const [anchorElNotif, setAnchorElNotif] = useState(null); // Menú de Notificaciones

    // Estados para Notificaciones
    const [notifications, setNotifications] = useState([]);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [readNotificationIds, setReadNotificationIds] = useState([]);
    const storageKey = currentUser?.id_usuario ? `notif-read-${currentUser.id_usuario}` : null;
    const historyKey = currentUser?.id_usuario ? `notif-history-${currentUser.id_usuario}` : null;
    const persistReadNotifications = useCallback((ids) => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(ids));
        }
    }, [storageKey]);
    const persistNotificationsHistory = useCallback((items) => {
        if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(items));
        }
    }, [historyKey]);
    useEffect(() => {
        if (!storageKey) {
            setReadNotificationIds([]);
            return;
        }
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            setReadNotificationIds(Array.isArray(saved) ? saved : []);
        } catch {
            setReadNotificationIds([]);
        }
    }, [storageKey]);
    useEffect(() => {
        if (!historyKey) {
            setNotifications([]);
            return;
        }
        try {
            const saved = JSON.parse(localStorage.getItem(historyKey) || '[]');
            setNotifications(Array.isArray(saved) ? saved : []);
        } catch {
            setNotifications([]);
        }
    }, [historyKey]);
    const markNotificationAsRead = useCallback((notifId) => {
        if (!notifId) return;
        setReadNotificationIds((prev) => {
            if (prev.includes(notifId)) return prev;
            const updated = [...prev, notifId];
            persistReadNotifications(updated);
            return updated;
        });
    }, [persistReadNotifications]);
    const readSet = useMemo(() => new Set(readNotificationIds), [readNotificationIds]);
    const badgeContent = useMemo(() => notifications.reduce(
        (acc, notif) => acc + (readSet.has(notif.id_notificacion) ? 0 : 1),
        0
    ), [notifications, readSet]);
    
    const openMenu = Boolean(anchorElMenu);
    const openNotif = Boolean(anchorElNotif);

    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate(isAuthenticated ? '/dashboard' : '/'); 
    };
    
    // --- Lógica del Menú de Perfil ---
    const handleMenuOpen = (event) => {
        setAnchorElMenu(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorElMenu(null);
    };

    const handleProfileClick = () => {
        navigate('/perfil');
        handleMenuClose(); 
    };

    const handleLogoutClick = () => {
        onLogout();
        handleMenuClose();
    };

    const getInitials = (name) => {
    // ... (tu función getInitials sin cambios) ...
        if (!name) return 'U';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // -----------------------------------------------------------------
    // ⚙️ 3. Lógica de Notificaciones (FETCH) ACTUALIZADA
    // -----------------------------------------------------------------
    const fetchNotifications = useCallback(async (showSpinner = false) => {
        if (!isAuthenticated) return;

        // Solo muestra el spinner si se lo pedimos (al hacer clic)
        if (showSpinner) {
            setLoadingNotif(true);
        }

        // ⚙️ 3a. Obtenemos el token para la autenticación
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("No se encontró token. No se pueden cargar notificaciones.");
            return; 
        }

        try {
            // ⚙️ 3b. Usamos la URL real y el token
            const response = await fetch(`${VITE_API_URL_BACKEND}/notificaciones/${currentUser.id_usuario}`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
            });
            
            if (!response.ok) {
                // Manejo de error de la API
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al cargar notificaciones');
            }

            // ⚙️ 3d. Usamos los datos reales de la API
            const data = await response.json(); 
            setNotifications((prev) => {
                const merged = mergeNotificationsLists(prev, data);
                persistNotificationsHistory(merged);
                return merged;
            });

        } catch (error) {
            console.error("Fallo al obtener notificaciones:", error);
        } finally {
            // ⚙️ 3e. Solo quitamos el spinner si se mostró
            if (showSpinner) {
                setLoadingNotif(false);
            }
        }
    }, [isAuthenticated, currentUser?.id_usuario, persistNotificationsHistory]);


    // -----------------------------------------------------------------
    // ⚙️ 4. NUEVO: useEffect para carga inicial y Polling (auto-refresco)
    // -----------------------------------------------------------------
    useEffect(() => {
        if (isAuthenticated) {
            // 1. Cargar notificaciones inmediatamente al montar/autenticar
            fetchNotifications(false); // false = no mostrar spinner

            // 2. Establecer un intervalo para refrescar cada 30 segundos
            const intervalId = setInterval(() => {
                fetchNotifications(false); // Carga en segundo plano
            }, 30000); // 30000 ms = 30 segundos

            // 3. Limpiar el intervalo cuando el componente se desmonte
            //    o cuando el usuario cierre sesión (isAuthenticated cambie).
            return () => clearInterval(intervalId);
        } else {
            // Si el usuario cierra sesión, limpia las notificaciones
            setNotifications([]);
            setReadNotificationIds([]);
        }
    }, [isAuthenticated, fetchNotifications]);


    // ⚙️ 5. Lógica de clic actualizada
    const handleNotifOpen = (event) => {
        setAnchorElNotif(event.currentTarget);
        // Carga las notificaciones y MUESTRA el spinner al hacer clic
        fetchNotifications(true);
    };

    const handleNotifClose = () => {
        setAnchorElNotif(null);
    };
    const handleNotificationItemClick = (notifId) => {
        markNotificationAsRead(notifId);
        handleNotifClose();
    };


    return (
        <>
            <AppBar 
                position="sticky" 
                elevation={0}
                sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(25, 118, 210, 0.1)'
                }}
            >
                <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1 }}> 
                    
                    {/* ... (Logo y Título sin cambios) ... */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8, transition: '0.2s' }
                        }}
                        onClick={handleLogoClick}
                    >
                        <img 
                            src={IMPALogo} 
                            alt="IMPA Logo" 
                            style={{ width: 70, height: 70, marginRight: '8px', objectFit: 'contain' }} 
                        /> 
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: '600', 
                                color: '#00799B', 
                                marginLeft: 2, 
                                letterSpacing: '2px', 
                                display: { xs: 'none', sm: 'block' } // Oculto en 'xs'
                            }}
                        >
                            INSTITUTO MORELIANO DE PROTECCIÓN ANIMAL
                        </Typography>
                        
                        <Typography 
                            variant="h4"
                            component="h1" 
                            sx={{ 
                                fontWeight: '600', 
                                color: '#00799B', 
                                marginLeft: 2, 
                                letterSpacing: '2px', 
                                display: { xs: 'block', sm: 'none' } // Visible en 'xs', oculto en 'sm'
                            }}
                        >
                            IMPA
                        </Typography>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }} /> 
                    
                    {/* Controles de usuario */}
                    {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* 🔔 Campanita de Notificaciones */}
                            <IconButton
                                size="large"
                                aria-label={`show ${badgeContent} new notifications`}
                                color="inherit"
                                onClick={handleNotifOpen}
                                sx={{ mr: 1.5, color: 'text.secondary' }}
                            >
                                {/* ⚙️ 6. Este contador ahora se actualiza solo */}
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
                                    sx: { width: 320, maxHeight: 400 } // Tamaño fijo para el menú
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
                                            onClick={() => handleNotificationItemClick(notif.id_notificacion)} 
                                            sx={{ 
                                                whiteSpace: 'normal', 
                                                display: 'block', 
                                                py: 1.5, 
                                                px: 2,
                                                bgcolor: readSet.has(notif.id_notificacion) ? 'transparent' : 'rgba(25,118,210,0.08)'
                                            }}
                                        >
                                            <Typography 
                                                variant="body1" 
                                                sx={{ fontWeight: 600, mb: 0.5 }}
                                                color={readSet.has(notif.id_notificacion) ? 'text.secondary' : 'text.primary'}
                                            >
                                                {notif.titulo}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {notif.mensaje} {/* <-- Confirmado */}
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
                                
                            {/* ------------------------------------------------- */}
                            {/* ⚙️ 8. AVATAR (Confirmado) */}
                            {/* ------------------------------------------------- */}
                            <IconButton
                                onClick={handleMenuOpen}
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={openMenu ? 'menu-appbar' : undefined}
                                aria-haspopup="true"
                                color="inherit"
                                sx={{ p: 0 }}
                            >
                                <Avatar
                                    alt={currentUser?.nombre}
                                    src={sanitizeBase64Image(currentUser?.foto_perfil_base64) || undefined}
                                    sx={{
                                        bgcolor: currentUser?.foto_perfil_base64 ? 'transparent' : stringToColor(currentUser?.nombre || 'usuario'),
                                        width: 40,
                                        height: 40,
                                        color: currentUser?.foto_perfil_base64 ? 'inherit' : '#ffffff',
                                    }}
                                >
                                    {!currentUser?.foto_perfil_base64 && (
                                        getInitials(currentUser?.nombre)
                                    )}
                                </Avatar>
                            </IconButton>
                            
                            {/* Menú de Perfil */}
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElMenu}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={openMenu}
                                onClose={handleMenuClose}
                            >
                                <MenuItem disabled>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Hola, {currentUser?.nombre || 'Usuario'}
                                    </Typography>
                                </MenuItem>
                                <Divider sx={{ my: 0.5 }} /> 
                                <MenuItem onClick={handleProfileClick}>
                                    <AccountCircle fontSize="small" sx={{ mr: 1 }} />
                                    Mi Perfil
                                </MenuItem>
                                <MenuItem onClick={handleLogoutClick}>
                                    <Logout fontSize="small" sx={{ mr: 1 }} />
                                    Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        // Botón de Login
                        <Button 
                            variant="contained" 
                            startIcon={<Login />} 
                            onClick={onOpenLoginModal}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            Acceder
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            
        </>
    );
};

export default PublicNavbar;
