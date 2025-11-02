import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Collapse, Box
} from '@mui/material';
import { NavLink } from 'react-router-dom'; // ⬅️ Importación clave para la navegación

import {
    // Íconos Principales
    User, Stethoscope, BarChart2, FileText, BookOpen, Smile, 
    Heart, Home, ChevronDown, ChevronUp, Eye, Plus, Pencil, Trash2, Briefcase, // ⬅️ Nuevo para Empleados
    Users
} from 'lucide-react';

// Ajuste de tamaño
const drawerWidth = 300; 
// Ajusta la ruta del logo si es necesario.
import IMPALogo from '../../assets/img/logo_impa.png'; 

// 🔑 MAPEO DE RUTAS: Define la URL final para cada submenú.
const routeMap = {
    // Dashboard / Inicio
    'Panel de Control': '/dashboard', // Ruta del Dashboard principal
    
    // EMPLEADOS
    'Ver Empleados': '/dashboard/empleados/ver',
    'Crear Empleado': '/dashboard/empleados/crear',
    'Gestionar Empleados': '/dashboard/empleados/gestion',
    
    // PERSONAS
    'Ver Clientes': '/dashboard/personas/ver',
    'Crear Cliente': '/dashboard/personas/crear',
    'Gestionar Clientes': '/dashboard/personas/gestion',
    
    // Mascotas
    'Ver Mascotas': '/dashboard/mascotas/ver',
    'Registrar Mascota': '/dashboard/mascotas/registrar',
    'Editar/Eliminar Mascota': '/dashboard/mascotas/gestion',
    
    // Citas
    'Ver Citas': '/dashboard/citas/ver',
    'Nueva Cita': '/dashboard/citas/crear',
    'Editar/Cancelar': '/dashboard/citas/gestion',
    
    // Adopciones
    'Ver Solicitudes': '/dashboard/adopciones/ver',
    'Aprobar/Rechazar': '/dashboard/adopciones/gestion',
    'Crear Adopción': '/dashboard/adopciones/crear',

    // Consultas Médicas
    'Ver Consultas': '/dashboard/consultas/ver',
    'Crear Consulta': '/dashboard/consultas/crear',
    'Editar Consulta': '/dashboard/consultas/editar',

    // Expedientes
    'Ver Expedientes': '/dashboard/expedientes/ver',
    'Crear Expediente': '/dashboard/expedientes/crear',
    'Editar Expediente': '/dashboard/expedientes/editar',

    // Documentos
    'Ver Documentos': '/dashboard/documentos/ver',
    'Verificar Documento': '/dashboard/documentos/verificar',
    
    // Notificaciones
    'Ver Notificacion': '/dashboard/notificaciones/ver', // Ajusta el nombre si es diferente
    'Crear Notificacion': '/dashboard/notificaciones/crear',
};


// 🔑 LÓGICA DE ICONOS DE ACCIÓN (La función que ya tenías)
const getIconAndColorForSubmenu = (name) => {
    // ... (Tu lógica de colores y tipos de icono)
    const lowerName = name.toLowerCase();
  

    // 1. ELIMINAR/CANCELAR/RECHAZAR (ROJO)
    if (lowerName.includes('eliminar') || lowerName.includes('cancelar') || lowerName.includes('rechazar')) {
        return { Icon: Trash2, color: '#F44336' }; // Rojo
    }
    // 2. CREAR/NUEVO/REGISTRAR/APROBAR/VERIFICAR (AZUL)
    if (lowerName.includes('crear') || lowerName.includes('nuevo') || lowerName.includes('registrar') || lowerName.includes('aprobar') || lowerName.includes('verificar')) {
        return { Icon: Plus, color: '#2196F3' }; // Azul
    }
    // 3. EDITAR (AMARILLO)
    if (lowerName.includes('editar')) {
        return { Icon: Pencil, color: '#FFC107' }; // Amarillo/Ámbar
    }
    // 4. VER (VERDE)
    if (lowerName.includes('ver') || lowerName.includes('solicitudes')) {
        return { Icon: Eye, color: '#4CAF50' }; // Verde
    }
    
    // Fallback (gris)
    return { Icon: Plus, color: '#757575' };
};


// 🔑 MAPA COMPLETO DE PERMISOS (sin cambios, solo se asegura la estructura)
const menuItems = [
    { 
        name: 'Dashboard', 
        icon: Home, 
        route: routeMap['Panel de Control'],
        requiredPermissions: ['ver_usuario', 'ver_mascota'], // Mínimo para ver el Dashboard
    },
    { 
        name: 'Empleados', 
        icon: Briefcase,
        requiredPermissions: ['ver_empleado', 'crear_empleado', 'editar_empleado'],
        subMenu: [
            { name: 'Ver Empleados', requiredPermissions: ['ver_empleado'] },
            { name: 'Crear Empleado', requiredPermissions: ['crear_empleado'] },
            { name: 'Gestionar Empleados', requiredPermissions: ['editar_empleado', 'eliminar_empleado'] },
        ] 
    },
    { 
        name: 'Clientes', 
        icon: Users,
        requiredPermissions: ['ver_persona', 'crear_persona', 'editar_persona'],
        subMenu: [
            { name: 'Ver Clientes', requiredPermissions: ['ver_persona'] },
            { name: 'Crear Cliente', requiredPermissions: ['crear_persona'] },
            { name: 'Gestionar Clientes', requiredPermissions: ['editar_persona', 'eliminar_persona'] },
        ] 
    },
    { 
    name: 'Mascotas', 
    icon: Heart, 
    requiredPermissions: ['ver_mascota', 'crear_mascota'], 
    subMenu: [
      { name: 'Ver Mascotas', requiredPermissions: ['ver_mascota'] },
      { name: 'Registrar Mascota', requiredPermissions: ['crear_mascota'] },
      { name: 'Editar/Eliminar', requiredPermissions: ['editar_mascota', 'eliminar_mascota'] },
    ] 
  },
  { 
    name: 'Citas', 
    icon: Stethoscope, 
    requiredPermissions: ['ver_cita', 'crear_cita'], 
    subMenu: [
      { name: 'Ver Citas', requiredPermissions: ['ver_cita'] },
      { name: 'Nueva Cita', requiredPermissions: ['crear_cita'] },
      { name: 'Editar/Cancelar', requiredPermissions: ['editar_cita', 'cancelar_cita'] },
    ] 
  },
  { 
    name: 'Adopciones', 
    icon: Home, 
    requiredPermissions: ['ver_adopcion', 'aprobar_adopcion'], 
    subMenu: [
      { name: 'Ver Solicitudes', requiredPermissions: ['ver_adopcion'] },
      { name: 'Aprobar/Rechazar', requiredPermissions: ['aprobar_adopcion', 'rechazar_adopcion'] },
      { name: 'Crear Adopción', requiredPermissions: ['crear_adopcion'] },
    ] 
  },
  { 
    name: 'Consultas Médicas', 
    icon: BarChart2, 
    requiredPermissions: ['ver_consulta', 'crear_consulta'], 
    subMenu: [
      { name: 'Ver Consultas', requiredPermissions: ['ver_consulta'] },
      { name: 'Crear Consulta', requiredPermissions: ['crear_consulta'] },
      { name: 'Editar Consulta', requiredPermissions: ['editar_consulta'] },
    ] 
  },
  { 
    name: 'Expedientes', 
    icon: FileText, 
    requiredPermissions: ['ver_expediente'], 
    subMenu: [
      { name: 'Ver Expedientes', requiredPermissions: ['ver_expediente'] },
      { name: 'Crear Expediente', requiredPermissions: ['crear_expediente'] },
      { name: 'Editar Expediente', requiredPermissions: ['editar_expediente'] },
    ] 
  },
  { 
    name: 'Documentos', 
    icon: BookOpen, 
    requiredPermissions: ['ver_documento'], 
    subMenu: [
      { name: 'Ver Documentos', requiredPermissions: ['ver_documento'] },
      { name: 'Verificar Documento', requiredPermissions: ['verificar_documento', 'rechazar_documento'] },
    ] 
  },
  { name: 'Notificaciones', icon: Smile, requiredPermissions: ['ver_notificacion', 'crear_notificacion'] },
];

const SidebarMUI = ({ userPermissions = [] }) => {
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (name) => {
    setOpenSubMenus(prevOpen => {
      const isCurrentlyOpen = prevOpen[name];
      // Cierra todos los menús y solo abre el nuevo.
      // Si el que se clickeó ya estaba abierto, lo cierra y no abre ninguno.
      return isCurrentlyOpen ? {} : { [name]: true };
    });
  };
  
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const userPerms = new Set(userPermissions);
    return requiredPermissions.some(perm => userPerms.has(perm));
  };
  
  const filterSubMenu = (subMenuItems) => {
      if (!subMenuItems) return [];
      return subMenuItems.filter(subItem => hasPermission(subItem.requiredPermissions));
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          boxShadow: 3,
          zIndex: 100,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* Encabezado con Logo IMPA */}
      <Box sx={{ 
          height: 70,
          padding: '16px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#1565C0',
      }}>
        <img src={IMPALogo} alt="IMPA Logo" style={{ width: 60, height: 60, marginRight: '8px', objectFit: 'contain' }} /> 
        <Typography 
          variant="h5" 
          component="h1" 
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
          
          // Verificar permisos para el ítem principal
          const showParent = hasPermission(item.requiredPermissions) || hasVisibleSubMenu;

          if (!showParent) return null;

          const IconComponent = item.icon;
          const isOpen = openSubMenus[item.name];

          return (
            <React.Fragment key={item.name}>
              {/* Item Principal */}
              <ListItem disablePadding>
                <ListItemButton 
                  // 🔑 Navegación del elemento padre: usa NavLink si no tiene submenú o si es el Dashboard
                  component={!hasVisibleSubMenu && item.route ? NavLink : 'div'} 
                  to={item.route || '#'} // Si no hay ruta, es solo un contenedor de submenús
                  onClick={() => hasVisibleSubMenu && toggleSubMenu(item.name)}
                  sx={{ py: 1.5, px: 3,
                      // Estilo activo para el NavLink 
                      '&.active': {
                          backgroundColor: '#e3f2fd', // Color azul claro para el ítem activo
                          borderRight: '4px solid #1976d2', // Línea azul de resaltado
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
                      // 🔑 Obtener la ruta del mapa de rutas
                      const destinationPath = routeMap[subItem.name] || '#'; 

                      return (
                        <ListItem key={subItem.name} disablePadding sx={{ pl: 6 }}>
                          <ListItemButton
                            component={NavLink} // ⬅️ Usa NavLink para navegar
                            to={destinationPath} // ⬅️ Usa la ruta definida
                            sx={{ 
                                py: 1,
                                // Estilo activo para el NavLink
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
    </Drawer>
  );
};

export default SidebarMUI;