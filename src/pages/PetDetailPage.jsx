import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Grid, CardMedia,
    Typography, Button, CssBaseline, Chip, CircularProgress, Alert,
    Stack
} from '@mui/material';
import { 
    Favorite, Male, Female, Cake, LocalHospital, CheckCircleRounded
} from '@mui/icons-material';
import { 
    PawPrint, Heart, Stethoscope, Shield, HeartHandshake
} from 'lucide-react'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'; // 🔑 1. IMPORTA useNavigate

// Componentes Separados (Importados de tu estructura)
import PublicNavbar from '../components/public/PublicNavbar'; // Asegúrate de que esta ruta sea correcta
import PublicFooter from '../components/public/PublicFooter'; // Asegúrate de que esta ruta sea correcta

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PET_DETAIL_ENDPOINT = '/mascotas/'; 

// TEMA PERSONALIZADO (Copiado de LandingPage para coherencia)
const customTheme = createTheme({
    palette: {
        primary: {
            main: '#007BFF',
        },
        secondary: {
            main: '#5C6BC0',
        },
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

// Función de utilidad (Copiada de LandingPage)
const calcularEdad = (meses) => {
    if (meses === null || meses === undefined) return 'Edad desconocida';
    if (meses < 12) return `${meses} meses`;
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;
    return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} meses`;
};

// Función para transformar Base64
const getImageUrl = (base64String, index) => {
    if (!base64String) return '/placeholder-pet.jpg'; // Imagen de respaldo
    
    const prefix = 'data:image/jpeg;base64,'; 
    if (base64String && base64String.startsWith(prefix)) {
        return base64String;
    }
    return prefix + base64String;
};

// --- COMPONENTE PRINCIPAL ---
// 🔑 2. RECIBE 'onOpenLoginModal' EN LOS PROPS
const PetDetailPage = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout, onOpenLoginModal }) => {
    const { petId } = useParams();
    const navigate = useNavigate(); // 🔑 1. INICIALIZA useNavigate
    
    const [mascota, setMascota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        if (!petId) {
            setError('ID de mascota no proporcionado.');
            setLoading(false);
            return;
        }

        const fetchMascota = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL_BACKEND}${PET_DETAIL_ENDPOINT}${petId}`); 
                const data = await response.json();
                setMascota(data);
                setMainImage(getImageUrl(data.imagenes_base64?.[0]));
            } catch (err) {
                setError(err.message);
                console.error('Error fetching pet detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMascota();
    }, [petId]);

    // 🔑 3. CREA LA FUNCIÓN HANDLER PARA EL BOTÓN
    const handleAdoptionClick = () => {
        if (isAuthenticated) {
            navigate(`/solicitar-adopcion/${petId}`);
        } else {
            // Usuario NO LOGUEADO: Abrir el modal de login
            if (onOpenLoginModal) {
                onOpenLoginModal();
            } else {
                console.error("La prop 'onOpenLoginModal' no fue proporcionada a PetDetailPage.");
            }
        }
    };

    // Manejo de estados de carga y error
    if (loading) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                {/* 🔑 2. PASA LA PROP AL NAVBAR */}
                <PublicNavbar 
                    isAuthenticated={isAuthenticated} 
                    currentUser={currentUser} 
                    onLoginSuccess={onLoginSuccess} 
                    onLogout={onLogout}
                    onOpenLoginModal={onOpenLoginModal}
                />
                <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
                    <CircularProgress color="primary" />
                    <Typography variant="h6" sx={{ mt: 2 }}>Cargando información de la mascota...</Typography>
                </Container>
                <PublicFooter />
            </ThemeProvider>
        );
    }

    if (error || !mascota) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                {/* 🔑 2. PASA LA PROP AL NAVBAR */}
                <PublicNavbar 
                    isAuthenticated={isAuthenticated} 
                    currentUser={currentUser} 
                    onLoginSuccess={onLoginSuccess} 
                    onLogout={onLogout}
                    onOpenLoginModal={onOpenLoginModal}
                />
                <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
                    <Alert severity="error">
                        {error || "Mascota no encontrada. Por favor, verifica el ID."}
                    </Alert>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => window.history.back()}>
                        Volver al listado
                    </Button>
                </Container>
                <PublicFooter />
            </ThemeProvider>
        );
    }
    
    // Función para cambiar la imagen principal
    const handleImageClick = (base64) => {
        setMainImage(getImageUrl(base64));
    };

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
             {/* 🔑 2. PASA LA PROP AL NAVBAR */}
            <PublicNavbar 
                isAuthenticated={isAuthenticated} 
                currentUser={currentUser} 
                onLoginSuccess={onLoginSuccess} 
                onLogout={onLogout}
                onOpenLoginModal={onOpenLoginModal}
            />

            <Box sx={{ bgcolor: 'background.default', py: { xs: 5, md: 10 } }}>
                <Container maxWidth="lg">
                    {/* Cabecera ligera */}
                    <Stack spacing={1.2} sx={{ mb: 2 }}>
                        <Chip label={mascota.estado_adopcion === 'disponible' ? 'Disponible' : 'En proceso'} color={mascota.estado_adopcion === 'disponible' ? 'success' : 'warning'} sx={{ width: 'fit-content', fontWeight: 700 }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.05 }}>
                            {mascota.nombre}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Conoce a {mascota.nombre}: datos claros, salud verificada y acompañamiento.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip icon={mascota.sexo === 'macho' ? <Male /> : <Female />} label={mascota.sexo} color={mascota.sexo === 'macho' ? 'primary' : 'secondary'} />
                            <Chip icon={<Cake />} label={calcularEdad(mascota.edad_en_meses)} variant="outlined" />
                            <Chip icon={<PawPrint size={18} />} label={mascota.raza || 'Raza desconocida'} variant="outlined" />
                            <Chip icon={<Heart />} label={mascota.especie} variant="outlined" />
                            {mascota.tamano && (
                                <Chip label={`Tamaño: ${mascota.tamano}`} variant="outlined" />
                            )}
                        </Stack>
                    </Stack>

                    <Grid container spacing={3} alignItems="flex-start">
                        {/* Galería vertical con miniaturas alineadas */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 110px' }, gap: 1.5, alignItems: 'stretch' }}>
                                <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.08)', aspectRatio: '4 / 5', minHeight: 360 }}>
                                    <Box
                                        component="img"
                                        src={mainImage || getImageUrl(mascota.imagenes_base64?.[0])}
                                        alt={mascota.nombre}
                                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <Stack spacing={1} sx={{ maxHeight: 520, overflow: 'auto', pr: 0.5 }}>
                                    {mascota.imagenes_base64 && mascota.imagenes_base64.map((base64, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => handleImageClick(base64)}
                                            sx={{
                                                height: 100,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: mainImage === getImageUrl(base64) ? '3px solid #007BFF' : '1px solid #e6e9f0',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(base64, index)}
                                                alt={`Miniatura ${index + 1}`}
                                                loading="lazy"
                                                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Panel informativo */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2.6}>
                                <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, border: '1px solid #e6e9f0', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}>
                                    <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', mb: 1 }}>
                                        Cuota de adopción
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                                        Gratis
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Incluye revisión veterinaria y guía de adaptación.
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
                                    <Box sx={{ p: 2.3, bgcolor: '#f7f9ff', borderRadius: 3, border: '1px solid #e6e9f0' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Datos rápidos</Typography>
                                    <Stack spacing={0.6} sx={{ mt: 1 }}>
                                        <Typography variant="body1"><strong>Especie:</strong> {mascota.especie}</Typography>
                                        <Typography variant="body1"><strong>Edad:</strong> {calcularEdad(mascota.edad_en_meses)}</Typography>
                                        <Typography variant="body1"><strong>Raza:</strong> {mascota.raza || 'N/D'}</Typography>
                                        <Typography variant="body1"><strong>Tamaño:</strong> {mascota.tamano || 'N/D'}</Typography>
                                        <Typography variant="body1"><strong>Peso:</strong> {mascota.peso || 'N/D'}</Typography>
                                        <Typography variant="body1"><strong>Estado:</strong> {mascota.estado_adopcion}</Typography>
                                    </Stack>
                                </Box>
                                    <Box sx={{ p: 2.3, bgcolor: 'white', borderRadius: 3, border: '1px solid #e6e9f0' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Salud</Typography>
                                        <Stack spacing={0.8} sx={{ mt: 1 }}>
                                            <Chip
                                                icon={<CheckCircleRounded />}
                                                label={mascota.vacunado ? 'Vacunación al día' : 'Vacunación pendiente'}
                                                color={mascota.vacunado ? 'success' : 'warning'}
                                                variant={mascota.vacunado ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 700 }}
                                            />
                                            <Chip
                                                icon={<LocalHospital />}
                                                label={mascota.esterilizado ? 'Esterilizado/a' : 'Esterilización pendiente'}
                                                color={mascota.esterilizado ? 'success' : 'warning'}
                                                variant={mascota.esterilizado ? 'filled' : 'outlined'}
                                            />
                                        </Stack>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, border: '1px solid #e6e9f0', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                        Sobre {mascota.nombre}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                        {mascota.descripcion || 'Esta mascota está lista para encontrar un hogar lleno de cariño.'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        startIcon={<Favorite />}
                                        onClick={handleAdoptionClick}
                                        sx={{ py: 1.3, fontWeight: 800, borderRadius: 2, boxShadow: '0 10px 25px rgba(0,123,255,0.25)' }}
                                    >
                                        Solicitar adopción
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="large"
                                        sx={{ py: 1.3, fontWeight: 700, borderRadius: 2 }}
                                        onClick={() => window.history.back()}
                                    >
                                        Volver al catálogo
                                    </Button>
                                </Box>

                                <Stack spacing={1} sx={{ p: 2.3, borderRadius: 3, border: '1px dashed #e6e9f0', bgcolor: '#f9fbff' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Shield size={18} />
                                        <Typography variant="body2">Proceso transparente y seguimiento post-adopción.</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Stethoscope size={18} />
                                        <Typography variant="body2">Revisión veterinaria previa a la entrega.</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <HeartHandshake size={18} />
                                        <Typography variant="body2">Acompañamiento para adaptación en casa.</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <PublicFooter />
        </ThemeProvider>
    );
};

export default PetDetailPage;
