// src/components/admin/AdopcionesListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, IconButton, Avatar
} from '@mui/material';
import { Pets, Edit, Delete, Person, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const ADOPCIONES_ENDPOINT = '/adopciones/listar'; 

const AdopcionesListarPage = ({ isManagementView = false }) => {
    const [adopciones, setAdopciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAdopciones = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${ADOPCIONES_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // El backend devuelve un array directamente
            const receivedData = Array.isArray(response.data) ? response.data : [];

            if (!receivedData.length) {
                setError("No se encontraron adopciones en el sistema.");
            }

            setAdopciones(receivedData);
        } catch (err) {
            if (err.response) {
                setError(
                    err.response.status === 401 || err.response.status === 403
                        ? "Acceso denegado. No tienes permisos para ver esta lista."
                        : `Error del servidor (${err.response.status}).`
                );
            } else {
                setError("Error de red. Asegúrate de que el backend esté corriendo y accesible.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdopciones(); }, []); 

    // Función para obtener el color del chip según el estado de adopción
    const getEstadoColor = (estado) => {
        const colorMap = {
            'en_proceso': 'warning',
            'completada': 'success',
            'rechazada': 'error',
            'cancelada': 'default',
            'devuelta': 'error'
        };
        return colorMap[estado] || 'default';
    };

    // Función para obtener el color del chip según el estado de solicitud
    const getSolicitudColor = (estado) => {
        const colorMap = {
            'en_revision': 'info',
            'aprobada': 'success',
            'rechazada': 'error',
            'cancelada': 'default'
        };
        return colorMap[estado] || 'default';
    };

    // Función para formatear el estado para mostrar
    const formatEstado = (estado) => {
        return estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
    };

    // Función para obtener el ícono según el estado
    const getEstadoIcon = (estado) => {
        const iconMap = {
            'completada': <CheckCircle sx={{ fontSize: 16 }} />,
            'rechazada': <Cancel sx={{ fontSize: 16 }} />,
            'cancelada': <Cancel sx={{ fontSize: 16 }} />,
            'en_proceso': <HourglassEmpty sx={{ fontSize: 16 }} />,
            'devuelta': <Cancel sx={{ fontSize: 16 }} />
        };
        return iconMap[estado] || null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando adopciones...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    const tableTitle = isManagementView ? 'Gestión de Adopciones' : 'Historial de Adopciones';

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{tableTitle}</Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de adopciones">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Mascota</TableCell>
                            <TableCell>Adoptante</TableCell>
                            <TableCell>Fecha Solicitud</TableCell>
                            <TableCell>Estado Adopción</TableCell>
                            <TableCell>Estado Solicitud</TableCell>
                            <TableCell>Documentos</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {adopciones.map(adopcion => (
                            <TableRow key={adopcion.id_adopcion} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{adopcion.id_adopcion}</TableCell>
                                
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                        src={adopcion.mascota?.imagen_url} 
                                        sx={{ width: 32, height: 32, mr: 1.5 }}
                                    >
                                        <Pets />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {adopcion.mascota?.nombre || 'Sin mascota'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {adopcion.mascota?.especie} {adopcion.mascota?.raza && `- ${adopcion.mascota.raza}`}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {adopcion.usuario?.nombre || 'Usuario no disponible'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {adopcion.usuario?.correo_electronico}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell>
                                    <Typography variant="body2">
                                        {new Date(adopcion.fecha_solicitud).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(adopcion.fecha_solicitud).toLocaleTimeString('es-MX', { timeStyle: 'short' })}
                                    </Typography>
                                </TableCell>
                                
                                <TableCell>
                                    <Chip 
                                        label={formatEstado(adopcion.estado)}
                                        color={getEstadoColor(adopcion.estado)}
                                        size="small"
                                        icon={getEstadoIcon(adopcion.estado)}
                                        sx={{ fontWeight: 500 }}
                                    />
                                </TableCell>
                                
                                <TableCell>
                                    <Chip 
                                        label={formatEstado(adopcion.estado_solicitud)}
                                        color={getSolicitudColor(adopcion.estado_solicitud)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </TableCell>
                                
                                <TableCell>
                                    <Chip 
                                        label={adopcion.documentos_verificados ? 'Verificados' : 'Pendientes'}
                                        color={adopcion.documentos_verificados ? 'success' : 'warning'}
                                        size="small"
                                        variant="filled"
                                    />
                                </TableCell>
                                
                                {isManagementView && (
                                    <TableCell align="center">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => console.log('Ver/Editar', adopcion.id_adopcion)}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => console.log('Eliminar', adopcion.id_adopcion)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton> 
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdopcionesListarPage;