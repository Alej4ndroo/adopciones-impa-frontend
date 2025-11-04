import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme,
    Stack, alpha, Card, IconButton, Tooltip, useMediaQuery
} from '@mui/material';
import { 
    Pets as PetsIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    CrueltyFree,
    BugReport
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PETS_ENDPOINT = '/mascotas/listar'; 

const MascotasListarPage = ({ isManagementView = false }) => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const fetchPets = async () => {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${PETS_ENDPOINT}`, {
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

    const getSpeciesIcon = (especie) => {
        switch(especie) {
            case 'perro':
            case 'gato':
                return <PetsIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            case 'conejo':
                return <CrueltyFree sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            default:
                return <BugReport sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
        }
    };

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'disponible':
                return 'success';
            case 'en_proceso':
                return 'warning';
            case 'adoptado':
                return 'primary';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '60vh',
                gap: 2
            }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                    Cargando mascotas...
                </Typography>
            </Box>
        );
    }

    // Vista de tarjetas para móviles
    const MobileCardView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pets.map(pet => (
                <Card 
                    key={pet.id_mascota}
                    elevation={2}
                    sx={{ 
                        p: 2,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8]
                        }
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                {getSpeciesIcon(pet.especie)}
                                <Typography variant="h6" fontWeight={600}>
                                    {pet.nombre}
                                </Typography>
                            </Stack>
                            <Chip 
                                label={pet.estado_adopcion} 
                                size="small" 
                                color={getStatusColor(pet.estado_adopcion)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>

                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr',
                            gap: 1.5,
                            pt: 1
                        }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Especie
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {pet.especie.charAt(0).toUpperCase() + pet.especie.slice(1)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Raza
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {pet.raza || 'N/A'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Edad
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    ID
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    #{pet.id_mascota}
                                </Typography>
                            </Box>
                        </Box>

                        {isManagementView && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
                                <Tooltip title="Ver detalles">
                                    <IconButton 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                        }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton 
                                        size="small"
                                        sx={{ 
                                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                    <IconButton 
                                        size="small"
                                        sx={{ 
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </Stack>
                </Card>
            ))}
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            {/* Header Mejorado */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: { xs: 2, sm: 3 },
                    mb: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    color: 'white'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: alpha('#fff', 0.2),
                            backdropFilter: 'blur(10px)',
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: 2,
                            display: 'flex'
                        }}
                    >
                        <PetsIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                    </Box>
                    <Box>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                            Lista de Mascotas
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {pets.length} {pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Alertas */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {/* Contenido principal */}
            {pets.length === 0 ? (
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <PetsIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay mascotas registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Las mascotas que registres aparecerán aquí
                    </Typography>
                </Paper>
            ) : isMobile ? (
                <MobileCardView />
            ) : (
                <TableContainer 
                    component={Paper} 
                    elevation={3}
                    sx={{ 
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow 
                                sx={{ 
                                    '& th': { 
                                        fontWeight: 700,
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        py: 2
                                    } 
                                }}
                            >
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                {!isTablet && <TableCell>Especie</TableCell>}
                                {!isTablet && <TableCell>Raza</TableCell>}
                                <TableCell>Edad</TableCell>
                                <TableCell>Estado</TableCell>
                                {isManagementView && <TableCell align="center">Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pets.map((pet, index) => (
                                <TableRow 
                                    key={pet.id_mascota}
                                    hover
                                    sx={{
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            transform: 'scale(1.01)'
                                        },
                                        bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.02)
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                        #{pet.id_mascota}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {getSpeciesIcon(pet.especie)}
                                            <Typography fontWeight={600}>
                                                {pet.nombre}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    {!isTablet && (
                                        <TableCell>
                                            <Chip 
                                                label={pet.especie.charAt(0).toUpperCase() + pet.especie.slice(1)} 
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                    )}
                                    {!isTablet && (
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {pet.raza || 'N/A'}
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={pet.estado_adopcion} 
                                            size="small" 
                                            color={getStatusColor(pet.estado_adopcion)}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    {isManagementView && (
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <Tooltip title="Ver detalles">
                                                    <IconButton 
                                                        size="small"
                                                        sx={{ 
                                                            color: theme.palette.primary.main,
                                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton 
                                                        size="small"
                                                        sx={{ 
                                                            color: theme.palette.warning.main,
                                                            '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton 
                                                        size="small"
                                                        sx={{ 
                                                            color: theme.palette.error.main,
                                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default MascotasListarPage;