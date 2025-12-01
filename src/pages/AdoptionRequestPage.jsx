import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Box, Card, CardContent, Typography, TextField, 
    Button, Alert, CircularProgress, Grid, Avatar, Chip,
    FormControlLabel, Checkbox, Paper, CssBaseline
} from '@mui/material';
import { 
    Favorite, ArrowBack, Send, Home, Description
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PawPrint } from 'lucide-react';

import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const customTheme = createTheme({
    palette: {
        primary: { main: '#007BFF' },
        secondary: { main: '#5C6BC0' },
        background: {
            default: '#f4f7ff',
            paper: '#ffffff',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 700 },
        button: { textTransform: 'none' }
    },
});

const getImageUrl = (base64String) => {
    if (!base64String) return '/placeholder-pet.jpg';
    const prefix = 'data:image/jpeg;base64,';
    if (base64String.startsWith(prefix)) return base64String;
    return prefix + base64String;
};

const AdoptionRequestPage = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout, onOpenLoginModal }) => {
    const { petId } = useParams();
    const navigate = useNavigate();
    
    const [mascota, setMascota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        ubicacion_en_hogar: '',
        motivo_adopcion: '',
        observaciones: '',
        acepta_terminos: false
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL_BACKEND}/mascotas/${petId}`);
                if (!response.ok) throw new Error('Error al cargar la mascota');
                const data = await response.json();
                setMascota(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (petId) fetchMascota();
    }, [petId]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.ubicacion_en_hogar.trim()) {
            errors.ubicacion_en_hogar = 'Debes describir dónde vivirá la mascota';
        }
        
        if (!formData.motivo_adopcion.trim()) {
            errors.motivo_adopcion = 'Debes explicar por qué quieres adoptar';
        } else if (formData.motivo_adopcion.trim().length < 50) {
            errors.motivo_adopcion = 'Por favor, proporciona más detalles (mínimo 50 caracteres)';
        }
        
        if (!formData.acepta_terminos) {
            errors.acepta_terminos = 'Debes aceptar los términos y condiciones';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            
            const adopcionData = {
                id_usuario: currentUser.id_usuario,
                id_mascota: parseInt(petId),
                ubicacion_en_hogar: formData.ubicacion_en_hogar.trim(),
                motivo_adopcion: formData.motivo_adopcion.trim(),
                observaciones: formData.observaciones.trim() || null,
            };

            const response = await fetch(`${API_URL_BACKEND}/adopciones/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adopcionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la solicitud');
            }

            setSuccess(true);
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/');
            }, 10000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                <PublicNavbar 
                    isAuthenticated={isAuthenticated} 
                    currentUser={currentUser} 
                    onLoginSuccess={onLoginSuccess} 
                    onLogout={onLogout}
                    onOpenLoginModal={onOpenLoginModal}
                />
                <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                    <CircularProgress color="primary" />
                    <Typography variant="h6" sx={{ mt: 2 }}>Cargando formulario...</Typography>
                </Container>
                <PublicFooter />
            </ThemeProvider>
        );
    }

    if (error && !mascota) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                <PublicNavbar 
                    isAuthenticated={isAuthenticated} 
                    currentUser={currentUser} 
                    onLoginSuccess={onLoginSuccess} 
                    onLogout={onLogout}
                    onOpenLoginModal={onOpenLoginModal}
                />
                <Container maxWidth="md" sx={{ py: 10 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }} 
                        onClick={() => navigate('/')}
                        startIcon={<ArrowBack />}
                    >
                        Volver al inicio
                    </Button>
                </Container>
                <PublicFooter />
            </ThemeProvider>
        );
    }

    if (success) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                <PublicNavbar 
                    isAuthenticated={isAuthenticated} 
                    currentUser={currentUser} 
                    onLoginSuccess={onLoginSuccess} 
                    onLogout={onLogout}
                    onOpenLoginModal={onOpenLoginModal}
                />
                <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                    <Card sx={{ p: 5, borderRadius: 4 }}>
                        <Favorite sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                            ¡Solicitud Enviada!
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                            Tu solicitud para adoptar a {mascota?.nombre} ha sido recibida exitosamente.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo pronto.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                            Redirigiendo...
                        </Typography>
                    </Card>
                </Container>
                <PublicFooter />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <PublicNavbar 
                isAuthenticated={isAuthenticated} 
                currentUser={currentUser} 
                onLoginSuccess={onLoginSuccess} 
                onLogout={onLogout}
                onOpenLoginModal={onOpenLoginModal}
            />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 10 }, bgcolor: 'background.default' }}>
                
                {/* Header con botón de volver */}
                <Box sx={{ mb: 3 }}>
                    <Button 
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 2 }}
                    >
                        Volver
                    </Button>
                    
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                        Solicitud de Adopción
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Estás a un paso de darle un hogar a una mascota
                    </Typography>
                </Box>

                {/* Tarjeta de la mascota seleccionada */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'primary.light', color: 'white' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Avatar 
                                src={getImageUrl(mascota?.imagenes_base64?.[0])}
                                alt={mascota?.nombre}
                                sx={{ width: 80, height: 80, border: '3px solid white' }}
                            />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {mascota?.nombre}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={mascota?.raza}
                                    size="small"
                                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
                                />
                                <Chip 
                                    icon={<PawPrint size={16} />}
                                    label={mascota?.sexo}
                                    size="small"
                                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Formulario */}
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            
                            {/* Campo: Ubicación en el hogar */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Home color="primary" /> Ubicación en tu hogar
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="ubicacion_en_hogar"
                                    placeholder="Ej: Casa con jardín amplio, departamento de 2 habitaciones, patio techado..."
                                    multiline
                                    rows={3}
                                    value={formData.ubicacion_en_hogar}
                                    onChange={handleChange}
                                    error={!!formErrors.ubicacion_en_hogar}
                                    helperText={formErrors.ubicacion_en_hogar || 'Describe dónde vivirá la mascota'}
                                    required
                                />
                            </Box>

                            {/* Campo: Motivo de adopción */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Favorite color="primary" /> ¿Por qué quieres adoptar?
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="motivo_adopcion"
                                    placeholder="Cuéntanos por qué quieres adoptar a esta mascota, qué puedes ofrecerle, tu experiencia con mascotas..."
                                    multiline
                                    rows={5}
                                    value={formData.motivo_adopcion}
                                    onChange={handleChange}
                                    error={!!formErrors.motivo_adopcion}
                                    helperText={formErrors.motivo_adopcion || `${formData.motivo_adopcion.length}/50 caracteres mínimo`}
                                    required
                                />
                            </Box>

                            {/* Campo: Observaciones adicionales */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Description color="primary" /> Observaciones adicionales (opcional)
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="observaciones"
                                    placeholder="Cualquier información adicional que consideres relevante..."
                                    multiline
                                    rows={3}
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    helperText="Información adicional que quieras compartir"
                                />
                            </Box>

                            {/* Checkbox de términos */}
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="acepta_terminos"
                                            checked={formData.acepta_terminos}
                                            onChange={handleChange}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            Acepto los términos y condiciones de adopción, y me comprometo a brindar 
                                            los cuidados necesarios a la mascota
                                        </Typography>
                                    }
                                />
                                {formErrors.acepta_terminos && (
                                    <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                                        {formErrors.acepta_terminos}
                                    </Typography>
                                )}
                            </Box>

                            {/* Botón de envío */}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                                sx={{ 
                                    py: 1.5, 
                                    borderRadius: 2, 
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}
                            >
                                {submitting ? 'Enviando solicitud...' : 'Enviar Solicitud de Adopción'}
                            </Button>
                        </form>

                    </CardContent>
                </Card>

                {/* Información adicional */}
                <Box sx={{ mt: 4, p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'red' }}>
                        Próximos pasos:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        1. Revisaremos tu solicitud en un plazo de 2-3 días hábiles
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        2. Te contactaremos para coordinar una entrevista
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        3. Si todo está en orden, coordinaremos la entrega de tu nueva mascota
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        4. ¡Comenzará su aventura juntos!
                    </Typography>
                </Box>

            </Container>

            <PublicFooter />
        </ThemeProvider>
    );
};

export default AdoptionRequestPage;