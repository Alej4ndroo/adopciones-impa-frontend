import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Collapse, Box
} from '@mui/material';
import { NavLink } from 'react-router-dom'; 

import {
    // Íconos Principales
    User, Stethoscope, BarChart2, FileText, BookOpen, Smile, 
    Heart, Home, ChevronDown, ChevronUp, Eye, Plus, Pencil, Trash2, Briefcase, 
    Users
} from 'lucide-react';

import IMPALogo from '../../assets/img/logo_impa.png'; 

// --- (Tu lógica de routeMap, getIconAndColor, y menuItems se mantiene igual) ---
const routeMap = {
    'Panel de Control': '/dashboard',
    'Ver Empleados': '/dashboard/empleados/ver',
    'Crear Empleado': '/dashboard/empleados/crear',
    'Gestionar Empleados': '/dashboard/empleados/gestion',
    'Ver Clientes': '/dashboard/personas/ver',
    'Crear Cliente': '/dashboard/personas/crear',
    'Gestionar Clientes': '/dashboard/personas/gestion',
    'Ver Mascotas': '/dashboard/mascotas/ver',
    'Registrar Mascota': '/dashboard/mascotas/registrar',
    'Ver Citas': '/dashboard/citas/ver',
    'Nueva Cita': '/dashboard/citas/crear',
    'Ver Solicitudes': '/dashboard/adopciones/ver',
    'Crear Adopción': '/dashboard/adopciones/crear',
    'Ver Consultas': '/dashboard/consultas/ver',
    'Crear Consulta': '/dashboard/consultas/crear',
    'Ver Servicios': '/dashboard/servicios/ver',
    'Nuevo Servicio': '/dashboard/servicios/crear',
    'Ver Seguimientos': '/dashboard/seguimientos/ver',
    'Ver Documentos': '/dashboard/documentos/ver',
    'Verificar Documento': '/dashboard/documentos/verificar',
};

const getIconAndColorForSubmenu = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('eliminar') || lowerName.includes('cancelar') || lowerName.includes('rechazar')) {
        return { Icon: Trash2, color: '#F44336' };
    }
    if (lowerName.includes('crear') || lowerName.includes('nuevo') || lowerName.includes('nueva') || lowerName.includes('registrar') || lowerName.includes('aprobar') || lowerName.includes('verificar')) {
        return { Icon: Plus, color: '#2196F3' };
    }
    if (lowerName.includes('editar')) {
        return { Icon: Pencil, color: '#FFC107' };
    }
    if (lowerName.includes('ver') || lowerName.includes('solicitudes')) {
        return { Icon: Eye, color: '#4CAF50' };
    }
    return { Icon: Plus, color: '#757575' };
};

const menuItems = [
    { name: 'Dashboard', icon: Home, route: routeMap['Panel de Control'], requiredPermissions: ['ver_usuario', 'ver_mascota'] },
    { name: 'Empleados', icon: Briefcase, requiredPermissions: ['ver_empleado', 'crear_empleado', 'editar_empleado'], subMenu: [
            { name: 'Ver Empleados', requiredPermissions: ['ver_empleado'] },
            { name: 'Crear Empleado', requiredPermissions: ['crear_empleado'] },
    ] },
    { name: 'Clientes', icon: Users, requiredPermissions: ['ver_usuario', 'crear_usuario', 'editar_usuario'], subMenu: [
            { name: 'Ver Clientes', requiredPermissions: ['ver_usuario'] },
            { name: 'Crear Cliente', requiredPermissions: ['crear_usuario'] },
    ] },
    { name: 'Mascotas', icon: Heart, requiredPermissions: ['ver_mascota', 'crear_mascota'], subMenu: [
      { name: 'Ver Mascotas', requiredPermissions: ['ver_mascota'] },
      { name: 'Registrar Mascota', requiredPermissions: ['crear_mascota'] }
    ] },
    { name: 'Citas', icon: Stethoscope, requiredPermissions: ['ver_cita', 'crear_cita'], subMenu: [
      { name: 'Ver Citas', requiredPermissions: ['ver_cita'] },
      { name: 'Nueva Cita', requiredPermissions: ['crear_cita'] }
    ] },
    { name: 'Adopciones', icon: Home, requiredPermissions: ['ver_adopcion', 'aprobar_adopcion'], subMenu: [
      { name: 'Ver Solicitudes', requiredPermissions: ['ver_adopcion'] },
      { name: 'Crear Adopción', requiredPermissions: ['crear_adopcion'] },
    ] },
    { name: 'Consultas Médicas', icon: BarChart2, requiredPermissions: ['ver_consulta', 'crear_consulta'], subMenu: [
      { name: 'Ver Consultas', requiredPermissions: ['ver_consulta'] },
      { name: 'Crear Consulta', requiredPermissions: ['crear_consulta'] }
    ] },
    { name: 'Servicios', icon: FileText, requiredPermissions: [], subMenu: [
      { name: 'Ver Servicios', requiredPermissions: [] },
      { name: 'Nuevo Servicio', requiredPermissions: [] }
    ] },
    { name: 'Seguimientos', icon: Smile, requiredPermissions: ['ver_adopcion'], subMenu: [
      { name: 'Ver Seguimientos', requiredPermissions: ['ver_adopcion'] }
    ] },
];

// --- (Fin de la lógica que no cambia) ---


const SidebarMUI = ({ userPermissions = [], drawerWidth, mobileOpen, onDrawerToggle }) => {
  
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (name) => {
    setOpenSubMenus(prevOpen => {
      const isCurrentlyOpen = prevOpen[name];
      return isCurrentlyOpen ? {} : { [name]: true };
    });
  };
  
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    const userPerms = new Set(userPermissions);
    return requiredPermissions.some(perm => userPerms.has(perm));
  };
  
  const filterSubMenu = (subMenuItems) => {
      if (!subMenuItems) return [];
      return subMenuItems.filter(subItem => hasPermission(subItem.requiredPermissions));
  };

  const drawerContent = (
    <>
      {/* Encabezado con Logo IMPA */}
      <Box sx={{ 
          height: 70, padding: '16px 24px', display: 'flex', 
          alignItems: 'center', backgroundColor: '#1565C0',
      }}>
        <img src={IMPALogo} alt="IMPA Logo" style={{ width: 60, height: 60, marginRight: '8px', objectFit: 'contain' }} /> 
        <Typography 
          variant="h5" component="h1" 
          sx={{ fontWeight: '600', color: 'white', letterSpacing: '2px' }}
        >
          IMPA
        </Typography>
      </Box>
      <Divider />
      
      {/* Menú de Navegación */}
      <List component="nav" sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          
          const filteredSubMenu = filterSubMenu(item.subMenu);
          const hasVisibleSubMenu = filteredSubMenu.length > 0;
          const showParent = hasPermission(item.requiredPermissions) || hasVisibleSubMenu;

          if (!showParent) return null;

          const IconComponent = item.icon;
          const isOpen = openSubMenus[item.name];

          return (
            <React.Fragment key={item.name}>
              {/* Item Principal */}
              <ListItem disablePadding>
                <ListItemButton 
                  component={!hasVisibleSubMenu && item.route ? NavLink : 'div'} 
                  to={item.route || '#'}
                  
                  // 1. ⬅️ ¡CAMBIO AQUÍ!
                  onClick={() => {
                    if (hasVisibleSubMenu) {
                      toggleSubMenu(item.name); // Si tiene submenú, lo abre/cierra
                    
                    // AÑADE ESTA CONDICIÓN
                    } else if (mobileOpen) { 
                      onDrawerToggle(); // Si es un link directo, CIERRA el drawer SÓLO SI ESTÁ EN MÓVIL
                    }
                  }}

                  sx={{ py: 1.5, px: 3,
                      '&.active': {
                          backgroundColor: '#e3f2fd', 
                          borderRight: '4px solid #1976d2', 
                      }
                  }} 
                >
                  <ListItemIcon>
                    <IconComponent size={24} color="#555" /> 
                  </ListItemIcon>
                  <ListItemText primary={<Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{item.name}</Typography>} /> 
                  {hasVisibleSubMenu && (isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </ListItemButton>
              </ListItem>
              
              {/* Submenú Filtrado */}
              {hasVisibleSubMenu && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ backgroundColor: '#fafafa' }}>
                    {filteredSubMenu.map((subItem) => {
                      
                      const { Icon, color } = getIconAndColorForSubmenu(subItem.name);
                      const destinationPath = routeMap[subItem.name] || '#'; 

                      return (
                        <ListItem key={subItem.name} disablePadding sx={{ pl: 6 }}>
                          <ListItemButton
                            component={NavLink}
                            to={destinationPath}
                            
                            // 2. ⬅️ ¡CAMBIO AQUÍ!
                            onClick={() => {
                              if (mobileOpen) {
                                onDrawerToggle();
                              }
                            }} 

                            sx={{
                                py: 1,
                                '&.active': {
                                    backgroundColor: '#e3f2fd', 
                                    fontWeight: 'bold',
                                }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Icon size={18} color={color} />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="body2">{subItem.name}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  // --- (El return con los 2 Drawers se mantiene igual) ---
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* --- DRAWER TEMPORAL (MÓVIL) --- */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle} // Esto lo cierra al hacer clic FUERA
        ModalProps={{
          keepMounted: true, 
        }}
        sx={{
          display: { xs: 'block', sm: 'none' }, 
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: 3, 
            zIndex: 1300, 
          },
        }}
      >
        {drawerContent} 
      </Drawer>

      {/* --- DRAWER PERMANENTE (ESCRITORIO) --- */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' }, 
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            zIndex: 100, 
          },
        }}
        open 
      >
        {drawerContent} 
      </Drawer>
    </Box>
  );
};

export default SidebarMUI;
