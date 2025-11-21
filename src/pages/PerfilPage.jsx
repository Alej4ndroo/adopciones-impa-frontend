//pages/PerfilPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Box, Grid, Card, CardContent, Avatar,
    Typography, Button, CssBaseline, Chip, CircularProgress, Alert,
    Divider, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, IconButton,
    Stack, Zoom
} from '@mui/material';
import {
    Email, Badge, Pets, Event, Phone, Home, CameraAlt, Edit, Close,
    CloudUpload, Description
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
        primary: { main: '#007BFF' },
        secondary: { main: '#5C6BC0' },
        background: { default: '#f4f7ff', paper: '#ffffff' }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 700 },
        button: { textTransform: 'none' }
    },
});

// Estilos reutilizables para fijar alturas y evitar saltos en el layout
const cardBaseSx = {
    borderRadius: 3,
    border: '1px solid #e4e7ec',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%'
};

const sectionContentSx = {
    p: 3.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
    height: '100%'
};

const ellipsisText = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};

const mutedLabelSx = {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: 700
};

const statCardSx = {
    borderRadius: 2,
    backgroundColor: '#ffffff',
    border: '1px solid #e6e9f0',
    p: 2.4,
    display: 'flex',
    alignItems: 'center',
    gap: 1.8
};

// -------------------------------------------------------------------
// 🚀 FUNCIÓN HELPER - Actualización de Usuario
// -------------------------------------------------------------------
const apiUpdateUser = async (userId, data) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        throw new Error('No autenticado. Por favor, inicie sesión.');
    }

    const url = `${VITE_API_URL_BACKEND}/usuarios/actualizar/${userId}`;
    const config = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar los datos.');
    }

    return response.json();
};
// -------------------------------------------------------------------

// Merge helper to keep nested data (rol/direcciones) when API returns partial updates
const mergeUserData = (prev, incoming) => {
    if (!prev) return incoming;
    return {
        ...prev,
        ...incoming,
        rol: incoming?.rol || prev.rol,
        direcciones: incoming?.direcciones ?? prev.direcciones
    };
};

// Lee un archivo y devuelve su dataURL completa (para preview) y la parte base64 (para enviar)
const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result || '';
        const dataUrl = typeof result === 'string' ? result : '';
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        resolve({ dataUrl, base64 });
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
});

// Asegura que el string base64 tenga el prefijo data URL para mostrar la imagen
const asDataUrlImage = (value) => {
    if (!value) return null;
    return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
};

const PerfilPage = ({ isAuthenticated, currentUser, onProfileUpdate, onLogout }) => {
    // 🔥 CAMBIO PRINCIPAL: Un solo estado para el usuario (como EmpleadosPerfilPage)
    const [userData, setUserData] = useState(null);

    // Estados para los datos del perfil (citas/adopciones)
    const [misCitas, setMisCitas] = useState([]);
    const [misAdopciones, setMisAdopciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
    const [isSavingPhoto, setIsSavingPhoto] = useState(false);
    
    const initialAddressState = {
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        pais: 'México'
    };

    // Estado para nueva dirección
    const [newAddress, setNewAddress] = useState(initialAddressState);
    const hasAddress = Boolean(userData?.direcciones?.length);

    const normalizeSpaces = (value) => value.replace(/\s+/g, ' ').trim();
    const onlyDigits = (value) => value.replace(/[^0-9]/g, '');
    const limit = (value, max) => value.slice(0, max);

    // Estados para documentos
    const [docUploads, setDocUploads] = useState({ ine: null, acta: null, comprobante: null });
    const [docUploading, setDocUploading] = useState(null);
    const [docRemoving, setDocRemoving] = useState(null);
    const [docPreviews, setDocPreviews] = useState({ ine: null, acta: null, comprobante: null });

    // Ref para el input de foto
    const photoInputRef = useRef(null);
    const docInputRefs = useRef({ ine: null, acta: null, comprobante: null });

    // 🔥 CAMBIO: useEffect simplificado - Solo carga inicial
    useEffect(() => {
        if (currentUser) {
            setUserData(currentUser);

            setEditedUser({
                nombre: currentUser.nombre || '',
                telefono: currentUser.telefono || '',
                fecha_nacimiento: currentUser.fecha_nacimiento ? currentUser.fecha_nacimiento.split('T')[0] : ''
            });

            fetchUserData(currentUser.id_usuario);
        } else {
            setUserData(null);
            setMisCitas([]);
            setMisAdopciones([]);
            setLoading(false);
        }
    }, [currentUser?.id_usuario]); // 🔥 Solo reacciona al cambio de ID


    // Carga los datos secundarios (citas, adopciones)
    const fetchUserData = async (usuarioId) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch citas
            const citasResponse = await fetch(`${VITE_API_URL_BACKEND}/citas/usuario/${usuarioId}`, { headers });
            if (citasResponse.ok) {
                const citasData = await citasResponse.json();
                setMisCitas(citasData);
            }

            // Fetch adopciones
            const adopcionesResponse = await fetch(`${VITE_API_URL_BACKEND}/adopciones/usuario/${usuarioId}`, { headers });
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

            setNewPhoto(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // -------------------------------------------------------------------
    // 🔥 FUNCIONES DE ACTUALIZACIÓN CORREGIDAS
    // -------------------------------------------------------------------

    const handleUploadPhoto = async () => {
        if (!newPhoto) return;

        setIsSavingPhoto(true);
        setError(null);
        setSuccessMessage(null);

        const reader = new FileReader();

        reader.onloadend = async () => {
            try {
                const base64String = reader.result.split(',')[1];
                const photoData = { foto_perfil_base64: base64String };

                const response = await apiUpdateUser(userData.id_usuario, photoData);

                // 🔥 Extrae el usuario de la respuesta
                const usuarioActualizado = response.usuario || response;

                // 🔥 Fusiona para no perder rol/direcciones cuando el backend responde parcial
                const mergedUser = mergeUserData(userData, usuarioActualizado);

                setUserData(mergedUser);

                // 🔥 Actualiza también el localStorage y currentUser del padre
                localStorage.setItem('userData', JSON.stringify(mergedUser));

                if (onProfileUpdate) {
                    onProfileUpdate(mergedUser);
                }

                setSuccessMessage('Foto actualizada correctamente');
                setOpenEditPhoto(false);
                setNewPhoto(null);
                setPhotoPreview(null);

            } catch (err) {
                console.error('Error al subir foto:', err);
                setError(err.message);
            } finally {
                setIsSavingPhoto(false);
            }
        };

        reader.onerror = () => {
            console.error('Error al leer el archivo de imagen.');
            setError('Error al procesar la foto.');
            setIsSavingPhoto(false);
        };

        reader.readAsDataURL(newPhoto);
    };

    const handleUpdateProfile = async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const response = await apiUpdateUser(userData.id_usuario, editedUser);

            // 🔥 Extrae el usuario de la respuesta
            const usuarioActualizado = response.usuario || response;

            // 🔥 Fusiona para no perder rol/direcciones cuando el backend responde parcial
            const mergedUser = mergeUserData(userData, usuarioActualizado);

            // 🔥 Actualiza el estado local
            setUserData(mergedUser);

            // 🔥 Actualiza también el localStorage y currentUser del padre
            localStorage.setItem('userData', JSON.stringify(mergedUser));
            if (onProfileUpdate) {
                onProfileUpdate(mergedUser);
            }

            setSuccessMessage('Perfil actualizado correctamente');
            setOpenEditProfile(false);

        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            setError(err.message);
        }
    };

    const handleOpenAddressModal = () => {
        if (hasAddress && userData?.direcciones?.length) {
            const dir = userData.direcciones[0];
            setNewAddress({
                calle: normalizeSpaces(dir.calle || ''),
                numero_exterior: limit(onlyDigits(dir.numero_exterior || ''), 6),
                numero_interior: limit(onlyDigits(dir.numero_interior || ''), 6),
                colonia: normalizeSpaces(dir.colonia || ''),
                ciudad: normalizeSpaces(dir.ciudad || ''),
                estado: normalizeSpaces(dir.estado || ''),
                codigo_postal: limit(onlyDigits(dir.codigo_postal || ''), 5),
                pais: dir.pais || 'México'
            });
        } else {
            setNewAddress(initialAddressState);
        }
        setOpenAddAddress(true);
    };

    const documentTypes = [
        { key: 'ine', label: 'INE / IFE', helper: 'Imagen (JPG, PNG)', field: 'url_ine' },
        { key: 'acta', label: 'Acta de nacimiento', helper: 'Imagen (JPG, PNG)', field: 'url_acta' },
        { key: 'comprobante', label: 'Comprobante de domicilio', helper: 'Imagen (JPG, PNG)', field: 'url_comprobante' }
    ];

    const handleDocSelect = (type, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccessMessage(null);

        const allowed = ['image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) {
            setError('Formato no permitido. Usa JPG o PNG.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('El archivo no puede exceder 10MB.');
            return;
        }

        setDocUploads((prev) => ({ ...prev, [type]: file }));
        // Previsualizar al instante
        readFileAsBase64(file)
            .then(({ dataUrl }) => setDocPreviews((prev) => ({ ...prev, [type]: dataUrl })))
            .catch(() => setDocPreviews((prev) => ({ ...prev, [type]: null })));
    };

    const handleDocUpload = async (type) => {
        const file = docUploads[type];
        if (!file) {
            setError('Selecciona un archivo antes de subir.');
            return;
        }
        if (!userData?.id_usuario && !userData?.id_persona) {
            setError('Falta el identificador del usuario para asociar los documentos.');
            return;
        }

        setDocUploading(type);
        setError(null);
        setSuccessMessage(null);

        try {
            const { dataUrl, base64 } = await readFileAsBase64(file);

            const field = documentTypes.find((d) => d.key === type)?.field;
            if (!field) {
                throw new Error('Tipo de documento no reconocido.');
            }

            // Enviamos como base64 al backend (igual que la foto de perfil).
            // Si el backend rechaza el campo, guardamos localmente para la demo.
            let patchedUser;
            try {
                const response = await apiUpdateUser(userData.id_usuario, { [field]: base64 });
                const usuarioActualizado = response.usuario || response;
                const mergedUser = mergeUserData(userData, usuarioActualizado);
                patchedUser = { ...mergedUser, [field]: base64 };
                setSuccessMessage('Documento guardado correctamente.');
            } catch (apiErr) {
                console.error('API no aceptó el documento, guardando solo local:', apiErr);
                patchedUser = { ...userData, [field]: base64 };
                setSuccessMessage('Documento guardado localmente (no se guardó en el servidor).');
            }

            setUserData(patchedUser);
            localStorage.setItem('userData', JSON.stringify(patchedUser));
            onProfileUpdate?.(patchedUser);

            // Limpiar input y file seleccionado
            setDocUploads((prev) => ({ ...prev, [type]: null }));
            setDocPreviews((prev) => ({ ...prev, [type]: dataUrl }));
            if (docInputRefs.current[type]) {
                docInputRefs.current[type].value = '';
            }
        } catch (err) {
            console.error('Error al preparar documento:', err);
            setError(err.message || 'No se pudo subir el documento.');
        } finally {
            setDocUploading(null);
        }
    };

    const handleDocRemove = async (type) => {
        const field = documentTypes.find((d) => d.key === type)?.field;
        if (!field) {
            setError('Tipo de documento no reconocido.');
            return;
        }

        setDocRemoving(type);
        setError(null);
        setSuccessMessage(null);

        try {
            try {
                await apiUpdateUser(userData.id_usuario, { [field]: null });
                setSuccessMessage('Documento eliminado correctamente.');
            } catch (apiErr) {
                console.warn('API no aceptó eliminar, limpiando solo local:', apiErr);
                setSuccessMessage('Documento eliminado localmente (no se eliminó en el servidor).');
            }

            const patchedUser = { ...userData, [field]: null };
            setUserData(patchedUser);
            localStorage.setItem('userData', JSON.stringify(patchedUser));
            onProfileUpdate?.(patchedUser);

            setDocUploads((prev) => ({ ...prev, [type]: null }));
            setDocPreviews((prev) => ({ ...prev, [type]: null }));
            if (docInputRefs.current[type]) {
                docInputRefs.current[type].value = '';
            }
        } catch (err) {
            console.error('Error al eliminar documento:', err);
            setError(err.message || 'No se pudo eliminar el documento.');
        } finally {
            setDocRemoving(null);
        }
    };

    const handleAddAddress = async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const requiredFields = ['calle', 'numero_exterior', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
            const missing = requiredFields.filter((field) => !String(newAddress[field] || '').trim());
            if (missing.length) {
                setError('Completa todos los campos obligatorios de la dirección.');
                return;
            }

            const numericFields = [
                { key: 'numero_exterior', label: 'Número exterior' },
                { key: 'codigo_postal', label: 'Código Postal', length: 5 },
                { key: 'numero_interior', label: 'Número interior', optional: true }
            ];
            const nonNumeric = numericFields.find(({ key, optional, length }) => {
                const value = String(newAddress[key] || '').trim();
                if (!value && optional) return false;
                return !/^[0-9]+$/.test(value);
            });
            if (nonNumeric) {
                setError(`${nonNumeric.label} solo debe contener números.`);
                return;
            }

            const invalidLength = numericFields.find(({ key, length }) => {
                if (!length) return false;
                const value = String(newAddress[key] || '').trim();
                return value.length !== length;
            });
            if (invalidLength) {
                setError(`${invalidLength.label} debe tener ${invalidLength.length} dígitos.`);
                return;
            }

            const addressData = {
                ...newAddress,
                tipo_direccion: 'residencial',
                es_principal: true
            };

            const response = await apiUpdateUser(userData.id_usuario, addressData);
            
            // 🔥 Extrae el usuario de la respuesta
            const usuarioActualizado = response.usuario || response;
            
            // 🔥 Fusiona para no perder rol/direcciones cuando el backend responde parcial
            const mergedUser = mergeUserData(userData, usuarioActualizado);

            // 🔥 Resuelve direcciones: usa las del backend si vienen, de lo contrario actualiza localmente
            const backendDirecciones = usuarioActualizado?.direcciones;
            const updatedDirecciones = backendDirecciones && backendDirecciones.length
                ? backendDirecciones
                : (() => {
                    const existing = userData?.direcciones?.[0];
                    const mergedAddress = existing
                        ? { ...existing, ...newAddress }
                        : { ...newAddress };
                    return [mergedAddress];
                })();

            const patchedUser = { ...mergedUser, direcciones: updatedDirecciones };
            
            // 🔥 Actualiza el estado local
            setUserData(patchedUser);
            
            // 🔥 Actualiza también el localStorage y currentUser del padre
            localStorage.setItem('userData', JSON.stringify(patchedUser));
            if (onProfileUpdate) {
                onProfileUpdate(patchedUser);
            }

            setSuccessMessage('Dirección actualizada correctamente');
            setOpenAddAddress(false);
            setNewAddress(initialAddressState);

        } catch (err) {
            console.error('Error al agregar dirección:', err);
            setError(err.message);
        }
    };

    const statBlocks = [
        {
            key: 'citas',
            label: 'Citas',
            value: misCitas.length || 0,
            description: misCitas.length ? 'Agendadas con el equipo' : 'Aún sin citas agendadas',
            icon: Event,
            color: 'primary.main',
            bg: '#e8f1ff'
        },
        {
            key: 'adopciones',
            label: 'Solicitudes',
            value: misAdopciones.length || 0,
            description: 'Procesos de adopción',
            icon: Pets,
            color: 'secondary.main',
            bg: '#eef2ff'
        },
        {
            key: 'direcciones',
            label: 'Direcciones',
            value: userData?.direcciones?.length || 0,
            description: 'Ubicaciones registradas',
            icon: Home,
            color: 'primary.dark',
            bg: '#e6f4ff'
        }
    ];

    // -------------------------------------------------------------------
    // ⬇️ RENDERIZADO (JSX) ⬇️
    // -------------------------------------------------------------------

    // Loading state
    if (loading && !userData) {
        return (
            <ThemeProvider theme={customTheme}>
                <CssBaseline />
                <PublicNavbar
                    isAuthenticated={isAuthenticated}
                    currentUser={currentUser}
                    onProfileUpdate={onProfileUpdate}
                    onLogout={onLogout}
                />
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh'
                }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress size={60} />
                        <Typography variant="h6" color="textSecondary">Cargando perfil...</Typography>
                    </Stack>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />

            <PublicNavbar
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onProfileUpdate={onProfileUpdate}
                onLogout={onLogout}
            />

            <Box
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    backgroundColor: '#f5f7fb',
                    pt: 8,
                    pb: 10
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 2 }}>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="overline" sx={{ letterSpacing: 1, color: 'primary.main', fontWeight: 700 }}>Panel personal</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.6 }}>
                                Hola, {userData?.nombre?.split(' ')[0] || 'explorador'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* alertas globales de feedback */}
                    {error && (
                        <Zoom in={Boolean(error)}>
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
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
                                sx={{ mb: 3, borderRadius: 2 }}
                                onClose={() => setSuccessMessage(null)}
                            >
                                {successMessage}
                            </Alert>
                        </Zoom>
                    )}

                    {isAuthenticated && userData && (
                        <Box
                            component="section"
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                gap: 2.2,
                                mb: 3.5
                            }}
                        >
                            {statBlocks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Box key={item.key} sx={statCardSx}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                backgroundColor: item.bg,
                                                display: 'grid',
                                                placeItems: 'center',
                                                color: item.color,
                                                fontSize: '1.4rem'
                                            }}
                                        >
                                            <Icon fontSize="inherit" />
                                        </Box>
                                        <Stack spacing={0.3}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                                                {item.value}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}

                    {/* Usamos userData en lugar de localUser */}
                    {!isAuthenticated || !userData ? (
                        <Card sx={{ ...cardBaseSx, p: 4, textAlign: 'center' }}>
                            <Alert severity="warning" sx={{ justifyContent: 'center', mb: 3, fontSize: '1.1rem' }}>
                                Por favor, <strong>inicia sesión</strong> para ver y gestionar tu perfil.
                            </Alert>
                            <Typography variant="body1" color="text.secondary">
                                Aquí podrás ver tus citas, gestionar adopciones y actualizar tus datos.
                            </Typography>
                        </Card>

                    ) : (
                        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">

                            {/* Columna Izquierda: Tarjeta de Usuario */}
                            <Grid item xs={12} md={4}>
                                <Card sx={{ ...cardBaseSx, height: '100%', width: '697px' }}>
                                    <CardContent sx={{ ...sectionContentSx, textAlign: 'center', height: '100%', p: 3 }}>
                                        <Stack spacing={2.5} sx={{ height: '100%' }}>
                                            <Stack spacing={1.5} alignItems="center">
                                                <Box sx={{ position: 'relative', display: 'inline-block', alignSelf: 'center', p: 1.2, borderRadius: '50%', background: '#eef2ff' }}>
                                                    <input
                                                        accept="image/*"
                                                        type="file"
                                                        ref={photoInputRef}
                                                        style={{ display: 'none' }}
                                                        onChange={handlePhotoChange}
                                                    />
                                                    <Avatar
                                                        src={photoPreview || (userData.foto_perfil_base64 ? `data:image/jpeg;base64,${userData.foto_perfil_base64}` : undefined)}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            mx: 'auto',
                                                            bgcolor: 'secondary.main',
                                                            fontSize: '3.4rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            border: '4px solid #fff',
                                                        }}
                                                        onClick={() => photoInputRef.current?.click()}
                                                    >
                                                        {!photoPreview && !userData.foto_perfil_base64 && userData.nombre?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <IconButton
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 6,
                                                            right: 6,
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                        }}
                                                        size="small"
                                                        onClick={() => photoInputRef.current?.click()}
                                                    >
                                                        <CameraAlt fontSize="small" />
                                                    </IconButton>
                                                    {newPhoto && (
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

                                                {newPhoto && (
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={handleUploadPhoto}
                                                            disabled={isSavingPhoto}
                                                            startIcon={isSavingPhoto ? <CircularProgress size={16} color="inherit" /> : null}
                                                        >
                                                            Guardar
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => {
                                                                setNewPhoto(null);
                                                                setPhotoPreview(null);
                                                                if (photoInputRef.current) {
                                                                    photoInputRef.current.value = "";
                                                                }
                                                            }}
                                                            disabled={isSavingPhoto}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </Stack>
                                                )}

                                                <Stack spacing={0.2} sx={{ alignItems: 'center' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em', ...ellipsisText }} title={userData.nombre}>
                                                        {userData.nombre}
                                                    </Typography>
                                                    <Chip
                                                        label={userData.rol?.nombre_rol?.toUpperCase() || 'SIN ROL'}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ fontWeight: 700, maxWidth: '100%', ...ellipsisText, borderRadius: 1.5 }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Información básica y datos de contacto.
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            <Divider />

                                            <Stack spacing={1.4} sx={{ textAlign: 'left', flexGrow: 1 }}>
                                                <Typography variant="subtitle2" sx={mutedLabelSx}>Datos de contacto</Typography>
                                                <Stack spacing={1.1}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 40, height: 40 }}>
                                                            <Email fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">Correo</Typography>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                {userData.correo_electronico}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 40, height: 40 }}>
                                                            <Phone fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                {userData.telefono || 'No registrado'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 40, height: 40 }}>
                                                            <Badge fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">Rol</Typography>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                {userData.rol?.nombre_rol?.toUpperCase() || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Stack>
                                            </Stack>

                                            <Stack direction="row" spacing={1} sx={{ mt: 'auto', width: '100%' }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Edit />}
                                                    sx={{ borderRadius: 2, fontWeight: 700, width: '100%', py: 1.05, boxShadow: 'none' }}
                                                    onClick={() => {
                                                        setEditedUser({
                                                            nombre: userData.nombre || '',
                                                            telefono: userData.telefono || '',
                                                            fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : ''
                                                        });
                                                        setOpenEditProfile(true);
                                                    }}
                                                >
                                                    Editar Perfil
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Columna Derecha: Direcciones, Citas y Adopciones */}
                            <Grid item xs={12} md={8}>
                                <Stack spacing={2.5}>
                                    <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                        <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                                <Box>
                                                    <Typography sx={mutedLabelSx}>Ubicaciones</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Mis Direcciones</Typography>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={hasAddress ? <Edit /> : <Home />}
                                                    sx={{ fontWeight: 700 }}
                                                    onClick={handleOpenAddressModal}
                                                >
                                                    {hasAddress ? 'Editar dirección' : 'Agregar dirección'}
                                                </Button>
                                            </Stack>

                                            {userData.direcciones && userData.direcciones.length === 0 ? (
                                                <Alert severity="info" sx={{ mb: 1 }}>No tienes direcciones registradas.</Alert>
                                            ) : (
                                                <Stack spacing={1.2}>
                                                    {userData.direcciones && userData.direcciones.map((dir, index) => (
                                                        <Box
                                                            key={dir.id_direccion || index}
                                                            sx={{
                                                                border: '1px solid #edf0f5',
                                                                borderRadius: 2,
                                                                p: 1.4,
                                                                display: 'flex',
                                                                gap: 1.4,
                                                                alignItems: 'flex-start'
                                                            }}
                                                        >
                                                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                                <Home fontSize="small" />
                                                            </Avatar>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                    {`${dir.calle} ${dir.numero_exterior}${dir.numero_interior ? ' Int. ' + dir.numero_interior : ''}`}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ ...ellipsisText }}>
                                                                    {`${dir.colonia}, ${dir.ciudad}, ${dir.estado} - CP ${dir.codigo_postal}`}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                        <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                                <Box>
                                                    <Typography sx={mutedLabelSx}>Agenda</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Mis Citas</Typography>
                                                </Box>
                                                <Button variant="contained" component={Link} to="/citas" sx={{ fontWeight: 700, boxShadow: 'none' }} >
                                                    Agendar nueva cita
                                                </Button>
                                            </Stack>
                                            {loading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}> <CircularProgress /> </Box>
                                            ) : misCitas.length === 0 ? (
                                                <Alert severity="info">No tienes citas programadas.</Alert>
                                            ) : (
                                                <Stack spacing={1.1}>
                                                    {misCitas.map((cita) => {
                                                        const estadoColor = cita.estado === 'aprobada' || cita.estado === 'confirmada'
                                                            ? 'success'
                                                            : cita.estado === 'rechazada'
                                                                ? 'error'
                                                                : 'warning';

                                                        return (
                                                            <Box
                                                                key={cita.id_cita}
                                                                sx={{
                                                                    border: '1px solid #edf0f5',
                                                                    borderRadius: 2,
                                                                    p: 1.4,
                                                                    display: 'flex',
                                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                                    gap: 1.1,
                                                                    alignItems: { sm: 'center' },
                                                                    justifyContent: 'space-between'
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ flex: 1 }}>
                                                                    <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 42, height: 42 }}>
                                                                        <Event fontSize="small" />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                            {cita.motivo || 'Cita veterinaria'}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" sx={{ ...ellipsisText }}>
                                                                            {`Fecha: ${new Date(cita.fecha_hora).toLocaleDateString()} · ${new Date(cita.fecha_hora).toLocaleTimeString()} `}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>

                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Chip
                                                                        label={cita.estado}
                                                                        color={estadoColor}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                    {cita.estado === 'pendiente' && (
                                                                        <Button size="small" variant="outlined" color="error">Cancelar</Button>
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                        <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                                <Box>
                                                    <Typography sx={mutedLabelSx}>Adopciones</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Mis Solicitudes</Typography>
                                                </Box>
                                                <Button variant="contained" component={Link} to="/adopciones" sx={{ fontWeight: 700, boxShadow: 'none' }} >
                                                    Ver mascotas en adopción
                                                </Button>
                                            </Stack>
                                            {loading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}> <CircularProgress /> </Box>
                                            ) : misAdopciones.length === 0 ? (
                                                <Alert severity="info">No tienes solicitudes de adopción.</Alert>
                                            ) : (
                                                <Stack spacing={1.1}>
                                                    {misAdopciones.map((adopcion) => {
                                                        const estadoColor = adopcion.estado === 'aprobada'
                                                            ? 'success'
                                                            : adopcion.estado === 'rechazada'
                                                                ? 'error'
                                                                : 'warning';
                                                        return (
                                                            <Box
                                                                key={adopcion.id_adopcion}
                                                                sx={{
                                                                    border: '1px solid #edf0f5',
                                                                    borderRadius: 2,
                                                                    p: 1.4,
                                                                    display: 'flex',
                                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                                    gap: 1.1,
                                                                    alignItems: { sm: 'center' },
                                                                    justifyContent: 'space-between'
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={1.4} alignItems="center" sx={{ flex: 1 }}>
                                                                    <Avatar sx={{ bgcolor: '#f0efff', color: 'secondary.main', width: 42, height: 42 }}>
                                                                        <Pets fontSize="small" />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                            {`Mascota: ${adopcion.mascota?.nombre || 'N/A'}`}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" sx={{ ...ellipsisText }}>
                                                                            {`Fecha: ${new Date(adopcion.fecha_solicitud).toLocaleDateString()}`}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                                <Chip
                                                                    label={adopcion.estado}
                                                                    color={estadoColor}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}

                    {isAuthenticated && userData && (
                        <Box sx={{ mt: 3.5 }}>
                            <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                        <Box>
                                            <Typography sx={mutedLabelSx}>Documentos oficiales</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Sube tus identificaciones</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack spacing={1.2} sx={{ mt: 1 }}>
                                        {documentTypes.map((doc) => {
                                            const existingUrl = userData?.[doc.field];
                                            const pendingFile = docUploads[doc.key];
                                            const currentPreview = docPreviews[doc.key] || asDataUrlImage(existingUrl);
                                            const hasDoc = Boolean(pendingFile || existingUrl || currentPreview);
                                            const statusLabel = pendingFile
                                                ? `Pendiente de envío (${pendingFile.name})`
                                                : existingUrl
                                                    ? 'Documento cargado'
                                                    : 'Sin documento';
                                            const statusColor = pendingFile ? 'warning' : existingUrl ? 'success' : 'default';
                                            return (
                                                <Box
                                                    key={doc.key}
                                                    sx={{
                                                        border: '1px solid #edf0f5',
                                                        borderRadius: 2,
                                                        p: 1.4,
                                                        display: 'flex',
                                                        flexDirection: { xs: 'column', sm: 'row' },
                                                        gap: 1.1,
                                                        alignItems: { sm: 'center' },
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={1.4} alignItems="center" sx={{ flex: 1 }}>
                                                        <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 42, height: 42 }}>
                                                            <Description fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                {doc.label}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {doc.helper}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                                                        <Chip
                                                            label={statusLabel}
                                                            color={statusColor}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            ref={(el) => (docInputRefs.current[doc.key] = el)}
                                                            onChange={(e) => handleDocSelect(doc.key, e)}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<CloudUpload />}
                                                            sx={{ fontWeight: 700 }}
                                                            onClick={() => docInputRefs.current[doc.key]?.click()}
                                                        >
                                                            Seleccionar
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            disabled={docUploading === doc.key}
                                                            onClick={() => handleDocUpload(doc.key)}
                                                            sx={{ fontWeight: 700, boxShadow: 'none' }}
                                                            startIcon={docUploading === doc.key ? <CircularProgress size={16} color="inherit" /> : null}
                                                        >
                                                            Subir
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            disabled={docRemoving === doc.key || !hasDoc}
                                                            onClick={() => handleDocRemove(doc.key)}
                                                            sx={{ fontWeight: 700 }}
                                                            startIcon={docRemoving === doc.key ? <CircularProgress size={16} color="inherit" /> : <Close fontSize="small" />}
                                                        >
                                                            Quitar
                                                        </Button>
                                                    </Stack>
                                                    {currentPreview && (
                                                        <Box
                                                            component="img"
                                                            src={currentPreview}
                                                        alt={`Vista previa de ${doc.label}`}
                                                        sx={{ mt: { xs: 1, sm: 0 }, maxHeight: 120, borderRadius: 1.5, border: '1px solid #edf0f5' }}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </CardContent>
                            </Card>
                        </Box>
                    )}

                </Container>
            </Box>

            {/* ------------------------------------------------------------------- */}
            {/* ⬇️ MODALES ⬇️ */}
            {/* ------------------------------------------------------------------- */}

            {/* Modal: Editar Foto de Perfil */}
            <Dialog open={openEditPhoto} onClose={() => setOpenEditPhoto(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Cambiar Foto de Perfil
                    <IconButton onClick={() => setOpenEditPhoto(false)} sx={{ position: 'absolute', right: 8, top: 8 }} >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar
                            src={photoPreview || (userData?.foto_perfil_base64 ? `data:image/jpeg;base64,${userData.foto_perfil_base64}` : undefined)}
                            sx={{ width: 150, height: 150, mx: 'auto', mb: 3 }}
                        >
                            {!photoPreview && !userData?.foto_perfil_base64 && userData?.nombre?.charAt(0).toUpperCase()}
                        </Avatar>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload-modal"
                            type="file"
                            onChange={handlePhotoChange}
                        />
                        <label htmlFor="photo-upload-modal">
                            <Button variant="outlined" component="span" startIcon={<CameraAlt />}>
                                Seleccionar Foto
                            </Button>
                        </label>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditPhoto(false)}>Cancelar</Button>
                    <Button onClick={handleUploadPhoto} variant="contained" disabled={!newPhoto || isSavingPhoto}>
                        {isSavingPhoto ? <CircularProgress size={20} /> : 'Subir Foto'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Editar Perfil */}
            <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Editar Perfil
                    <IconButton onClick={() => setOpenEditProfile(false)} sx={{ position: 'absolute', right: 8, top: 8 }} >
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

            {/* Modal: Agregar/Editar Dirección */}
            <Dialog open={openAddAddress} onClose={() => setOpenAddAddress(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {hasAddress ? 'Editar Dirección' : 'Agregar Dirección'}
                    <IconButton onClick={() => setOpenAddAddress(false)} sx={{ position: 'absolute', right: 8, top: 8 }} >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                required
                                label="Calle"
                                value={newAddress.calle}
                                onChange={(e) => setNewAddress({ ...newAddress, calle: normalizeSpaces(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                label="No. Int"
                                value={newAddress.numero_interior}
                                onChange={(e) => setNewAddress({ ...newAddress, numero_interior: limit(onlyDigits(e.target.value), 6) })}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                required
                                label="No. Ext"
                                value={newAddress.numero_exterior}
                                onChange={(e) => setNewAddress({ ...newAddress, numero_exterior: limit(onlyDigits(e.target.value), 6) })}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Colonia"
                                value={newAddress.colonia}
                                onChange={(e) => setNewAddress({ ...newAddress, colonia: normalizeSpaces(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Ciudad"
                                value={newAddress.ciudad}
                                onChange={(e) => setNewAddress({ ...newAddress, ciudad: normalizeSpaces(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Estado"
                                value={newAddress.estado}
                                onChange={(e) => setNewAddress({ ...newAddress, estado: normalizeSpaces(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Código Postal"
                                value={newAddress.codigo_postal}
                                onChange={(e) => setNewAddress({ ...newAddress, codigo_postal: limit(onlyDigits(e.target.value), 5) })}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 5 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="País"
                                value={newAddress.pais}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddAddress(false)}>Cancelar</Button>
                    <Button onClick={handleAddAddress} variant="contained">
                        {hasAddress ? 'Guardar cambios' : 'Agregar Dirección'}
                    </Button>
                </DialogActions>
            </Dialog>

            <PublicFooter />

        </ThemeProvider>
    );
};

export default PerfilPage;
