import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Grid, Card, CardContent, CardMedia,
    Typography, Button, CssBaseline, Chip, CircularProgress, Alert,
    Stack, ImageList, ImageListItem
} from '@mui/material';
import { 
    Favorite, Male, Female, Cake, LocalHospital, CheckCircle, Close, Info
} from '@mui/icons-material';
import { 
    HeartHandshake, Stethoscope, Shield, Bone, PawPrint, Heart, Syringe
} from 'lucide-react'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams } from 'react-router-dom';

// Componentes Separados (Importados de tu estructura)
import PublicNavbar from '../components/public/PublicNavbar'; // Asegúrate de que esta ruta sea correcta
import PublicFooter from '../components/public/PublicFooter'; // Asegúrate de que esta ruta sea correcta

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
// 🔑 NOTA: Reemplaza con el endpoint real para obtener UNA mascota por ID
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
    
    // Asumimos que los datos ya están limpios, pero si necesitas el mismo prefijo:
    const prefix = 'data:image/jpeg;base64,'; 
    if (base64String && base64String.startsWith(prefix)) {
        return base64String;
    }
    return prefix + base64String;
};

// --- COMPONENTE PRINCIPAL ---
const PetDetailPage = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout }) => {
    const { petId } = useParams();
    
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
                // 🔑 Llamar al endpoint de detalle
                const response = await fetch(`${API_URL_BACKEND}${PET_DETAIL_ENDPOINT}${petId}`); 
                
                // Simulación de respuesta de fetch (reemplazar con tu lógica de fetch real)
                if (!response.ok) {
                    // throw new Error(`Error al cargar la mascota con ID ${petId}`);
                    // SIMULACIÓN DE DATOS TEMPORALES si el fetch falla o no existe el endpoint de detalle
                    const dummyData = {
                        id_mascota: petId,
                        nombre: 'Maximus Aurelius',
                        especie: 'perro',
                        raza: 'Golden Retriever Mestizo',
                        sexo: 'macho',
                        edad_en_meses: 30, // 2 años y 6 meses
                        descripcion: 'Maximus es un perro noble y cariñoso, rescatado de una situación difícil. Le encanta jugar a la pelota, pasear por el parque y recibir caricias en la barriga. Es ideal para una familia con niños mayores o una pareja activa. Es muy sociable con otros perros y se adapta rápido a nuevos entornos. Aunque es grande, es un "perro faldero" en el corazón. Necesita un hogar con espacio para correr.',
                        estado_adopcion: 'disponible',
                        comportamiento: 'Juguetón, fiel, protector, requiere socialización inicial con extraños.',
                        peso_kg: 28.5,
                        vacunado: true,
                        esterilizado: true,
                        desparasitado: true,
                        microchip: true,
                        requisitos: ['Jardín o patio cercado', 'Experiencia previa con perros grandes', 'Visitas de seguimiento'],
                        imagenes_base64: [
                            'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5pDpnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVYI.... (STRING BASE64 LARGO REAL 1)',
                            'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5pDpnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVnI.... (STRING BASE64 LARGO REAL 2)',
                            // Agrega más strings Base64 simulados si lo deseas
                        ]
                    };
                    setMascota(dummyData);
                    setMainImage(getImageUrl(dummyData.imagenes_base64[0]));
                    console.warn("Usando datos de mascota simulados. Verifica el PET_DETAIL_ENDPOINT.");
                } else {
                    const data = await response.json();
                    setMascota(data);
                    // Establecer la primera imagen como principal al cargar
                    setMainImage(getImageUrl(data.imagenes_base64?.[0]));
                }
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching pet detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMascota();
    }, [petId]); // Dependencia del ID de la mascota

    // Manejo de estados de carga y error
    if (loading) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                <PublicNavbar isAuthenticated={isAuthenticated} currentUser={currentUser} onLoginSuccess={onLoginSuccess} onLogout={onLogout} />
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
                <PublicNavbar isAuthenticated={isAuthenticated} currentUser={currentUser} onLoginSuccess={onLoginSuccess} onLogout={onLogout} />
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

    // Estilo para las tarjetas de estado de salud
    const HealthFeatureCard = ({ label, isChecked, icon: Icon }) => (
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, minHeight: 100 }}>
            {isChecked ? (
                <CheckCircle color="success" sx={{ fontSize: 30, mr: 2 }} />
            ) : (
                <Close color="error" sx={{ fontSize: 30, mr: 2 }} />
            )}
            <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                    {label}
                </Typography>
                <Chip
                    label={isChecked ? "Completado" : "Pendiente"}
                    color={isChecked ? "success" : "error"}
                    size="small"
                />
            </Box>
        </Card>
    );

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <PublicNavbar isAuthenticated={isAuthenticated} currentUser={currentUser} onLoginSuccess={onLoginSuccess} onLogout={onLogout} />

            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 10 }, bgcolor: 'background.default' }}>
                <Card sx={{ borderRadius: 4, boxShadow: 6, p: { xs: 2, md: 5 } }}>
                    <Grid container spacing={5}>
                        
                        {/* 🐶 Galería de Imágenes y Nombre Principal */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                                {mascota.nombre}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                                ¡Conoce a tu futuro mejor amigo!
                            </Typography>

                            {/* Imagen Principal */}
                            <CardMedia
                                component="img"
                                height="450"
                                image={mainImage || getImageUrl(mascota.imagenes_base64?.[0])}
                                alt={mascota.nombre}
                                sx={{ objectFit: 'cover', borderRadius: 3, mb: 2, boxShadow: 3 }}
                            />

                            {/* Miniaturas de Galería */}
                            <ImageList cols={4} rowHeight={100} gap={8}>
                                {mascota.imagenes_base64 && mascota.imagenes_base64.map((base64, index) => (
                                    <ImageListItem 
                                        key={index}
                                        onClick={() => handleImageClick(base64)}
                                        sx={{ 
                                            cursor: 'pointer', 
                                            borderRadius: 2, 
                                            overflow: 'hidden',
                                            border: mainImage === getImageUrl(base64) ? '3px solid #007BFF' : '1px solid #ddd',
                                            transition: 'border 0.2s'
                                        }}
                                    >
                                        <img
                                            src={getImageUrl(base64, index)}
                                            alt={`Miniatura ${index + 1}`}
                                            loading="lazy"
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Grid>

                        {/* 📋 Información Completa y Botón de Adopción */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 3, mb: 4 }}>
                                {/* Chips de Datos Clave */}
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={2}>
                                    <Chip 
                                        icon={mascota.sexo === 'macho' ? <Male /> : <Female />} 
                                        label={mascota.sexo.charAt(0).toUpperCase() + mascota.sexo.slice(1)}
                                        color={mascota.sexo === 'macho' ? 'primary' : 'secondary'}
                                        sx={{ fontWeight: 600, fontSize: '1rem', py: 2 }}
                                    />
                                    <Chip 
                                        icon={<Cake />} 
                                        label={calcularEdad(mascota.edad_en_meses)}
                                        color="info"
                                        sx={{ fontWeight: 600, fontSize: '1rem', py: 2 }}
                                    />
                                    <Chip 
                                        icon={<PawPrint size={20} />} 
                                        label={mascota.raza}
                                        variant="outlined"
                                        sx={{ fontWeight: 600, fontSize: '1rem', py: 2 }}
                                    />
                                    {mascota.estado_adopcion === 'disponible' && (
                                        <Chip 
                                            icon={<Heart />} 
                                            label="¡Disponible para Adopción!"
                                            color="success"
                                            sx={{ fontWeight: 700, fontSize: '1rem', py: 2 }}
                                        />
                                    )}
                                </Stack>
                                
                                {/* Botón de CTA Principal */}
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    startIcon={<Favorite />}
                                    sx={{ 
                                        py: 1.5, 
                                        borderRadius: 2, 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)'
                                    }}
                                >
                                    Solicitar Adopción de {mascota.nombre}
                                </Button>
                            </Box>

                            {/* Descripción Completa */}
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                Sobre {mascota.nombre}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                                {mascota.descripcion}
                            </Typography>

                            {/* Características Adicionales */}
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                Personalidad y Comportamiento
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
                                {mascota.comportamiento || 'Información de comportamiento no disponible.'}
                            </Typography>

                            {/* Requisitos (Opcional) */}
                            {mascota.requisitos && mascota.requisitos.length > 0 && (
                                <Box mb={4}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                                        <Info sx={{ mr: 1, verticalAlign: 'middle' }} /> Requisitos de Adopción
                                    </Typography>
                                    <Stack component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                        {mascota.requisitos.map((req, index) => (
                                            <li key={index} style={{ marginBottom: '8px' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <CheckCircle color="primary" sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                                                    {req}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                        </Grid>
                        
                        {/* 💉 Sección de Salud y Cuidados */}
                        <Grid item xs={12}>
                            <Box sx={{ mt: 5, pt: 3, borderTop: '2px solid #e0e0e0' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                                    Salud y Cuidado Médico
                                </Typography>
                                <Grid container spacing={3} justifyContent="center">
                                    <Grid item xs={12} sm={6} md={3}>
                                        <HealthFeatureCard label="Vacunación al día" isChecked={mascota.vacunado} icon={Syringe} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <HealthFeatureCard label="Esterilizado/a" isChecked={mascota.esterilizado} icon={LocalHospital} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <HealthFeatureCard label="Desparasitado/a" isChecked={mascota.desparasitado} icon={LocalHospital} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <HealthFeatureCard label="Microchip Implantado" isChecked={mascota.microchip} icon={Shield} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                    </Grid>
                </Card>
            </Container>

            <PublicFooter />
        </ThemeProvider>
    );
};

export default PetDetailPage;