import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Chip, Avatar } from '@mui/material';
import { UserCircle, Bell, LogOut, Menu as MenuIcon } from 'lucide-react';

const NavbarMUI = ({ sidebarWidth, currentUser, onLogout, onDrawerToggle }) => {
    const navigate = useNavigate();
    const [fotoPerfil, setFotoPerfil] = useState(null);

    console.log('NavbarMUI - currentUser:', currentUser);
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
    }, [currentUser]); // 🔹 se ejecuta cuando cambia currentUser

    const userName = currentUser?.nombre || 'Empleado';
    const greeting = `Bienvenid@, ${userName}`;
    const notificationCount = 3;

    const handleProfileClick = () => navigate('/dashboard/perfil');

    return (
        <AppBar
            position="fixed"
            sx={{
                height: 70,
                width: { sm: `calc(100% - ${sidebarWidth}px)` },
                ml: { sm: `${sidebarWidth}px` },
                backgroundColor: '#1565C0',
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
                    <IconButton color="inherit" sx={{ position: 'relative' }}>
                        <Bell size={24} color="#ffffffff" />
                        {notificationCount > 0 && (
                            <Chip
                                label={notificationCount}
                                size="small"
                                color="error"
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    height: 16,
                                    borderRadius: '8px',
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold',
                                }}
                            />
                        )}
                    </IconButton>

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
