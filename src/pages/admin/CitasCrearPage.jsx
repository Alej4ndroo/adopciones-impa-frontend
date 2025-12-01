import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button,
    FormControl, Paper, 
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
const USUARIOS_ENDPOINT = '/usuarios/listar-clientes';
const MASCOTAS_ENDPOINT = '/mascotas/listar';
const EMPLEADOS_ENDPOINT = '/empleados/listar';
const SERVICIOS_ENDPOINT = '/servicios/listar';
const ADOPCIONES_ENDPOINT = '/adopciones/listar';
const CITAS_ENDPOINT = '/citas/listar';

// --- COMPONENTE PRINCIPAL ---
const toInputDateTime = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : new Date();
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const getTodayMinLocal = () => toInputDateTime(new Date());

const isHalfHourSlot = (value) => {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return date.getMinutes() % 30 === 0;
};

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
    const [adopciones, setAdopciones] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [citas, setCitas] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({
        usuario: '',
        servicio: '',
        fecha: ''
    });

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
                
                const [usuariosRes, mascotasRes, empleadosRes, serviciosRes, adopcionesRes, citasRes] = await Promise.all([
                    axios.get(`${API_URL_BACKEND}${USUARIOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${MASCOTAS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${EMPLEADOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${SERVICIOS_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${ADOPCIONES_ENDPOINT}`, { headers }),
                    axios.get(`${API_URL_BACKEND}${CITAS_ENDPOINT}`, { headers })
                ]);

                setUsuarios(usuariosRes.data || []);
                setMascotas(mascotasRes.data || []);
                setEmpleados(empleadosRes.data || []);
                setServicios(serviciosRes.data || []);
                setAdopciones(adopcionesRes.data || []);
                setCitas(citasRes.data || []);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError("Error al cargar los datos necesarios. Verifique su conexión.");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar mascotas según el usuario seleccionado
    useEffect(() => {
        if (!formData.id_usuario) {
            setFilteredMascotas([]);
            return;
        }
        const filtradas = mascotas.filter((m) => {
            const propietarioId = m.id_usuario || m.usuario?.id_usuario || m.usuarios?.id_usuario || null;
            const estado = (m.estado_adopcion || '').toLowerCase();
            const estadoSol = (m.estado_solicitud || '').toLowerCase();
            const adoptada = estado === 'adoptado' || estadoSol === 'aprobada';
            return propietarioId === parseInt(formData.id_usuario, 10) && adoptada;
        });

        const adopcionesUsuario = adopciones.filter((a) => {
            const userId = a.id_usuario || a.usuario?.id_usuario;
            const estado = (a.estado || '').toLowerCase();
            const estadoSol = (a.estado_solicitud || '').toLowerCase();
            const adoptada = estado === 'adoptado' || estadoSol === 'aprobada';
            return userId === parseInt(formData.id_usuario, 10) && adoptada && a.mascota;
        }).map((a) => ({
            ...a.mascota,
            id_mascota: a.mascota?.id_mascota
        })).filter(Boolean);

        const uniqueMascotas = [...filtradas, ...adopcionesUsuario].reduce((acc, current) => {
            if (!current?.id_mascota) return acc;
            if (acc.some((m) => m.id_mascota === current.id_mascota)) return acc;
            return [...acc, current];
        }, []);

        setFilteredMascotas(uniqueMascotas);

        // Si la mascota seleccionada ya no pertenece al usuario, limpiar selección
        if (formData.id_mascota && !uniqueMascotas.some((m) => m.id_mascota === formData.id_mascota)) {
            setFormData((prev) => ({ ...prev, id_mascota: '' }));
        }
    }, [formData.id_usuario, mascotas, adopciones]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'fecha_cita') {
            setFieldErrors((prev) => ({ ...prev, fecha: '' }));
        }
    };

const handleAutocompleteChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
        setFieldErrors((prev) => {
            if (name === 'id_usuario') return { ...prev, usuario: '' };
            if (name === 'id_servicio') return { ...prev, servicio: '' };
            return prev;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({ usuario: '', servicio: '', fecha: '' });
        setError(null);
        setSuccess(null);

        const newFieldErrors = { usuario: '', servicio: '', fecha: '' };
        if (!formData.id_usuario) newFieldErrors.usuario = 'Selecciona un cliente.';
        if (!formData.id_servicio) newFieldErrors.servicio = 'Selecciona un servicio.';
        if (!formData.fecha_cita) newFieldErrors.fecha = 'Debes indicar fecha y hora.';
        const hasInlineErrors = Object.values(newFieldErrors).some(Boolean);
        if (hasInlineErrors) {
            setFieldErrors(newFieldErrors);
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        const fechaValida = new Date(formData.fecha_cita);
        if (Number.isNaN(fechaValida.getTime())) {
            setError('Selecciona una fecha y hora válida.');
            setLoading(false);
            return;
        }
        if (fechaValida < new Date(Date.now() - 60000)) {
            setFieldErrors((prev) => ({ ...prev, fecha: 'No puedes seleccionar una fecha anterior a hoy.' }));
            setError('Revisa la fecha seleccionada.');
            setLoading(false);
            return;
        }
        if (!isHalfHourSlot(formData.fecha_cita)) {
            setFieldErrors((prev) => ({ ...prev, fecha: 'Los horarios son cada 30 minutos (10:00, 10:30, ...).' }));
            setError('Revisa la fecha seleccionada.');
            setLoading(false);
            return;
        }
        if (formData.id_servicio) {
            const conflict = citas.some((cita) => {
                if (!cita || !cita.servicio) return false;
                const serviceId = cita.id_servicio || cita.servicio?.id_servicio;
                if (parseInt(serviceId, 10) !== parseInt(formData.id_servicio, 10)) return false;
                const citaDate = new Date(cita.fecha_hora || cita.fecha_cita || '');
                return citaDate.getTime() === fechaValida.getTime();
            });
            if (conflict) {
                setFieldErrors((prev) => ({ ...prev, fecha: 'Ya existe una cita para ese servicio a la misma hora.' }));
                setError('Existe un conflicto con otra cita.');
                setLoading(false);
                return;
            }
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
                            Información General de la Cita
                        </Typography>
                    </Stack>
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                fullWidth
                                options={usuarios}
                                getOptionLabel={(option) => `${option.nombre} (${option.correo_electronico})`}
                                value={usuarios.find(u => u.id_usuario === formData.id_usuario) || null}
                                onChange={(e, newValue) => handleAutocompleteChange('id_usuario', newValue?.id_usuario || '')}
                                renderInput={(params) => (
                                    <TextField 
                                        fullWidth
                                        {...params} 
                                        label="Cliente" 
                                        required
                                        error={Boolean(fieldErrors.usuario)}
                                        helperText={fieldErrors.usuario}
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

                        <FormControl fullWidth>
                            <Autocomplete
                                fullWidth
                                options={filteredMascotas}
                                getOptionLabel={(option) => `${option.nombre} - ${option.especie} (${option.raza || 'Sin raza'})`}
                                value={filteredMascotas.find(m => m.id_mascota === formData.id_mascota) || null}
                                onChange={(e, newValue) => handleAutocompleteChange('id_mascota', newValue?.id_mascota || '')}
                                renderInput={(params) => (
                                    <TextField 
                                        fullWidth
                                        {...params} 
                                        label="Mascota (Opcional)" 
                                        helperText={
                                            filteredMascotas.length === 0
                                                ? formData.id_usuario
                                                    ? 'Este cliente no tiene mascotas adoptadas registradas.'
                                                    : 'Selecciona primero un cliente para ver sus mascotas.'
                                                : ''
                                        }
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
                            label="Fecha y Hora de la Cita" 
                            name="fecha_cita" 
                            type="datetime-local" 
                            value={formData.fecha_cita} 
                            onChange={handleChange} 
                            InputLabelProps={{ shrink: true }} 
                            inputProps={{ min: getTodayMinLocal(), step: 1800 }}
                            error={Boolean(fieldErrors.fecha)}
                            helperText={fieldErrors.fecha || 'Horario permitido: 10:00 a 18:00 y en intervalos de 30 minutos.'}
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
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <Autocomplete
                                fullWidth
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
                                        fullWidth
                                        {...params} 
                                        required
                                        label="Servicio" 
                                        error={Boolean(fieldErrors.servicio)}
                                        helperText={fieldErrors.servicio || 'Selecciona el servicio a realizar'}
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

                        <FormControl fullWidth>
                            <Autocomplete
                                fullWidth
                                options={empleados.filter(e => e.activo)}
                                getOptionLabel={(option) => {
                                    if (!option) return '';
                                    const nombre = option.nombre || option.usuarios?.nombre || option.usuario?.nombre || 'Sin nombre';
                                    const numero = option.numero_empleado || option.usuarios?.numero_empleado || '';
                                    return numero ? `${nombre} - ${numero}` : nombre;
                                }}
                                value={empleados.find(e => e.id_empleado === formData.id_empleado) || null}
                                onChange={(e, newValue) => handleAutocompleteChange('id_empleado', newValue?.id_empleado || '')}
                                renderInput={(params) => (
                                    <TextField 
                                        fullWidth
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
                    </Stack>
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
                    
                    <Stack spacing={3}>
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
                    </Stack>
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
