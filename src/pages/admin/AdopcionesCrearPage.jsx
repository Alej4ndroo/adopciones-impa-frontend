import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Paper, 
    CircularProgress, Alert, Divider, useTheme, Stack, 
    alpha, Zoom, Autocomplete, FormControlLabel, Checkbox
} from '@mui/material';
import { 
    Pets as PetsIcon, 
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// --- CONFIGURACIÓN ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_ADOPCION_ENDPOINT = '/adopciones/crear';
const USUARIOS_ENDPOINT = '/usuarios/listar';
const MASCOTAS_ENDPOINT = '/mascotas/listar';

const ESTADO_ADOPCION_OPTIONS = ['en_proceso', 'completada', 'rechazada', 'cancelada', 'devuelta'];
const ESTADO_SOLICITUD_OPTIONS = ['en_revision', 'aprobada', 'rechazada', 'cancelada'];

// --- COMPONENTE PRINCIPAL ---
const AdopcionesCrearPage = () => {
    const theme = useTheme();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        id_usuario: '',
        id_mascota: '',
        fecha_solicitud: new Date().toISOString().slice(0, 16),
        fecha_entrega: '',
        estado: 'en_proceso',
        estado_solicitud: 'en_revision',
        documentos_verificados: false,
        motivo_devolucion: '',
        fecha_devolucion: '',
        observaciones: '',
        ubicacion_en_hogar: '',
        motivo_adopcion: '',
    });
    
    // Estados para los datos de los selects
    const [usuarios, setUsuarios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    
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
                
                const [usuariosRes, mascotasRes] = await Promise.all([
                    axios.get(`${API_URL_BACKEND}${USUARIOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${MASCOTAS_ENDPOINT}`, { headers })
                ]);

                setUsuarios(usuariosRes.data || []);
                // Filtrar solo mascotas disponibles para adopción
                const mascotasDisponibles = (mascotasRes.data || []).filter(
                    m => m.estado_adopcion === 'disponible' && m.activo
                );
                setMascotas(mascotasDisponibles);
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
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
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
        };
        
        // Limpiar campos vacíos o no aplicables según el estado
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null) {
                delete payload[key];
            }
        });

        // Validación: Si no es estado 'devuelta', eliminar campos de devolución
        if (payload.estado !== 'devuelta') {
            delete payload.motivo_devolucion;
            delete payload.fecha_devolucion;
        }

        // Envío a la API
        try {
            const response = await axios.post(
                `${API_URL_BACKEND}${CREATE_ADOPCION_ENDPOINT}`, 
                payload, 
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess(`Adopción registrada con éxito (ID: ${response.data.id_adopcion}).`);
            
            // Resetear formulario
            setFormData({
                id_usuario: '',
                id_mascota: '',
                fecha_solicitud: new Date().toISOString().slice(0, 16),
                fecha_entrega: '',
                estado: 'en_proceso',
                estado_solicitud: 'en_revision',
                documentos_verificados: false,
                motivo_devolucion: '',
                fecha_devolucion: '',
                observaciones: '',
                ubicacion_en_hogar: '',
                motivo_adopcion: '',
            });

        } catch (err) {
            console.error("Error al registrar adopción:", err.response || err);
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
        <Box sx={{ width: '100%', mx: 'auto' }}>
            
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
                        <PetsIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Registrar Nueva Adopción
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Complete el formulario para registrar una solicitud de adopción
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
                    width: '100%',
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
                            Información General de la Adopción
                        </Typography>
                    </Stack>
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                options={usuarios}
                                getOptionLabel={(option) => `${option.nombre} (${option.correo_electronico})`}
                                value={usuarios.find(u => u.id_usuario === formData.id_usuario) || null}
                                onChange={(e, newValue) => handleAutocompleteChange('id_usuario', newValue?.id_usuario || '')}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Usuario Adoptante" 
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

                        <FormControl fullWidth required>
                            <Autocomplete
                                options={mascotas}
                                getOptionLabel={(option) => `${option.nombre} - ${option.especie} (${option.raza || 'Sin raza'})`}
                                value={mascotas.find(m => m.id_mascota === formData.id_mascota) || null}
                                onChange={(e, newValue) => handleAutocompleteChange('id_mascota', newValue?.id_mascota || '')}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Mascota a Adoptar" 
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

                        <TextField 
                            fullWidth 
                            required 
                            label="Fecha de Solicitud" 
                            name="fecha_solicitud" 
                            type="datetime-local" 
                            value={formData.fecha_solicitud} 
                            onChange={handleChange} 
                            InputLabelProps={{ shrink: true }} 
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }
                            }} 
                        />

                        <TextField 
                            fullWidth 
                            label="Fecha de Entrega (Opcional)" 
                            name="fecha_entrega" 
                            type="datetime-local" 
                            value={formData.fecha_entrega} 
                            onChange={handleChange} 
                            InputLabelProps={{ shrink: true }} 
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }
                            }} 
                        />
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Estados y Verificación */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Estado y Verificación
                        </Typography>
                    </Stack>
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth required>
                            <InputLabel>Estado de la Adopción</InputLabel>
                            <Select 
                                name="estado" 
                                value={formData.estado} 
                                onChange={handleChange} 
                                label="Estado de la Adopción"
                                sx={{ 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }}
                            >
                                {ESTADO_ADOPCION_OPTIONS.map(estado => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Estado de la Solicitud</InputLabel>
                            <Select 
                                name="estado_solicitud" 
                                value={formData.estado_solicitud} 
                                onChange={handleChange} 
                                label="Estado de la Solicitud"
                                sx={{ 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }}
                            >
                                {ESTADO_SOLICITUD_OPTIONS.map(estado => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="documentos_verificados"
                                    checked={formData.documentos_verificados}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label="Documentos Verificados"
                        />
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Información del Adoptante */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Información del Adoptante
                        </Typography>
                    </Stack>
                    
                    <Stack spacing={3}>
                        <TextField 
                            fullWidth 
                            label="Motivo de la Adopción" 
                            name="motivo_adopcion" 
                            value={formData.motivo_adopcion} 
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="¿Por qué desea adoptar esta mascota?"
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }
                            }} 
                        />

                        <TextField 
                            fullWidth 
                            label="Ubicación en el Hogar" 
                            name="ubicacion_en_hogar" 
                            value={formData.ubicacion_en_hogar} 
                            onChange={handleChange}
                            multiline
                            rows={2}
                            placeholder="Describa dónde vivirá la mascota (interior, patio, etc.)"
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }
                            }} 
                        />

                        <TextField 
                            fullWidth 
                            label="Observaciones Generales" 
                            name="observaciones" 
                            value={formData.observaciones} 
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Cualquier información adicional relevante"
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    fontSize: '0.95rem'
                                }
                            }} 
                        />
                    </Stack>
                </Box>

                {/* Sección: Información de Devolución (Solo si estado es 'devuelta') */}
                {formData.estado === 'devuelta' && (
                    <>
                        <Divider sx={{ my: 4 }} />
                        <Box sx={{ mb: 5 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Box 
                                    sx={{ 
                                        width: 4, height: 28, borderRadius: 2,
                                        background: `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={600} color="error">
                                    Información de Devolución
                                </Typography>
                            </Stack>
                            
                            <Stack spacing={3}>
                                <TextField 
                                    fullWidth 
                                    required
                                    label="Fecha de Devolución" 
                                    name="fecha_devolucion" 
                                    type="datetime-local" 
                                    value={formData.fecha_devolucion} 
                                    onChange={handleChange} 
                                    InputLabelProps={{ shrink: true }} 
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 2,
                                            fontSize: '0.95rem'
                                        }
                                    }} 
                                />

                                <TextField 
                                    fullWidth 
                                    required
                                    label="Motivo de la Devolución" 
                                    name="motivo_devolucion" 
                                    value={formData.motivo_devolucion} 
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    placeholder="Explique las razones de la devolución"
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 2,
                                            fontSize: '0.95rem'
                                        }
                                    }} 
                                />
                            </Stack>
                        </Box>
                    </>
                )}

                {/* Botón de Envío */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || !formData.id_usuario || !formData.id_mascota}
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
                        {loading ? 'Registrando...' : 'Registrar Adopción'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdopcionesCrearPage;
