import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Chip,
    Grid,
    TextField,
    InputAdornment,
    useTheme,
    useMediaQuery,
    Divider,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    AccessTime as AccessTimeIcon,
    Pets as PetsIcon,
    MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const LIST_ENDPOINT = '/servicios/listar';
const CREATE_ENDPOINT = '/servicios/crear';
const UPDATE_ENDPOINT = (id) => `/servicios/actualizar/${id}`;
const ACTIVATE_ENDPOINT = (id) => `/servicios/activar/${id}`;
const DEACTIVATE_ENDPOINT = (id) => `/servicios/desactivar/${id}`;

const ServiciosListarPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        costo_base: '',
        duracion_estimada_min: '',
        requiere_mascota: false
    });

    const authHeaders = () => {
        const token = localStorage.getItem('authToken');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchServicios = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${API_URL_BACKEND}${LIST_ENDPOINT}`, {
                headers: authHeaders()
            });
            setServicios(resp.data || []);
        } catch (err) {
            console.error('Error al cargar servicios:', err);
            setError('No se pudieron cargar los servicios. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios();
    }, []);

    const filteredServicios = useMemo(() => {
        return servicios.filter((s) => {
            const matchSearch =
                s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                s.descripcion?.toLowerCase().includes(search.toLowerCase());
            const matchStatus =
                statusFilter === 'todos' ||
                (statusFilter === 'activos' && s.activo) ||
                (statusFilter === 'inactivos' && !s.activo);
            return matchSearch && matchStatus;
        });
    }, [servicios, search, statusFilter]);

    const handleToggleActivo = async (servicio) => {
        const endpoint = servicio.activo ? DEACTIVATE_ENDPOINT(servicio.id_servicio) : ACTIVATE_ENDPOINT(servicio.id_servicio);
        setSaving(true);
        try {
            await axios.patch(`${API_URL_BACKEND}${endpoint}`, {}, { headers: authHeaders() });
            setServicios((prev) =>
                prev.map((s) =>
                    s.id_servicio === servicio.id_servicio ? { ...s, activo: !servicio.activo } : s
                )
            );
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            setError('No se pudo actualizar el estado del servicio.');
        } finally {
            setSaving(false);
        }
    };

    const openEditDialog = (servicio) => {
        setSelectedServicio(servicio);
        setForm({
            nombre: servicio?.nombre || '',
            descripcion: servicio?.descripcion || '',
            costo_base: servicio?.costo_base ?? '',
            duracion_estimada_min: servicio?.duracion_estimada_min ?? '',
            requiere_mascota: Boolean(servicio?.requiere_mascota)
        });
        setEditDialogOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveEdit = async () => {
        if (!selectedServicio) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                costo_base: form.costo_base ? parseFloat(form.costo_base) : null,
                duracion_estimada_min: form.duracion_estimada_min ? parseInt(form.duracion_estimada_min, 10) : null
            };
            const resp = await axios.put(
                `${API_URL_BACKEND}${UPDATE_ENDPOINT(selectedServicio.id_servicio)}`,
                payload,
                { headers: authHeaders() }
            );
            setServicios((prev) =>
                prev.map((s) => (s.id_servicio === selectedServicio.id_servicio ? resp.data : s))
            );
            setEditDialogOpen(false);
            setSelectedServicio(null);
        } catch (err) {
            console.error('Error al actualizar servicio:', err);
            setError('No se pudo actualizar el servicio. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const statusChip = (activo) => (
        <Chip
            label={activo ? 'Activo' : 'Inactivo'}
            color={activo ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
        />
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 1, md: 2 } }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white'
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h5" fontWeight={700}>Servicios</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Administra los servicios disponibles.</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/dashboard/servicios/crear')}
                        sx={{
                            bgcolor: 'white',
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            '&:hover': { bgcolor: alpha('#fff', 0.9) }
                        }}
                    >
                        Nuevo Servicio
                    </Button>
                </Stack>
            </Paper>

            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o descripción"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Chip
                                label="Todos"
                                color={statusFilter === 'todos' ? 'primary' : 'default'}
                                onClick={() => setStatusFilter('todos')}
                            />
                            <Chip
                                label="Activos"
                                color={statusFilter === 'activos' ? 'primary' : 'default'}
                                onClick={() => setStatusFilter('activos')}
                            />
                            <Chip
                                label="Inactivos"
                                color={statusFilter === 'inactivos' ? 'primary' : 'default'}
                                onClick={() => setStatusFilter('inactivos')}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {filteredServicios.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary">No hay servicios para mostrar.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {isMobile ? (
                        filteredServicios.map((servicio) => (
                            <Paper key={servicio.id_servicio} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight={700}>{servicio.nombre}</Typography>
                                    {statusChip(servicio.activo)}
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {servicio.descripcion || 'Sin descripción'}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <MonetizationOnIcon fontSize="small" color="success" />
                                    <Typography variant="body2">${servicio.costo_base || 0}</Typography>
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{servicio.duracion_estimada_min || 0} min</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <PetsIcon fontSize="small" color={servicio.requiere_mascota ? 'primary' : 'disabled'} />
                                    <Typography variant="body2">
                                        {servicio.requiere_mascota ? 'Requiere mascota' : 'Opcional mascota'}
                                    </Typography>
                                </Stack>
                                <Divider sx={{ my: 1.5 }} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => openEditDialog(servicio)}
                                        fullWidth
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant={servicio.activo ? 'outlined' : 'contained'}
                                        color={servicio.activo ? 'error' : 'success'}
                                        startIcon={servicio.activo ? <BlockIcon /> : <CheckCircleIcon />}
                                        onClick={() => handleToggleActivo(servicio)}
                                        disabled={saving}
                                        fullWidth
                                    >
                                        {servicio.activo ? 'Desactivar' : 'Activar'}
                                    </Button>
                                </Stack>
                            </Paper>
                        ))
                    ) : (
                        filteredServicios.map((servicio) => (
                            <Paper key={servicio.id_servicio} elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="h6" fontWeight={700}>{servicio.nombre}</Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {servicio.descripcion || 'Sin descripción'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <MonetizationOnIcon fontSize="small" color="success" />
                                            <Typography variant="body2">${servicio.costo_base || 0}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{servicio.duracion_estimada_min || 0} min</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PetsIcon fontSize="small" color={servicio.requiere_mascota ? 'primary' : 'disabled'} />
                                            <Typography variant="body2">
                                                {servicio.requiere_mascota ? 'Requiere mascota' : 'Opcional mascota'}
                                            </Typography>
                                        </Stack>
                                        <Box sx={{ mt: 0.5 }}>{statusChip(servicio.activo)}</Box>
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => openEditDialog(servicio)}
                                                sx={{ minWidth: 120 }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant={servicio.activo ? 'outlined' : 'contained'}
                                                color={servicio.activo ? 'error' : 'success'}
                                                startIcon={servicio.activo ? <BlockIcon /> : <CheckCircleIcon />}
                                                onClick={() => handleToggleActivo(servicio)}
                                                disabled={saving}
                                                sx={{ minWidth: 140 }}
                                            >
                                                {servicio.activo ? 'Desactivar' : 'Activar'}
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))
                    )}
                </Stack>
            )}

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Editar servicio</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleFormChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Descripción"
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleFormChange}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                        <TextField
                            label="Costo base"
                            name="costo_base"
                            type="number"
                            value={form.costo_base}
                            onChange={handleFormChange}
                            inputProps={{ min: 0, step: '0.01' }}
                            fullWidth
                        />
                        <TextField
                            label="Duración estimada (minutos)"
                            name="duracion_estimada_min"
                            type="number"
                            value={form.duracion_estimada_min}
                            onChange={handleFormChange}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.requiere_mascota}
                                    onChange={handleSwitchChange}
                                    name="requiere_mascota"
                                />
                            }
                            label="Requiere mascota"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ServiciosListarPage;
