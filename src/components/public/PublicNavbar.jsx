// src/components/layout/PublicNavbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, Box, Avatar, Fade, 
    IconButton, Modal, Menu, MenuItem, Badge, Divider, CircularProgress
} from '@mui/material';
import { Login, Close, Logout, Notifications, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoginMUI from '../auth/LoginMUI'; 
import IMPALogo from '../../assets/img/logo_impa_azul.png'; 

// Función para generar un color aleatorio (pastel o vibrante, ajusta según necesidad)
const stringToColor = (string) => {
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

const PublicNavbar = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout }) => {
    const [openModal, setOpenModal] = useState(false); 
    const [anchorElMenu, setAnchorElMenu] = useState(null); // Menú de Perfil
    const [anchorElNotif, setAnchorElNotif] = useState(null); // Menú de Notificaciones

    // Estados para Notificaciones
    const [notifications, setNotifications] = useState([]);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const badgeContent = notifications.length; // Contador de notificaciones
    
    const openMenu = Boolean(anchorElMenu);
    const openNotif = Boolean(anchorElNotif);

    const navigate = useNavigate();

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const handleModalLoginSuccess = (user) => {
        onLoginSuccess(user);
        handleClose();
    };

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

    const handleLogoutClick = () => {
        onLogout();
        handleMenuClose();
    };

    // Lógica para obtener las iniciales del usuario
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // --- Lógica de Notificaciones (FETCH) ---
    // Usamos useCallback para que la función sea estable
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoadingNotif(true);
        // NOTA: Reemplaza 'http://localhost:3000' por tu base URL real
        // y añade la lógica de autenticación (ej: token en headers)
        try {
            const response = await fetch('/notificaciones', { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${tokenDeUsuario}` // Si usas JWT
                },
            });
            
            // Simulación de delay y respuesta para entorno de prueba
            await new Promise(resolve => setTimeout(resolve, 500)); 

            if (!response.ok) {
                // Manejo de error de la API
                throw new Error('Error al cargar notificaciones');
            }

            // Aquí asumo que tu API devuelve un JSON como este:
            // [{ id: 1, mensaje: 'Nuevo reporte creado' }, ...]
            const data = await response.json(); 
            // setNotifications(data); // Usa esto con tu API real

            // **Datos simulados para demostración:**
            setNotifications([
                { id: 1, mensaje: 'Tienes 2 nuevas solicitudes de adopción.' },
                { id: 2, mensaje: 'El reporte #123 ha sido actualizado.' },
                { id: 3, mensaje: 'Reunión de equipo a las 10:00 AM.' },
            ]);

        } catch (error) {
            console.error("Fallo al obtener notificaciones:", error);
            // setNotifications([]); // Limpia o maneja el error visualmente
        } finally {
            setLoadingNotif(false);
        }
    }, [isAuthenticated]);

    // Lógica para abrir/cerrar el menú de notificaciones y hacer fetch al abrir
    const handleNotifOpen = (event) => {
        setAnchorElNotif(event.currentTarget);
        // Cargar notificaciones solo si están vacías o al abrir
        if (notifications.length === 0 && isAuthenticated) {
             fetchNotifications();
        }
    };

    const handleNotifClose = () => {
        setAnchorElNotif(null);
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
                    
                    {/* 🎯 Logo clickeable */}
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
                        
                        {/* 2. Texto para Móvil (sólo xs) */}
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
                    
                    {/* Espaciador */}
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
                                            key={notif.id} 
                                            onClick={handleNotifClose} // Al hacer clic, cierras el menú (y puedes marcar como leído)
                                            sx={{ whiteSpace: 'normal' }}
                                        >
                                            <Typography variant="body2">
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
                                
                            {/* Avatar / Icono de Perfil */}
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
                                    src={currentUser?.fotoPerfil || ''}
                                    sx={{
                                        bgcolor: currentUser?.fotoPerfil ? 'transparent' : stringToColor(currentUser?.nombre || 'usuario'),
                                        width: 40,
                                        height: 40,
                                        color: currentUser?.fotoPerfil ? 'inherit' : '#ffffff',
                                    }}
                                >
                                    {!currentUser?.fotoPerfil && (
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
                                <MenuItem onClick={handleLogoutClick}>
                                    <Logout fontSize="small" sx={{ mr: 1 }} />
                                    Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Button 
                            variant="contained" 
                            startIcon={<Login />} 
                            onClick={handleOpen}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            Acceder
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            
            {/* Modal de Login (sin cambios) */}
            <Modal open={openModal} onClose={handleClose}>
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
                            onClick={handleClose}
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
                        <LoginMUI onLoginSuccess={handleModalLoginSuccess} />
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default PublicNavbar;