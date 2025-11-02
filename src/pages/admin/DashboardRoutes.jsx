// src/pages/admin/DashboardRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';

// 🔑 Importa tus páginas
import DashboardPage from './DashboardPage';
import PerfilPage from './PerfilPage';
import EmpleadosListarPage from './EmpleadosListarPage';
import EmpleadosCrearPage from './EmpleadosCrearPage';
import ClientesListarPage from './ClientesListarPage';
import ClientesCrearPage from './ClientesCrearPage';
import MascotasListarPage from './MascotasListarPage';
import MascotasCrearPage from './MascotasCrearPage';
import CitasListPage from './CitasListPage';
import AdopcionesListPage from './AdopcionesListPage';
import ConsultasListarPage from './ConsultasListarPage';
import ConsultasCrearPage from './ConsultasCrearPage';

// Este componente devuelve un fragmento de rutas, NO <Routes>
const DashboardRoutes = () => (
  <>
    {/* Ruta de inicio/panel principal */}
    <Route index element={<DashboardPage />} />
    
    {/* Perfil */}
    <Route path="perfil" element={<PerfilPage />} />

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
    <Route path="citas/ver" element={<CitasListPage />} />

    {/* Adopciones */}
    <Route path="adopciones/ver" element={<AdopcionesListPage />} />

    {/* Consultas */}
    <Route path="consultas/ver" element={<ConsultasListarPage />} />
    <Route path="consultas/crear" element={<ConsultasCrearPage />} />

  </>
);

export default DashboardRoutes;