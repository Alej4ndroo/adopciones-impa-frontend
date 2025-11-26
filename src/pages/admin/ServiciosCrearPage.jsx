import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Pets as PetsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_ENDPOINT = '/servicios/crear';

const ServiciosCrearPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        costo_base: '',
        duracion_estimada_min: '',
        requiere_mascota: false
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitch = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('authToken');
            const payload = {
                ...formData,
                costo_base: formData.costo_base ? parseFloat(formData.costo_base) : null,
                duracion_estimada_min: formData.duracion_estimada_min ? parseInt(formData.duracion_estimada_min, 10) : null
            };
            await axios.post(`${API_URL_BACKEND}${CREATE_ENDPOINT}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Servicio creado correctamente.');
            setTimeout(() => navigate('/dashboard/servicios/ver'), 800);
        } catch (err) {
            console.error('Error al crear servicio:', err);
            setError('No se pudo crear el servicio. Revisa los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: '900px', mx: 'auto', p: { xs: 1, md: 2 } }}>
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
                        <Typography variant="h5" fontWeight={700}>Nuevo Servicio</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Agrega un servicio al catálogo.</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            bgcolor: 'white',
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            '&:hover': { bgcolor: alpha('#fff', 0.9) }
                        }}
                    >
                        Volver
                    </Button>
                </Stack>
            </Paper>

            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Descripción"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Costo base"
                                name="costo_base"
                                type="number"
                                value={formData.costo_base}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: '0.01' }}
                                fullWidth
                            />
                            <TextField
                                label="Duración estimada (minutos)"
                                name="duracion_estimada_min"
                                type="number"
                                value={formData.duracion_estimada_min}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                                fullWidth
                            />
                        </Stack>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.requiere_mascota}
                                    onChange={handleSwitch}
                                    name="requiere_mascota"
                                />
                            }
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PetsIcon fontSize="small" />
                                    <Typography variant="body2">Requiere mascota</Typography>
                                </Stack>
                            }
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
                            disabled={loading}
                            sx={{ alignSelf: 'flex-start', px: 3, py: 1 }}
                        >
                            {loading ? 'Guardando...' : 'Guardar servicio'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ServiciosCrearPage;
