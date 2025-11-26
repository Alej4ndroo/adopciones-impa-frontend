import React, { useState, useEffect } from 'react';
import { 
    Container, Box,
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
    const [docWarning, setDocWarning] = useState(null);

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
    const isDocVerified = (currentUser?.documentacion_verificada || '').toLowerCase() === 'verificada';

    useEffect(() => {
        if (isDocVerified) {
            setDocWarning(null);
        }
    }, [isDocVerified]);

    const handleAdoptionClick = () => {
        if (isAuthenticated) {
            if (!isDocVerified) {
                setDocWarning('Debes tener tu documentación verificada para solicitar una adopción.');
                return;
            }
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

            <Box sx={{ bgcolor: '#eef2ff', py: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', width: 260, height: 260, bgcolor: 'primary.main', borderRadius: '50%', filter: 'blur(110px)', opacity: 0.18, top: -60, left: -80 }} />
                <Box sx={{ position: 'absolute', width: 220, height: 220, bgcolor: 'secondary.main', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.16, bottom: -70, right: -60 }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack spacing={1.4} alignItems="flex-start" sx={{ mb: { xs: 4, md: 5 } }}>
                        <Chip 
                            label={mascota.estado_adopcion === 'disponible' ? 'Disponible' : 'En proceso'} 
                            color={mascota.estado_adopcion === 'disponible' ? 'success' : 'warning'} 
                            sx={{ px: 1, height: 30, fontWeight: 700, borderRadius: 2 }}
                        />
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.05 }}>
                            {mascota.nombre}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
                            Conoce a {mascota.nombre}: salud verificada, acompañamiento y toda la información que necesitas para tomar una decisión informada.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                            <Chip icon={mascota.sexo === 'macho' ? <Male /> : <Female />} label={mascota.sexo} color={mascota.sexo === 'macho' ? 'primary' : 'secondary'} sx={{ fontWeight: 600 }} />
                            <Chip icon={<Cake />} label={calcularEdad(mascota.edad_en_meses)} variant="outlined" sx={{ fontWeight: 600 }} />
                            <Chip icon={<PawPrint size={18} />} label={mascota.raza || 'Raza desconocida'} variant="outlined" sx={{ fontWeight: 600 }} />
                            <Chip icon={<Heart />} label={mascota.especie} variant="outlined" sx={{ fontWeight: 600 }} />
                            {mascota.tamano && (
                                <Chip label={`Tamaño: ${mascota.tamano}`} variant="outlined" sx={{ fontWeight: 600 }} />
                            )}
                        </Stack>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' }, gap: { xs: 3, md: 4 } }}>
                        <Box sx={{ bgcolor: 'white', borderRadius: 4, p: { xs: 2, md: 2.5 }, boxShadow: '0 24px 60px rgba(15,23,42,0.08)', border: '1px solid #e7e9f4' }}>
                            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', aspectRatio: '4 / 5', mb: 2.5, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}>
                                <Box
                                    component="img"
                                    src={mainImage || getImageUrl(mascota.imagenes_base64?.[0])}
                                    alt={mascota.nombre}
                                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 14, left: 14 }}>
                                    <Chip 
                                        label={mascota.especie || 'Mascota'} 
                                        size="small" 
                                        color="primary" 
                                        sx={{ fontWeight: 700, bgcolor: 'rgba(0,123,255,0.9)', color: 'white', borderRadius: 2 }}
                                    />
                                    <Chip 
                                        label={mascota.estado_adopcion ? mascota.estado_adopcion.charAt(0).toUpperCase() + mascota.estado_adopcion.slice(1) : 'Estado'} 
                                        size="small" 
                                        color={mascota.estado_adopcion === 'disponible' ? 'success' : 'warning'} 
                                        variant={mascota.estado_adopcion === 'disponible' ? 'filled' : 'outlined'}
                                        sx={{ fontWeight: 700, borderRadius: 2, bgcolor: mascota.estado_adopcion === 'disponible' ? undefined : 'rgba(255,255,255,0.9)' }}
                                    />
                                </Stack>
                            </Box>
                            <Stack direction="row" spacing={1.2} sx={{ overflowX: 'auto', pb: 0.5 }}>
                                {mascota.imagenes_base64 && mascota.imagenes_base64.map((base64, index) => {
                                    const url = getImageUrl(base64, index);
                                    const active = mainImage === url;
                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => handleImageClick(base64)}
                                            sx={{
                                                width: 110,
                                                height: 90,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: active ? '3px solid #007BFF' : '1px solid #e6e9f0',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                boxShadow: active ? '0 10px 25px rgba(0,123,255,0.25)' : 'none'
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Miniatura ${index + 1}`}
                                                loading="lazy"
                                                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>

                        <Box sx={{ bgcolor: 'white', borderRadius: 4, p: { xs: 2.5, md: 3.5 }, boxShadow: '0 24px 60px rgba(15,23,42,0.08)', border: '1px solid #e7e9f4', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' }, gap: 1.5 }}>
                                <Box sx={{ p: 2.4, borderRadius: 3, bgcolor: '#f6f8ff', border: '1px solid #e6e9f0' }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, letterSpacing: 0.5 }}>Datos rápidos</Typography>
                                    <Stack spacing={0.6}>
                                        <Typography variant="body2"><strong>Especie:</strong> {mascota.especie || 'N/D'}</Typography>
                                        <Typography variant="body2"><strong>Edad:</strong> {calcularEdad(mascota.edad_en_meses)}</Typography>
                                        <Typography variant="body2"><strong>Raza:</strong> {mascota.raza || 'N/D'}</Typography>
                                        <Typography variant="body2"><strong>Tamaño:</strong> {mascota.tamano || 'N/D'}</Typography>
                                        <Typography variant="body2"><strong>Estado:</strong> {mascota.estado_adopcion || 'N/D'}</Typography>
                                    </Stack>
                                </Box>
                                <Box sx={{ p: 2.4, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e6e9f0' }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, letterSpacing: 0.5 }}>Salud</Typography>
                                    <Stack spacing={1}>
                                        <Chip
                                            icon={<CheckCircleRounded />}
                                            label={mascota.vacunado ? 'Vacunación al día' : 'Vacunación pendiente'}
                                            color={mascota.vacunado ? 'success' : 'warning'}
                                            variant={mascota.vacunado ? 'filled' : 'outlined'}
                                            sx={{ fontWeight: 700, borderRadius: 2 }}
                                        />
                                        <Chip
                                            icon={<LocalHospital />}
                                            label={mascota.esterilizado ? 'Esterilizado/a' : 'Esterilización pendiente'}
                                            color={mascota.esterilizado ? 'success' : 'warning'}
                                            variant={mascota.esterilizado ? 'filled' : 'outlined'}
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </Stack>
                                </Box>
                            </Box>

                            <Box sx={{ p: 2.6, borderRadius: 3, border: '1px solid #e6e9f0', bgcolor: '#fbfcff' }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, letterSpacing: 0.5 }}>Sobre {mascota.nombre}</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    {mascota.descripcion || 'Esta mascota está lista para encontrar un hogar lleno de cariño.'}
                                </Typography>
                            </Box>

                            {!isDocVerified && (
                                <Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 600 }}>
                                    Debes tener la documentación verificada para adoptar. Actualiza tus documentos en tu perfil.
                                </Alert>
                            )}
                            {docWarning && (
                                <Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 600 }}>
                                    {docWarning}
                                </Alert>
                            )}

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<Favorite />}
                                    onClick={handleAdoptionClick}
                                    disabled={!isDocVerified}
                                    sx={{ py: 1.3, fontWeight: 800, borderRadius: 2.5, flex: 1 }}
                                >
                                    Solicitar adopción
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    sx={{ py: 1.3, fontWeight: 700, borderRadius: 2.5, flex: 1 }}
                                    onClick={() => window.history.back()}
                                >
                                    Volver al catálogo
                                </Button>
                            </Stack>

                            <Stack spacing={1.1} sx={{ p: 2.2, borderRadius: 3, border: '1px dashed #d8deff', bgcolor: 'rgba(0,123,255,0.04)' }}>
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
                        </Box>
                    </Box>
                </Container>
            </Box>

            <PublicFooter />
        </ThemeProvider>
    );
};

export default PetDetailPage;
