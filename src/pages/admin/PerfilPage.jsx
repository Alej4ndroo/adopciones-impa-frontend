import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, Divider, CircularProgress, 
    Alert, Avatar, Stack, useTheme, Chip, Button, TextField,
    alpha, Fade, Zoom, Card, CardContent
} from '@mui/material';
import { 
    Person as PersonIcon, 
    LocationOn as LocationOnIcon, 
    Email as EmailIcon,
    Phone as PhoneIcon,
    Cake as CakeIcon,
    Badge as BadgeIcon, 
    PhotoCamera as PhotoCameraIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Description as DocumentIcon,
    AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

// --- CONFIGURACIÓN DE API ---
const API_URL_BACKEND = import.meta.env.API_URL_BACKEND;
const PROFILE_ENDPOINT = '/empleados/obtener-perfil';
const PROFILE_UPDATE_ENDPOINT = '/empleados/actualizar';

const PerfilUsuarioPage = () => {
    const theme = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("No autenticado. Por favor, inicie sesión.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL_BACKEND}${PROFILE_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUserData(response.data); 
            setFormData(response.data);
            console.log("Datos del perfil cargados:", response.data);

        } catch (err) {
            console.error("Error al cargar el perfil:", err.response || err);
            const errorMessage = err.response?.data?.error || "Error al obtener los datos del perfil.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);
    
    const handleEditToggle = () => {
        if (isEditing) {
            setFormData(userData);
            setSelectedPhoto(null);
            setPhotoPreview(null);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            
            // Crear objeto con los datos a enviar
            const dataToSend = { ...formData };
            
            // Si hay una foto seleccionada, convertirla a base64
            if (selectedPhoto) {
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedPhoto);
                });
                
                const base64String = await base64Promise;
                dataToSend.foto_perfil_base64 = base64String;
            }

            const response = await axios.patch(`${API_URL_BACKEND}${PROFILE_UPDATE_ENDPOINT}`, dataToSend, {
                 headers: { Authorization: `Bearer ${token}` }
            });

            setUserData(response.data);
            setFormData(response.data);
            setIsEditing(false);
            setSelectedPhoto(null);
            setPhotoPreview(null);
            
        } catch (err) {
             console.error("Error al guardar cambios:", err.response || err);
             const saveError = err.response?.data?.error || "Error al guardar cambios.";
             setError(saveError);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecciona un archivo de imagen válido.');
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen no puede superar los 5MB.');
                return;
            }
            
            setSelectedPhoto(file);
            
            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderInfoItem = (Icon, label, value) => (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Box 
                sx={{ 
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Icon />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="textSecondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight={500} color="textPrimary">
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Stack>
    );
    
    const renderEditItem = (Icon, label, name, value, type = 'text') => (
        <TextField
            fullWidth
            label={label}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            type={type}
            margin="normal"
            InputProps={{
                startAdornment: (
                    <Box sx={{ 
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        p: 0.8,
                        borderRadius: 1.5,
                        mr: 1.5,
                        display: 'flex'
                    }}>
                        <Icon sx={{ fontSize: 20 }} />
                    </Box>
                ),
            }}
            variant="outlined"
            sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                }
            }}
        />
    );
    
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '80vh',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`
            }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="textSecondary">Cargando perfil...</Typography>
                </Stack>
            </Box>
        );
    }

    if (error && !isEditing) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }
    
    if (!userData) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    No se pudieron cargar los datos del usuario.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
            py: 4,
            px: { xs: 2, sm: 3, md: 4 }
        }}>
            
            {/* Header del Perfil con Diseño Mejorado */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Patrón de fondo decorativo */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    opacity: 0.1,
                    background: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Avatar Section con Input de archivo oculto */}
                    <Box sx={{ position: 'relative' }}>
                        <input
                            accept="image/*"
                            type="file"
                            id="photo-upload"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                        />
                        <label htmlFor="photo-upload">
                            <Avatar 
                                alt={userData.nombre} 
                                src={photoPreview || userData.foto_perfil_base64} 
                                sx={{ 
                                    width: 120, 
                                    height: 120,
                                    border: `4px solid ${alpha('#fff', 0.3)}`,
                                    boxShadow: theme.shadows[8],
                                    cursor: isEditing ? 'pointer' : 'default',
                                    transition: 'all 0.3s',
                                    '&:hover': isEditing ? {
                                        transform: 'scale(1.05)',
                                        border: `4px solid ${alpha('#fff', 0.5)}`,
                                    } : {}
                                }}
                            >
                                <AccountCircleIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                        </label>
                        {isEditing && (
                            <label htmlFor="photo-upload">
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 4,
                                        right: 4,
                                        bgcolor: alpha('#000', 0.7),
                                        backdropFilter: 'blur(8px)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { 
                                            bgcolor: theme.palette.primary.light,
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                >
                                    <PhotoCameraIcon fontSize="small" />
                                </Box>
                            </label>
                        )}
                        {selectedPhoto && (
                            <Chip
                                label="Nueva foto"
                                color="success"
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                }}
                            />
                        )}
                    </Box>

                    {/* User Info */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            {userData.nombre}
                        </Typography>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            alignItems={{ xs: 'center', sm: 'flex-start' }}
                            sx={{ mt: 1 }}
                        >
                            <Chip 
                                icon={<BadgeIcon />}
                                label={userData.nombre_rol || 'Usuario'}
                                sx={{ 
                                    bgcolor: alpha('#fff', 0.2),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    border: `1px solid ${alpha('#fff', 0.3)}`
                                }}
                            />
                            <Chip 
                                icon={<EmailIcon />}
                                label={userData.correo_electronico}
                                sx={{ 
                                    bgcolor: alpha('#fff', 0.2),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: `1px solid ${alpha('#fff', 0.3)}`
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Box>
                        {isEditing ? (
                            <Stack direction="row" spacing={2}>
                                <Button 
                                    onClick={handleSaveProfile} 
                                    variant="contained"
                                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={isSaving}
                                    sx={{
                                        bgcolor: 'white',
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                        px: 3,
                                        '&:hover': {
                                            bgcolor: alpha('#fff', 0.9)
                                        }
                                    }}
                                >
                                    Guardar
                                </Button>
                                <Button 
                                    onClick={handleEditToggle} 
                                    variant="outlined"
                                    startIcon={<CloseIcon />}
                                    disabled={isSaving}
                                    sx={{
                                        borderColor: alpha('#fff', 0.5),
                                        color: 'white',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: alpha('#fff', 0.1)
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </Stack>
                        ) : (
                            <Button 
                                onClick={handleEditToggle} 
                                variant="contained"
                                startIcon={<EditIcon />}
                                sx={{
                                    bgcolor: 'white',
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: alpha('#fff', 0.9),
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[8]
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Editar Perfil
                            </Button>
                        )}
                    </Box>
                </Stack>

                {/* Error Alert dentro del header */}
                {error && isEditing && (
                    <Zoom in={Boolean(error)}>
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mt: 3,
                                borderRadius: 2,
                                bgcolor: alpha('#fff', 0.95)
                            }} 
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    </Zoom>
                )}
            </Paper>

            {/* Contenido Principal en Grid */}
            <Grid container spacing={3}>
                
                {/* Sección: Datos de Contacto */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Datos de Contacto
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />
                            
                            {isEditing ? (
                                <Box>
                                    {renderEditItem(PersonIcon, 'Nombre Completo', 'nombre', formData.nombre)}
                                    {renderEditItem(EmailIcon, 'Correo Electrónico', 'correo_electronico', formData.correo_electronico)}
                                    {renderEditItem(PhoneIcon, 'Teléfono', 'telefono', formData.telefono)}
                                    {renderEditItem(CakeIcon, 'Fecha de Nacimiento', 'fecha_nacimiento', formData.fecha_nacimiento, 'date')}
                                </Box>
                            ) : (
                                <Box>
                                    {renderInfoItem(EmailIcon, 'Correo Electrónico', userData.correo_electronico)}
                                    {renderInfoItem(PhoneIcon, 'Teléfono', userData.telefono)}
                                    {renderInfoItem(CakeIcon, 'Fecha de Nacimiento', userData.fecha_nacimiento)}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sección: Dirección */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Dirección Principal
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />

                            {isEditing ? (
                                <Box>
                                    {renderEditItem(LocationOnIcon, 'Calle', 'calle', formData.calle)}
                                    {renderEditItem(LocationOnIcon, 'Colonia', 'colonia', formData.colonia)}
                                    {renderEditItem(LocationOnIcon, 'Código Postal', 'codigo_postal', formData.codigo_postal)}
                                    {renderEditItem(LocationOnIcon, 'Ciudad', 'ciudad', formData.ciudad)}
                                </Box>
                            ) : (
                                <Box>
                                    {renderInfoItem(LocationOnIcon, 'Calle y Colonia', `${userData.calle} / ${userData.colonia}`)}
                                    {renderInfoItem(LocationOnIcon, 'Ciudad y C.P.', `${userData.ciudad} (${userData.codigo_postal})`)}
                                    {renderInfoItem(LocationOnIcon, 'Estado y País', `${userData.estado} / ${userData.pais}`)}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Sección: Documentos Personales */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Documentos Personales
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />
                            
                            {userData.documentos && userData.documentos.map((doc) => (
                                <Paper
                                    key={doc.id}
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            transform: 'translateX(4px)'
                                        }
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            p: 1.5,
                                            borderRadius: 2
                                        }}>
                                            <DocumentIcon color="primary" />
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={600}>{doc.nombre}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Subido el: {doc.fecha}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Chip 
                                        label={doc.estado}
                                        color={doc.estado === 'Aprobado' ? 'success' : doc.estado === 'Pendiente' ? 'warning' : 'error'}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Paper>
                            ))}
                            
                            {(!userData.documentos || userData.documentos.length === 0) && (
                                <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                                    No hay documentos registrados.
                                </Typography>
                            )}

                            <Button 
                                variant="contained"
                                fullWidth
                                sx={{ 
                                    mt: 2,
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: 600,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                }} 
                                startIcon={<DocumentIcon />}
                            >
                                Subir Nuevo Documento
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PerfilUsuarioPage;