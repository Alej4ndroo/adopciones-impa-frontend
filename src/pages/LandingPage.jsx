import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Grid, Card, CardContent, Avatar, CardMedia, CardActions,
    Fade, Typography, Button, CssBaseline, Chip, CircularProgress, Alert, Stack
} from '@mui/material';
import { 
    CheckCircle, ArrowForward, Favorite, Male, Female, Cake,
    LocalHospital, AccessTime, AttachMoney
} from '@mui/icons-material';
import { 
    HeartHandshake, Stethoscope, Shield, Heart, Syringe, PawPrint
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
    const [allPets, setAllPets] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [error, setError] = useState(null);
    const [errorServicios, setErrorServicios] = useState(null);
    const [blockedPetIds, setBlockedPetIds] = useState([]);
    const [adoptedPetIds, setAdoptedPetIds] = useState([]);

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

    const pasos = [
        { title: 'Completa tu perfil', description: 'Cuéntanos sobre tu hogar y estilo de vida para hacer el mejor match.', icon: HeartHandshake },
        { title: 'Conoce a la mascota', description: 'Agenda una visita y convive con ella en un espacio seguro y acompañado.', icon: Stethoscope },
        { title: 'Acompañamiento real', description: 'Seguimiento veterinario y guías de adaptación durante los primeros meses.', icon: Shield }
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
                const lista = Array.isArray(data) ? data : [];
                setAllPets(lista);
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

    useEffect(() => {
        const fetchAdoptions = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
                const resp = await fetch(`${API_URL_BACKEND}/adopciones/listar`, headers ? { headers } : undefined);
                const data = await resp.json();
                const adopciones = Array.isArray(data) ? data : [];

                const allAdopted = adopciones
                    .filter(a => {
                        const estado = (a.estado || '').toLowerCase();
                        const estadoSol = (a.estado_solicitud || '').toLowerCase();
                        return estado === 'adoptado' || estadoSol === 'aprobada';
                    })
                    .map(a => a.mascota?.id_mascota || a.id_mascota)
                    .filter(Boolean);

                const ownAdopted = adopciones
                    .filter(a => {
                        const userId = a.usuario?.id_usuario || a.id_usuario;
                        const estado = (a.estado || '').toLowerCase();
                        const estadoSol = (a.estado_solicitud || '').toLowerCase();
                        return currentUser?.id_usuario && userId === currentUser.id_usuario && (estado === 'adoptado' || estadoSol === 'aprobada');
                    })
                    .map(a => a.mascota?.id_mascota || a.id_mascota)
                    .filter(Boolean);

                setAdoptedPetIds(Array.from(new Set(allAdopted)));
                setBlockedPetIds(Array.from(new Set(ownAdopted)));
            } catch (err) {
                console.error('Error al cargar adopciones del usuario:', err);
                setAdoptedPetIds([]);
                setBlockedPetIds([]);
            }
        };
        fetchAdoptions();
    }, [currentUser]);

    useEffect(() => {
        const filtradas = allPets.filter((m) => {
            const estado = (m.estado_adopcion || '').toLowerCase();
            const activo = m.activo !== false;
            const noAdoptadoFlag = estado !== 'adoptado';
            const noAdoptadoGlobal = !adoptedPetIds.includes(m.id_mascota);
            const noPropia = !blockedPetIds.includes(m.id_mascota);
            return activo && noAdoptadoFlag && noAdoptadoGlobal && noPropia;
        });
        setMascotas(filtradas);
    }, [allPets, blockedPetIds, adoptedPetIds]);

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
                const lista = Array.isArray(data) ? data : [];
                const activos = lista.filter((srv) => srv.activo !== false);
                setServicios(activos);
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
    const perros = mascotas.filter(m => (m.especie || '').toLowerCase() === 'perro' && (m.estado_adopcion || '').toLowerCase() === 'disponible');
    const gatos = mascotas.filter(m => (m.especie || '').toLowerCase() === 'gato' && (m.estado_adopcion || '').toLowerCase() === 'disponible');

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
                    borderRadius: 3,
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: 3,
                    border: '1px solid #e6e9f0'
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
                borderRadius: 4,
                boxShadow: 3,
                border: '1px solid #e6e9f0'
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
                    py: { xs: 10, md: 16 },
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Fade in timeout={1200}>
                                <Box>
                                    <Chip
                                        label="Adopciones responsables"
                                        color="secondary"
                                        sx={{ mb: 2, fontWeight: 700, bgcolor: '#fff', color: 'primary.main' }}
                                    />
                                    <Typography 
                                        variant="h1" 
                                        sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 3, lineHeight: 1.1 }}
                                    >
                                        Un lugar seguro para adoptar y ayudar
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ mb: 4, opacity: 0.9, fontSize: '1.4rem' }}
                                    >
                                        Encuentra a tu compañero peludo con un proceso claro, acompañamiento real y un equipo que cuida cada detalle.
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
                                                borderRadius: 2, 
                                                boxShadow: '0 8px 18px rgba(0,0,0,0.16)'
                                            }}
                                        >
                                            Ver Mascotas Ahora
                                        </Button>
                                        <Button
                                            component="a"
                                            href="#pasos-adopcion"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                color: 'white',
                                                borderColor: 'white',
                                                px: 3.5,
                                                py: 1.3,
                                                fontWeight: 700,
                                                borderRadius: 2
                                            }}
                                        >
                                            Cómo funciona
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>
                </Container>
                <PawPrint size={150} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: 50, top: 10, transform: 'rotate(15deg)' }} />
                <PawPrint size={100} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', left: 60, bottom: 20, transform: 'rotate(-25deg)' }} />
            </Box>

            {/* Franja de impacto */}
            <Box sx={{ bgcolor: 'background.default', py: 4, borderBottom: '1px solid #e4e7ec' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} justifyContent="center">
                        {stats.map((stat, idx) => (
                            <Grid item xs={6} sm={3} key={idx}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{stat.number}</Typography>
                                    <Typography variant="body1" color="text.secondary">{stat.label}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Ruta de adopción */}
            <Box sx={{ bgcolor: 'white', py: 9 }} id="pasos-adopcion">
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Chip
                                label=""
                                sx={{bgcolor: '#ffffffff'}}
                            />
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                Tu adopción, clara y acompañada
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                Tres momentos clave para que te concentres en conocer a tu próxima compañera(o).
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Te guiamos en cada paso y te damos tiempos claros para que nada quede en duda.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3} sx={{ position: 'relative', pl: { md: 2 } }}>
                                {pasos.map((paso, idx) => (
                                    <Box
                                        key={paso.title}
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            alignItems: 'flex-start',
                                            position: 'relative',
                                            borderBottom: idx === pasos.length - 1 ? 'none' : '1px solid #e6e9f0',
                                            pb: idx === pasos.length - 1 ? 0 : 2,
                                            mb: idx === pasos.length - 1 ? 0 : 1
                                        }}
                                    >
                                        <Box sx={{ minWidth: 46, display: 'flex', justifyContent: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'secondary.main', width: 46, height: 46, fontWeight: 800 }}>
                                                {idx + 1}
                                            </Avatar>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {paso.title}
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {paso.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
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
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                            Servicios que cuidan de tu mascota
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Salud preventiva, esterilización y seguimiento en un solo lugar
                        </Typography>
                    </Box>
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

            {/* --- Nuestro Compromiso (rediseñado) --- */}
            <Box sx={{ py: 10, bgcolor: '#f5f8ff' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" sx={{ color: 'primary.main', mb: 1.5, fontSize: '3rem' }}>
                            Nuestro Compromiso
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Garantías que hacen la diferencia en el proceso de adopción
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        p: 3,
                                        borderRadius: 0,
                                        minHeight: 150,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.2,
                                        borderBottom: '2px solid #dfe6f5'
                                    }}
                                >
                                    <Box sx={{ width: 68, height: 6, bgcolor: 'secondary.main', borderRadius: 3 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'grid',
                                            placeItems: 'center',
                                        }}>
                                            <feature.icon size={26} />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {feature.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h2" sx={{ mb: 3, fontWeight: 800 }}>
                        ¿Listo para Cambiar una Vida?
                    </Typography>
                    <Button
                        component={Link}
                        to="/mascotas"
                        variant="contained" 
                        size="large"
                        disableElevation
                        sx={{  
                            bgcolor: 'white', 
                            color: 'primary.main', 
                            px: 5, 
                            py: 2, 
                            fontSize: '1.2rem', 
                            borderRadius: 3, 
                            boxShadow: '0 8px 16px rgba(0,0,0,0.18)'
                        }}
                    >
                        Comenzar Adopción
                    </Button>
                </Container>
                <PawPrint size={120} color="rgba(255,255,255,0.14)" style={{ position: 'absolute', right: 80, top: 30, transform: 'rotate(12deg)' }} />
                <PawPrint size={90} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', left: 70, bottom: 10, transform: 'rotate(-20deg)' }} />
            </Box>

            {/* FOOTER */}
            <PublicFooter />

        </ThemeProvider>
    );
};

export default LandingPage;
