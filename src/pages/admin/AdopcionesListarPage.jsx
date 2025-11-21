// src/components/admin/AdopcionesListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme,
    Stack, alpha, Card, IconButton, Tooltip, Collapse, Avatar,
    TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
    Grid, Divider, Button, useMediaQuery, Badge
} from '@mui/material';
import { 
    Pets as PetsIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Description as DescriptionIcon,
    CalendarToday as CalendarTodayIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Home as HomeIcon,
    Work as WorkIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowUp as ArrowUpIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    HourglassEmpty as HourglassEmptyIcon,
    Info as InfoIcon,
    AttachFile as AttachFileIcon,
    Favorite as FavoriteIcon,
    AssignmentTurnedIn as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const ADOPCIONES_ENDPOINT = '/adopciones/listar';

// Componente de tarjeta para móviles
const MobileAdopcionCard = ({ adopcion, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(adopcion.id_adopcion);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar la adopción #${adopcion.id_adopcion}?`)) {
            if (onDelete) onDelete(adopcion.id_adopcion);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(adopcion.id_adopcion);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
    };

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

    const getSolicitudColor = (estado) => {
        const colorMap = {
            'en_revision': 'info',
            'aprobada': 'success',
            'rechazada': 'error',
            'cancelada': 'default'
        };
        return colorMap[estado] || 'default';
    };

    const formatEstado = (estado) => {
        return estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
    };

    const getEstadoIcon = (estado) => {
        const iconMap = {
            'completada': <CheckCircleIcon />,
            'aprobada': <CheckCircleIcon />,
            'rechazada': <CancelIcon />,
            'cancelada': <CancelIcon />,
            'en_proceso': <HourglassEmptyIcon />,
            'en_revision': <HourglassEmptyIcon />,
            'devuelta': <CancelIcon />
        };
        return iconMap[estado] || <InfoIcon />;
    };

    return (
        <Card 
            elevation={2}
            sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: open ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent'
            }}
        >
            {/* Header clickeable */}
            <Box
                onClick={() => setOpen(!open)}
                sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: open ? alpha(theme.palette.primary.main, 0.05) : 'white',
                    '&:active': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 56,
                            height: 56,
                            fontSize: 20,
                            fontWeight: 700
                        }}
                    >
                        <FavoriteIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                                Adopción #{adopcion.id_adopcion}
                            </Typography>
                            <Chip
                                label={formatEstado(adopcion.estado)}
                                size="small"
                                color={getEstadoColor(adopcion.estado)}
                                icon={getEstadoIcon(adopcion.estado)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        {adopcion.mascota && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {adopcion.mascota.nombre}
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            {formatDate(adopcion.fecha_solicitud)}
                        </Typography>
                    </Box>

                    <IconButton
                        sx={{
                            color: theme.palette.primary.main,
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }}
                    >
                        <ArrowDownIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* Contenido expandible */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    {/* Información de la Adopción */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                            Información de la Adopción
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <AssignmentIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Estado de Solicitud</Typography>
                                    <Chip 
                                        label={formatEstado(adopcion.estado_solicitud)}
                                        color={getSolicitudColor(adopcion.estado_solicitud)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 500, mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <AttachFileIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Documentos</Typography>
                                    <Chip 
                                        label={adopcion.documentos_verificados ? 'Verificados' : 'Pendientes'}
                                        color={adopcion.documentos_verificados ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ fontWeight: 500, mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                            {adopcion.fecha_aprobacion && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.success.main, mt: 0.3 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Fecha de Aprobación</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDate(adopcion.fecha_aprobacion)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            {adopcion.notas && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <InfoIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mt: 0.3 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Notas</Typography>
                                        <Typography variant="body2">{adopcion.notas}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>

                    {/* Mascota */}
                    {adopcion.mascota && adopcion.mascota.id_mascota && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="success.main" sx={{ mb: 1.5 }}>
                                Mascota
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar 
                                        src={adopcion.mascota.imagen_url}
                                        sx={{ 
                                            width: 48, 
                                            height: 48,
                                            bgcolor: alpha(theme.palette.success.main, 0.2)
                                        }}
                                    >
                                        <PetsIcon sx={{ color: theme.palette.success.main }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{adopcion.mascota.nombre}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {adopcion.mascota.especie?.charAt(0).toUpperCase() + adopcion.mascota.especie?.slice(1)}
                                            {adopcion.mascota.raza && ` - ${adopcion.mascota.raza}`}
                                        </Typography>
                                    </Box>
                                </Box>
                                {adopcion.mascota.edad && (
                                    <Typography variant="body2" color="text.secondary">
                                        Edad: {adopcion.mascota.edad}
                                    </Typography>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Adoptante */}
                    {adopcion.usuario && adopcion.usuario.id_usuario && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="secondary" sx={{ mb: 1.5 }}>
                                Adoptante
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                    <Typography variant="body2" fontWeight={500}>{adopcion.usuario.nombre}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                    <Typography variant="body2">{adopcion.usuario.correo_electronico}</Typography>
                                </Box>
                                {adopcion.usuario.telefono && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <PhoneIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                        <Typography variant="body2">{adopcion.usuario.telefono}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Botones de acción */}
                    <Stack spacing={1.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={handleView}
                            sx={{
                                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                                fontWeight: 600
                            }}
                        >
                            Ver Detalles
                        </Button>
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleEdit}
                                sx={{ fontWeight: 600 }}
                            >
                                Editar
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                color="error"
                                onClick={handleDelete}
                                sx={{ fontWeight: 600 }}
                            >
                                Eliminar
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Collapse>
        </Card>
    );
};

// Componente de fila expandible para tabla
const AdopcionRow = ({ adopcion, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(adopcion.id_adopcion);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar la adopción #${adopcion.id_adopcion}?`)) {
            if (onDelete) onDelete(adopcion.id_adopcion);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(adopcion.id_adopcion);
    };

    const toggleRow = () => {
        setOpen(!open);
    };

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

    const getSolicitudColor = (estado) => {
        const colorMap = {
            'en_revision': 'info',
            'aprobada': 'success',
            'rechazada': 'error',
            'cancelada': 'default'
        };
        return colorMap[estado] || 'default';
    };

    const formatEstado = (estado) => {
        return estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    const formatDateLong = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
    };

    return (
        <>
            <TableRow
                hover
                onClick={toggleRow}
                sx={{
                    cursor: 'pointer',
                    bgcolor: open ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                    },
                    transition: 'all 0.2s ease'
                }}
            >
                <TableCell sx={{ width: 50 }}>
                    <IconButton
                        size="small"
                        sx={{
                            color: theme.palette.primary.main,
                            pointerEvents: 'none'
                        }}
                    >
                        {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Chip
                        label={`#${adopcion.id_adopcion}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                        }}
                    />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {adopcion.mascota && adopcion.mascota.id_mascota ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                src={adopcion.mascota.imagen_url}
                                sx={{
                                    bgcolor: theme.palette.success.main,
                                    width: 32,
                                    height: 32
                                }}
                            >
                                <PetsIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                    {adopcion.mascota.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {adopcion.mascota.especie}
                                </Typography>
                            </Box>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {adopcion.usuario && adopcion.usuario.id_usuario ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.secondary.main,
                                    width: 32,
                                    height: 32,
                                    fontSize: 14,
                                    fontWeight: 700
                                }}
                            >
                                {adopcion.usuario.nombre?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500} noWrap>
                                {adopcion.usuario.nombre}
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                            {formatDate(adopcion.fecha_solicitud)}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={formatEstado(adopcion.estado)}
                        size="small" 
                        color={getEstadoColor(adopcion.estado)}
                        sx={{ fontWeight: 600 }}
                    />
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip 
                        label={formatEstado(adopcion.estado_solicitud)}
                        size="small" 
                        color={getSolicitudColor(adopcion.estado_solicitud)}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                </TableCell>
            </TableRow>

            {/* Fila expandible */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            py: 3, 
                            px: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 2,
                            my: 1
                        }}>
                            <Grid container spacing={3}>
                                {/* Información de la Adopción */}
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.primary.main }} />
                                            <Typography variant="h6" fontWeight={600} color="primary">
                                                Información de la Adopción
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Fecha de Solicitud</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {formatDateLong(adopcion.fecha_solicitud)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {adopcion.fecha_aprobacion && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <CheckCircleIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Fecha de Aprobación</Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {formatDateLong(adopcion.fecha_aprobacion)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <AssignmentIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Estado de Solicitud</Typography>
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip 
                                                            label={formatEstado(adopcion.estado_solicitud)}
                                                            color={getSolicitudColor(adopcion.estado_solicitud)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <AttachFileIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Documentos</Typography>
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip 
                                                            label={adopcion.documentos_verificados ? 'Verificados' : 'Pendientes'}
                                                            color={adopcion.documentos_verificados ? 'success' : 'warning'}
                                                            size="small"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {adopcion.notas && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <InfoIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">Notas</Typography>
                                                        <Typography variant="body2">
                                                            {adopcion.notas}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Mascota */}
                                {adopcion.mascota && adopcion.mascota.id_mascota && (
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.success.main }} />
                                                <Typography variant="h6" fontWeight={600} color="success.main">
                                                    Mascota
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar
                                                        src={adopcion.mascota.imagen_url}
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.success.main, 0.2),
                                                            color: theme.palette.success.main,
                                                            width: 56,
                                                            height: 56
                                                        }}
                                                    >
                                                        <PetsIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {adopcion.mascota.nombre}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <InfoIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Especie y Raza</Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {adopcion.mascota.especie?.charAt(0).toUpperCase() + adopcion.mascota.especie?.slice(1)}
                                                            {adopcion.mascota.raza && ` - ${adopcion.mascota.raza}`}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {adopcion.mascota.edad && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                            <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Edad</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {adopcion.mascota.edad}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Adoptante */}
                                {adopcion.usuario && adopcion.usuario.id_usuario && (
                                    <Grid item xs={12}>
                                        <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.secondary.main }} />
                                                <Typography variant="h6" fontWeight={600} color="secondary">
                                                    Adoptante
                                                </Typography>
                                            </Stack>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                                                color: theme.palette.secondary.main,
                                                                width: 40,
                                                                height: 40,
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            {adopcion.usuario.nombre?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {adopcion.usuario.nombre}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                            <EmailIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {adopcion.usuario.correo_electronico}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                {adopcion.usuario.telefono && (
                                                    <Grid item xs={12} sm={4}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                                <PhoneIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {adopcion.usuario.telefono}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Botones de acción */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            onClick={handleDelete}
                                            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
                                        >
                                            Eliminar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={handleEdit}
                                            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<VisibilityIcon />}
                                            onClick={handleView}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3,
                                                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                                                boxShadow: theme.shadows[4],
                                                '&:hover': {
                                                    boxShadow: theme.shadows[8],
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// Componente principal
const AdopcionesListarPage = ({ isManagementView = false }) => {
    const [adopciones, setAdopciones] = useState([]);
    const [filteredAdopciones, setFilteredAdopciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        estado: '',
        estadoSolicitud: '',
        documentosVerificados: '',
        mascota: '',
        adoptante: '',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

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

            const receivedAdopciones = Array.isArray(response.data) 
                ? response.data 
                : [];

            if (!receivedAdopciones.length) {
                setError("No se encontraron adopciones en el sistema.");
            }

            console.log('Adopciones recibidas:', receivedAdopciones);
            setAdopciones(receivedAdopciones);
            setFilteredAdopciones(receivedAdopciones);
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

    useEffect(() => { 
        fetchAdopciones(); 
    }, []);

    // Aplicar filtros
    useEffect(() => {
        let filtered = adopciones;

        // Filtro de búsqueda
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(adopcion =>
                adopcion.id_adopcion?.toString().includes(searchTerm) ||
                adopcion.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                adopcion.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                adopcion.notas?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por estado de adopción
        if (filters.estado) {
            filtered = filtered.filter(adopcion => adopcion.estado === filters.estado);
        }

        // Filtro por estado de solicitud
        if (filters.estadoSolicitud) {
            filtered = filtered.filter(adopcion => adopcion.estado_solicitud === filters.estadoSolicitud);
        }

        // Filtro por documentos verificados
        if (filters.documentosVerificados !== '') {
            const verificados = filters.documentosVerificados === 'true';
            filtered = filtered.filter(adopcion => adopcion.documentos_verificados === verificados);
        }

        // Filtro por mascota
        if (filters.mascota) {
            filtered = filtered.filter(adopcion => 
                adopcion.mascota?.nombre?.toLowerCase().includes(filters.mascota.toLowerCase())
            );
        }

        // Filtro por adoptante
        if (filters.adoptante) {
            filtered = filtered.filter(adopcion => 
                adopcion.usuario?.nombre?.toLowerCase().includes(filters.adoptante.toLowerCase())
            );
        }

        // Filtro por rango de fechas
        if (filters.fechaDesde) {
            filtered = filtered.filter(adopcion => 
                new Date(adopcion.fecha_solicitud) >= new Date(filters.fechaDesde)
            );
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59, 999);
            filtered = filtered.filter(adopcion => 
                new Date(adopcion.fecha_solicitud) <= fechaHasta
            );
        }

        setFilteredAdopciones(filtered);
    }, [searchTerm, filters, adopciones]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            estado: '',
            estadoSolicitud: '',
            documentosVerificados: '',
            mascota: '',
            adoptante: '',
            fechaDesde: '',
            fechaHasta: ''
        });
        setSearchTerm('');
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0);

    const handleEdit = (idAdopcion) => {
        navigate(`/admin/adopciones/editar/${idAdopcion}`);
    };

    const handleDelete = async (idAdopcion) => {
        console.log('Eliminar adopción:', idAdopcion);
        // Implementar lógica de eliminación
        fetchAdopciones();
    };

    const handleView = (idAdopcion) => {
        navigate(`/adopciones/${idAdopcion}`);
    };

    // Obtener listas únicas para los filtros
    const estadosUnicos = [...new Set(adopciones.map(a => a.estado))];
    const estadosSolicitudUnicos = [...new Set(adopciones.map(a => a.estado_solicitud))];

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
                    Cargando adopciones...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    color: 'white'
                }}
            >
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                bgcolor: alpha('#fff', 0.2),
                                backdropFilter: 'blur(10px)',
                                p: 2,
                                borderRadius: 2,
                                display: 'flex'
                            }}
                        >
                            <FavoriteIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                        </Box>
                        <Box>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                                {isManagementView ? 'Gestión de Adopciones' : 'Lista de Adopciones'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filteredAdopciones.length} de {adopciones.length} {adopciones.length === 1 ? 'adopción' : 'adopciones'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buscador */}
                    <TextField
                        placeholder="Buscar por ID, mascota, adoptante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: { xs: '100%', sm: 300 },
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontWeight: 500
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Paper>

            {/* Botón de filtros */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Button
                    variant={showFilters ? "contained" : "outlined"}
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600
                    }}
                >
                    Filtros
                    {activeFiltersCount > 0 && (
                        <Badge 
                            badgeContent={activeFiltersCount} 
                            color="error" 
                            sx={{ ml: 1 }}
                        />
                    )}
                </Button>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="text"
                        startIcon={<CloseIcon />}
                        onClick={clearFilters}
                        sx={{ fontWeight: 600 }}
                    >
                        Limpiar filtros
                    </Button>
                )}
            </Stack>

            {/* Panel de filtros */}
            <Collapse in={showFilters}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Filtros Avanzados
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado de Adopción</InputLabel>
                                <Select
                                    value={filters.estado}
                                    label="Estado de Adopción"
                                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {estadosUnicos.map(estado => (
                                        <MenuItem key={estado} value={estado}>
                                            {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado de Solicitud</InputLabel>
                                <Select
                                    value={filters.estadoSolicitud}
                                    label="Estado de Solicitud"
                                    onChange={(e) => handleFilterChange('estadoSolicitud', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {estadosSolicitudUnicos.map(estado => (
                                        <MenuItem key={estado} value={estado}>
                                            {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Documentos</InputLabel>
                                <Select
                                    value={filters.documentosVerificados}
                                    label="Documentos"
                                    onChange={(e) => handleFilterChange('documentosVerificados', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="true">Verificados</MenuItem>
                                    <MenuItem value="false">Pendientes</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Mascota"
                                value={filters.mascota}
                                onChange={(e) => handleFilterChange('mascota', e.target.value)}
                                placeholder="Buscar por mascota..."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Adoptante"
                                value={filters.adoptante}
                                onChange={(e) => handleFilterChange('adoptante', e.target.value)}
                                placeholder="Buscar por adoptante..."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Desde"
                                value={filters.fechaDesde}
                                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Hasta"
                                value={filters.fechaHasta}
                                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

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
            {filteredAdopciones.length === 0 ? (
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <FavoriteIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm || activeFiltersCount > 0 
                            ? 'No se encontraron adopciones con los filtros aplicados' 
                            : 'No hay adopciones registradas'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || activeFiltersCount > 0 
                            ? 'Intenta cambiar los filtros de búsqueda' 
                            : 'Las adopciones que registres aparecerán aquí'}
                    </Typography>
                </Paper>
            ) : isMobile ? (
                // Vista de tarjetas para móviles
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredAdopciones.map((adopcion) => (
                        <MobileAdopcionCard
                            key={adopcion.id_adopcion}
                            adopcion={adopcion}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                        />
                    ))}
                </Box>
            ) : (
                // Vista de tabla para desktop/tablet
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
                                <TableCell sx={{ width: 50 }} />
                                <TableCell>ID</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Mascota</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Adoptante</TableCell>
                                <TableCell>Fecha Solicitud</TableCell>
                                <TableCell align="center">Estado</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Solicitud</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAdopciones.map((adopcion) => (
                                <AdopcionRow
                                    key={adopcion.id_adopcion}
                                    adopcion={adopcion}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AdopcionesListarPage;