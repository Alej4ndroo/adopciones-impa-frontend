import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Paper, 
    CircularProgress, Alert, Divider, useTheme, Stack, 
    alpha, InputAdornment
} from '@mui/material';
import { 
    NoteAdd as NoteAddIcon, 
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon, 
} from '@mui/icons-material';

// --- CONFIGURACIÓN DE CONSULTA ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_CONSULTA_ENDPOINT = '/consultas/crear'; 

// 🚨 MODIFICADO: Endpoints para cargar datos
const EXPEDIENTES_ENDPOINT = '/expedientes/listarActivos'; // Asumimos este endpoint
const VETERINARIOS_ENDPOINT = '/empleados/listarVeterinarios';

// 💡 Función de utilidad para obtener la fecha/hora local en formato YYYY-MM-DDTHH:MM
const getCurrentDateTimeLocal = () => {
    const now = new Date();
    // Ajustar por la zona horaria (restar minutos de la zona horaria)
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16); // Formato 'YYYY-MM-DDTHH:MM'
};

// --- COMPONENTE PRINCIPAL MODIFICADO ---
const ConsultasCrearPage = () => {
    const theme = useTheme();
    
    // 🚨 MODIFICADO: Estado basado 100% en la tabla 'consultas_veterinarias'
    const [formData, setFormData] = useState({
        id_expediente: '',
        id_empleado: '', // Veterinario
        fecha_consulta: getCurrentDateTimeLocal(), // 👈 Valor por defecto
        motivo: '',
        sintomas: '', // 👈 NUEVO
        peso_kg: '',
        temperatura_c: '',
        diagnostico: '',
        tratamiento: '',
        recomendaciones: '', // 👈 NUEVO (reemplaza 'observaciones')
        costo: '',
        proxima_cita: '', // 👈 NUEVO
    });
    
    // --- Estados para los menús desplegables ---
    const [expedientes, setExpedientes] = useState([]); // 👈 MODIFICADO
    const [veterinarios, setVeterinarios] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // 🚀 MODIFICADO: useEffect para cargar Expedientes y Veterinarios
    useEffect(() => {
        const fetchData = async () => {
            setLoadingDropdowns(true);
            try {
                const token = localStorage.getItem('authToken');
                
                // --- Simulación de datos (reemplazar con llamadas reales) ---
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 💡 Llama a expedientes
                // const resExpedientes = await axios.get(`${API_URL_BACKEND}${EXPEDIENTES_ENDPOINT}`, { headers: { Authorization: `Bearer ${token}` } });
                setExpedientes([ // 👈 Simulación de Expedientes
                    { id_expediente: 1, mascota: 'Firulais', cliente: 'Juan Pérez' },
                    { id_expediente: 2, mascota: 'Mishifu', cliente: 'Ana Gómez' },
                ]);

                // 💡 Llama a veterinarios
                // const resVets = await axios.get(`${API_URL_BACKEND}${VETERINARIOS_ENDPOINT}`, { headers: { Authorization: `Bearer ${token}` } });
                setVeterinarios([ // 👈 Simulación de Veterinarios
                    { id_empleado: 1, nombre: 'Dr. Alan Grant' },
                    { id_empleado: 3, nombre: 'Dra. Ellie Sattler' },
                ]);
                // --- Fin de simulación ---

            } catch (err) {
                setError("Error al cargar datos necesarios (expedientes/veterinarios).");
                console.error(err);
            } finally {
                setLoadingDropdowns(false);
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

        // 3. Preparar Payload (basado en la tabla)
        const payload = {
            ...formData,
            id_expediente: parseInt(formData.id_expediente, 10),
            id_empleado: parseInt(formData.id_empleado, 10),
            // 'creado_por' se debe añadir en el backend usando el ID del token
            
            // Convertir números
            peso_kg: parseFloat(formData.peso_kg) || null,
            temperatura_c: parseFloat(formData.temperatura_c) || null,
            costo: parseFloat(formData.costo) || 0.00,

            // Asegurar que la fecha próxima sea NULL si está vacía
            proxima_cita: formData.proxima_cita || null,
        };

        // 4. Envío a la API
        try {
            const response = await axios.post(`${API_URL_BACKEND}${CREATE_CONSULTA_ENDPOINT}`, payload, { 
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess(`Consulta registrada con éxito (ID: ${response.data.id_consulta}).`);
            
            // 5. Resetear
            setFormData({
                id_expediente: '', id_empleado: '',
                fecha_consulta: getCurrentDateTimeLocal(),
                motivo: '', sintomas: '', peso_kg: '', temperatura_c: '',
                diagnostico: '', tratamiento: '', recomendaciones: '',
                costo: '', proxima_cita: '',
            });

        } catch (err) {
            console.error("Error al registrar consulta:", err.response || err);
            const errorMessage = err.response?.data?.error || "Error de red o del servidor. Inténtelo de nuevo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZADO (Adaptado a la tabla 'consultas_veterinarias') ---
    return (
        <Box sx={{ width: '100%', mx: 'auto' }}>
            
            {/* Header Consulta */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, borderRadius: 3, color: 'white' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ bgcolor: alpha('#fff', 0.2), p: 2, borderRadius: 2, display: 'flex' }}>
                        <NoteAddIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Registrar Nueva Consulta
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Complete el formulario con los datos de la consulta.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Alertas */}
            {success && (<Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>)}
            {error && (<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>)}

            {/* Formulario Principal */}
            <Paper 
                elevation={3} 
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: '100%', p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}
            >
                {/* Sección: Datos de la Cita */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }} />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Datos Generales
                        </Typography>
                    </Stack>
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth required disabled={loadingDropdowns}>
                            <InputLabel>Expediente (Paciente)</InputLabel>
                            <Select name="id_expediente" value={formData.id_expediente} label="Expediente (Paciente)" onChange={handleChange}>
                                {expedientes.map(exp => (
                                    <MenuItem key={exp.id_expediente} value={exp.id_expediente}>
                                        {`${exp.mascota} (Dueño: ${exp.cliente})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required disabled={loadingDropdowns}>
                            <InputLabel>Veterinario Asignado</InputLabel>
                            <Select name="id_empleado" value={formData.id_empleado} label="Veterinario Asignado" onChange={handleChange}>
                                {veterinarios.map(vet => (
                                    <MenuItem key={vet.id_empleado} value={vet.id_empleado}>{vet.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            fullWidth 
                            required 
                            label="Fecha y Hora de Consulta" 
                            name="fecha_consulta" 
                            type="datetime-local"
                            value={formData.fecha_consulta} 
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField 
                            fullWidth 
                            label="Próxima Cita (Opcional)" 
                            name="proxima_cita"
                            type="datetime-local" 
                            value={formData.proxima_cita} 
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Examen Físico y Motivo */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }} />
                        <Typography variant="h6" fontWeight={600} color="primary">Examen y Motivo</Typography>
                    </Stack>
                    <Stack spacing={3}>
                        <TextField fullWidth required label="Motivo de la Consulta" name="motivo" value={formData.motivo} onChange={handleChange} />
                        <TextField fullWidth multiline rows={3} label="Síntomas" name="sintomas" value={formData.sintomas} onChange={handleChange} />
                        <TextField
                            fullWidth
                            label="Peso"
                            name="peso_kg"
                            value={formData.peso_kg}
                            onChange={handleChange}
                            type="number" 
                            InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                        />
                        <TextField
                            fullWidth
                            label="Temperatura"
                            name="temperatura_c"
                            value={formData.temperatura_c}
                            onChange={handleChange}
                            type="number" 
                            InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                        />
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Detalles Médicos */}
                <Box sx={{ mb: 5 }}>
                     <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }} />
                        <Typography variant="h6" fontWeight={600} color="primary">Diagnóstico y Tratamiento</Typography>
                    </Stack>
                    <Stack spacing={3}>
                        <TextField fullWidth required multiline rows={4} label="Diagnóstico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} />
                        <TextField fullWidth multiline rows={4} label="Tratamiento" name="tratamiento" value={formData.tratamiento} onChange={handleChange} />
                        <TextField fullWidth multiline rows={2} label="Recomendaciones" name="recomendaciones" value={formData.recomendaciones} onChange={handleChange} />
                    </Stack>
                </Box>
                
                <Divider sx={{ my: 4 }} />

                {/* Sección: Cierre de Consulta */}
                <Box sx={{ mb: 5 }}>
                     <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }} />
                        <Typography variant="h6" fontWeight={600} color="primary">Costo</Typography>
                    </Stack>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Costo"
                            name="costo"
                            value={formData.costo}
                            onChange={handleChange}
                            type="number" 
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        />
                        {/* 🚨 ELIMINADO: El campo 'estado_consulta' no está en la tabla */}
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Botón de Envío */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        // 🚨 MODIFICADO: Deshabilitado para campos de consulta
                        disabled={loading || loadingDropdowns || !formData.id_expediente || !formData.id_empleado || !formData.fecha_consulta || !formData.motivo || !formData.diagnostico}
                        sx={{ 
                            borderRadius: 2, px: 5, py: 1.5, fontSize: '1rem', fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }}
                    >
                        {loading ? 'Guardando...' : 'Guardar Consulta'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ConsultasCrearPage;
