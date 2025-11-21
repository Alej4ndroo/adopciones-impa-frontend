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
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    CrueltyFree,
    BugReport,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowUp as ArrowUpIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Cake as CakeIcon,
    MedicalServices as MedicalIcon,
    Palette as PaletteIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Description as DescriptionIcon,
    Close as CloseIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PETS_ENDPOINT = '/mascotas/listar'; 
const TAMANO_LABELS = { 'pequeño': 'Pequeño', 'pequeño': 'Pequeño', pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };

// Componente de tarjeta para móviles
const MobilePetCard = ({ pet, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(pet.id_mascota);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar a ${pet.nombre}?`)) {
            if (onDelete) onDelete(pet.id_mascota);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(pet.id_mascota);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'disponible': return 'success';
            case 'en_proceso': return 'warning';
            case 'adoptado': return 'primary';
            default: return 'default';
        }
    };

    const getSpeciesIcon = (especie) => {
        switch(especie?.toLowerCase()) {
            case 'perro':
            case 'gato':
                return <PetsIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            case 'conejo':
                return <CrueltyFree sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            default:
                return <BugReport sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
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
                        src={pet.imagenes_base64?.[0] || undefined}
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 56,
                            height: 56,
                            fontSize: 20,
                            fontWeight: 700,
                            border: `3px solid ${theme.palette.primary.main}`
                        }}
                    >
                        {!pet.imagenes_base64?.[0] && getSpeciesIcon(pet.especie)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                                {pet.nombre}
                            </Typography>
                            <Chip
                                label={pet.estado_adopcion}
                                size="small"
                                color={getStatusColor(pet.estado_adopcion)}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                            #{pet.id_mascota} • {pet.especie?.charAt(0).toUpperCase() + pet.especie?.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {pet.raza || 'Raza no especificada'}
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
                    {/* Imágenes */}
                    {pet.imagenes_base64 && pet.imagenes_base64.length > 0 && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                                Galería de Imágenes
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                {pet.imagenes_base64.map((img, idx) => (
                                    <Box
                                        key={idx}
                                        component="img"
                                        src={img}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: theme.shadows[4]
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                        alt={`${pet.nombre} ${idx + 1}`}
                                    />
                                ))}
                            </Stack>
                        </Card>
                    )}

                    {/* Características */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                            Características
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Edad</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Sexo</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {pet.sexo?.charAt(0).toUpperCase() + pet.sexo?.slice(1)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {TAMANO_LABELS[pet.tamano] || pet.tamano}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Color</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {pet.color || 'No especificado'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Salud */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="success.main" sx={{ mb: 1.5 }}>
                            Estado de Salud
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip 
                                label={pet.vacunado ? 'Vacunado' : 'Sin vacunar'}
                                size="small"
                                color={pet.vacunado ? 'success' : 'default'}
                                icon={<MedicalIcon />}
                            />
                            <Chip 
                                label={pet.esterilizado ? 'Esterilizado' : 'No esterilizado'}
                                size="small"
                                color={pet.esterilizado ? 'success' : 'default'}
                                icon={<MedicalIcon />}
                            />
                        </Stack>
                    </Card>

                    {/* Descripción */}
                    {pet.descripcion && (
                        <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={600} color="info.main" sx={{ mb: 1 }}>
                                Descripción
                            </Typography>
                            <Typography variant="body2">{pet.descripcion}</Typography>
                        </Card>
                    )}

                    {/* Información adicional */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="secondary" sx={{ mb: 1.5 }}>
                            Información Adicional
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Fecha de Ingreso</Typography>
                                    <Typography variant="body2" fontWeight={500}>{formatDate(pet.fecha_ingreso)}</Typography>
                                </Box>
                            </Box>
                            {pet.usuarios && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Registrado por</Typography>
                                        <Typography variant="body2" fontWeight={500}>{pet.usuarios.nombre}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>
                    </Card>

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
const PetRow = ({ pet, onEdit, onDelete, onView }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(pet.id_mascota);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar a ${pet.nombre}?`)) {
            if (onDelete) onDelete(pet.id_mascota);
        }
    };

    const handleView = (e) => {
        e.stopPropagation();
        if (onView) onView(pet.id_mascota);
    };

    const toggleRow = () => {
        setOpen(!open);
    };

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'disponible': return 'success';
            case 'en_proceso': return 'warning';
            case 'adoptado': return 'primary';
            default: return 'default';
        }
    };

    const getSpeciesIcon = (especie) => {
        switch(especie?.toLowerCase()) {
            case 'perro':
            case 'gato':
                return <PetsIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            case 'conejo':
                return <CrueltyFree sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
            default:
                return <BugReport sx={{ fontSize: 20, color: theme.palette.primary.main }} />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                        label={`#${pet.id_mascota}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                        }}
                    />
                </TableCell>
                <TableCell sx={{ width: 60 }}>
                    <Avatar
                        src={pet.imagenes_base64?.[0] || undefined}
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 45,
                            height: 45,
                            fontSize: 18,
                            border: `2px solid ${theme.palette.primary.main}`
                        }}
                    >
                        {!pet.imagenes_base64?.[0] && getSpeciesIcon(pet.especie)}
                    </Avatar>
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {getSpeciesIcon(pet.especie)}
                        <Typography fontWeight={600}>
                            {pet.nombre}
                        </Typography>
                    </Stack>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip 
                        label={pet.especie?.charAt(0).toUpperCase() + pet.especie?.slice(1)} 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                    />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {pet.raza || 'N/A'}
                </TableCell>
                <TableCell>
                    {`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {pet.sexo?.charAt(0).toUpperCase() + pet.sexo?.slice(1)}
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={pet.estado_adopcion} 
                        size="small" 
                        color={getStatusColor(pet.estado_adopcion)}
                        sx={{ fontWeight: 600 }}
                    />
                </TableCell>
            </TableRow>

            {/* Fila expandible */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            py: 3, 
                            px: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 2,
                            my: 1
                        }}>
                            <Grid container spacing={3}>
                                {/* Galería de imágenes */}
                                {pet.imagenes_base64 && pet.imagenes_base64.length > 0 && (
                                    <Grid item xs={12}>
                                        <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <ImageIcon sx={{ color: theme.palette.primary.main }} />
                                                <Typography variant="h6" fontWeight={600} color="primary">
                                                    Galería de Imágenes
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                                                {pet.imagenes_base64.map((img, idx) => (
                                                    <Box
                                                        key={idx}
                                                        component="img"
                                                        src={img}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            borderRadius: 2,
                                                            objectFit: 'cover',
                                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                boxShadow: theme.shadows[8]
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        alt={`${pet.nombre} ${idx + 1}`}
                                                    />
                                                ))}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Características físicas */}
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.primary.main }} />
                                            <Typography variant="h6" fontWeight={600} color="primary">
                                                Características Físicas
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <CakeIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Edad</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {`${Math.floor(pet.edad_en_meses / 12)} años ${pet.edad_en_meses % 12} meses`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <PetsIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {TAMANO_LABELS[pet.tamano] || pet.tamano}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <PersonIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Sexo</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {pet.sexo?.charAt(0).toUpperCase() + pet.sexo?.slice(1)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1, borderRadius: 1.5, display: 'flex' }}>
                                                    <PaletteIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Color</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {pet.color || 'No especificado'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Estado de salud */}
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: theme.palette.success.main }} />
                                            <Typography variant="h6" fontWeight={600} color="success.main">
                                                Estado de Salud
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                    Vacunación
                                                </Typography>
                                                <Chip 
                                                    label={pet.vacunado ? 'Vacunado' : 'Sin vacunar'}
                                                    size="small"
                                                    color={pet.vacunado ? 'success' : 'default'}
                                                    icon={<MedicalIcon />}
                                                />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                    Esterilización
                                                </Typography>
                                                <Chip 
                                                    label={pet.esterilizado ? 'Esterilizado' : 'No esterilizado'}
                                                    size="small"
                                                    color={pet.esterilizado ? 'success' : 'default'}
                                                    icon={<MedicalIcon />}
                                                />
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Descripción */}
                                {pet.descripcion && (
                                    <Grid item xs={12}>
                                        <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <DescriptionIcon sx={{ color: theme.palette.info.main }} />
                                                <Typography variant="h6" fontWeight={600} color="info.main">
                                                    Descripción
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2">{pet.descripcion}</Typography>
                                        </Card>
                                    </Grid>
                                )}

                                {/* Información adicional */}
                                <Grid item xs={12}>
                                    <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                                        <Typography variant="h6" fontWeight={600} color="secondary" sx={{ mb: 2 }}>
                                            Información Adicional
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <CalendarIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Fecha de Ingreso</Typography>
                                                        <Typography variant="body2" fontWeight={500}>{formatDate(pet.fecha_ingreso)}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            {pet.usuarios && (
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <PersonIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Registrado por</Typography>
                                                            <Typography variant="body2" fontWeight={500}>{pet.usuarios.nombre}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Card>
                                </Grid>

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
const MascotasListarPage = ({ isManagementView = false }) => {
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        especie: '',
        sexo: '',
        tamano: '',
        estado: '',
        vacunado: '',
        esterilizado: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

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

            console.log("[MascotasListarPage] Mascotas recibidas:", receivedPets);
            setPets(receivedPets);
            setFilteredPets(receivedPets);
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
        fetchPets(); 
    }, []);

    // Aplicar filtros
    useEffect(() => {
        let filtered = pets;

        // Filtro de búsqueda por nombre
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(pet =>
                pet.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pet.raza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pet.id_mascota?.toString().includes(searchTerm)
            );
        }

        // Filtros específicos
        if (filters.especie) {
            filtered = filtered.filter(pet => pet.especie === filters.especie);
        }
        if (filters.sexo) {
            filtered = filtered.filter(pet => pet.sexo === filters.sexo);
        }
        if (filters.tamano) {
            filtered = filtered.filter(pet => pet.tamano === filters.tamano);
        }
        if (filters.estado) {
            filtered = filtered.filter(pet => pet.estado_adopcion === filters.estado);
        }
        if (filters.vacunado !== '') {
            filtered = filtered.filter(pet => pet.vacunado === (filters.vacunado === 'true'));
        }
        if (filters.esterilizado !== '') {
            filtered = filtered.filter(pet => pet.esterilizado === (filters.esterilizado === 'true'));
        }

        setFilteredPets(filtered);
    }, [searchTerm, filters, pets]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            especie: '',
            sexo: '',
            tamano: '',
            estado: '',
            vacunado: '',
            esterilizado: ''
        });
        setSearchTerm('');
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length + (searchTerm ? 1 : 0);

    const handleEdit = (idMascota) => {
        navigate(`/admin/mascotas/editar/${idMascota}`);
    };

    const handleDelete = async (idMascota) => {
        console.log('Eliminar mascota:', idMascota);
        // Implementar lógica de eliminación
        fetchPets();
    };

    const handleView = (idMascota) => {
        navigate(`/mascotas/${idMascota}`);
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
                            <PetsIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                        </Box>
                        <Box>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                                Lista de Mascotas
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filteredPets.length} de {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buscador */}
                    <TextField
                        placeholder="Buscar por nombre, raza o ID..."
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
                                <InputLabel>Especie</InputLabel>
                                <Select
                                    value={filters.especie}
                                    label="Especie"
                                    onChange={(e) => handleFilterChange('especie', e.target.value)}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="perro">Perro</MenuItem>
                                    <MenuItem value="gato">Gato</MenuItem>
                                    <MenuItem value="conejo">Conejo</MenuItem>
                                    <MenuItem value="otro">Otro</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sexo</InputLabel>
                                <Select
                                    value={filters.sexo}
                                    label="Sexo"
                                    onChange={(e) => handleFilterChange('sexo', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="macho">Macho</MenuItem>
                                    <MenuItem value="hembra">Hembra</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tamaño</InputLabel>
                                <Select
                                    value={filters.tamano}
                                    label="Tamaño"
                                    onChange={(e) => handleFilterChange('tamano', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="pequeño">Pequeño</MenuItem>
                                    <MenuItem value="mediano">Mediano</MenuItem>
                                    <MenuItem value="grande">Grande</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado de Adopción</InputLabel>
                                <Select
                                    value={filters.estado}
                                    label="Estado de Adopción"
                                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="disponible">Disponible</MenuItem>
                                    <MenuItem value="en_proceso">En Proceso</MenuItem>
                                    <MenuItem value="adoptado">Adoptado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Vacunado</InputLabel>
                                <Select
                                    value={filters.vacunado}
                                    label="Vacunado"
                                    onChange={(e) => handleFilterChange('vacunado', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="true">Sí</MenuItem>
                                    <MenuItem value="false">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Esterilizado</InputLabel>
                                <Select
                                    value={filters.esterilizado}
                                    label="Esterilizado"
                                    onChange={(e) => handleFilterChange('esterilizado', e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="true">Sí</MenuItem>
                                    <MenuItem value="false">No</MenuItem>
                                </Select>
                            </FormControl>
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
            {filteredPets.length === 0 ? (
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
                        {searchTerm || activeFiltersCount > 0 
                            ? 'No se encontraron mascotas con los filtros aplicados' 
                            : 'No hay mascotas registradas'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || activeFiltersCount > 0 
                            ? 'Intenta cambiar los filtros de búsqueda' 
                            : 'Las mascotas que registres aparecerán aquí'}
                    </Typography>
                </Paper>
            ) : isMobile ? (
                // Vista de tarjetas para móviles
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredPets.map((pet) => (
                        <MobilePetCard
                            key={pet.id_mascota}
                            pet={pet}
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
                                <TableCell>Foto</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Especie</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Raza</TableCell>
                                <TableCell>Edad</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Sexo</TableCell>
                                <TableCell align="center">Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPets.map((pet) => (
                                <PetRow
                                    key={pet.id_mascota}
                                    pet={pet}
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

export default MascotasListarPage;
