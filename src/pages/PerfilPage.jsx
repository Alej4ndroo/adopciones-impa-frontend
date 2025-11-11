// src/pages/PerfilPage.jsx

import React, { useState, useEffect } from 'react';
import {
    Container, Box, Grid, Card, CardContent, Avatar,
    Typography, Button, CssBaseline, Chip, CircularProgress, Alert,
    List, ListItem, ListItemIcon, ListItemText, Divider, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import {
    Email, Badge, Pets, Event, Phone, Home, CameraAlt, Edit, Close
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Componentes Separados
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

// URL de la API
const VITE_API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

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

const PerfilPage = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout }) => {
    // Estados para los datos del perfil
    const [misCitas, setMisCitas] = useState([]);
    const [misAdopciones, setMisAdopciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para los modales de edición
    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [openEditPhoto, setOpenEditPhoto] = useState(false);
    const [openAddAddress, setOpenAddAddress] = useState(false);
    
    // Estados para edición de perfil
    const [editedUser, setEditedUser] = useState({
        nombre: '',
        telefono: '',
        fecha_nacimiento: ''
    });
    
    // Estado para nueva foto
    const [newPhoto, setNewPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    
    // Estado para nueva dirección
    const [newAddress, setNewAddress] = useState({
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        pais: 'México'
    });

    // Efecto para cargar los datos del usuario
    useEffect(() => {
        if (currentUser) {
            // Inicializar datos editables
            setEditedUser({
                nombre: currentUser.nombre || '',
                telefono: currentUser.telefono || '',
                fecha_nacimiento: currentUser.fecha_nacimiento || ''
            });
            
            // Cargar datos desde la API
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            // Fetch citas
            const citasResponse = await fetch(`${VITE_API_URL_BACKEND}/citas/usuario/${currentUser.id_usuario}`);
            if (citasResponse.ok) {
                const citasData = await citasResponse.json();
                setMisCitas(citasData);
            }
            
            // Fetch adopciones
            const adopcionesResponse = await fetch(`${VITE_API_URL_BACKEND}/adopciones/usuario/${currentUser.id_usuario}`);
            if (adopcionesResponse.ok) {
                const adopcionesData = await adopcionesResponse.json();
                setMisAdopciones(adopcionesData);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos del perfil.');
            setLoading(false);
        }
    };

    // Manejar cambio de foto
    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Subir foto de perfil (usando la misma ruta de actualización)
    const handleUploadPhoto = async () => {
        if (!newPhoto) return;
        
        try {
            // Convertir la foto a base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result.split(',')[1]; // Remover el prefijo data:image/...
                
                const response = await fetch(`${VITE_API_URL_BACKEND}/usuarios/${currentUser.id_usuario}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        foto_perfil_base64: base64String
                    })
                });
                
                if (response.ok) {
                    alert('Foto actualizada correctamente');
                    window.location.reload();
                    setOpenEditPhoto(false);
                } else {
                    alert('Error al subir la foto');
                }
            };
            reader.readAsDataURL(newPhoto);
        } catch (err) {
            console.error('Error al subir foto:', err);
            alert('Error al subir la foto');
        }
    };

    // Actualizar datos del perfil
    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`${VITE_API_URL_BACKEND}/usuarios/${currentUser.id_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedUser)
            });
            
            if (response.ok) {
                alert('Perfil actualizado correctamente');
                window.location.reload();
                setOpenEditProfile(false);
            } else {
                alert('Error al actualizar el perfil');
            }
        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            alert('Error al actualizar el perfil');
        }
    };

    // Agregar o actualizar dirección (usando la misma ruta de actualización)
    const handleAddAddress = async () => {
        try {
            // Preparar datos de dirección con es_principal en true para que sea la dirección principal
            const addressData = {
                ...newAddress,
                tipo_direccion: 'residencial',
                es_principal: true
            };

            const response = await fetch(`${VITE_API_URL_BACKEND}/usuarios/${currentUser.id_usuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
            
            if (response.ok) {
                alert('Dirección actualizada correctamente');
                window.location.reload();
                setOpenAddAddress(false);
            } else {
                alert('Error al agregar dirección');
            }
        } catch (err) {
            console.error('Error al agregar dirección:', err);
            alert('Error al agregar dirección');
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            
            {/* NAVBAR */}
            <PublicNavbar
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLoginSuccess={onLoginSuccess}
                onLogout={onLogout}
            />

            {/* CONTENIDO PRINCIPAL (sin Hero Section) */}
            <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>

                {/* Mensaje si no está autenticado */}
                {!isAuthenticated || !currentUser ? (
                    <Card sx={{ borderRadius: 3, boxShadow: 3, p: 4, textAlign: 'center' }}>
                        <Alert severity="warning" sx={{ justifyContent: 'center', mb: 3, fontSize: '1.1rem' }}>
                            Por favor, <strong>inicia sesión</strong> para ver y gestionar tu perfil.
                        </Alert>
                        <Typography variant="body1" color="text.secondary">
                            Aquí podrás ver tus citas, gestionar adopciones y actualizar tus datos.
                        </Typography>
                    </Card>

                ) : (
                    /* Contenido si SÍ está autenticado */
                    <Grid container spacing={4}>
                        
                        {/* Columna Izquierda: Tarjeta de Usuario */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        <Avatar
                                            src={currentUser.foto_perfil_base64 ? `data:image/jpeg;base64,${currentUser.foto_perfil_base64}` : undefined}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                mx: 'auto',
                                                mb: 3,
                                                bgcolor: 'secondary.main',
                                                fontSize: '3.5rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            {!currentUser.foto_perfil_base64 && currentUser.nombre.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                bottom: 20,
                                                right: -10,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' }
                                            }}
                                            size="small"
                                            onClick={() => setOpenEditPhoto(true)}
                                        >
                                            <CameraAlt fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    
                                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                        {currentUser.nombre}
                                    </Typography>
                                    
                                    {/* Detalles del usuario */}
                                    <Box sx={{ textAlign: 'left', my: 3 }}>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                                                    <Email />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Email" 
                                                    secondary={currentUser.correo_electronico} 
                                                    secondaryTypographyProps={{ sx: { fontSize: '0.85rem' } }}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                                                    <Phone />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Teléfono" 
                                                    secondary={currentUser.telefono || 'No registrado'} 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                                                    <Badge />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Rol" 
                                                    secondary={currentUser.rol.nombre_rol.toUpperCase()} 
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Button 
                                        variant="contained" 
                                        startIcon={<Edit />}
                                        sx={{ borderRadius: 2, fontWeight: 600, width: '100%', py: 1.2 }}
                                        onClick={() => setOpenEditProfile(true)}
                                    >
                                        Editar Perfil
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Columna Derecha: Direcciones, Citas y Adopciones */}
                        <Grid item xs={12} md={8}>
                            
                            {/* Sección: Mis Direcciones */}
                            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                                        Mis Direcciones
                                    </Typography>
                                    
                                    {currentUser.direcciones && currentUser.direcciones.length === 0 ? (
                                        <Alert severity="info" sx={{ mb: 2 }}>No tienes direcciones registradas.</Alert>
                                    ) : (
                                        <List>
                                            {currentUser.direcciones && currentUser.direcciones.map((dir, index) => (
                                                <React.Fragment key={dir.id_direccion || index}>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                                <Home fontSize="small" />
                                                            </Avatar>
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={`${dir.calle} ${dir.numero_exterior}${dir.numero_interior ? ' Int. ' + dir.numero_interior : ''}`}
                                                            secondary={`${dir.colonia}, ${dir.ciudad}, ${dir.estado} - CP ${dir.codigo_postal}`}
                                                        />
                                                    </ListItem>
                                                    {index < currentUser.direcciones.length - 1 && <Divider variant="inset" component="li" />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<Home />}
                                        sx={{ mt: 2, fontWeight: 600 }}
                                        onClick={() => setOpenAddAddress(true)}
                                    >
                                        Agregar Dirección
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Sección: Mis Citas */}
                            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                                        Mis Citas
                                    </Typography>

                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : error ? (
                                        <Alert severity="error">{error}</Alert>
                                    ) : misCitas.length === 0 ? (
                                        <Alert severity="info">No tienes citas programadas.</Alert>
                                    ) : (
                                        <List>
                                            {misCitas.map((cita, index) => (
                                                 <React.Fragment key={cita.id_cita}>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                                <Event fontSize="small" />
                                                            </Avatar>
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={cita.motivo || 'Cita veterinaria'} 
                                                            secondary={`Fecha: ${new Date(cita.fecha_hora).toLocaleDateString()} - ${new Date(cita.fecha_hora).toLocaleTimeString()} | Estado: ${cita.estado}`} 
                                                        />
                                                        {cita.estado === 'pendiente' && (
                                                            <Button size="small" variant="outlined" color="error">
                                                                Cancelar
                                                            </Button>
                                                        )}
                                                    </ListItem>
                                                    {index < misCitas.length - 1 && <Divider variant="inset" component="li" />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                    <Button 
                                        variant="contained" 
                                        component={Link}
                                        to="/citas"
                                        sx={{ mt: 2, fontWeight: 600 }}
                                    >
                                        Agendar Nueva Cita
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Sección: Mis Adopciones */}
                            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                                        Mis Solicitudes de Adopción
                                    </Typography>

                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : error ? (
                                        <Alert severity="error">{error}</Alert>
                                    ) : misAdopciones.length === 0 ? (
                                        <Alert severity="info">No tienes solicitudes de adopción.</Alert>
                                    ) : (
                                        <List>
                                            {misAdopciones.map((adopcion, index) => (
                                                <React.Fragment key={adopcion.id_adopcion}>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                                <Pets fontSize="small" />
                                                            </Avatar>
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={`Mascota: ${adopcion.mascota?.nombre || 'N/A'}`}
                                                            secondary={`Estado: ${adopcion.estado} | Fecha: ${new Date(adopcion.fecha_solicitud).toLocaleDateString()}`}
                                                        />
                                                        <Chip 
                                                            label={adopcion.estado} 
                                                            color={
                                                                adopcion.estado === 'aprobada' ? 'success' : 
                                                                adopcion.estado === 'rechazada' ? 'error' : 
                                                                'warning'
                                                            }
                                                            size="small"
                                                        />
                                                    </ListItem>
                                                    {index < misAdopciones.length - 1 && <Divider variant="inset" component="li" />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                    <Button 
                                        variant="contained" 
                                        component={Link}
                                        to="/adopciones"
                                        sx={{ mt: 2, fontWeight: 600 }}
                                    >
                                        Ver Mascotas en Adopción
                                    </Button>
                                </CardContent>
                            </Card>

                        </Grid>
                    </Grid>
                )}

            </Container>

            {/* MODALES DE EDICIÓN */}
            
            {/* Modal: Editar Foto de Perfil */}
            <Dialog open={openEditPhoto} onClose={() => setOpenEditPhoto(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Cambiar Foto de Perfil
                    <IconButton
                        onClick={() => setOpenEditPhoto(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar
                            src={photoPreview || (currentUser?.foto_perfil_base64 ? `data:image/jpeg;base64,${currentUser.foto_perfil_base64}` : undefined)}
                            sx={{ width: 150, height: 150, mx: 'auto', mb: 3 }}
                        >
                            {!photoPreview && !currentUser?.foto_perfil_base64 && currentUser?.nombre.charAt(0).toUpperCase()}
                        </Avatar>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload"
                            type="file"
                            onChange={handlePhotoChange}
                        />
                        <label htmlFor="photo-upload">
                            <Button variant="outlined" component="span" startIcon={<CameraAlt />}>
                                Seleccionar Foto
                            </Button>
                        </label>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditPhoto(false)}>Cancelar</Button>
                    <Button onClick={handleUploadPhoto} variant="contained" disabled={!newPhoto}>
                        Subir Foto
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Editar Perfil */}
            <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Editar Perfil
                    <IconButton
                        onClick={() => setOpenEditProfile(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nombre Completo"
                            value={editedUser.nombre}
                            onChange={(e) => setEditedUser({ ...editedUser, nombre: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Teléfono"
                            value={editedUser.telefono}
                            onChange={(e) => setEditedUser({ ...editedUser, telefono: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Fecha de Nacimiento"
                            type="date"
                            value={editedUser.fecha_nacimiento}
                            onChange={(e) => setEditedUser({ ...editedUser, fecha_nacimiento: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditProfile(false)}>Cancelar</Button>
                    <Button onClick={handleUpdateProfile} variant="contained">
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Agregar Dirección */}
            <Dialog open={openAddAddress} onClose={() => setOpenAddAddress(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Agregar Nueva Dirección
                    <IconButton
                        onClick={() => setOpenAddAddress(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Calle"
                                value={newAddress.calle}
                                onChange={(e) => setNewAddress({ ...newAddress, calle: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                label="No. Ext"
                                value={newAddress.numero_exterior}
                                onChange={(e) => setNewAddress({ ...newAddress, numero_exterior: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                label="No. Int"
                                value={newAddress.numero_interior}
                                onChange={(e) => setNewAddress({ ...newAddress, numero_interior: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Colonia"
                                value={newAddress.colonia}
                                onChange={(e) => setNewAddress({ ...newAddress, colonia: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Ciudad"
                                value={newAddress.ciudad}
                                onChange={(e) => setNewAddress({ ...newAddress, ciudad: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Estado"
                                value={newAddress.estado}
                                onChange={(e) => setNewAddress({ ...newAddress, estado: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Código Postal"
                                value={newAddress.codigo_postal}
                                onChange={(e) => setNewAddress({ ...newAddress, codigo_postal: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="País"
                                value={newAddress.pais}
                                onChange={(e) => setNewAddress({ ...newAddress, pais: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddAddress(false)}>Cancelar</Button>
                    <Button onClick={handleAddAddress} variant="contained">
                        Agregar Dirección
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FOOTER */}
            <PublicFooter />

        </ThemeProvider>
    );
};

export default PerfilPage;