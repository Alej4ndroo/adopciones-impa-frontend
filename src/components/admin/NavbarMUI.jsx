import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Chip } from '@mui/material';
import { UserCircle, Bell, LogOut } from 'lucide-react';

// Se elimina la dependencia y la función getGreeting de date-fns

const NavbarMUI = ({ sidebarWidth, currentUser, onLogout }) => {
    // Definición simple del saludo
    const navigate = useNavigate();

    const userName = currentUser?.nombre || 'Empleado'; 
    const greeting = `Bienvenid@, ${userName}`;
    
    // Simulación de notificaciones
    const notificationCount = 3; 

    const handleProfileClick = () => {
        navigate('/dashboard/perfil');
    };
    
    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                height: 70,
                width: `calc(100% - ${sidebarWidth}px)`, 
                ml: `${sidebarWidth}px`, 
                backgroundColor: '#1565C0', 
                boxShadow: 2, 
                color: 'white'
            }}
        >
            <Toolbar 
                sx={{ 
                    justifyContent: 'space-between', 
                    // 🔑 AJUSTE CRUCIAL: Mantener la altura para alineación con la Sidebar
                    minHeight: '64px !important', 
                    paddingY: 1, 
                }}
            >
                
                {/* Saludo Único y Centrado */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, }}>
                        {greeting}
                    </Typography>
                </Box>

                {/* Controles de Usuario y Notificaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    
                    {/* Botón de Notificaciones */}
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
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                    </IconButton>

                    {/* Ícono de Perfil */}
                    <IconButton 
                        color="inherit" 
                        sx={{ p: 0 }}
                        onClick={handleProfileClick} // 👈 Agrega el manejador de clic
                    >
                        <UserCircle size={30} color="#ffffffff" />
                    </IconButton>
                    
                    {/* Botón de Cerrar Sesión */}
                    <Button 
                        variant="outlined" 
                        color="white" 
                        size="small"
                        startIcon={<LogOut size={18} />}
                        onClick={onLogout}
                        sx={{ ml: 1 }}
                    >
                        Salir
                    </Button>

                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarMUI;