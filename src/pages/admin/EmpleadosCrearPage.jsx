import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Paper, 
    CircularProgress, Alert, Divider, useTheme, Stack, alpha, Zoom
} from '@mui/material';
import { 
    GroupAdd as GroupAddIcon, 
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon, 
    CloudUpload as CloudUploadIcon, // 👈 CORREGIDO: Necesario para la importación
} from '@mui/icons-material';

// --- CONFIGURACIÓN ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_EMPLOYEE_ENDPOINT = '/empleados/crear'; 

const ROL_OPTIONS = [
    { id: 3, nombre: 'veterinario' },
    { id: 4, nombre: 'Recepcionista' }
];

const ESTADO_DOCUMENTACION_OPTIONS = ['pendiente', 'verificada', 'rechazada'];

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
        numero_exterior: '',
        numero_interior: '',
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
    const [emailError, setEmailError] = useState(null);

    const todayMinus18 = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().split('T')[0];
    })();

    const sanitizeDigits = (value, maxLength) => value.replace(/\D/g, '').slice(0, maxLength);
    const sanitizePhone = (value) => sanitizeDigits(value, 10);
    const sanitizeCp = (value) => sanitizeDigits(value, 5);
    const sanitizeNumero = (value) => sanitizeDigits(value, 5);
    const isValidEmail = (val) => /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i.test(val);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // 🚨 Validación en tiempo real para la contraseña
        if (name === 'contrasena') {
            const validationError = validatePassword(value);
            setPasswordError(validationError);
        }

        if (name === 'telefono') {
            const digits = sanitizePhone(value);
            setFormData((prev) => ({ ...prev, [name]: digits }));
            return;
        }

        if (name === 'codigo_postal') {
            const digits = sanitizeCp(value);
            setFormData((prev) => ({ ...prev, [name]: digits }));
            return;
        }

        if (name === 'numero_exterior' || name === 'numero_interior') {
            const digits = sanitizeNumero(value);
            setFormData((prev) => ({ ...prev, [name]: digits }));
            return;
        }

        if (name === 'correo_electronico') {
            setEmailError(value && !isValidEmail(value) ? 'Correo no válido' : null);
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

        if (formData.fecha_nacimiento) {
            const born = new Date(formData.fecha_nacimiento);
            const today = new Date();
            const age = today.getFullYear() - born.getFullYear() - (today < new Date(today.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0);
            if (age < 18) {
                setError('El empleado debe ser mayor de 18 años.');
                setLoading(false);
                return;
            }
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
        const addressLine = [formData.calle, formData.numero_exterior, formData.numero_interior ? `Int ${formData.numero_interior}` : '']
            .filter(Boolean)
            .join(' ')
            .trim();

        const payload = {
            ...formData,
            calle: addressLine || formData.calle,
            foto_perfil_base64: fotoPerfilBase64, 
            id_rol: parseInt(formData.id_rol, 10),
        };
        
        Object.keys(payload).forEach(key => {
            if (payload[key] === '' || payload[key] === null) {
                delete payload[key];
            }
        });

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
                fecha_nacimiento: '', telefono: '', calle: '', numero_exterior: '', numero_interior: '', colonia: '', 
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
        <Box sx={{ width: '100%', mx: 'auto' }}>
            
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
                    width: '100%',
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
                    
                    <Stack spacing={3}>
                        <TextField fullWidth required label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField fullWidth required label="Correo Electrónico" name="correo_electronico" type="email" value={formData.correo_electronico} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        
                        {/* 🔒 CAMPO DE CONTRASEÑA MODIFICADO CON VALIDACIÓN */}
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

                        <TextField
                            fullWidth
                            label="Fecha de Nacimiento"
                            name="fecha_nacimiento"
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: todayMinus18 }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
                            helperText="10 dígitos, solo números"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Stack>
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
                    <Stack spacing={3}>
                        <TextField fullWidth required label="Calle" name="calle" value={formData.calle} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                required
                                label="Número Exterior"
                                name="numero_exterior"
                                value={formData.numero_exterior}
                                onChange={handleChange}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
                                helperText="Solo números"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                fullWidth
                                label="Número Interior (Opcional)"
                                name="numero_interior"
                                value={formData.numero_interior}
                                onChange={handleChange}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
                                helperText="Solo números"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Stack>
                        <TextField fullWidth required label="Colonia" name="colonia" value={formData.colonia} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField
                            fullWidth
                            required
                            label="C.P."
                            name="codigo_postal"
                            value={formData.codigo_postal}
                            onChange={handleChange}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
                            helperText="5 dígitos"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField fullWidth required label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Stack>
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
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            required
                            label="Número de Empleado"
                            name="numero_empleado"
                            value={formData.numero_empleado}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\\D/g, '').slice(0, 6);
                                setFormData((prev) => ({ ...prev, numero_empleado: digits }));
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                            helperText="Solo números"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
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
                        <TextField fullWidth required label="Licenciatura / Grado" name="licenciatura" value={formData.licenciatura} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField fullWidth required label="Cédula Profesional (Solo si aplica)" name="cedula_profesional" value={formData.cedula_profesional} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <TextField fullWidth required label="Especialidad (Ej: Cirugía, Medicina Interna)" name="especialidad" value={formData.especialidad} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
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
                        // Deshabilitado si hay un error de contraseña
                        disabled={
                            loading || !!passwordError || !!emailError ||
                            !formData.nombre || !formData.correo_electronico || !formData.contrasena ||
                            !formData.numero_empleado || !formData.telefono || formData.telefono.length !== 10 ||
                            !formData.calle || !formData.numero_exterior ||
                            !formData.colonia || !formData.codigo_postal || formData.codigo_postal.length !== 5 ||
                            !formData.ciudad
                        }
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
