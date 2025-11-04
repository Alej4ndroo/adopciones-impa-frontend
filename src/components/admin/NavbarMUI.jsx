import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Chip } from '@mui/material';
// 1. ⬅️ Importa el ícono del menú (hamburguesa)
import { UserCircle, Bell, LogOut, Menu as MenuIcon } from 'lucide-react';

// 2. ⬅️ Acepta el prop 'onDrawerToggle'
const NavbarMUI = ({ sidebarWidth, currentUser, onLogout, onDrawerToggle }) => {
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
                // 3. ⬅️ Ancho y Margen Responsivos
                width: { sm: `calc(100% - ${sidebarWidth}px)` }, 
                ml: { sm: `${sidebarWidth}px` }, 
                // En móvil (xs), width será 100% y ml será 0 por defecto
                
                backgroundColor: '#1565C0', 
                boxShadow: 2, 
                color: 'white',
                
                // 4. ⬅️ zIndex para estar sobre el Sidebar permanente
                zIndex: 1200, 
            }}
        >
            <Toolbar 
                sx={{ 
                    justifyContent: 'space-between', 
                    minHeight: '64px !important', 
                    paddingY: 1, 
                }}
            >
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* --- 5. BOTÓN DE HAMBURGUESA (MÓVIL) --- */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onDrawerToggle} // ⬅️ Llama a la función del padre
                        sx={{ 
                            mr: 2, 
                            display: { xs: 'flex', sm: 'none' } // ⬅️ SOLO se muestra en móvil
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Saludo - Oculto en móvil */}
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 500,
                            // 6. ⬅️ Oculta el saludo en 'xs' para dar espacio
                            display: { xs: 'none', sm: 'block' } 
                        }}
                    >
                        {greeting}
                    </Typography>
                </Box>

                {/* Controles de Usuario y Notificaciones (Sin cambios) */}
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
                        onClick={handleProfileClick}
                    >
                        <UserCircle size={30} color="#ffffffff" />
                    </IconButton>
                    
                    {/* Botón de Cerrar Sesión */}
                    <Button 
                        variant="outlined" 
                        // @ts-ignore
                        color="white" // 'white' no es un color de MUI, pero funciona con 'inherit'
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