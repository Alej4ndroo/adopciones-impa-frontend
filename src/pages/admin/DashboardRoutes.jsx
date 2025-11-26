// src/pages/admin/DashboardRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';

// 🔑 Importa tus páginas
import DashboardPage from './DashboardPage';
import EmpleadosPerfilPage from './EmpleadosPerfilPage';
import EmpleadosListarPage from './EmpleadosListarPage';
import EmpleadosCrearPage from './EmpleadosCrearPage';
import ClientesListarPage from './ClientesListarPage';
import ClientesCrearPage from './ClientesCrearPage';
import MascotasListarPage from './MascotasListarPage';
import MascotasCrearPage from './MascotasCrearPage';
import CitasListarPage from './CitasListarPage';
import CitasCrearPage from './CitasCrearPage';
import AdopcionesListarPage from './AdopcionesListarPage';
import AdopcionesCrearPage from './AdopcionesCrearPage';
import ConsultasListarPage from './ConsultasListarPage';
import ConsultasCrearPage from './ConsultasCrearPage';
import ServiciosListarPage from './ServiciosListarPage';
import ServiciosCrearPage from './ServiciosCrearPage';

// Este componente devuelve un fragmento de rutas, NO <Routes>
const DashboardRoutes = () => (
  <>
    {/* Ruta de inicio/panel principal */}
    <Route index element={<DashboardPage />} />
    
    {/* Perfil */}
    <Route path="perfil" element={<EmpleadosPerfilPage />} />

    {/* Empleados */}
    <Route path="empleados/ver" element={<EmpleadosListarPage />} />
    <Route path="empleados/crear" element={<EmpleadosCrearPage />} />

    {/* Clientes */}
    <Route path="personas/ver" element={<ClientesListarPage />} />
    <Route path="personas/crear" element={<ClientesCrearPage />} />

    {/* Mascotas */}
    <Route path="mascotas/ver" element={<MascotasListarPage />} />
    <Route path="mascotas/registrar" element={<MascotasCrearPage />} />

    {/* Citas */}
    <Route path="citas/ver" element={<CitasListarPage />} />
    <Route path="citas/crear" element={<CitasCrearPage />} />

    {/* Adopciones */}
    <Route path="adopciones/ver" element={<AdopcionesListarPage />} />
    <Route path="adopciones/crear" element={<AdopcionesCrearPage />} />

    {/* Consultas */}
    <Route path="consultas/ver" element={<ConsultasListarPage />} />
    <Route path="consultas/crear" element={<ConsultasCrearPage />} />

    {/* Servicios */}
    <Route path="servicios/ver" element={<ServiciosListarPage />} />
    <Route path="servicios/crear" element={<ServiciosCrearPage />} />

  </>
);

export default DashboardRoutes;
