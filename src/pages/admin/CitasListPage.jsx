// src/components/admin/CitasListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, IconButton
} from '@mui/material';
import { Event, Edit, Delete } from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CITAS_ENDPOINT = '/citas/listar'; 

const CitasListPage = ({ isManagementView = false }) => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCitas = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${CITAS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedCitas = Array.isArray(response.data) 
                ? response.data 
                : Array.isArray(response.data?.citas) 
                    ? response.data.citas 
                    : [];

            if (!receivedCitas.length) {
                setError("No se encontraron citas en el sistema.");
            }

            setCitas(receivedCitas);
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

    useEffect(() => { fetchCitas(); }, []); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando citas...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    const tableTitle = isManagementView ? 'Gestión de Citas' : 'Lista de Citas';

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{tableTitle}</Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de citas">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>ID Cita</TableCell>
                            <TableCell>Fecha y Hora</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>ID Persona</TableCell>
                            <TableCell>ID Servicio</TableCell>
                            <TableCell>Estado</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {citas.map(cita => (
                            <TableRow key={cita.id_cita} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{cita.id_cita}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Event sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                    {new Date(cita.fecha_cita).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                                </TableCell>
                                <TableCell>{cita.motivo}</TableCell>
                                <TableCell>{cita.id_persona}</TableCell>
                                <TableCell>{cita.id_servicio}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={cita.estado_cita} 
                                        size="small" 
                                        color={
                                            cita.estado_cita === 'programada' ? 'info' :
                                            cita.estado_cita === 'completada' ? 'success' :
                                            cita.estado_cita === 'cancelada' ? 'error' :
                                            cita.estado_cita === 'no_asistio' ? 'warning' :
                                            'default'
                                        }
                                        variant="outlined"
                                    />
                                </TableCell>
                                {isManagementView && (
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => console.log('Edit', cita.id_cita)}><Edit /></IconButton>
                                        <IconButton size="small" onClick={() => console.log('Delete', cita.id_cita)}><Delete /></IconButton> 
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

export default CitasListPage;