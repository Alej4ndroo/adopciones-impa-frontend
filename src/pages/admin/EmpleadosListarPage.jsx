// src/components/admin/EmpleadosListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert, Chip,
    Drawer, IconButton, List, ListItem, ListItemText, useTheme, Divider,
    Button, Grid
} from '@mui/material';
import { LayoutDashboard } from 'lucide-react';
import { Person, Visibility, Close, Phone, Email, LocationOn } from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const EMPLEADOS_ENDPOINT = '/empleados/listar';

// --- 1. Componente para mostrar el detalle completo (Dentro de un Drawer) ---
const EmployeeDetailDrawer = ({ empleado, open, onClose, isManagementView }) => {
    if (!empleado) return null;

    // Supongamos que la dirección viene en este formato (adaptar a tu modelo real)
    const fullAddress = empleado.usuarios.direccion
        ? `${empleado.usuarios.direccion.calle || ''} ${empleado.usuarios.direccion.numero_exterior || ''}, ${empleado.usuarios.direccion.colonia || ''}, ${empleado.usuarios.direccion.ciudad || ''}, C.P. ${empleado.usuarios.direccion.codigo_postal || ''}`.trim()
        : 'Dirección no registrada';

    return (
        <Drawer
            anchor="right" // Abre desde la derecha
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, p: 3 },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="div">
                    Detalles de {empleado.usuarios.nombre}
                </Typography>
                <IconButton onClick={onClose} size="large">
                    <Close />
                </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Información de Contacto y General
                    </Typography>
                    <List disablePadding>
                        <ListItem disablePadding>
                            <ListItemText primary={`No. Empleado: ${empleado.numero_empleado || 'N/A'}`} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary={`Email: ${empleado.usuarios.correo_electronico}`} secondary={<Email fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary={`Teléfono: ${empleado.telefono || 'N/A'}`} secondary={<Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText
                                primary="Roles:"
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        {empleado.usuarios.roles && empleado.usuarios.roles.length > 0
                                            ? empleado.usuarios.roles.map((rol, index) => (
                                                <Chip
                                                    key={index}
                                                    label={rol.nombre || rol}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ mr: 1, mb: 1 }}
                                                />
                                            ))
                                            : <Chip label="Sin Roles" size="small" />
                                        }
                                    </Box>
                                }
                            />
                        </ListItem>
                    </List>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Información Profesional
                    </Typography>
                    <List disablePadding>
                        <ListItem disablePadding>
                            <ListItemText primary={`Licenciatura: ${empleado.licenciatura || 'N/A'}`} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary={`Cédula Profesional: ${empleado.cedula_profesional || 'N/A'}`} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary={`Especialidad: ${empleado.especialidad || 'N/A'}`} />
                        </ListItem>
                    </List>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Dirección
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                            {fullAddress}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {isManagementView && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button variant="contained" color="primary">
                        Editar Empleado
                    </Button>
                </Box>
            )}
        </Drawer>
    );
};
// --------------------------------------------------------------------------

const EmpleadosListarPage = ({ isManagementView = false }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para el Drawer
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);

    const theme = useTheme();

    const fetchEmpleados = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${EMPLEADOS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedEmpleados = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.empleados)
                    ? response.data.empleados
                    : [];

            setEmpleados(receivedEmpleados);
        } catch (err) {
            // ... (Manejo de errores simplificado)
            setError("Error al cargar los empleados. Verifique la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmpleados(); }, []);

    // Funciones para manejar el Drawer
    const handleOpenDrawer = (empleado) => {
        setSelectedEmpleado(empleado);
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedEmpleado(null); // Limpia el estado
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando empleados...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!empleados.length) {
        return <Alert severity="info" sx={{ mt: 2 }}>No se encontraron empleados en el sistema.</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.dark }}>
                <LayoutDashboard size={30} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Lista de Empleados
            </Typography>
            
            <Divider sx={{ mb: 4 }} />

            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de empleados">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>Correo</TableCell>
                            <TableCell>Especialidad</TableCell>
                            <TableCell align="center">Ver Detalles</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {empleados.map(empleado => (
                            <TableRow
                                key={empleado.numero_empleado || empleado.id}
                                hover
                            // Hacemos toda la fila clickeable (o solo el botón de abajo)
                            // onClick={() => handleOpenDrawer(empleado)} 
                            // sx={{ cursor: 'pointer' }}
                            >
                                <TableCell sx={{ fontWeight: 500 }}>{empleado.numero_empleado || empleado.id}</TableCell>
                                <TableCell>
                                    {empleado.usuarios.nombre}
                                </TableCell>
                                <TableCell>{empleado.usuarios.correo_electronico || empleado.correo}</TableCell>
                                <TableCell>{empleado.especialidad || 'N/A'}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        aria-label="ver detalles"
                                        onClick={() => handleOpenDrawer(empleado)}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invocación del Cajón de Detalles */}
            <EmployeeDetailDrawer
                empleado={selectedEmpleado}
                open={openDrawer}
                onClose={handleCloseDrawer}
                isManagementView={isManagementView}
            />
        </Box>
    );
};

export default EmpleadosListarPage;