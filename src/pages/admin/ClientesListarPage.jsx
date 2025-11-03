// src/components/admin/EmpleadosListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme
} from '@mui/material';
import { LayoutDashboard } from 'lucide-react';
import { Person } from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.API_URL_BACKEND;
const CLIENTES_ENDPOINT = '/personas/listar'; 

const ClientesListarPage = ({ isManagementView = false }) => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();

    const fetchClientes = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${CLIENTES_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedClientes = Array.isArray(response.data) 
                ? response.data 
                : Array.isArray(response.data?.clientes) 
                    ? response.data.clientes 
                    : [];

            if (!receivedClientes.length) {
                setError("No se encontraron usuarios en el sistema.");
            }

            console.log('Clientes recibidos:', receivedClientes);
            setClientes(receivedClientes);
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

    useEffect(() => { fetchClientes(); }, []); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando clientes...</Typography>
            </Box>
        );
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.dark }}>
                <LayoutDashboard size={30} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Lista de Clientes
            </Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de clientes">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>Número de cliente</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Correo</TableCell>
                            <TableCell>Telefono</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clientes.map(cliente => (
                            <TableRow key={cliente.id_persona || cliente.id} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{cliente.id_persona || cliente.id}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    {cliente.usuarios.nombre}
                                </TableCell>
                                <TableCell>{cliente.usuarios.correo_electronico || cliente.correo}</TableCell>
                                <TableCell>{cliente.usuarios.telefono || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ClientesListarPage;