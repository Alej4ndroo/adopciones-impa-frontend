import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Grid, Paper, 
    CircularProgress, Alert, FormControlLabel, Checkbox, 
    Divider, useTheme, Stack, alpha, Zoom
} from '@mui/material';
import { 
    GroupAdd as GroupAddIcon, 
    Save as SaveIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon, 
    CloudUpload as CloudUploadIcon, // 👈 CORREGIDO: Necesario para la importación
} from '@mui/icons-material';

// --- CONFIGURACIÓN ---
const API_URL_BACKEND = import.meta.env.API_URL_BACKEND;
const CREATE_EMPLOYEE_ENDPOINT = '/empleados/crear'; 

const ROL_OPTIONS = [
    { id: 3, nombre: 'veterinario' },
    { id: 4, nombre: 'Recepcionista' }
];

const ESTADO_DOCUMENTACION_OPTIONS = ['pendiente', 'verificado', 'rechazado'];

// --- FUNCIONES DE UTILIDAD ---

// Función para convertir archivo a Base64 (necesaria para la foto de perfil)
const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); 
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// 🔒 NUEVA FUNCIÓN DE VALIDACIÓN DE SEGURIDAD
const validatePassword = (password) => {
    // 1. Mínimo 8 caracteres (length >= 8)
    if (password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }
    // 2. Al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
        return "La contraseña debe incluir al menos una mayúscula.";
    }
    // 3. Al menos un número
    if (!/[0-9]/.test(password)) {
        return "La contraseña debe incluir al menos un número.";
    }
    // 4. Al menos un carácter especial (caracteres especiales comunes)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return "La contraseña debe incluir al menos un carácter especial.";
    }
    return null; // La contraseña es válida
};


// --- COMPONENTE PRINCIPAL ---
const EmpleadosCrearPage = () => {
    const theme = useTheme();
    
    // Estado con los campos combinados de USUARIO y EMPLEADO
    const [formData, setFormData] = useState({
        // CAMPOS DE USUARIO (USANDO 'nombre' como campo único, aunque se recomienda separarlo)
        nombre: '', 
        correo_electronico: '',
        contrasena: '', 
        fecha_nacimiento: '', 
        telefono: '',
        calle: '', 
        colonia: '',
        codigo_postal: '',
        ciudad: '',
        
        // CAMPOS DE EMPLEADO
        numero_empleado: '', 
        cedula_profesional: '',
        licenciatura: '',
        especialidad: '', 
        
        // ROLES Y ESTADO
        id_rol: ROL_OPTIONS[0].id,
        documentacion_verificada: 'pendiente', 
        activo: true,
    });
    
    const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState(null); // Nuevo estado para error de contraseña

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // 🚨 Validación en tiempo real para la contraseña
        if (name === 'contrasena') {
            const validationError = validatePassword(value);
            setPasswordError(validationError);
        }

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFotoPerfilFile(file || null);
    };

    const handleRemoveFile = () => {
        setFotoPerfilFile(null);
        document.getElementById('profile-image-upload-button').value = ''; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        // 1. 🔒 Validar Contraseña antes de cualquier envío
        const validationError = validatePassword(formData.contrasena);
        if (validationError) {
            setPasswordError(validationError);
            setError("Error de validación en la contraseña.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        // 2. Convertir imagen
        let fotoPerfilBase64 = null;
        if (fotoPerfilFile) {
            try {
                fotoPerfilBase64 = await convertFileToBase64(fotoPerfilFile);
            } catch (err) {
                setError("Error al procesar la foto de perfil. Intente de nuevo.");
                setLoading(false);
                return;
            }
        }

        // 3. Preparar Payload
        const payload = {
            ...formData,
            foto_perfil_base64: fotoPerfilBase64, 
            id_rol: parseInt(formData.id_rol, 10),
        };
        
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null) {
                delete payload[key];
            }
        });

        console.log("Payload preparado para envío:", payload);

        // 4. Envío a la API
        try {
            const response = await axios.post(`${API_URL_BACKEND}${CREATE_EMPLOYEE_ENDPOINT}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess(`Empleado "${response.data.nombre}" (${response.data.numero_empleado}) registrado con éxito.`);
            
            // 5. Resetear
            setFormData({
                nombre: '', correo_electronico: '', contrasena: '', 
                fecha_nacimiento: '', telefono: '', calle: '', colonia: '', 
                codigo_postal: '', ciudad: '', numero_empleado: '', 
                cedula_profesional: '', licenciatura: '', especialidad: '',
                id_rol: ROL_OPTIONS[0].id,
                documentacion_verificada: 'pendiente',
                activo: true,
            });
            setFotoPerfilFile(null); 
            setPasswordError(null);

        } catch (err) {
            console.error("Error al registrar empleado:", err.response || err);
            const errorMessage = err.response?.data?.error || "Error de red o del servidor. Inténtelo de nuevo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZADO (Sección modificada del campo Contraseña) ---
    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            
            {/* Header Empleado - Se mantiene igual */}
            {/* ... */}
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
                        <GroupAddIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Registrar Nuevo Empleado
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Complete el formulario para agregar un nuevo usuario/empleado al sistema
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Alertas - Se mantienen igual */}
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
                {/* Sección: Información Personal (Usuario) */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Datos Personales y Acceso
                        </Typography>
                    </Stack>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Correo Electrónico" name="correo_electronico" type="email" value={formData.correo_electronico} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        
                        {/* 🔒 CAMPO DE CONTRASEÑA MODIFICADO CON VALIDACIÓN */}
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                required 
                                label="Contraseña" 
                                name="contrasena" 
                                type="password" 
                                value={formData.contrasena} 
                                onChange={handleChange} 
                                error={!!passwordError} // Muestra error si passwordError tiene un valor
                                helperText={
                                    passwordError || 
                                    "Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial."
                                }
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Dirección (Simplificada) - Se mantiene igual */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Dirección
                        </Typography>
                    </Stack>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField fullWidth required label="Calle y Número" name="calle" value={formData.calle} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField fullWidth required label="Colonia" name="colonia" value={formData.colonia} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth required label="C.P." name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={9}>
                            <TextField fullWidth required label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Sección: Información Laboral (Empleado) - Se mantiene igual */}
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                        <Box 
                            sx={{ 
                                width: 4, height: 28, borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }} 
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Información Laboral
                        </Typography>
                    </Stack>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Número de Empleado" name="numero_empleado" value={formData.numero_empleado} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Rol</InputLabel>
                                <Select 
                                    name="id_rol" 
                                    value={formData.id_rol} 
                                    onChange={handleChange} 
                                    label="Rol"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {ROL_OPTIONS.map(opt => (
                                        <MenuItem key={opt.id} value={opt.id}>
                                            {opt.nombre.charAt(0).toUpperCase() + opt.nombre.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Licenciatura / Grado" name="licenciatura" value={formData.licenciatura} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Cédula Profesional (Solo si aplica)" name="cedula_profesional" value={formData.cedula_profesional} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth required label="Especialidad (Ej: Cirugía, Medicina Interna)" name="especialidad" value={formData.especialidad} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Botón de Envío */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        // Deshabilitado si hay un error de contraseña
                        disabled={loading || !!passwordError || !formData.nombre || !formData.correo_electronico || !formData.contrasena || !formData.numero_empleado}
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
                        {loading ? 'Registrando...' : 'Registrar Empleado'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default EmpleadosCrearPage;