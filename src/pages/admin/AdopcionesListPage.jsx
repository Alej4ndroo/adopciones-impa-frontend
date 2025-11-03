// src/components/admin/AdopcionesListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, IconButton, Avatar
} from '@mui/material';
import { Pets, Person, Edit, Delete } from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.API_URL_BACKEND;
const ADOPCIONES_ENDPOINT = '/adopciones/listar'; 

const AdopcionesListPage = ({ isManagementView = false }) => {
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

            const receivedData = Array.isArray(response.data) 
                ? response.data 
                : Array.isArray(response.data?.adopciones) 
                    ? response.data.adopciones 
                    : [];

            if (!receivedData.length) {
                setError("No se encontraron solicitudes de adopción en el sistema.");
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

    const tableTitle = isManagementView ? 'Gestión de Adopciones' : 'Lista de Solicitudes de Adopción';

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
                            <TableCell>Fecha de Solicitud</TableCell>
                            <TableCell>Estado</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {adopciones.map(adopcion => (
                            <TableRow key={adopcion.id_adopcion} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{adopcion.id_adopcion}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar src={adopcion.mascota.url_imagen} sx={{ width: 32, height: 32, mr: 1.5 }}><Pets /></Avatar>
                                    {adopcion.mascota.nombre}
                                </TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                    {adopcion.adoptante.usuario.nombre}
                                </TableCell>
                                <TableCell>
                                    {new Date(adopcion.fecha_solicitud).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={adopcion.estado_solicitud} 
                                        size="small" 
                                        color={
                                            adopcion.estado_solicitud === 'aprobada' ? 'success' :
                                            adopcion.estado_solicitud === 'en_revision' ? 'warning' :
                                            adopcion.estado_solicitud === 'rechazada' ? 'error' :
                                            'default'
                                        }
                                        variant="outlined"
                                    />
                                </TableCell>
                                {isManagementView && (
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => console.log('Ver/Editar', adopcion.id_adopcion)}><Edit /></IconButton>
                                        <IconButton size="small" onClick={() => console.log('Eliminar', adopcion.id_adopcion)}><Delete /></IconButton> 
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

export default AdopcionesListPage;