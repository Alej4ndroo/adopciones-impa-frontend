import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Grid, Card, CardContent, CardMedia, CardActions,
    Fade, Typography, Button, CssBaseline, Chip, CircularProgress, Alert, Stack
} from '@mui/material';
import { 
    Favorite, Male, Female, Cake
} from '@mui/icons-material';
import { PawPrint } from 'lucide-react'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Componentes
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
// 1. Usamos el nuevo endpoint para traer solo mascotas disponibles
const PETS_ENDPOINT = '/mascotas/listar'; 

// 2. Reutilizamos el mismo tema del LandingPage
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

// 3. Reutilizamos la función helper
const calcularEdad = (meses) => {
    if (meses < 12) return `${meses} meses`;
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;
    return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} meses`;
};

// 4. Reutilizamos el componente PetCard EXACTAMENTE como estaba en LandingPage
const PetCard = ({ pet }) => {
    let base64String = pet.imagenes_base64?.[0];
    const prefix = 'data:image/jpeg;base64,';
    const estado = (pet.estado_adopcion || '').toLowerCase();
    const estadoLabel = estado
        ? estado.charAt(0).toUpperCase() + estado.slice(1)
        : 'Estado desconocido';
    const estadoColor = estado === 'disponible'
        ? 'success'
        : estado === 'adoptado'
            ? 'default'
            : 'warning';
    
    if (base64String && base64String.startsWith(prefix)) {
        base64String = base64String.substring(prefix.length);
    }
    
    const dataUrl = base64String 
        ? prefix + base64String 
        : '';
    
    return (
        <Card 
            component={Link} 
            to={`/mascota/${pet.id_mascota}`}
            sx={{ 
                height: 500, 
                width: 350,
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                textDecoration: 'none',
                color: 'inherit'
            }}>
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="240"
                    image={dataUrl} 
                    alt={pet.nombre}
                    sx={{ objectFit: 'cover' }}
                />
                <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, left: 12, right: 12, justifyContent: 'space-between' }}>
                    <Chip 
                        label={pet.especie?.charAt(0).toUpperCase() + pet.especie?.slice(1) || 'Mascota'}
                        size="small"
                        color="primary"
                        sx={{ 
                            bgcolor: 'rgba(0,123,255,0.9)', 
                            color: 'white',
                            fontWeight: 700
                        }}
                    />
                    <Chip 
                        label={estadoLabel}
                        size="small"
                        color={estadoColor}
                        variant={estado === 'disponible' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, bgcolor: estado === 'disponible' ? undefined : 'rgba(255,255,255,0.9)' }}
                    />
                </Stack>
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
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
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '4.5em'
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

// 5. Componente Principal de la Página
const CatalogoMascotas = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout, onOpenLoginModal }) => {
    
    // 6. Estado para esta página
    const [allPets, setAllPets] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blockedPetIds, setBlockedPetIds] = useState([]);
    const [adoptedPetIds, setAdoptedPetIds] = useState([]);

    // 7. useEffect para cargar las mascotas disponibles
    useEffect(() => {
        const fetchMascotasDisponibles = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL_BACKEND}${PETS_ENDPOINT}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al cargar las mascotas');
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

        fetchMascotasDisponibles();
    }, []);

    // 7.1 Obtener adopciones para ocultar mascotas ya adoptadas (aunque no haya sesión)
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

    // 7.2 Combinar filtros locales con adopciones
    useEffect(() => {
        const filtradas = allPets.filter((m) => {
            const estado = (m.estado_adopcion || '').toLowerCase();
            const activo = m.activo !== false; // true si null/undefined
            const noAdoptadoFlag = estado !== 'adoptado';
            const noAdoptadoGlobal = !adoptedPetIds.includes(m.id_mascota);
            const noPropia = !blockedPetIds.includes(m.id_mascota);
            return activo && noAdoptadoFlag && noAdoptadoGlobal && noPropia;
        });
        setMascotas(filtradas);
    }, [allPets, blockedPetIds, adoptedPetIds]);

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

            {/* 8. Hero Section (Banner superior) */}
            <Box
                sx={{
                    position: 'relative',
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 10, md: 14 }, // Un poco más corto que el landing
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #007BFF 0%, #00C6FF 100%)',
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Fade in timeout={1200}>
                        <Box>
                            <Typography 
                                variant="h1" 
                                sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, mb: 3, lineHeight: 1.1 }}
                            >
                                Mascotas en Adopción
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ mb: 4, opacity: 0.9, fontSize: '1.3rem', maxWidth: '700px', mx: 'auto' }}
                            >
                                Encuentra a tu compañero ideal. Todos nuestros peludos están listos para dar y recibir amor.
                            </Typography>
                        </Box>
                    </Fade>
                    <PawPrint size={150} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: 50, top: 0, transform: 'rotate(15deg)' }} />
                    <PawPrint size={100} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', left: 50, bottom: 0, transform: 'rotate(-30deg)' }} />
                </Container>
            </Box>

            {/* 9. Grid de Mascotas */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                
                {/* Título de la sección */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                        Nuestros Peludos Disponibles
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Conoce a todos los perros y gatos que esperan un hogar
                    </Typography>
                </Box>

                {/* 10. Lógica de Carga / Error / Datos */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 600, fontSize: '1.1rem' }}>
                            {error}
                        </Alert>
                    </Box>
                ) : mascotas.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <Alert severity="info" sx={{ width: '100%', maxWidth: 600, fontSize: '1.1rem' }}>
                            ¡Todos nuestros peludos han sido adoptados! No hay mascotas disponibles en este momento.
                        </Alert>
                    </Box>
                ) : (
                    (() => {
                        const perros = mascotas.filter(m => (m.especie || '').toLowerCase() === 'perro');
                        const gatos = mascotas.filter(m => (m.especie || '').toLowerCase() === 'gato');
                        const otros = mascotas.filter(m => {
                            const especie = (m.especie || '').toLowerCase();
                            return especie !== 'perro' && especie !== 'gato';
                        });

                        const renderSection = (titulo, lista, color, alwaysShow = false) => (
                            (alwaysShow || lista.length > 0) && (
                                <Box key={titulo} sx={{ width: '100%', mb: 6 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                        <Box sx={{ width: 10, height: 32, borderRadius: 3, bgcolor: color, boxShadow: `0 6px 14px ${color}33` }} />
                                        <Typography variant="h5" sx={{ fontWeight: 800, color }}>
                                            {titulo}
                                        </Typography>
                                    </Stack>
                                    {lista.length > 0 ? (
                                        <Grid container spacing={4} justifyContent="center">
                                            {lista.map((pet) => (
                                                <Grid item key={pet.id_mascota} xs={12} sm={6} md={4}>
                                                    <PetCard pet={pet} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No hay mascotas en esta categoría.
                                        </Typography>
                                    )}
                                </Box>
                            )
                        );

                        return (
                            <>
                                {renderSection('Perros', perros, '#1976d2', true)}
                                {renderSection('Gatos', gatos, '#9c27b0', true)}
                                {renderSection('Otros', otros, '#ff9800', true)}
                            </>
                        );
                    })()
                )}
            </Container>

            <PublicFooter />
        </ThemeProvider>
    );
};

export default CatalogoMascotas;
