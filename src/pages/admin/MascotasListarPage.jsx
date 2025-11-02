// src/components/admin/MascotasListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme
} from '@mui/material';
import { LayoutDashboard } from 'lucide-react';
import { Pets, BugReport, CrueltyFree } from '@mui/icons-material'; // Usaremos Pets para perros/gatos

const API_BASE_URL = 'http://localhost:3000'; 
const PETS_ENDPOINT = '/mascotas/listar'; 

const MascotasListarPage = ({ isManagementView = false }) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();

    const fetchPets = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}${PETS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedPets = Array.isArray(response.data) 
                ? response.data 
                : Array.isArray(response.data?.mascotas) 
                    ? response.data.mascotas 
                    : [];

            if (!receivedPets.length) {
                setError("No se encontraron mascotas en el sistema.");
            }

            setPets(receivedPets);
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

    useEffect(() => { fetchPets(); }, []); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando mascotas...</Typography>
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
                Lista de Mascotas
            </Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader aria-label="lista de usuarios">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f5f5' } }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Especie</TableCell>
                            <TableCell>Raza</TableCell>
                            <TableCell>Edad</TableCell>
                            <TableCell>Estado</TableCell>
                            {isManagementView && <TableCell align="center">Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pets.map(pet => (
                            <TableRow key={pet.id_mascota} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{pet.id_mascota}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    {pet.especie === 'perro' && <Pets sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}
                                    {pet.especie === 'gato' && <Pets sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}
                                    {pet.especie === 'conejo' && <CrueltyFree sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}
                                    {pet.especie === 'otro' && <BugReport sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}
                                    {pet.nombre}
                                </TableCell>
                                <TableCell>{pet.especie}</TableCell>
                                <TableCell>{pet.raza}</TableCell>
                                <TableCell>
                                    {`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}
                                </TableCell>
                                <TableCell>
                                    
                                    <Chip 
                                        label={pet.estado_adopcion} 
                                        size="small" 
                                        color={
                                            pet.estado_adopcion === 'disponible' ? 'success' :
                                            pet.estado_adopcion === 'en_proceso' ? 'warning' :
                                            pet.estado_adopcion === 'adoptado' ? 'primary' :
                                            'default'
                                        }
                                        variant="outlined"
                                    />
                                </TableCell>
                                {isManagementView && (
                                    <TableCell align="center">
                                        {/* Aquí puedes agregar botones de acción como Editar o Eliminar */}
                                        {/* 
                                        <IconButton size="small" onClick={() => handleEdit(pet.id_mascota)}><Edit /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(pet.id_mascota)}><Delete /></IconButton> 
                                        */}
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

export default MascotasListarPage;