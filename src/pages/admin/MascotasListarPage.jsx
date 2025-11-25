import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, Alert, Chip, useTheme,
    Stack, alpha, Card, IconButton, Collapse, Avatar,
    TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
    Grid, Divider, Button, useMediaQuery, Badge, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControlLabel, Checkbox
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
    MedicalServices as MedicalIcon,
    CalendarToday as CalendarIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PETS_ENDPOINT = '/mascotas/listar'; 
const TAMANO_LABELS = { 'pequeño': 'Pequeño', 'pequeño': 'Pequeño', pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };
const ESPECIE_OPTIONS = ['perro', 'gato', 'conejo', 'hamster', 'otro'];
const TAMANO_OPTIONS = [
    { value: 'pequeño', label: 'Pequeño' },
    { value: 'mediano', label: 'Mediano' },
    { value: 'grande', label: 'Grande' }
];
const SEXO_OPTIONS = ['macho', 'hembra'];
const ESTADO_ADOPCION_OPTIONS = ['disponible', 'en_proceso', 'adoptado'];
const getEstadoLabel = (estado) => {
    if (!estado) return 'N/A';
    if (estado === 'en_proceso') return 'Pendiente';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
};
const resolveEstadoAdopcion = (pet, adoptionMap = {}) => {
    if (!pet) return 'disponible';
    const entry = adoptionMap[pet.id_mascota];
    const adoptionState = typeof entry === 'string' ? entry : entry?.estado;
    if (adoptionState === 'rechazada') return 'disponible';
    if (adoptionState) return adoptionState;
    if (pet.estado_adopcion) return pet.estado_adopcion;
    if (pet.estado) return pet.estado; // posible nombre alternativo desde adopciones
    if (pet.estado_solicitud) {
        if (pet.estado_solicitud === 'aprobada') return 'adoptado';
        if (pet.estado_solicitud === 'rechazada') return 'disponible';
        return 'en_proceso';
    }
    return 'disponible';
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Componente de tarjeta para móviles
const MobilePetCard = ({ pet, onEdit, onToggleActive, onView, adoptionMap = {} }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(pet.id_mascota);
    };

    const handleToggle = (e) => {
        e.stopPropagation();
        if (onToggleActive) onToggleActive(pet);
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
                                label={getEstadoLabel(resolveEstadoAdopcion(pet, adoptionMap))}
                                size="small"
                                color={getStatusColor(resolveEstadoAdopcion(pet, adoptionMap))}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        <Chip
                            label={pet.activo ? 'Activa' : 'Inactiva'}
                            size="small"
                            color={pet.activo ? 'success' : 'default'}
                            sx={{ mb: 0.5, fontWeight: 600 }}
                        />
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
                    <Stack spacing={2}>
                        <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                    icon={<MedicalIcon fontSize="small" />}
                                    label={`ID: ${pet.id_mascota}`}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main }}
                                />
                                <Chip
                                    icon={<CalendarIcon fontSize="small" />}
                                    label={formatDate(pet.fecha_ingreso)}
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                />
                                {resolveEstadoAdopcion(pet, adoptionMap) && (
                                    <Chip
                                        label={getEstadoLabel(resolveEstadoAdopcion(pet, adoptionMap))}
                                        size="small"
                                        color={getStatusColor(resolveEstadoAdopcion(pet, adoptionMap))}
                                        sx={{ fontWeight: 700 }}
                                    />
                                )}
                            </Stack>
                        </Card>

                        {pet.imagenes_base64 && pet.imagenes_base64.length > 0 && (
                            <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                                <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                                    Galería
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
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
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                            }}
                                            alt={`${pet.nombre} ${idx + 1}`}
                                        />
                                    ))}
                                </Stack>
                            </Card>
                        )}

                        <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                            <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                                Datos rápidos
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Raza</Typography>
                                    <Typography variant="body2" fontWeight={600}>{pet.raza || 'No especificada'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Edad</Typography>
                                    <Typography variant="body2" fontWeight={600}>{`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                                    <Typography variant="body2" fontWeight={600}>{TAMANO_LABELS[pet.tamano] || pet.tamano}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Sexo</Typography>
                                    <Typography variant="body2" fontWeight={600}>{pet.sexo?.charAt(0).toUpperCase() + pet.sexo?.slice(1)}</Typography>
                                </Grid>
                            </Grid>
                        </Card>

                        <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                            <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                                Salud
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

                        {/* Botones de acción */}
                        <Stack spacing={1.25} sx={{ pt: 0.5 }}>
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
                            <Stack direction="row" spacing={1.25}>
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
                                    color={pet.activo ? 'error' : 'success'}
                                    onClick={handleToggle}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {pet.activo ? 'No Activa' : 'Activar'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Box>
            </Collapse>
        </Card>
    );
};

// Componente de fila expandible para tabla
const PetRow = ({ pet, onEdit, onToggleActive, onView, adoptionMap = {} }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(pet.id_mascota);
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
                    <Stack direction="column" spacing={0.5} alignItems="center">
                        <Chip 
                            label={getEstadoLabel(resolveEstadoAdopcion(pet, adoptionMap))} 
                            size="small" 
                            color={getStatusColor(resolveEstadoAdopcion(pet, adoptionMap))}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={pet.activo ? 'Activa' : 'Inactiva'}
                            size="small"
                            color={pet.activo ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Fila expandible */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            py: 3, 
                            px: { xs: 1.5, sm: 2 },
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 2,
                            my: 1
                        }}>
                            <Grid container spacing={2.5}>
                                {pet.imagenes_base64 && pet.imagenes_base64.length > 0 && (
                                    <Grid item xs={12}>
                                        <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                            <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                                                Galería
                                            </Typography>
                                            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
                                                {pet.imagenes_base64.map((img, idx) => (
                                                    <Box
                                                        key={idx}
                                                        component="img"
                                                        src={img}
                                                        sx={{
                                                            width: 110,
                                                            height: 110,
                                                            borderRadius: 2,
                                                            objectFit: 'cover',
                                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                                        }}
                                                        alt={`${pet.nombre} ${idx + 1}`}
                                                    />
                                                ))}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}

                                <Grid item xs={12} md={8}>
                                    <Card elevation={0} sx={{ p: 2.5, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                            <Chip 
                                                label={`#${pet.id_mascota}`}
                                                size="small"
                                                sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}
                                            />
                                            <Chip 
                                                label={getEstadoLabel(resolveEstadoAdopcion(pet, adoptionMap))}
                                                size="small"
                                                color={getStatusColor(resolveEstadoAdopcion(pet, adoptionMap))}
                                                sx={{ fontWeight: 700 }}
                                            />
                                            <Chip 
                                                label={pet.especie?.charAt(0).toUpperCase() + pet.especie?.slice(1)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Stack>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary">Raza</Typography>
                                                <Typography variant="body2" fontWeight={600}>{pet.raza || 'No especificada'}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary">Edad</Typography>
                                                <Typography variant="body2" fontWeight={600}>{`${Math.floor(pet.edad_en_meses / 12)}a ${pet.edad_en_meses % 12}m`}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary">Sexo</Typography>
                                                <Typography variant="body2" fontWeight={600}>{pet.sexo?.charAt(0).toUpperCase() + pet.sexo?.slice(1)}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                                                <Typography variant="body2" fontWeight={600}>{TAMANO_LABELS[pet.tamano] || pet.tamano}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary">Color</Typography>
                                                <Typography variant="body2" fontWeight={600}>{pet.color || 'No especificado'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card elevation={0} sx={{ p: 2.5, height: '100%', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                                        <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mb: 1.5 }}>
                                            Salud y adopción
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                                            <Chip 
                                                label={getEstadoLabel(resolveEstadoAdopcion(pet, adoptionMap))}
                                                size="small"
                                                color={getStatusColor(resolveEstadoAdopcion(pet, adoptionMap))}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Stack>
                                    </Card>
                                </Grid>

                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DeleteIcon />}
                                    color={pet.activo ? 'error' : 'success'}
                                    onClick={() => onToggleActive?.(pet)}
                                    sx={{ borderRadius: 2, fontWeight: 600, px: 3, flex: 1 }}
                                >
                                    {pet.activo ? 'No Activa' : 'Activar'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={handleEdit}
                                    sx={{ borderRadius: 2, fontWeight: 600, px: 3, flex: 1 }}
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
                                        flex: 1,
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
    const [adoptionMap, setAdoptionMap] = useState({});
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        nombre: '',
        especie: '',
        raza: '',
        edad_en_meses: '',
        color: '',
        tamano: '',
        sexo: '',
        descripcion: '',
        vacunado: false,
        esterilizado: false,
        estado_adopcion: 'disponible',
        activo: true
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    useEffect(() => {
        const fetchAdoptions = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const resp = await axios.get(`${API_URL_BACKEND}/adopciones/listar`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const adopciones = Array.isArray(resp.data) ? resp.data : [];
                const map = {};
                adopciones.forEach((adopcion) => {
                    const idMascota = adopcion.mascota?.id_mascota || adopcion.id_mascota;
                    if (!idMascota) return;
                    const estadoSolicitud = adopcion.estado_solicitud;
                    const estado = adopcion.estado;
                    let resolved = 'en_proceso';
                    if (estado === 'adoptado' || estadoSolicitud === 'aprobada') {
                        resolved = 'adoptado';
                    } else if (estadoSolicitud === 'rechazada') {
                        resolved = null;
                    }
                    // No sobrescribir adoptado
                    if (map[idMascota]?.estado === 'adoptado') return;
                    if (resolved) {
                        map[idMascota] = { estado: resolved, id_adopcion: adopcion.id_adopcion };
                    }
                });
                setAdoptionMap(map);
            } catch (err) {
                console.error('Error al cargar adopciones:', err);
            }
        };
        fetchAdoptions();
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
    const authHeaders = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    const updatePetOnServer = async (idMascota, payload) => {
        const headers = authHeaders();
        if (!headers) {
            setError('No autenticado. Por favor, inicie sesión.');
            return false;
        }

        try {
            await axios.put(
                `${API_URL_BACKEND}/mascotas/actualizar/${idMascota}`,
                payload,
                { headers }
            );
            return true;
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Endpoint /mascotas/actualizar/:id no encontrado en backend.');
                return false;
            }
            throw err;
        }
    };

    const openEditDialog = (pet) => {
        if (!pet) return;
        setSelectedPet(pet);
        setEditForm({
            nombre: pet.nombre || '',
            especie: pet.especie || '',
            raza: pet.raza || '',
            edad_en_meses: pet.edad_en_meses || '',
            color: pet.color || '',
            tamano: pet.tamano || '',
            sexo: pet.sexo || '',
            descripcion: pet.descripcion || '',
            vacunado: Boolean(pet.vacunado),
            esterilizado: Boolean(pet.esterilizado),
            estado_adopcion: pet.estado_adopcion || 'disponible',
            activo: pet.activo !== false
        });
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedPet(null);
    };

    const handleEditChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSubmit = async () => {
        if (!selectedPet) return;
        try {
            setSavingEdit(true);
            const payload = {
                ...editForm,
                edad_en_meses: Number(editForm.edad_en_meses) || 0
            };
            const updated = await updatePetOnServer(selectedPet.id_mascota, payload);
            if (!updated) return;

            const updater = (list) => list.map((pet) => (
                pet.id_mascota === selectedPet.id_mascota
                    ? { ...pet, ...payload }
                    : pet
            ));
            setPets(updater);
            setFilteredPets(updater);
            closeEditDialog();
        } catch (err) {
            console.error('Error al actualizar mascota:', err);
            setError('No se pudo actualizar la mascota. Intenta nuevamente.');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleEdit = (idMascota) => {
        const pet = pets.find((p) => p.id_mascota === idMascota);
        if (pet) openEditDialog(pet);
    };

    const handleToggleActive = async (pet) => {
        if (!pet) return;
        const nextActive = !pet.activo;
        const adoptionInfo = adoptionMap[pet.id_mascota];
        const prevAdoptionState = typeof adoptionInfo === 'object' ? adoptionInfo?.estado : adoptionInfo;
        const actionText = nextActive ? 'activar' : 'poner como No Activa';
        if (!window.confirm(`¿Quieres ${actionText} a ${pet.nombre}?`)) return;
        const payload = {
            activo: nextActive,
            ...(nextActive && prevAdoptionState === 'rechazada' ? { estado_adopcion: 'disponible' } : {})
        };
        try {
            const updated = await updatePetOnServer(pet.id_mascota, payload);
            if (!updated) return;
            const updater = (list) => list.map((p) => (
                p.id_mascota === pet.id_mascota ? { ...p, ...payload } : p
            ));
            setPets(updater);
            setFilteredPets(updater);
            // Si hay adopción asociada, rechazarla al desactivar o volverla a pendiente al activar
            const idAdopcion = typeof adoptionInfo === 'object' ? adoptionInfo?.id_adopcion : null;
            if (idAdopcion) {
                const token = localStorage.getItem('authToken');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                // Si venía rechazada y se reactiva, limpiar la asociación local y dejar disponible
                if (nextActive && prevAdoptionState === 'rechazada') {
                    setAdoptionMap((prev) => {
                        const next = { ...prev };
                        delete next[pet.id_mascota];
                        return next;
                    });
                } else {
                    const estado_solicitud = nextActive ? 'en_revision' : 'rechazada';
                    await axios.patch(
                        `${API_URL_BACKEND}/adopciones/${idAdopcion}/rechazar`,
                        { estado_solicitud },
                        { headers }
                    );
                    setAdoptionMap((prev) => ({
                        ...prev,
                        [pet.id_mascota]: {
                            id_adopcion: idAdopcion,
                            estado: nextActive ? 'en_proceso' : 'rechazada'
                        }
                    }));
                }
            }
        } catch (err) {
            console.error('Error al actualizar estado de mascota:', err);
            setError('No se pudo actualizar el estado de la mascota. Verifica permisos o intenta más tarde.');
        }
    };

    const handleView = (idMascota) => {
        const pet = pets.find((p) => p.id_mascota === idMascota);
        if (!pet) return;
        setSelectedPet(pet);
        setViewDialogOpen(true);
    };

    const closeViewDialog = () => {
        setViewDialogOpen(false);
        setSelectedPet(null);
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
                            onToggleActive={handleToggleActive}
                            onView={handleView}
                            adoptionMap={adoptionMap}
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
                                    onToggleActive={handleToggleActive}
                                    onView={handleView}
                                    adoptionMap={adoptionMap}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialogo de edición */}
            <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>Editar Mascota</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label="Nombre"
                            value={editForm.nombre}
                            onChange={handleEditChange('nombre')}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Especie</InputLabel>
                            <Select
                                value={editForm.especie}
                                label="Especie"
                                onChange={handleEditChange('especie')}
                            >
                                {ESPECIE_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Raza"
                            value={editForm.raza}
                            onChange={handleEditChange('raza')}
                            fullWidth
                        />
                        <TextField
                            label="Edad (meses)"
                            type="number"
                            value={editForm.edad_en_meses}
                            onChange={handleEditChange('edad_en_meses')}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Color"
                            value={editForm.color}
                            onChange={handleEditChange('color')}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tamaño</InputLabel>
                            <Select
                                value={editForm.tamano}
                                label="Tamaño"
                                onChange={handleEditChange('tamano')}
                            >
                                {TAMANO_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Sexo</InputLabel>
                            <Select
                                value={editForm.sexo}
                                label="Sexo"
                                onChange={handleEditChange('sexo')}
                            >
                                {SEXO_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Descripción"
                            multiline
                            minRows={3}
                            value={editForm.descripcion}
                            onChange={handleEditChange('descripcion')}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Estado de adopción</InputLabel>
                            <Select
                                value={editForm.estado_adopcion}
                                label="Estado de adopción"
                                onChange={handleEditChange('estado_adopcion')}
                            >
                                {ESTADO_ADOPCION_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>{opt.replace('_', ' ')}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Stack direction="row" spacing={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={editForm.vacunado}
                                        onChange={handleEditChange('vacunado')}
                                    />
                                }
                                label="Vacunado"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={editForm.esterilizado}
                                        onChange={handleEditChange('esterilizado')}
                                    />
                                }
                                label="Esterilizado"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={editForm.activo}
                                        onChange={handleEditChange('activo')}
                                    />
                                }
                                label="Activo"
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSubmit}
                        disabled={savingEdit}
                    >
                        {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogo de detalles */}
            <Dialog open={viewDialogOpen} onClose={closeViewDialog} fullWidth maxWidth="sm">
                <DialogTitle>Detalles de la mascota</DialogTitle>
                <DialogContent dividers>
                    {selectedPet && (
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={`#${selectedPet.id_mascota}`} />
                                <Chip label={getEstadoLabel(selectedPet.estado_adopcion)} color={selectedPet.estado_adopcion === 'disponible' ? 'success' : selectedPet.estado_adopcion === 'en_proceso' ? 'warning' : 'default'} />
                                <Chip label={selectedPet.activo === false ? 'Inactivo' : 'Activo'} color={selectedPet.activo === false ? 'default' : 'success'} />
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedPet.nombre}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Especie</Typography>
                                    <Typography variant="body1">{selectedPet.especie}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Raza</Typography>
                                    <Typography variant="body1">{selectedPet.raza || 'No especificada'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Edad</Typography>
                                    <Typography variant="body1">{`${Math.floor(selectedPet.edad_en_meses / 12)}a ${selectedPet.edad_en_meses % 12}m`}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Color</Typography>
                                    <Typography variant="body1">{selectedPet.color}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Tamaño</Typography>
                                    <Typography variant="body1">{TAMANO_LABELS[selectedPet.tamano] || selectedPet.tamano}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Sexo</Typography>
                                    <Typography variant="body1">{selectedPet.sexo}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Vacunado</Typography>
                                    <Typography variant="body1">{selectedPet.vacunado ? 'Sí' : 'No'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Esterilizado</Typography>
                                    <Typography variant="body1">{selectedPet.esterilizado ? 'Sí' : 'No'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Fecha de ingreso</Typography>
                                    <Typography variant="body1">{formatDate(selectedPet.fecha_ingreso)}</Typography>
                                </Grid>
                                {selectedPet.descripcion && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Descripción</Typography>
                                        <Typography variant="body1">{selectedPet.descripcion}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeViewDialog}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MascotasListarPage;
