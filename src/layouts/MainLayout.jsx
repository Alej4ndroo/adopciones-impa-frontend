// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavbarMUI from '../components/admin/NavbarMUI';
import SidebarMUI from '../components/admin/SidebarMUI';

const drawerWidth = 300;

const MainLayout = ({ currentUser, onLogout, onProfileUpdate}) => { 
  const userPermissions = currentUser?.permisos || [];
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) {
      localStorage.setItem('lastDashboardPath', location.pathname);
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <NavbarMUI 
        sidebarWidth={drawerWidth} 
        currentUser={currentUser}
        onLogout={onLogout} 
        onDrawerToggle={handleDrawerToggle}
      /> 

      <SidebarMUI 
        userPermissions={userPermissions} 
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle}
      />
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f5f5f5', 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar /> 
        <Outlet context={{ onProfileUpdate, currentUser }} />
      </Box>
    </Box>
  );
};

export default MainLayout;