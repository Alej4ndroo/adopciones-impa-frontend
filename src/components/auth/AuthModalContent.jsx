import React, { useState, useMemo } from 'react';
import { 
    Box, Button, TextField, Typography, Link, 
    InputAdornment, IconButton, Stack, Alert
} from '@mui/material';
import { 
    Visibility, VisibilityOff, Email, Lock, 
    Person, Pets, CalendarToday
} from '@mui/icons-material';
import axios from 'axios';

const VITE_API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const ADULT_MIN_AGE = 18;
const getAdultMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - ADULT_MIN_AGE);
    today.setHours(0, 0, 0, 0);
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
};

const isAdult = (birthDateStr) => {
    if (!birthDateStr) return false;
    const birthDate = new Date(birthDateStr);
    if (Number.isNaN(birthDate.getTime())) return false;
    const today = new Date();
    const adultDate = new Date(today.getFullYear() - ADULT_MIN_AGE, today.getMonth(), today.getDate());
    return birthDate <= adultDate;
};

// --- FUNCIÓN HELPER PARA VALIDAR ---
const checkPasswordValidation = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
};

// --- NUEVA FUNCIÓN HELPER PARA MENSAJE DE ERROR ---
/**
 * Genera un string con los requisitos faltantes de la contraseña.
 * @param {string} password - La contraseña a validar.
 * @returns {string} - Un string con los errores, o un string vacío si es válida.
 */
const getPasswordError = (password) => {
    const validation = checkPasswordValidation(password);
    let errors = [];
    if (!validation.length) errors.push("8+ caracteres");
    if (!validation.uppercase) errors.push("1 mayúscula");
    if (!validation.number) errors.push("1 número");
    if (!validation.specialChar) errors.push("1 caracter especial");
    
    if (errors.length > 0) {
        return "Falta: " + errors.join(', ');
    }
    return ''; // Vacío si todo es válido
};


const AuthModalContent = ({ onLoginSuccess, onClose }) => {
    const [view, setView] = useState('login'); 
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // --- Estado para el error de contraseña ---
    const [passwordError, setPasswordError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        nombre_completo: '',
        confirmPassword: '',
        fecha_nacimiento: ''
    });
    const adultMaxDate = useMemo(() => getAdultMaxDate(), []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Limpia el error general del Alert

        // --- VALIDACIÓN EN TIEMPO REAL ---
        if (name === 'password') {
            setPasswordError(getPasswordError(value));
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${VITE_API_URL_BACKEND}/auth/login`, {
                correo_electronico: formData.email,
                contrasena: formData.password,
            });
            const { token, usuario } = response.data; 

            if (usuario && usuario.activo === false) {
                setError('Tu cuenta está inactiva. Contacta al administrador.');
                setLoading(false);
                return;
            }

            if (!token) {
                throw new Error("El servidor no proporcionó un token.");
            }
            
            localStorage.setItem('authToken', token);
            onLoginSuccess({ token, user: usuario });

        } catch (err) {
            console.error('Error de autenticación:', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError(err.response.data?.message || 'Tu cuenta está inactiva. Contacta al administrador.');
                } else if (err.response.status === 401 || err.response.status === 400) {
                    setError('Usuario o contraseña incorrectos.');
                } else {
                    setError(err.response.data?.message || 'Ocurrió un error inesperado al iniciar sesión.');
                }
            } else if (err.request) {
                setError(`No se pudo conectar con el servidor en ${VITE_API_URL_BACKEND}.`);
            } else {
                setError('Ocurrió un error inesperado al iniciar sesión.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!isAdult(formData.fecha_nacimiento)) {
            setError('Debes ser mayor de edad para registrarte.');
            return;
        }

        const currentPasswordError = getPasswordError(formData.password);
        if (currentPasswordError) {
            setPasswordError(currentPasswordError);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${VITE_API_URL_BACKEND}/auth/registro`, {
                nombre: formData.nombre,
                correo_electronico: formData.email,
                contrasena: formData.password,
                fecha_nacimiento: formData.fecha_nacimiento
            });

            onLoginSuccess(response.data);
        } catch (err) {
            console.error(err);
            setError('Error al crear la cuenta. Intenta con otro correo.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        try {
            if (!formData.nombre_completo || !formData.email || !formData.recoveryPassword || !formData.recoveryConfirmPassword) {
                setError('Completa nombre completo, correo y la nueva contraseña.');
                setLoading(false);
                return;
            }
            if (formData.recoveryPassword !== formData.recoveryConfirmPassword) {
                setError('Las contraseñas no coinciden.');
                setLoading(false);
                return;
            }
            await axios.post(`${VITE_API_URL_BACKEND}/auth/contrasena-olvidada`, { 
                email: formData.email,
                nombre_completo: formData.nombre_completo,
                nueva_contrasena: formData.recoveryPassword
            });
            setSuccessMsg('Contraseña restablecida con éxito.');
            setError('');
        } catch (err) {
            setError('Hubo un problema al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const renderLogin = () => (
        <form onSubmit={handleLoginSubmit}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            mb: 2,
                            boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)'
                        }}
                    >
                        <Pets sx={{ fontSize: 45, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" 
                        sx={{ 
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        ¡Bienvenido de nuevo!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Inicia sesión para adoptar a tu compañero ideal
                    </Typography>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ borderRadius: 2, boxShadow: 1 }}
                    >
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth 
                    label="Correo Electrónico" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />
                
                <TextField
                    fullWidth 
                    label="Contraseña" 
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    edge="end"
                                    sx={{ color: '#007BFF' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link 
                        component="button" 
                        type="button" 
                        variant="body2" 
                        onClick={() => { setView('recovery'); setError(''); setSuccessMsg(''); setPasswordError(''); }}
                        sx={{ 
                            textDecoration: 'none',
                            color: '#007BFF',
                            fontWeight: 500,
                            '&:hover': {
                                color: '#0056b3'
                            }
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Box>

                <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    type="submit" 
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                        boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0056b3 0%, #007BFF 100%)',
                            boxShadow: '0 6px 20px rgba(0, 123, 255, 0.5)',
                        }
                    }}
                >
                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" component="span">
                        ¿No tienes cuenta?{' '}
                    </Typography>
                    <Link 
                        component="button" 
                        type="button" 
                        variant="body2" 
                        fontWeight="bold"
                        onClick={() => { setView('register'); setError(''); setPasswordError(''); }}
                        sx={{
                            color: '#007BFF',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            '&:hover': {
                                color: '#0056b3'
                            }
                        }}
                    >
                        Regístrate aquí
                    </Link>
                </Box>
            </Stack>
        </form>
    );

    const renderRegister = () => (
        <form onSubmit={handleRegisterSubmit}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            mb: 2,
                            boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)'
                        }}
                    >
                        <Person sx={{ fontSize: 45, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ 
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        Crear Cuenta
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Únete para encontrar a tu compañero ideal
                    </Typography>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ borderRadius: 2, boxShadow: 1 }}
                    >
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth 
                    label="Nombre Completo" 
                    name="nombre"
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Fecha de Nacimiento" 
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento} 
                    onChange={handleChange} 
                    required
                    inputProps={{ max: adultMaxDate }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <CalendarToday sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Correo Electrónico" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Contraseña" 
                    name="password" 
                    type="password"
                    value={formData.password} 
                    onChange={handleChange} 
                    required
                    error={!!passwordError} 
                    helperText={passwordError} 
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Confirmar Contraseña" 
                    name="confirmPassword" 
                    type="password"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required
                    error={formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword}
                    helperText={
                        formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword 
                        ? "Las contraseñas no coinciden" 
                        : ""
                    }
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#f093fb',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock sx={{ color: '#f093fb' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    type="submit" 
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                        boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0056b3 0%, #007BFF 100%)',
                            boxShadow: '0 6px 20px rgba(0, 123, 255, 0.5)',
                        }
                    }}
                >
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" component="span">
                        ¿Ya tienes cuenta?{' '}
                    </Typography>
                    <Link 
                        component="button" 
                        type="button" 
                        variant="body2" 
                        fontWeight="bold"
                        onClick={() => { setView('login'); setError(''); setPasswordError(''); }}
                        sx={{
                            color: '#007BFF',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            '&:hover': {
                                color: '#0056b3'
                            }
                        }}
                    >
                        Inicia sesión
                    </Link>
                </Box>
            </Stack>
        </form>
    );

    const renderRecovery = () => (
        <form onSubmit={handleRecoverySubmit}>
            <Stack spacing={3}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            mb: 2,
                            boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)'
                        }}
                    >
                        <Lock sx={{ fontSize: 45, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold"
                        sx={{ 
                            background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        Recuperar Contraseña
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Ingresa tu nombre, correo y define tu nueva contraseña.
                    </Typography>
                </Box>

                {successMsg && (
                    <Alert 
                        severity="success" 
                        sx={{ borderRadius: 2, boxShadow: 1 }}
                    >
                        {successMsg}
                    </Alert>
                )}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ borderRadius: 2, boxShadow: 1 }}
                    >
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth 
                    label="Nombre completo" 
                    name="nombre_completo" 
                    value={formData.nombre_completo}
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Correo Electrónico" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Nueva contraseña" 
                    name="recoveryPassword" 
                    type="password"
                    value={formData.recoveryPassword} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <TextField
                    fullWidth 
                    label="Confirmar contraseña" 
                    name="recoveryConfirmPassword" 
                    type="password"
                    value={formData.recoveryConfirmPassword} 
                    onChange={handleChange} 
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                                borderColor: '#007BFF',
                            },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock sx={{ color: '#007BFF' }}/>
                            </InputAdornment>
                        ) 
                    }}
                />

                <Button 
                    fullWidth 
                    variant="contained" 
                    type="submit" 
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
                        boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0056b3 0%, #007BFF 100%)',
                            boxShadow: '0 6px 20px rgba(0, 123, 255, 0.5)',
                        }
                    }}
                >
                    {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </Button>

                <Button 
                    fullWidth 
                    variant="outlined"
                    onClick={() => { setView('login'); setError(''); setSuccessMsg(''); setPasswordError(''); }}
                    sx={{
                        borderRadius: 2,
                        py: 1.2,
                        borderColor: '#007BFF',
                        color: '#007BFF',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: '#0056b3',
                            backgroundColor: 'rgba(0, 123, 255, 0.05)'
                        }
                    }}
                >
                    Volver al Login
                </Button>
            </Stack>
        </form>
    );

    return (
        <Box sx={{ py: 2, px: 1 }}>
            {view === 'login' && renderLogin()}
            {view === 'register' && renderRegister()}
            {view === 'recovery' && renderRecovery()}
        </Box>
    );
};

export default AuthModalContent;
