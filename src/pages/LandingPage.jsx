import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Grid, Card, CardContent, Avatar, CardMedia, CardActions,
    Fade, Typography, Button, CssBaseline, Chip, CircularProgress, Alert
} from '@mui/material';
import { 
    CheckCircle, ArrowForward, Favorite, Male, Female, Cake,
    LocalHospital, AccessTime, AttachMoney
} from '@mui/icons-material';
import { 
    HeartHandshake, Stethoscope, Shield, Bone, PawPrint, Heart, Syringe
} from 'lucide-react'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Componentes Separados
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PETS_ENDPOINT = '/mascotas/listar'; 
const SERVICES_ENDPOINT = '/servicios/listar'; 

// TEMA PERSONALIZADO
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

const LandingPage = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout, onOpenLoginModal }) => {
    const [hoveredCard, setHoveredCard] = useState(null); 
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [error, setError] = useState(null);
    const [errorServicios, setErrorServicios] = useState(null);

    // ARRAYS DE DATOS
    const features = [
        {
            icon: HeartHandshake,
            title: 'Hogares Felices',
            description: 'Más de 2,500 adopciones exitosas con seguimiento y cariño.'
        },
        {
            icon: Stethoscope,
            title: 'Salud Garantizada',
            description: 'Todas las mascotas se entregan esterilizadas, vacunadas y desparasitadas.'
        },
        {
            icon: Shield,
            title: 'Proceso Transparente',
            description: 'Verificación simple y acompañamiento en cada paso de la solicitud.'
        }
    ];

    const stats = [
        { number: '2,500+', label: 'Adopciones Exitosas' },
        { number: '98%', label: 'Índice de Permanencia' },
        { number: '15+', label: 'Años de Trayectoria' },
        { number: '400+', label: 'Voluntarios Activos' }
    ];

    // Consultar mascotas del backend
    useEffect(() => {
        const fetchMascotas = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL_BACKEND}${PETS_ENDPOINT}`);
                if (!response.ok) {
                    throw new Error('Error al cargar las mascotas');
                }
                const data = await response.json();
                setMascotas(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching mascotas:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMascotas();
    }, []);

    // Consultar servicios del backend
    useEffect(() => {
        const fetchServicios = async () => {
            try {
                setLoadingServicios(true);
                const response = await fetch(`${API_URL_BACKEND}${SERVICES_ENDPOINT}`);
                if (!response.ok) {
                    throw new Error('Error al cargar los servicios');
                }
                const data = await response.json();
                setServicios(data);
                setErrorServicios(null);
            } catch (err) {
                setErrorServicios(err.message);
                console.error('Error fetching servicios:', err);
            } finally {
                setLoadingServicios(false);
            }
        };

        fetchServicios();
    }, []);

    // Filtrar mascotas por especie y disponibilidad
    const perros = mascotas.filter(m => m.especie === 'perro' && m.estado_adopcion === 'disponible');
    const gatos = mascotas.filter(m => m.especie === 'gato' && m.estado_adopcion === 'disponible');

    // Función para calcular años desde meses
    const calcularEdad = (meses) => {
        if (meses < 12) return `${meses} meses`;
        const anos = Math.floor(meses / 12);
        const mesesRestantes = meses % 12;
        if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;
        return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} meses`;
    };

    // Mapeo de iconos para servicios
    const getIconoServicio = (nombre) => {
        const iconMap = {
            'Cita de Adopción': <Heart size={40} />,
            'Consulta General': <Stethoscope size={40} />,
            'Desparasitación': <LocalHospital sx={{ fontSize: 40 }} />,
            'Esterilización': <LocalHospital sx={{ fontSize: 40 }} />,
            'Seguimiento Post-Adopción': <HeartHandshake size={40} />,
            'Vacunación': <Syringe size={40} />
        };
        return iconMap[nombre] || <Heart size={40} />;
    };

    // Formatear precio
    const formatearPrecio = (precio) => {
        const num = parseFloat(precio);
        if (num === 0) return 'Gratis';
        return `$${num.toFixed(2)} MXN`;
    };

    const PetCard = ({ pet }) => {
        // --- LÓGICA DE BASE64: CONVERSIÓN EN EL FRONTEND ---
        
        // 1. Obtener el primer string Base64 del array
        let base64String = pet.imagenes_base64?.[0];

        // 2. CORRECCIÓN CLAVE: Eliminar el prefijo si ya existe para evitar la duplicación (ERR_INVALID_URL)
        const prefix = 'data:image/jpeg;base64,';
        if (base64String && base64String.startsWith(prefix)) {
            base64String = base64String.substring(prefix.length);
        }
        
        // 3. Construir la Data URL (Añadimos el prefijo una SOLA vez)
        const dataUrl = base64String 
            ? prefix + base64String 
            : '';
        // --- FIN DE LA LÓGICA DE BASE64 ---
        
        return (
            <Card 
                component={Link} // 🔑 Usamos Link como componente base
                to={`/mascota/${pet.id_mascota}`}
                sx={{ 
                    height: 500, 
                    width: 350,
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                    }
                }}>
                <CardMedia
                    component="img"
                    height="240"
                    // 4. Usamos la Data URL para mostrar la imagen
                    image={dataUrl} 
                    alt={pet.nombre}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}> {/* 🎯 flexGrow: 1 estira el contenido */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {pet.nombre}
                        </Typography>
                        <Chip 
                            icon={pet.sexo === 'macho' ? <Male /> : <Female />} 
                            label={pet.sexo.charAt(0).toUpperCase() + pet.sexo.slice(1)}
                            size="small"
                            color={pet.sexo === 'macho' ? 'primary' : 'secondary'}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <Cake sx={{ fontSize: 18, mr: 0.5 }} />
                        <Typography variant="body2">
                            {calcularEdad(pet.edad_en_meses)} • {pet.raza}
                        </Typography>
                    </Box>
                    <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        mb: 2, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // 🎯 Límite de 3 líneas
                        WebkitBoxOrient: 'vertical',
                        minHeight: '4.5em' // Altura mínima para la descripción (3 líneas * 1.5em altura de línea)
                    }}
                    >
                        {pet.descripcion}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {pet.vacunado && (
                            <Chip label="Vacunado" size="small" color="success" sx={{ fontSize: '0.7rem' }} />
                        )}
                        {pet.esterilizado && (
                            <Chip label="Esterilizado" size="small" color="info" sx={{ fontSize: '0.7rem' }} />
                        )}
                    </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<Favorite />}
                        sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.2
                        }}
                    >
                        Quiero Adoptarlo
                    </Button>
                </CardActions>
            </Card>
        );
    }

    const ServiceCard = ({ servicio }) => (
        <Card
            sx={{
                height: 380, // 🎯 ALTURA FIJA PARA UNIFORMIDAD
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 4,
                '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 15px 30px rgba(0, 123, 255, 0.2)' }
            }}
        >
            <CardContent sx={{ p: 4, textAlign: 'center', flexGrow: 1 }}> {/* flexGrow: 1 */}
                <Avatar sx={{ bgcolor: 'secondary.main', width: 70, height: 70, mx: 'auto', mb: 3 }}>
                    {getIconoServicio(servicio.nombre)}
                </Avatar>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {servicio.nombre}
                </Typography>
                <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                        mb: 3,
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // 🎯 Límite de 3 líneas
                        WebkitBoxOrient: 'vertical',
                        minHeight: '4.5em' // Altura mínima para la descripción
                    }}
                >
                    {servicio.descripcion}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                        icon={<AttachMoney />}
                        label={formatearPrecio(servicio.costo_base)} 
                        color="primary" 
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                        icon={<AccessTime />}
                        label={`${servicio.duracion_estimada_min} min`} 
                        variant="outlined"
                    />
                </Box>
                {!servicio.requiere_mascota && (
                    <Chip 
                        label="No requiere mascota" 
                        size="small" 
                        color="success"
                        sx={{ fontSize: '0.75rem', mt: 1 }}
                    />
                )}
            </CardContent>
        </Card>
    );

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

            <Box
                sx={{
                    position: 'relative',
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 10, md: 18 },
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #007BFF 0%, #00C6FF 100%)',
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Fade in timeout={1200}>
                                <Box>
                                    <Typography 
                                        variant="h1" 
                                        sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 3, lineHeight: 1.1 }}
                                    >
                                        Adopta Amor, Cambia una Vida
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ mb: 4, opacity: 0.9, fontSize: '1.4rem' }}
                                    >
                                        Encuentra a tu compañero peludo perfecto. Nuestro proceso es seguro, responsable y lleno de alegría.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Button
                                            component={Link}     // 1. Añade esto (le dice a MUI que use el Link)
                                            to="/mascotas"
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowForward />}
                                            sx={{ 
                                                bgcolor: 'white', 
                                                color: 'primary.main', 
                                                px: 4, 
                                                py: 1.5, 
                                                fontSize: '1.1rem', 
                                                borderRadius: 10, 
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
                                                }
                                            }}
                                        >
                                            Ver Mascotas Ahora
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <PawPrint size={200} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: 50, top: 50 }} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* --- Perros Section --- */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                        Perros en Adopción
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Compañeros leales esperando por su familia perfecta
                    </Typography>
                </Box>

                {loading || error || perros.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : <Alert severity="info">No hay perros disponibles en este momento</Alert>}
                    </Box>
                ) : (
                    <Grid container spacing={4} justifyContent="center">
                        {perros.map((perro) => (
                            <Grid item xs={12} sm={6} md={3} key={perro.id_mascota}>
                                <PetCard pet={perro} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* --- Gatos Section --- */}
            <Box sx={{ bgcolor: 'white', py: 10 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                            Gatos en Adopción
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Compañeros independientes y cariñosos
                        </Typography>
                    </Box>

                    {loading || error || gatos.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            {loading ? <CircularProgress /> : error ? null : <Alert severity="info">No hay gatos disponibles en este momento</Alert>}
                        </Box>
                    ) : (
                        <Grid container spacing={4} justifyContent="center">
                            {gatos.map((gato) => (
                                <Grid item xs={12} sm={6} md={3} key={gato.id_mascota}>
                                    <PetCard pet={gato} /> {/* 🔑 Usar PetCard */}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* --- SERVICIOS SECTION: Alto y Centrado corregidos --- */}
            <Box sx={{ py: 10, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    {/* ... (Títulos) ... */}
                    {loadingServicios || errorServicios || servicios.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            {loadingServicios ? <CircularProgress /> : errorServicios ? <Alert severity="error">{errorServicios}</Alert> : <Alert severity="info">No hay servicios disponibles en este momento</Alert>}
                        </Box>
                    ) : (
                        <Grid container spacing={4} justifyContent="center">
                            {servicios.map((servicio) => (
                                <Grid item xs={12} sm={6} md={4} key={servicio.id_servicio}>
                                    <ServiceCard servicio={servicio} /> {/* 🔑 Usar ServiceCard */}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* --- Features: Alto y Centrado corregidos --- */}
            <Box sx={{ py: 10, bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" sx={{ color: 'primary.main', mb: 2, fontSize: '3rem' }}>
                            Nuestro Compromiso
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Garantías que hacen la diferencia en el proceso de adopción
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card
                                    onMouseEnter={() => setHoveredCard(index)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    sx={{
                                        // 🎯 Flexbox para alto uniforme
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease', 
                                        borderRadius: 4,
                                        transform: hoveredCard === index ? 'translateY(-10px)' : 'translateY(0)',
                                        boxShadow: hoveredCard === index ? '0 15px 30px rgba(0, 123, 255, 0.2)' : 1,
                                    }}
                                >
                                    <CardContent sx={{ p: 4, textAlign: 'center', flexGrow: 1 }}> {/* 🎯 flexGrow: 1 */}
                                        <Avatar sx={{ bgcolor: 'secondary.main', width: 70, height: 70, mx: 'auto', mb: 3 }}>
                                            <feature.icon size={36} />
                                        </Avatar>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{ mb: 3 }}>
                        ¿Listo para Cambiar una Vida?
                    </Typography>
                    <Button
                        variant="contained" 
                        size="large"
                        sx={{  
                            bgcolor: 'white', 
                            color: 'primary.main', 
                            px: 5, 
                            py: 2, 
                            fontSize: '1.2rem', 
                            borderRadius: 3, 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', 
                            '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.95)', 
                                transform: 'scale(1.05)' 
                            } 
                        }}
                    >
                        Comenzar Adopción
                    </Button>
                </Container>
            </Box>

            {/* FOOTER */}
            <PublicFooter />

        </ThemeProvider>
    );
};

export default LandingPage;