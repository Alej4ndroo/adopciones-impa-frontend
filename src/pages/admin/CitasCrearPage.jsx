import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Grid, Paper, 
    CircularProgress, Alert, Divider, useTheme, Stack, 
    alpha, Zoom, Autocomplete
} from '@mui/material';
import { 
    Event as EventIcon, 
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// --- CONFIGURACIÓN ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_CITA_ENDPOINT = '/citas/crear';
const USUARIOS_ENDPOINT = '/usuarios/listar';
const MASCOTAS_ENDPOINT = '/mascotas/listar';
const EMPLEADOS_ENDPOINT = '/empleados/listar';
const SERVICIOS_ENDPOINT = '/servicios/listar';

// --- COMPONENTE PRINCIPAL ---
const CitasCrearPage = () => {
    const theme = useTheme();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        id_usuario: '',
        id_mascota: '',
        id_empleado: '',
        id_servicio: '',
        fecha_cita: '',
        estado_cita: 'programada',
        motivo: '',
        observaciones: '',
        costo: '',
    });
    
    // Estados para los datos de los selects
    const [usuarios, setUsuarios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("No autenticado. Por favor, inicie sesión.");
                setLoadingData(false);
                return;
            }

            try {
                const headers = { Authorization: `Bearer ${token}` };
                
                const [usuariosRes, mascotasRes, empleadosRes, serviciosRes] = await Promise.all([
                    axios.get(`${API_URL_BACKEND}${USUARIOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${MASCOTAS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${EMPLEADOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${SERVICIOS_ENDPOINT}`, { headers })
                ]);

                setUsuarios(usuariosRes.data || []);
                setMascotas(mascotasRes.data || []);
                setEmpleados(empleadosRes.data || []);
                setServicios(serviciosRes.data || []);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError("Error al cargar los datos necesarios. Verifique su conexión.");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleAutocompleteChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        // Preparar Payload
        const payload = {
            ...formData,
            id_usuario: parseInt(formData.id_usuario, 10),
            id_mascota: formData.id_mascota ? parseInt(formData.id_mascota, 10) : null,
            id_empleado: formData.id_empleado ? parseInt(formData.id_empleado, 10) : null,
            id_servicio: formData.id_servicio ? parseInt(formData.id_servicio, 10) : null,
            costo: formData.costo ? parseFloat(formData.costo) : 0.00,
        };
        
        // Limpiar campos vacíos
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null) {
                delete payload[key];
            }
        });

        // Envío a la API
        try {
            const response = await axios.post(
                `${API_URL_BACKEND}${CREATE_CITA_ENDPOINT}`, 
                payload, 
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess(`Cita registrada con éxito (ID: ${response.data.id_cita}).`);
            
            // Resetear formulario
            setFormData({
                id_usuario: '',
                id_mascota: '',
                id_empleado: '',
                id_servicio: '',
                fecha_cita: '',
                estado_cita: 'programada',
                motivo: '',
                observaciones: '',
                costo: '',
            });

        } catch (err) {
            console.error("Error al registrar cita:", err.response || err);
            const errorMessage = err.response?.data?.error || "Error de red o del servidor. Inténtelo de nuevo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Mostrar loader mientras se cargan los datos
    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    // --- RENDERIZADO ---
    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            
            {/* Header */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3,
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
                            p: 2,
                            borderRadius: 2,
                            display: 'flex'
                        }}
                    >
                        <EventIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Registrar Nueva Cita
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Complete el formulario para agendar una cita en el sistema
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Alertas */}
            {success && (
                <Zoom in={Boolean(success)}>
                    <Alert 
                        severity="success" 
                        icon={<CheckCircleIcon />}
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setSuccess(null)}
                    >
                        {success}
                    </Alert>
                </Zoom>
            )}

            {error && (
                <Zoom in={Boolean(error)}>
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                </Zoom>
            )}

            {/* Formulario Principal */}
            <Paper 
                elevation={3} 
                component="form"
                onSubmit={handleSubmit}
                sx={{ 
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 3
                }}
            >
                {/* Sección: Información General */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Información General de la Cita
                        </Typography>
                    </Stack>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <Autocomplete
                                    options={usuarios}
                                    getOptionLabel={(option) => `${option.nombre} (${option.correo_electronico})`}
                                    value={usuarios.find(u => u.id_usuario === formData.id_usuario) || null}
                                    onChange={(e, newValue) => handleAutocompleteChange('id_usuario', newValue?.id_usuario || '')}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label="Usuario (Cliente)" 
                                            required
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: 2,
                                                    fontSize: '0.95rem'
                                                },
                                                '& .MuiInputBase-input': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={mascotas}
                                    getOptionLabel={(option) => `${option.nombre} - ${option.especie} (${option.raza || 'Sin raza'})`}
                                    value={mascotas.find(m => m.id_mascota === formData.id_mascota) || null}
                                    onChange={(e, newValue) => handleAutocompleteChange('id_mascota', newValue?.id_mascota || '')}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label="Mascota (Opcional)" 
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: 2,
                                                    fontSize: '0.95rem'
                                                },
                                                '& .MuiInputBase-input': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                required 
                                label="Fecha y Hora de la Cita" 
                                name="fecha_cita" 
                                type="datetime-local" 
                                value={formData.fecha_cita} 
                                onChange={handleChange} 
                                InputLabelProps={{ shrink: true }} 
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        fontSize: '0.95rem'
                                    }
                                }} 
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Servicio y Personal */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Servicio y Personal Asignado
                        </Typography>
                    </Stack>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={servicios.filter(s => s.activo)}
                                    getOptionLabel={(option) => `${option.nombre} - ${option.costo_base || 0}`}
                                    value={servicios.find(s => s.id_servicio === formData.id_servicio) || null}
                                    onChange={(e, newValue) => {
                                        handleAutocompleteChange('id_servicio', newValue?.id_servicio || '');
                                        if (newValue?.costo_base) {
                                            setFormData(prev => ({ ...prev, costo: newValue.costo_base }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            required
                                            label="Servicio" 
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: 2,
                                                    fontSize: '0.95rem'
                                                },
                                                '& .MuiInputBase-input': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={empleados.filter(e => e.activo)}
                                    getOptionLabel={(option) => `${option.nombre} - ${option.numero_empleado}`}
                                    value={empleados.find(e => e.id_empleado === formData.id_empleado) || null}
                                    onChange={(e, newValue) => handleAutocompleteChange('id_empleado', newValue?.id_empleado || '')}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label="Empleado Asignado (Opcional)" 
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: 2,
                                                    fontSize: '0.95rem'
                                                },
                                                '& .MuiInputBase-input': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="Costo de la Cita" 
                                name="costo" 
                                type="number" 
                                value={formData.costo} 
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        fontSize: '0.95rem'
                                    }
                                }} 
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Detalles Adicionales */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Detalles Adicionales
                        </Typography>
                    </Stack>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <TextField 
                                fullWidth 
                                label="Motivo de la Cita" 
                                name="motivo" 
                                value={formData.motivo} 
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Observaciones" 
                                name="observaciones" 
                                value={formData.observaciones} 
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Botón de Envío */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || !formData.id_usuario || !formData.fecha_cita || !formData.id_servicio}
                        sx={{ 
                            borderRadius: 2, 
                            px: 5, 
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                                transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                                background: theme.palette.action.disabledBackground
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? 'Registrando...' : 'Registrar Cita'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CitasCrearPage;