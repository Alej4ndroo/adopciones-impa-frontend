// src/components/admin/CitasListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme,
    Stack, alpha, Card, IconButton, Tooltip, Avatar, useMediaQuery,
    Drawer, Divider, Button
} from '@mui/material';
import { 
    Event as EventIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    MedicalServices as MedicalServicesIcon,
    AccessTime as AccessTimeIcon,
    Description as DescriptionIcon,
    CalendarToday as CalendarTodayIcon,
    CheckCircle as CheckCircleIcon,
    Pets as PetsIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    AttachMoney as AttachMoneyIcon,
    Work as WorkIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CITAS_ENDPOINT = '/citas/listar';

// --- Componente para mostrar el detalle completo (Drawer mejorado) ---
const CitaDetailDrawer = ({ cita, open, onClose, isManagementView }) => {
    const theme = useTheme();

    if (!cita) return null;

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'programada': return theme.palette.info.main;
            case 'completada': return theme.palette.success.main;
            case 'cancelada': return theme.palette.error.main;
            case 'no_asistio': return theme.palette.warning.main;
            default: return theme.palette.grey[500];
        }
    };

    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'programada': return 'Programada';
            case 'completada': return 'Completada';
            case 'cancelada': return 'Cancelada';
            case 'no_asistio': return 'No Asistió';
            default: return estado;
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: 480 },
                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
                },
            }}
        >
            {/* Header del Drawer */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    p: 3,
                    position: 'relative'
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        bgcolor: alpha('#000', 0.2),
                        '&:hover': { bgcolor: alpha('#000', 0.4) }
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                    <Avatar
                        sx={{
                            width: 72,
                            height: 72,
                            bgcolor: alpha('#fff', 0.3),
                            backdropFilter: 'blur(10px)',
                            fontSize: 32,
                            fontWeight: 700
                        }}
                    >
                        <EventIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Cita #{cita.id_cita}
                        </Typography>
                        <Chip 
                            label={getEstadoLabel(cita.estado_cita)}
                            size="small"
                            sx={{ 
                                mt: 1,
                                bgcolor: alpha('#fff', 0.3),
                                color: 'white',
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </Box>
                </Stack>
            </Box>

            {/* Contenido del Drawer */}
            <Box sx={{ p: 3 }}>
                {/* Sección: Información de la Cita */}
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 4,
                                height: 24,
                                borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }}
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Información de la Cita
                        </Typography>
                    </Stack>

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <CalendarTodayIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Fecha y Hora
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {new Date(cita.fecha_cita).toLocaleString('es-MX', { 
                                        dateStyle: 'long', 
                                        timeStyle: 'short' 
                                    })}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <DescriptionIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Motivo
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {cita.motivo}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(getEstadoColor(cita.estado_cita), 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 20, color: getEstadoColor(cita.estado_cita) }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Estado
                                </Typography>
                                <Chip 
                                    label={getEstadoLabel(cita.estado_cita)}
                                    size="small"
                                    sx={{ 
                                        bgcolor: alpha(getEstadoColor(cita.estado_cita), 0.1),
                                        color: getEstadoColor(cita.estado_cita),
                                        fontWeight: 600,
                                        mt: 0.5
                                    }}
                                />
                            </Box>
                        </Box>
                    </Stack>
                </Card>

                {/* Sección: Cliente */}
                {cita.usuario && (
                    <Card
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 24,
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }}
                            />
                            <Typography variant="h6" fontWeight={600} color="primary">
                                Información del Cliente
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                        color: theme.palette.secondary.main,
                                        width: 40,
                                        height: 40,
                                        fontWeight: 700
                                    }}
                                >
                                    {cita.usuario.nombre?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Nombre del Cliente
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {cita.usuario.nombre}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                    }}
                                >
                                    <EmailIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Correo Electrónico
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {cita.usuario.correo_electronico}
                                    </Typography>
                                </Box>
                            </Box>

                            {cita.usuario.telefono && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <PhoneIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Teléfono
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {cita.usuario.telefono}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>
                )}

                {/* Sección: Mascota */}
                {cita.mascota && (
                    <Card
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 24,
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                                }}
                            />
                            <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.success.main }}>
                                Información de la Mascota
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: alpha(theme.palette.success.main, 0.2),
                                        color: theme.palette.success.main,
                                        width: 40,
                                        height: 40,
                                    }}
                                >
                                    <PetsIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Nombre de la Mascota
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {cita.mascota.nombre}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                    }}
                                >
                                    <InfoIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Especie y Raza
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {cita.mascota.especie} - {cita.mascota.raza}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Card>
                )}

                {/* Sección: Servicio */}
                {cita.servicio && (
                    <Card
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 24,
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                                }}
                            />
                            <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.warning.main }}>
                                Servicio Solicitado
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        p: 1,
                                        borderRadius: 2,
                                        display: 'flex'
                                    }}
                                >
                                    <MedicalServicesIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Nombre del Servicio
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {cita.servicio.nombre}
                                    </Typography>
                                </Box>
                            </Box>

                            {cita.servicio.descripcion && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <DescriptionIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Descripción
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {cita.servicio.descripcion}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {cita.servicio.costo_base && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <AttachMoneyIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Costo Base
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ${parseFloat(cita.servicio.costo_base).toFixed(2)} MXN
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>
                )}

                {/* Sección: Empleado Asignado */}
                {cita.empleado && (
                    <Card
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                            borderRadius: 3,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 24,
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
                                }}
                            />
                            <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.info.main }}>
                                Empleado Asignado
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: alpha(theme.palette.info.main, 0.2),
                                        color: theme.palette.info.main,
                                        width: 40,
                                        height: 40,
                                        fontWeight: 700
                                    }}
                                >
                                    {cita.empleado.nombre?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Nombre del Empleado
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {cita.empleado.nombre}
                                    </Typography>
                                </Box>
                            </Box>

                            {cita.empleado.especialidad && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <WorkIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Especialidad
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {cita.empleado.especialidad}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {cita.empleado.numero_empleado && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            No. Empleado
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {cita.empleado.numero_empleado}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>
                )}

                {/* Botones de Acción */}
                {isManagementView && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<EditIcon />}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: theme.shadows[4],
                                '&:hover': {
                                    boxShadow: theme.shadows[8],
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Editar Cita
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<DeleteIcon />}
                            color="error"
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Eliminar
                        </Button>
                    </Stack>
                )}
            </Box>
        </Drawer>
    );
};

// --------------------------------------------------------------------------

const CitasListarPage = ({ isManagementView = false }) => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

            console.log('Citas recibidas:', receivedCitas);
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

    const handleOpenDrawer = (cita) => {
        setSelectedCita(cita);
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedCita(null);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'programada': return 'info';
            case 'completada': return 'success';
            case 'cancelada': return 'error';
            case 'no_asistio': return 'warning';
            default: return 'default';
        }
    };

    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'programada': return 'Programada';
            case 'completada': return 'Completada';
            case 'cancelada': return 'Cancelada';
            case 'no_asistio': return 'No Asistió';
            default: return estado;
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
                    Cargando citas...
                </Typography>
            </Box>
        );
    }

    // Vista de tarjetas para móviles
    const MobileCardView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {citas.map(cita => (
                <Card 
                    key={cita.id_cita}
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
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack spacing={1} sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" fontWeight={700} color="primary">
                                        Cita #{cita.id_cita}
                                    </Typography>
                                    <Chip 
                                        label={getEstadoLabel(cita.estado_cita)}
                                        size="small"
                                        color={getEstadoColor(cita.estado_cita)}
                                    />
                                </Stack>
                                
                                {cita.usuario && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" fontWeight={600}>
                                            {cita.usuario.nombre}
                                        </Typography>
                                    </Stack>
                                )}

                                {cita.mascota && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PetsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {cita.mascota.nombre} ({cita.mascota.especie})
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                            
                            <Tooltip title="Ver detalles">
                                <IconButton 
                                    onClick={() => handleOpenDrawer(cita)}
                                    sx={{ 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                    }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr',
                            gap: 1.5,
                            pt: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(cita.fecha_cita).toLocaleString('es-MX', { 
                                        dateStyle: 'medium', 
                                        timeStyle: 'short' 
                                    })}
                                </Typography>
                            </Box>
                            
                            {cita.servicio && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MedicalServicesIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {cita.servicio.nombre}
                                    </Typography>
                                </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {cita.motivo}
                                </Typography>
                            </Box>
                        </Box>
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
                    background: `linear-gradient(135deg, #1E74D1 0%, #038ffaff 100%)`,
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
                        <EventIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                    </Box>
                    <Box>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                            {isManagementView ? 'Gestión de Citas' : 'Lista de Citas'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {citas.length} {citas.length === 1 ? 'cita registrada' : 'citas registradas'}
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
            {citas.length === 0 ? (
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <EventIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay citas registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Las citas que registres aparecerán aquí
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
                                <TableCell>ID Cita</TableCell>
                                <TableCell>Fecha y Hora</TableCell>
                                <TableCell>Cliente</TableCell>
                                {!isTablet && <TableCell>Mascota</TableCell>}
                                <TableCell>Servicio</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {citas.map((cita, index) => (
                                <TableRow 
                                    key={cita.id_cita}
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
                                        #{cita.id_cita}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {new Date(cita.fecha_cita).toLocaleString('es-MX', { 
                                                    dateStyle: 'short', 
                                                    timeStyle: 'short' 
                                                })}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {cita.usuario ? (
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: theme.palette.secondary.main,
                                                        width: 32,
                                                        height: 32,
                                                        fontSize: 14,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {cita.usuario.nombre?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {cita.usuario.nombre}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No asignado
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {!isTablet && (
                                        <TableCell>
                                            {cita.mascota ? (
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <PetsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {cita.mascota.nombre}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({cita.mascota.especie})
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    N/A
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        {cita.servicio ? (
                                            <Tooltip title={cita.servicio.descripcion || ''}>
                                                <Typography variant="body2" fontWeight={500} noWrap>
                                                    {cita.servicio.nombre}
                                                </Typography>
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No especificado
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getEstadoLabel(cita.estado_cita)}
                                            size="small"
                                            color={getEstadoColor(cita.estado_cita)}
                                            variant="outlined"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Ver detalles">
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleOpenDrawer(cita)}
                                                    sx={{ 
                                                        color: theme.palette.primary.main,
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {isManagementView && (
                                                <>
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
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Drawer de Detalles */}
            <CitaDetailDrawer
                cita={selectedCita}
                open={openDrawer}
                onClose={handleCloseDrawer}
                isManagementView={isManagementView}
            />
        </Box>
    );
};

export default CitasListarPage;