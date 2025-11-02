// src/components/admin/ConsultasListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, IconButton, Avatar
} from '@mui/material';
import { Pets, Edit, Delete, MedicalServices } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000'; 
const CONSULTAS_ENDPOINT = '/consultas/listar'; 

const ConsultasListarPage = ({ isManagementView = false }) => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConsultas = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}${CONSULTAS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // El backend devuelve un array directamente
            const receivedData = Array.isArray(response.data) ? response.data : [];

            if (!receivedData.length) {
                setError("No se encontraron consultas veterinarias en el sistema.");
            }

            setConsultas(receivedData);
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

    useEffect(() => { fetchConsultas(); }, []); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando consultas...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    const tableTitle = isManagementView ? 'Gestión de Consultas Veterinarias' : 'Historial de Consultas';

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>{tableTitle}</Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de consultas">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Mascota</TableCell>
                            <TableCell>Veterinario</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>Costo</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {consultas.map(consulta => (
                            <TableRow key={consulta.id_consulta} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{consulta.id_consulta}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar src={consulta.expediente.mascota.url_imagen} sx={{ width: 32, height: 32, mr: 1.5 }}><Pets /></Avatar>
                                    {consulta.expediente.mascota.nombre}
                                </TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MedicalServices sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                                    {consulta.empleado.usuario.nombre}
                                </TableCell>
                                <TableCell>
                                    {new Date(consulta.fecha_consulta).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                                </TableCell>
                                <TableCell>{consulta.motivo}</TableCell>
                                <TableCell>${parseFloat(consulta.costo).toFixed(2)}</TableCell>
                                {isManagementView && (
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => console.log('Ver/Editar', consulta.id_consulta)}><Edit /></IconButton>
                                        <IconButton size="small" onClick={() => console.log('Eliminar', consulta.id_consulta)}><Delete /></IconButton> 
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

export default ConsultasListarPage;