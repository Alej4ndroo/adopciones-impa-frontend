// src/components/admin/CitasListarPage.jsx

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
    Event as EventIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    MedicalServices as MedicalServicesIcon,
    Description as DescriptionIcon,
    CalendarToday as CalendarTodayIcon,
    Pets as PetsIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    AttachMoney as AttachMoneyIcon,
    Work as WorkIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowUp as ArrowUpIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CITAS_ENDPOINT = '/citas/listar';

// Componente de tarjeta para móviles
const MobileCitaCard = ({ cita, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(cita.id_cita);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar la cita #${cita.id_cita}?`)) {
            if (onDelete) onDelete(cita.id_cita);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(cita.id_cita);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-MX', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
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

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'programada': return <ScheduleIcon />;
            case 'completada': return <CheckCircleIcon />;
            case 'cancelada': return <CancelIcon />;
            case 'no_asistio': return <WarningIcon />;
            default: return <InfoIcon />;
        }
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
                        <EventIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                                Cita #{cita.id_cita}
                            </Typography>
                            <Chip
                                label={getEstadoLabel(cita.estado_cita)}
                                size="small"
                                color={getEstadoColor(cita.estado_cita)}
                                icon={getEstadoIcon(cita.estado_cita)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        {cita.usuario && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {cita.usuario.nombre}
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            {formatDate(cita.fecha_cita)}
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
                    {/* Información de la Cita */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                            Información de la Cita
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <DescriptionIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mt: 0.3 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Motivo</Typography>
                                    <Typography variant="body2" fontWeight={500}>{cita.motivo}</Typography>
                                </Box>
                            </Box>
                            {cita.observaciones && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <InfoIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mt: 0.3 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                                        <Typography variant="body2">{cita.observaciones}</Typography>
                                    </Box>
                                </Box>
                            )}
                            {cita.costo && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Costo</Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                            ${parseFloat(cita.costo).toFixed(2)} MXN
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>

                    {/* Cliente */}
                    {cita.usuario && cita.usuario.id_usuario && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="secondary" sx={{ mb: 1.5 }}>
                                Cliente
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                    <Typography variant="body2" fontWeight={500}>{cita.usuario.nombre}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                    <Typography variant="body2">{cita.usuario.correo_electronico}</Typography>
                                </Box>
                                {cita.usuario.telefono && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <PhoneIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                        <Typography variant="body2">{cita.usuario.telefono}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Mascota */}
                    {cita.mascota && cita.mascota.id_mascota && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="success.main" sx={{ mb: 1.5 }}>
                                Mascota
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PetsIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                    <Typography variant="body2" fontWeight={500}>{cita.mascota.nombre}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {cita.mascota.especie?.charAt(0).toUpperCase() + cita.mascota.especie?.slice(1)} - {cita.mascota.raza}
                                </Typography>
                            </Stack>
                        </Card>
                    )}

                    {/* Servicio */}
                    {cita.servicio && cita.servicio.id_servicio && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="warning.main" sx={{ mb: 1.5 }}>
                                Servicio
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <MedicalServicesIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                    <Typography variant="body2" fontWeight={500}>{cita.servicio.nombre}</Typography>
                                </Box>
                                {cita.servicio.descripcion && (
                                    <Typography variant="body2" color="text.secondary">
                                        {cita.servicio.descripcion}
                                    </Typography>
                                )}
                                {cita.servicio.costo_base && (
                                    <Typography variant="body2" fontWeight={600}>
                                        Costo base: ${parseFloat(cita.servicio.costo_base).toFixed(2)} MXN
                                    </Typography>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Empleado */}
                    {cita.empleado && cita.empleado.id_empleado && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="info.main" sx={{ mb: 1.5 }}>
                                Empleado Asignado
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                                    <Typography variant="body2" fontWeight={500}>{cita.empleado.nombre}</Typography>
                                </Box>
                                {cita.empleado.especialidad && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <WorkIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                                        <Typography variant="body2">{cita.empleado.especialidad}</Typography>
                                    </Box>
                                )}
                                {cita.empleado.numero_empleado && (
                                    <Typography variant="caption" color="text.secondary">
                                        No. Empleado: {cita.empleado.numero_empleado}
                                    </Typography>
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
const CitaRow = ({ cita, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(cita.id_cita);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar la cita #${cita.id_cita}?`)) {
            if (onDelete) onDelete(cita.id_cita);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(cita.id_cita);
    };

    const toggleRow = () => {
        setOpen(!open);
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
                        label={`#${cita.id_cita}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={500}>
                            {formatDate(cita.fecha_cita)}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {cita.usuario && cita.usuario.id_usuario ? (
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
                                {cita.usuario.nombre?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500} noWrap>
                                {cita.usuario.nombre}
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, maxWidth: 200 }}>
                    <Typography variant="body2" noWrap>
                        {cita.motivo || 'Sin especificar'}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {cita.servicio && cita.servicio.id_servicio ? (
                        <Tooltip title={cita.servicio.descripcion || ''}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                                {cita.servicio.nombre}
                            </Typography>
                        </Tooltip>
                    ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={getEstadoLabel(cita.estado_cita)}
                        size="small" 
                        color={getEstadoColor(cita.estado_cita)}
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
                                {/* Información de la Cita */}
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.primary.main }} />
                                            <Typography variant="h6" fontWeight={600} color="primary">
                                                Información de la Cita
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Fecha y Hora</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {formatDateLong(cita.fecha_cita)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <DescriptionIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Motivo</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {cita.motivo}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {cita.observaciones && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <InfoIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                                                        <Typography variant="body2">
                                                            {cita.observaciones}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            {cita.costo && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Costo Total</Typography>
                                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                                            ${parseFloat(cita.costo).toFixed(2)} MXN
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Cliente */}
                                {cita.usuario && cita.usuario.id_usuario && (
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.secondary.main }} />
                                                <Typography variant="h6" fontWeight={600} color="secondary">
                                                    Cliente
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={2}>
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
                                                        {cita.usuario.nombre?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {cita.usuario.nombre}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <EmailIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {cita.usuario.correo_electronico}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {cita.usuario.telefono && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                            <PhoneIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {cita.usuario.telefono}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Mascota */}
                                {cita.mascota && cita.mascota.id_mascota && (
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
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.success.main, 0.2),
                                                            color: theme.palette.success.main,
                                                            width: 40,
                                                            height: 40
                                                        }}
                                                    >
                                                        <PetsIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {cita.mascota.nombre}
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
                                                            {cita.mascota.especie?.charAt(0).toUpperCase() + cita.mascota.especie?.slice(1)} - {cita.mascota.raza}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Servicio */}
                                {cita.servicio && cita.servicio.id_servicio && (
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.warning.main }} />
                                                <Typography variant="h6" fontWeight={600} color="warning.main">
                                                    Servicio
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                        <MedicalServicesIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">Nombre del Servicio</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {cita.servicio.nombre}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {cita.servicio.descripcion && (
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                            <DescriptionIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="caption" color="text.secondary">Descripción</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {cita.servicio.descripcion}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                                {cita.servicio.costo_base && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                            <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Costo Base</Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                ${parseFloat(cita.servicio.costo_base).toFixed(2)} MXN
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Empleado */}
                                {cita.empleado && cita.empleado.id_empleado && (
                                    <Grid item xs={12}>
                                        <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.info.main }} />
                                                <Typography variant="h6" fontWeight={600} color="info.main">
                                                    Empleado Asignado
                                                </Typography>
                                            </Stack>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {cita.empleado.nombre}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                {cita.empleado.especialidad && (
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                                <WorkIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">Especialidad</Typography>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {cita.empleado.especialidad}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                                {cita.empleado.numero_empleado && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            No. Empleado: {cita.empleado.numero_empleado}
                                                        </Typography>
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
const CitasListarPage = ({ isManagementView = false }) => {
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        estado: '',
        servicio: '',
        empleado: '',
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
            setFilteredCitas(receivedCitas);
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
        fetchCitas(); 
    }, []);

    // Aplicar filtros
    useEffect(() => {
        let filtered = citas;

        // Filtro de búsqueda
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(cita =>
                cita.id_cita?.toString().includes(searchTerm) ||
                cita.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cita.servicio?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por estado
        if (filters.estado) {
            filtered = filtered.filter(cita => cita.estado_cita === filters.estado);
        }

        // Filtro por servicio
        if (filters.servicio) {
            filtered = filtered.filter(cita => 
                cita.servicio?.nombre?.toLowerCase().includes(filters.servicio.toLowerCase())
            );
        }

        // Filtro por empleado
        if (filters.empleado) {
            filtered = filtered.filter(cita => 
                cita.empleado?.nombre?.toLowerCase().includes(filters.empleado.toLowerCase())
            );
        }

        // Filtro por rango de fechas
        if (filters.fechaDesde) {
            filtered = filtered.filter(cita => 
                new Date(cita.fecha_cita) >= new Date(filters.fechaDesde)
            );
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59, 999);
            filtered = filtered.filter(cita => 
                new Date(cita.fecha_cita) <= fechaHasta
            );
        }

        setFilteredCitas(filtered);
    }, [searchTerm, filters, citas]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            estado: '',
            servicio: '',
            empleado: '',
            fechaDesde: '',
            fechaHasta: ''
        });
        setSearchTerm('');
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0);

    const handleEdit = (idCita) => {
        navigate(`/admin/citas/editar/${idCita}`);
    };

    const handleDelete = async (idCita) => {
        console.log('Eliminar cita:', idCita);
        // Implementar lógica de eliminación
        fetchCitas();
    };

    const handleView = (idCita) => {
        navigate(`/citas/${idCita}`);
    };

    // Obtener listas únicas para los filtros
    const estadosUnicos = [...new Set(citas.map(c => c.estado_cita))];
    const serviciosUnicos = [...new Set(citas.filter(c => c.servicio).map(c => c.servicio.nombre))];
    const empleadosUnicos = [...new Set(citas.filter(c => c.empleado).map(c => c.empleado.nombre))];

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
                            <EventIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                        </Box>
                        <Box>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                                {isManagementView ? 'Gestión de Citas' : 'Lista de Citas'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filteredCitas.length} de {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buscador */}
                    <TextField
                        placeholder="Buscar por ID, cliente, motivo..."
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
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filters.estado}
                                    label="Estado"
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
                            <TextField
                                fullWidth
                                size="small"
                                label="Servicio"
                                value={filters.servicio}
                                onChange={(e) => handleFilterChange('servicio', e.target.value)}
                                placeholder="Buscar por servicio..."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Empleado"
                                value={filters.empleado}
                                onChange={(e) => handleFilterChange('empleado', e.target.value)}
                                placeholder="Buscar por empleado..."
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
            {filteredCitas.length === 0 ? (
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
                        {searchTerm || activeFiltersCount > 0 
                            ? 'No se encontraron citas con los filtros aplicados' 
                            : 'No hay citas registradas'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || activeFiltersCount > 0 
                            ? 'Intenta cambiar los filtros de búsqueda' 
                            : 'Las citas que registres aparecerán aquí'}
                    </Typography>
                </Paper>
            ) : isMobile ? (
                // Vista de tarjetas para móviles
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredCitas.map((cita) => (
                        <MobileCitaCard
                            key={cita.id_cita}
                            cita={cita}
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
                                <TableCell>Fecha y Hora</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Cliente</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Motivo</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Servicio</TableCell>
                                <TableCell align="center">Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCitas.map((cita) => (
                                <CitaRow
                                    key={cita.id_cita}
                                    cita={cita}
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

export default CitasListarPage;