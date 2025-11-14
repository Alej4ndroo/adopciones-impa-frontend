//pages/admin/EmpleadosPerfilPage.jsx
import React, { useState, useEffect, useRef } from 'react'; 
import {
    Box, Typography, Grid, Paper, Divider, CircularProgress,
    Alert, Avatar, Stack, useTheme, Chip, Button,
    alpha, Zoom, Card, CardContent
} from '@mui/material';
import {
    Person as PersonIcon,
    LocationOn as LocationOnIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Cake as CakeIcon,
    Badge as BadgeIcon,
    PhotoCamera as PhotoCameraIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Description as DocumentIcon,
    AccountCircle as AccountCircleIcon,
    Info as InfoIcon,
    UploadFile as UploadFileIcon // --- NUEVO ---
} from '@mui/icons-material';
import axios from 'axios';

// --- CONFIGURACIÓN DE API ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const PROFILE_ENDPOINT = '/empleados/obtener-perfil';
const PHOTO_UPDATE_ENDPOINT = '/empleados/cambiar-foto';
// --- NUEVO: Endpoint para subir documentos ---
const DOCUMENT_UPLOAD_ENDPOINT = '/empleados/subir-documento'; 

const PerfilUsuarioPage = () => {
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // --- NUEVO: Estados para la subida de documentos ---
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);
    const [documentError, setDocumentError] = useState(null);
    const [documentSuccess, setDocumentSuccess] = useState(null);
    const documentInputRef = useRef(null); // --- NUEVO: Ref para el input de archivo

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        // --- NUEVO: Limpiar errores de documento al recargar ---
        setDocumentError(null); 
        setDocumentSuccess(null);

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

    
    const handleSavePhoto = async () => {
        if (!selectedPhoto) {
            setError("No hay ninguna foto seleccionada.");
            return;
        }

        setIsSavingPhoto(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('authToken');

            // Convertir la foto seleccionada a base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(selectedPhoto);
            });

            const base64String = await base64Promise;

            // Enviar solo la foto a la nueva ruta
            const response = await axios.post(
                `${API_URL_BACKEND}${PHOTO_UPDATE_ENDPOINT}`,
                { foto_perfil_base64: base64String },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Asumiendo que el backend responde con los datos del usuario actualizados
            setUserData(response.data); 
            setSuccessMessage("Foto de perfil actualizada con éxito.");
            setSelectedPhoto(null);
            setPhotoPreview(null);

        } catch (err) {
            console.error("Error al guardar la foto:", err.response || err);
            const saveError = err.response?.data?.error || "Error al guardar la foto.";
            setError(saveError);
        } finally {
            setIsSavingPhoto(false);
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        
        setError(null);
        setSuccessMessage(null);

        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecciona un archivo de imagen válido.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setError('La imagen no puede superar los 5MB.');
                return;
            }

            setSelectedPhoto(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- NUEVO: Handler para cuando se selecciona un documento ---
    const handleDocumentChange = (event) => {
        const file = event.target.files?.[0];

        // Limpiar estados
        setDocumentError(null);
        setDocumentSuccess(null);

        if (file) {
            // Validación de tamaño (ej. 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setDocumentError('El archivo es demasiado grande. Límite: 10MB.');
                // Limpiar el valor del input para permitir re-seleccionar
                if (documentInputRef.current) {
                    documentInputRef.current.value = "";
                }
                return;
            }

            // Validación de tipo (Mencionaste JPG, PDF, PNG, etc.)
            const allowedTypes = [
                'image/jpeg', 
                'image/png', 
                'application/pdf', 
                'application/msword', // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
            ];
            
            if (!allowedTypes.includes(file.type)) {
                setDocumentError('Tipo de archivo no permitido (Solo JPG, PNG, PDF, DOC/DOCX).');
                if (documentInputRef.current) {
                    documentInputRef.current.value = "";
                }
                return;
            }

            setSelectedDocument(file);
        }
    };

    // --- NUEVO: Handler para ENVIAR el documento al backend ---
    const handleUploadDocument = async () => {
        if (!selectedDocument) {
            setDocumentError("No hay ningún documento seleccionado.");
            return;
        }

        setIsUploadingDocument(true);
        setDocumentError(null);
        setDocumentSuccess(null);

        try {
            const token = localStorage.getItem('authToken');

            // Convertir el documento a base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(selectedDocument);
            });

            const base64String = await base64Promise;

            // Enviar a la nueva ruta
            const response = await axios.post(
                `${API_URL_BACKEND}${DOCUMENT_UPLOAD_ENDPOINT}`,
                { 
                    // El backend necesitará el nombre y el contenido
                    nombre_archivo: selectedDocument.name,
                    archivo_base64: base64String 
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Asumiendo que el backend responde con los datos del usuario actualizados
            // (incluyendo la nueva lista de documentos)
            setUserData(response.data); 
            setDocumentSuccess("Documento subido con éxito.");
            setSelectedDocument(null);
            
            // Limpiar el valor del input
            if (documentInputRef.current) {
                documentInputRef.current.value = "";
            }

        } catch (err) {
            console.error("Error al subir el documento:", err.response || err);
            const uploadError = err.response?.data?.error || "Error al procesar el documento.";
            setDocumentError(uploadError);
        } finally {
            setIsUploadingDocument(false);
        }
    };


    const renderInfoItem = (Icon, label, value) => (
        // ... (Tu función renderInfoItem sin cambios)
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

    
    if (loading) {
        // ... (Tu UI de Carga sin cambios)
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                background: `linear-gradient(135deg, #1E74D1 0%, #038ffaff 100%)`,
            }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="textSecondary">Cargando perfil...</Typography>
                </Stack>
            </Box>
        );
    }

    if (error && !userData) { 
        // ... (Tu UI de Error principal sin cambios)
         return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!userData) {
        // ... (Tu UI de 'No hay datos' sin cambios)
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    No se pudieron cargar los datos del usuario.
                </Alert>
            </Box>
        );
    }

    return (
        <>
            {/* --- NUEVO: Input de archivo oculto para documentos --- */}
            <input
                type="file"
                ref={documentInputRef}
                style={{ display: 'none' }}
                // Mencionaste jpg, pdg (asumo pdf), png, etc.
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                onChange={handleDocumentChange}
            />

            {/* Header del Perfil */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, #1E74D1 0%, #038ffaff 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* ... (Tu fondo decorativo sin cambios) ... */}
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
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': { 
                                        transform: 'scale(1.05)',
                                        border: `4px solid ${alpha('#fff', 0.5)}`,
                                    }
                                }}
                            >
                                <AccountCircleIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                        </label>
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

                    {/* Botones de Acción (Solo para foto) (Sin cambios) */}
                    <Box>
                        {selectedPhoto && (
                            <Stack direction="row" spacing={2}>
                                <Button
                                    onClick={handleSavePhoto}
                                    variant="contained"
                                    startIcon={isSavingPhoto ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={isSavingPhoto}
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
                                    Guardar Foto
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSelectedPhoto(null);
                                        setPhotoPreview(null);
                                        setError(null);
                                    }}
                                    variant="outlined"
                                    startIcon={<CloseIcon />}
                                    disabled={isSavingPhoto}
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
                        )}
                    </Box>
                </Stack>

                {/* Alertas de Feedback para Éxito o Error (Foto) (Sin cambios) */}
                {error && (
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
                 {successMessage && (
                    <Zoom in={Boolean(successMessage)}>
                        <Alert
                            severity="success"
                            sx={{
                                mt: 3,
                                borderRadius: 2,
                                bgcolor: alpha('#fff', 0.95)
                            }}
                            onClose={() => setSuccessMessage(null)}
                        >
                            {successMessage}
                        </Alert>
                    </Zoom>
                )}
            </Paper>

            {/* Alerta informativa (Sin cambios) */}
            <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
                <Typography fontWeight={500}>
                    Para actualizar tus datos personales (nombre, contacto, dirección), por favor contacta a un administrador o al director.
                </Typography>
            </Alert>

            {/* Contenido Principal en Grid */}
            <Grid container spacing={3}>

                {/* Sección: Datos de Contacto (Solo Vista) (Sin cambios) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                 <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, #1E74D1 0%, #038ffaff 100%)`,
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Datos de Contacto
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />

                            <Box>
                                {renderInfoItem(EmailIcon, 'Correo Electrónico', userData.correo_electronico)}
                                {renderInfoItem(PhoneIcon, 'Teléfono', userData.telefono)}
                                {renderInfoItem(CakeIcon, 'Fecha de Nacimiento', userData.fecha_nacimiento)}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sección: Dirección (Solo Vista) (Sin cambios) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                 <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, #1E74D1 0%, #038ffaff 100%)`,
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Dirección Principal
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />
                            
                            <Box>
                                {renderInfoItem(LocationOnIcon, 'Calle y Colonia', `${userData.calle || 'N/A'} / ${userData.colonia || 'N/A'}`)}
                                {renderInfoItem(LocationOnIcon, 'Ciudad y C.P.', `${userData.ciudad || 'N/A'} (${userData.codigo_postal || 'N/A'})`)}
                                {renderInfoItem(LocationOnIcon, 'Estado y País', `${userData.estado || 'N/A'} / ${userData.pais || 'N/A'}`)}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* --- SECCIÓN MODIFICADA: Documentos Personales --- */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            {/* ... (Título de la Card sin cambios) ... */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Box 
                                    sx={{ 
                                        width: 4, 
                                        height: 32, 
                                        borderRadius: 2,
                                        background: `linear-gradient(180deg, #1E74D1 0%, #038ffaff 100%)`,
                                    }} 
                                />
                                <Typography variant="h6" fontWeight={700} color="primary">
                                    Documentos Personales
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 3 }} />

                            {/* ... (Listado de documentos existentes sin cambios) ... */}
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
                            
                            {/* --- INICIO: NUEVA Lógica de Subida de Documentos --- */}
                
                            {/* 1. Alertas de feedback para documentos */}
                            {documentError && (
                                <Alert 
                                    severity="error" 
                                    sx={{ mt: 2, borderRadius: 2 }} 
                                    onClose={() => setDocumentError(null)}
                                >
                                    {documentError}
                                </Alert>
                            )}
                            {documentSuccess && (
                                <Alert 
                                    severity="success" 
                                    sx={{ mt: 2, borderRadius: 2 }} 
                                    onClose={() => setDocumentSuccess(null)}
                                >
                                    {documentSuccess}
                                </Alert>
                            )}

                            {/* 2. UI Condicional: Mostrar selección o botón de subir */}
                            {!selectedDocument ? (
                                // Botón para INICIAR la subida (abre el explorador de archivos)
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        py: 1.5,
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, #1E74D1 0%, #038ffaff 100%)`,
                                    }}
                                    startIcon={<UploadFileIcon />} // --- MODIFICADO: Icono
                                    // --- MODIFICADO: onClick para disparar el input oculto ---
                                    onClick={() => documentInputRef.current?.click()} 
                                >
                                    Subir Nuevo Documento
                                </Button>
                            ) : (
                                // UI para CONFIRMAR/CANCELAR el archivo seleccionado
                                <Box sx={{ 
                                    mt: 3, 
                                    p: 2.5, 
                                    border: `2px dashed ${theme.palette.divider}`, 
                                    borderRadius: 3, 
                                    bgcolor: alpha(theme.palette.primary.main, 0.04) 
                                }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary.dark">
                                        Confirmar subida
                                    </Typography>
                                    
                                    <Stack 
                                        direction={{ xs: 'column', sm: 'row' }} 
                                        spacing={1.5} 
                                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                                        sx={{ mb: 2.5, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}
                                    >
                                        <DocumentIcon color="primary" />
                                        <Typography 
                                            variant="body1" 
                                            fontWeight={500}
                                            sx={{ wordBreak: 'break-all', flex: 1 }}
                                        >
                                            {selectedDocument.name}
                                        </Typography>
                                        <Chip 
                                            label={`${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB`} 
                                            size="small" 
                                            variant='outlined'
                                        />
                                    </Stack>

                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                setSelectedDocument(null);
                                                setDocumentError(null);
                                                if (documentInputRef.current) {
                                                    documentInputRef.current.value = ""; // Resetea el input
                                                }
                                            }}
                                            disabled={isUploadingDocument}
                                            startIcon={<CloseIcon />}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleUploadDocument}
                                            disabled={isUploadingDocument}
                                            startIcon={isUploadingDocument ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                            sx={{
                                                background: `linear-gradient(135deg, #1E74D1 0%, #038ffaff 100%)`,
                                            }}
                                        >
                                            Confirmar y Subir
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                            {/* --- FIN: Lógica de Subida de Documentos --- */}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default PerfilUsuarioPage;