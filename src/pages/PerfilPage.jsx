//pages/PerfilPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Box, Grid, Card, CardContent, Avatar,
    Typography, Button, CssBaseline, Chip, CircularProgress, Alert,
    Divider, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, IconButton,
    Stack, Zoom, MenuItem
} from '@mui/material';
import {
    Email, Badge, Pets, Event, Phone, Home, CameraAlt, Edit, Close,
    CloudUpload, Description, CheckCircle, AccessTime
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
// FUNCIÓN HELPER - Actualización de Usuario
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

    const payload = await response.json();
    const usuario = payload?.usuario || payload?.perfil || payload?.user || payload;
    if (usuario) {
        const direcciones = normalizeDirecciones(usuario);
        return { ...usuario, direcciones };
    }
    return usuario;
};

const apiGetUser = async (userId) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No autenticado.');
    const url = `${VITE_API_URL_BACKEND}/usuarios/${userId}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo obtener el usuario actualizado.');
    const data = await res.json();
    const usuario = data?.usuario_completo || data;
    const direcciones = normalizeDirecciones(usuario);
    return { ...usuario, direcciones };
};
// -------------------------------------------------------------------

// Normaliza y fusiona direcciones aunque el backend devuelva "direccion" singular o venga vacío
const normalizeDirecciones = (user, fallbackAddress = null) => {
    if (!user) return fallbackAddress ? [fallbackAddress] : [];
    const parseNumero = (calleText) => {
        if (!calleText) return { base: calleText || '', ext: '', int: '' };
        // Intenta extraer dígitos al final o con "Int."
        const match = calleText.match(/^(.*?)(\d+)(?:\s*Int\.?\s*([A-Za-z0-9]+))?\s*$/i);
        if (!match) return { base: calleText, ext: '', int: '' };
        const [, base, ext, inter] = match;
        return { base: base.trim(), ext: ext || '', int: inter || '' };
    };

    const list = [];
    if (Array.isArray(user.direcciones) && user.direcciones.length) {
        list.push(...user.direcciones);
    }
    if (user.direccion) list.push(user.direccion);
    const personaAddrKeys = ['calle', 'colonia', 'codigo_postal', 'ciudad', 'estado', 'pais'];
    const hasPersonaFields = personaAddrKeys.some((k) => user?.persona?.[k]);
    if (hasPersonaFields) {
        list.push({
            ...fallbackAddress,
            ...user.persona
        });
    }
    if (!list.length && fallbackAddress) list.push(fallbackAddress);

    return list.map((dir) => {
        if (dir.numero_exterior) return dir;
        const parsed = parseNumero(dir.calle);
        return {
            ...dir,
            calle: parsed.base || dir.calle,
            numero_exterior: parsed.ext || dir.numero_exterior || '',
            numero_interior: parsed.int || dir.numero_interior || ''
        };
    });
};

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

const resolvePersonaFromState = (userData, misAdopciones = []) => {
    if (!userData) return null;
    if (userData.id_persona) return { id_persona: userData.id_persona, persona: userData.persona };
    if (userData.persona?.id_persona) return { id_persona: userData.persona.id_persona, persona: userData.persona };
    const adop = misAdopciones.find((a) => a.id_persona);
    if (adop) return { id_persona: adop.id_persona, persona: userData.persona };
    return null;
};

const resolvePrimaryAddress = (data) => {
    if (!data) return null;
    if (Array.isArray(data.direcciones) && data.direcciones.length) return data.direcciones[0];
    if (data.direccion) return data.direccion;

    const source = data.persona || data;
    const hasFields = ['calle', 'colonia', 'ciudad', 'codigo_postal', 'numero_exterior', 'numero_interior', 'estado', 'pais']
        .some((key) => Boolean(source?.[key]));

    if (!hasFields) return null;

    return {
        calle: source.calle || '',
        numero_exterior: source.numero_exterior || '',
        numero_interior: source.numero_interior || '',
        colonia: source.colonia || '',
        ciudad: source.ciudad || '',
        estado: source.estado || '',
        codigo_postal: source.codigo_postal || '',
        pais: source.pais || 'México'
    };
};

// Helpers de subida multipart (foto/documentos)
const uploadMultipart = async (url, formData) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.mensaje || data.error || data.message || 'Error al subir archivo.');
    }
    return res.json();
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
    const normalizedDirecciones = normalizeDirecciones(userData);
    const primaryAddress = normalizedDirecciones[0] || resolvePrimaryAddress(userData);
    const addressList = normalizedDirecciones;
    const hasAddress = Boolean(primaryAddress);

    const normalizeSpaces = (value) => value.replace(/\s+/g, ' ').trim();
    const onlyDigits = (value) => value.replace(/[^0-9]/g, '');
    const limit = (value, max) => value.slice(0, max);
    const formatDate = (value) => {
        if (!value) return 'N/A';
        const parsed = new Date(value);
        if (Number.isNaN(parsed)) return value;
        return parsed.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    const persistUser = (user) => {
        if (!user) return;
        localStorage.setItem('userData', JSON.stringify(user));
        onProfileUpdate?.(user);
    };

    const formatStatusLabel = (value) => {
        if (!value) return '';
        const map = {
            en_proceso: 'En proceso',
            en_revision: 'En revisión',
            en_progreso: 'En progreso',
            aprobada: 'Aprobada',
            rechazada: 'Rechazada',
            cancelada: 'Cancelada',
            pendiente: 'Pendiente',
            confirmada: 'Confirmada'
        };
        const normalized = value.toString().toLowerCase();
        if (map[normalized]) return map[normalized];
        const cleaned = normalized.replace(/_/g, ' ');
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    };
    const toInputDateTime = (dateValue) => {
        const date = dateValue ? new Date(dateValue) : new Date();
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    };

    // Mascotas del usuario (aprobadas/adoptadas)
    const adoptedMascotas = misAdopciones
        .filter((ad) => {
            const estado = (ad.estado_solicitud || ad.estado || '').toLowerCase();
            return ['aprobada', 'aprobado', 'adoptado', 'en_proceso', 'en proceso', 'confirmada'].includes(estado);
        })
        .map((ad) => ad.mascota)
        .filter(Boolean);
    const hasMascotas = adoptedMascotas.length > 0;

    // Estados para documentos
    const [docUploads, setDocUploads] = useState({ ine: null, acta: null, comprobante: null });
    const [docUploading, setDocUploading] = useState(null);
    const [docRemoving, setDocRemoving] = useState(null);
    const [docPreviews, setDocPreviews] = useState({ ine: null, acta: null, comprobante: null });
    const docEndpoints = {
        ine: { tipo_documento: 'ine' },
        acta: { tipo_documento: 'acnac' },
        comprobante: { tipo_documento: 'comdom' }
    };

    const refreshUser = async (userId, fallbackUser = null) => {
        try {
            const fresh = await apiGetUser(userId);
            const merged = mergeUserData(fallbackUser || userData, fresh);
            setUserData(merged);
            persistUser(merged);
        } catch (err) {
            console.warn('[refreshUser] no se pudo refrescar usuario:', err);
        }
    };

    // Estado para agendar cita desde perfil
    const [openBookCita, setOpenBookCita] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        fecha_cita: '',
        motivo: '',
        observaciones: '',
        id_servicio: '',
        id_mascota: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [serviciosLoading, setServiciosLoading] = useState(false);
    const filteredServicios = servicios.filter((srv) => {
        if (hasMascotas) return true;
        const nombre = (srv?.nombre || '').toLowerCase();
        return nombre.includes('adop') && !nombre.includes('seguimiento');
    });
    const [openReschedule, setOpenReschedule] = useState(false);
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleError, setRescheduleError] = useState(null);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    // Ref para el input de foto
    const photoInputRef = useRef(null);
    const docInputRefs = useRef({ ine: null, acta: null, comprobante: null });

    // 🔥 CAMBIO: useEffect simplificado - Solo carga inicial
    useEffect(() => {
        if (currentUser) {
            const stored = (() => {
                try {
                    return JSON.parse(localStorage.getItem('userData') || 'null');
                } catch {
                    return null;
                }
            })();
            const mergedUser = stored ? mergeUserData(currentUser, stored) : currentUser;

            setUserData(mergedUser);

            setEditedUser({
                nombre: mergedUser.nombre || '',
                telefono: mergedUser.telefono || '',
                fecha_nacimiento: mergedUser.fecha_nacimiento ? mergedUser.fecha_nacimiento.split('T')[0] : ''
            });

            fetchUserData(currentUser.id_usuario);
        } else {
            setUserData(null);
            setMisCitas([]);
            setMisAdopciones([]);
            setLoading(false);
        }
    }, [currentUser?.id_usuario]); // Solo reacciona al cambio de ID


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
                const normalized = { ...usuarioActualizado, direcciones: normalizeDirecciones(usuarioActualizado) };
                const mergedUser = mergeUserData(userData, normalized);

                setUserData(mergedUser);
                persistUser(mergedUser);
                await refreshUser(userData.id_usuario, mergedUser);

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
            const normalized = { ...usuarioActualizado, direcciones: normalizeDirecciones(usuarioActualizado) };

            // 🔥 Fusiona para no perder rol/direcciones cuando el backend responde parcial
            const mergedUser = mergeUserData(userData, normalized);

            // 🔥 Actualiza el estado local y almacenamiento
            setUserData(mergedUser);
            persistUser(mergedUser);

            setSuccessMessage('Perfil actualizado correctamente');
            setOpenEditProfile(false);

            await refreshUser(userData.id_usuario, mergedUser);

        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            setError(err.message);
        }
    };

    const handleOpenAddressModal = () => {
        const dir = primaryAddress;

        if (dir) {
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
        { key: 'ine', label: 'INE', helper: 'Imagen (JPG, PNG)', field: 'url_ine' },
        { key: 'acta', label: 'Acta de nacimiento', helper: 'Imagen (JPG, PNG)', field: 'url_acta' },
        { key: 'comprobante', label: 'Comprobante de domicilio', helper: 'Imagen (JPG, PNG)', field: 'url_comprobante' }
    ];

    // Prepara las previsualizaciones cuando el usuario ya tiene documentos guardados (p. ej., tras login)
    useEffect(() => {
        if (!userData) {
            setDocPreviews({ ine: null, acta: null, comprobante: null });
            return;
        }
        const nextPreviews = {};
        documentTypes.forEach(({ key, field }) => {
            const val = userData[field];
            if (val) {
                nextPreviews[key] = asDataUrlImage(val);
            }
        });
        if (Object.keys(nextPreviews).length) {
            setDocPreviews((prev) => ({ ...prev, ...nextPreviews }));
        }
    }, [userData]);

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
        const field = documentTypes.find((d) => d.key === type)?.field;
        if (!field) {
            setError('Tipo de documento no reconocido.');
            return;
        }

        setDocUploading(type);
        setError(null);
        setSuccessMessage(null);

        try {
            const endpoint = docEndpoints[type];
            if (!endpoint) throw new Error('Tipo de documento no reconocido.');

            const { dataUrl, base64 } = await readFileAsBase64(file);
            const mime = file.type || 'image/jpeg';

            const payload = {
                id_usuario: userData?.id_usuario,
                tipo_documento: endpoint.tipo_documento,
                archivo_base64: base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`
            };

            const res = await fetch(`${VITE_API_URL_BACKEND}/personas/subir-documento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.mensaje || data.error || data.message || `No se pudo subir el documento (status ${res.status}).`);
            }

            const data = await res.json().catch(() => ({}));
            const urlDocumento =
                data?.documento?.archivo_url ||
                data?.documento?.archivo_base64 ||
                payload.archivo_base64 ||
                dataUrl;

            const patchedUser = { ...userData, [field]: urlDocumento };

            setUserData(patchedUser);
            persistUser(patchedUser);

            // Limpiar input y file seleccionado
            setDocUploads((prev) => ({ ...prev, [type]: null }));
            setDocPreviews((prev) => ({
                ...prev,
                [type]: asDataUrlImage(urlDocumento) || dataUrl
            }));
            if (docInputRefs.current[type]) {
                docInputRefs.current[type].value = '';
            }
            setSuccessMessage('Documento guardado correctamente.');
        } catch (err) {
            console.error('Error al subir documento:', err);
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
            const patchedUser = { ...userData, [field]: null };
            setUserData(patchedUser);
            localStorage.setItem('userData', JSON.stringify(patchedUser));
            onProfileUpdate?.(patchedUser);

            setDocUploads((prev) => ({ ...prev, [type]: null }));
            setDocPreviews((prev) => ({ ...prev, [type]: null }));
            if (docInputRefs.current[type]) {
                docInputRefs.current[type].value = '';
            }
            setSuccessMessage('Documento eliminado localmente.');
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

            // La BD no tiene columnas de número; lo concatenamos en la calle para no perderlo
            const calleConNumero = `${newAddress.calle} ${newAddress.numero_exterior || ''}${newAddress.numero_interior ? ' Int. ' + newAddress.numero_interior : ''}`.trim();

            const addressPayload = {
                calle: calleConNumero,
                colonia: newAddress.colonia,
                codigo_postal: newAddress.codigo_postal,
                ciudad: newAddress.ciudad,
                estado: newAddress.estado,
                pais: newAddress.pais,
                tipo_direccion: 'domicilio',
                es_principal: true
            };

            const response = await apiUpdateUser(userData.id_usuario, addressPayload);
            const usuarioActualizado = response.usuario || response.perfil || response;

            // Tomamos direcciones directamente de la respuesta; si no viene, usamos la capturada
            const backendDirecciones = normalizeDirecciones(usuarioActualizado, newAddress);
            const updatedDirecciones = backendDirecciones.length ? backendDirecciones : [newAddress];

            const patchedUser = {
                ...mergeUserData(userData, usuarioActualizado),
                direcciones: updatedDirecciones
            };

            // 🔥 Actualiza el estado local
            setUserData(patchedUser);
            persistUser(patchedUser);

            await refreshUser(userData.id_usuario, patchedUser);
            await refreshUser(userData.id_usuario, patchedUser);

            setSuccessMessage('Dirección actualizada correctamente');
            setOpenAddAddress(false);
            setNewAddress(initialAddressState);

        } catch (err) {
            console.error('Error al agregar dirección:', err);
            setError(err.message);
        }
    };

    const fetchServicios = async () => {
        if (serviciosLoading || servicios.length) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            setServiciosLoading(true);
            const res = await fetch(`${VITE_API_URL_BACKEND}/servicios/listar`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServicios(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error al cargar servicios', err);
        } finally {
            setServiciosLoading(false);
        }
    };

    const handleSubmitCita = async () => {
        setBookingError(null);
        setSuccessMessage(null);
        if (!bookingForm.fecha_cita || !bookingForm.motivo) {
            setBookingError('Completa fecha y motivo de la cita.');
            return;
        }
        const selectedDate = new Date(bookingForm.fecha_cita);
        const now = new Date();
        if (selectedDate < new Date(now.getTime() - 60000)) {
            setBookingError('No puedes seleccionar una fecha anterior a hoy.');
            return;
        }
        const hour = selectedDate.getHours();
        if (hour < 10 || hour >= 18) {
            setBookingError('El horario de atención es de 10:00 a 18:00.');
            return;
        }
        if (!bookingForm.id_servicio) {
            setBookingError('Selecciona un servicio para la cita.');
            return;
        }
        if (hasMascotas && !bookingForm.id_mascota) {
            setBookingError('Selecciona una mascota para este servicio.');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setBookingError('Necesitas iniciar sesión para agendar.');
            return;
        }
        setBookingLoading(true);
        try {
            const payload = {
                id_usuario: userData.id_usuario,
                fecha_cita: bookingForm.fecha_cita,
                motivo: bookingForm.motivo,
                observaciones: bookingForm.observaciones || undefined,
                id_servicio: bookingForm.id_servicio || undefined,
                id_mascota: bookingForm.id_mascota || undefined,
                estado_cita: 'programada'
            };
            Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
            const res = await fetch(`${VITE_API_URL_BACKEND}/citas/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || 'No se pudo agendar la cita.');
            }
            setSuccessMessage('Cita agendada correctamente.');
            setOpenBookCita(false);
            setBookingForm({ fecha_cita: '', motivo: '', observaciones: '', id_servicio: '', id_mascota: '' });
            fetchUserData(userData.id_usuario);
        } catch (err) {
            console.error('Error al agendar cita:', err);
            setBookingError(err.message || 'No se pudo agendar la cita.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleOpenReschedule = (cita) => {
        setRescheduleTarget(cita);
        setRescheduleDate(toInputDateTime(cita.fecha_hora || cita.fecha_cita));
        setRescheduleError(null);
        setOpenReschedule(true);
    };

    const handleSubmitReschedule = async () => {
        if (!rescheduleTarget) return;
        setRescheduleError(null);
        setSuccessMessage(null);

        if (!rescheduleDate) {
            setRescheduleError('Selecciona fecha y hora.');
            return;
        }

        const selectedDate = new Date(rescheduleDate);
        const now = new Date();
        if (selectedDate < new Date(now.getTime() - 60000)) {
            setRescheduleError('No puedes seleccionar una fecha anterior a hoy.');
            return;
        }

        const hour = selectedDate.getHours();
        if (hour < 10 || hour >= 18) {
            setRescheduleError('El horario de atención es de 10:00 a 18:00.');
            return;
        }

        const getCitaService = (c) => c?.id_servicio || c?.servicio?.id_servicio || null;
        const targetService = getCitaService(rescheduleTarget);
        if (targetService) {
            const conflict = misCitas.some((c) => {
                if (c.id_cita === rescheduleTarget.id_cita) return false;
                const cs = getCitaService(c);
                if (cs !== targetService) return false;
                const cDate = new Date(c.fecha_hora || c.fecha_cita || '');
                return cDate.getTime() === selectedDate.getTime();
            });
            if (conflict) {
                setRescheduleError('Ya tienes una cita de ese servicio en la misma fecha y hora.');
                return;
            }
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setRescheduleError('Necesitas iniciar sesión para reagendar.');
            return;
        }

        setRescheduleLoading(true);
        try {
            const payload = {
                fecha_cita: selectedDate.toISOString(),
                estado_cita: 'programada'
            };
            const res = await fetch(`${VITE_API_URL_BACKEND}/citas/actualizar-fecha/${rescheduleTarget.id_cita}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || 'No se pudo reagendar la cita.');
            }

            const updated = misCitas.map((c) =>
                c.id_cita === rescheduleTarget.id_cita
                    ? { ...c, fecha_hora: payload.fecha_cita, fecha_cita: payload.fecha_cita }
                    : c
            );
            setMisCitas(updated);
            setSuccessMessage('Cita reagendada correctamente.');
            setOpenReschedule(false);
            setRescheduleTarget(null);
            setRescheduleDate('');
        } catch (err) {
            console.error('Error al reagendar cita:', err);
            setRescheduleError(err.message || 'No se pudo reagendar la cita.');
        } finally {
            setRescheduleLoading(false);
        }
    };

    const verificationRaw = (userData?.documentacion_verificada
        || userData?.estado_documentacion
        || userData?.persona?.documentacion_verificada
        || '').toString().toLowerCase();

    const verificationStatus = (() => {
        if (['verificada', 'verificado', 'aprobada', 'aprobado', 'validada', 'validado', 'confirmada'].includes(verificationRaw)) {
            return {
                value: 'Verificado',
                description: 'Documentación revisada',
                icon: CheckCircle,
                color: 'success.main',
                bg: '#e6f4ea'
            };
        }
        if (['rechazada', 'rechazado', 'denegada', 'denegado'].includes(verificationRaw)) {
            return {
                value: 'Rechazada',
                description: 'Revisa tus documentos',
                icon: Close,
                color: 'error.main',
                bg: '#ffecec'
            };
        }
        return {
            value: 'En revisión',
            description: 'Proceso de verificación',
            icon: AccessTime,
            color: 'warning.main',
            bg: '#fff7e6'
        };
    })();

    const statBlocks = [
        {
            key: 'verificado',
            label: 'Estado de perfil',
            ...verificationStatus
        },
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
        }
    ];

    // -------------------------------------------------------------------
    // RENDERIZADO (JSX)
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

    const profilePhotoSrc = photoPreview || asDataUrlImage(userData?.foto_perfil_base64 || userData?.url_foto_perfil);

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
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                                gridTemplateColumns: {
                                    xs: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    sm: 'repeat(2, minmax(260px, 1fr))',
                                    md: 'repeat(2, minmax(300px, 1fr))',
                                    lg: 'repeat(3, minmax(320px, 1fr))'
                                },
                                gap: 2.4,
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
                        <Stack spacing={{ xs: 3, md: 3.5 }}>

                            {/* Tarjeta de Perfil */}
                            <Card sx={{ ...cardBaseSx, height: '100%' }}>
                                <CardContent sx={{ ...sectionContentSx, textAlign: 'center', height: '100%', p: 3 }}>
                                    <Stack spacing={2.5} sx={{ height: '100%' }}>
                                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                                            <Typography sx={mutedLabelSx}>Perfil</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                Mi Perfil
                                            </Typography>
                                        </Box>
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
                                                    src={profilePhotoSrc || undefined}
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
                                                    {!profilePhotoSrc && userData.nombre?.charAt(0).toUpperCase()}
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
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 800,
                                                        letterSpacing: '-0.01em',
                                                        textAlign: 'center',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        wordBreak: 'break-word',
                                                        minHeight: '3.2rem'
                                                    }}
                                                    title={userData.nombre}
                                                >
                                                    {userData.nombre}
                                                </Typography>
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
                                                            <Typography variant="body2" color="text.secondary">Fecha de nacimiento</Typography>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, ...ellipsisText }}>
                                                                {formatDate(userData.fecha_nacimiento)}
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

                            {/* Ubicaciones */}
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

                                    {addressList.length === 0 ? (
                                        <Alert severity="info" sx={{ mb: 1 }}>No tienes direcciones registradas.</Alert>
                                    ) : (
                                        <Stack spacing={1.2}>
                                            {addressList.map((dir, index) => (
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
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    ...ellipsisText,
                                                                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                                                    wordBreak: 'break-word'
                                                                }}
                                                            >
                                                                {`${dir.calle} ${dir.numero_exterior}${dir.numero_interior ? ' Int. ' + dir.numero_interior : ''}`}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    ...ellipsisText,
                                                                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                                                    wordBreak: 'break-word'
                                                                }}
                                                            >
                                                                {`${dir.colonia}, ${dir.ciudad}, ${dir.estado} - CP ${dir.codigo_postal}`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Citas */}
                            <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                        <Box>
                                            <Typography sx={mutedLabelSx}>Agenda</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Mis Citas</Typography>
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    sx={{ fontWeight: 700, boxShadow: 'none' }}
                                                    onClick={() => {
                                                        setBookingError(null);
                                                        setOpenBookCita(true);
                                                        setBookingForm({ fecha_cita: '', motivo: '', observaciones: '', id_servicio: '', id_mascota: '' });
                                                        fetchServicios();
                                                    }}
                                                >
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
                                                                    {`Fecha: ${new Date(cita.fecha_hora || cita.fecha_cita).toLocaleDateString()} · ${new Date(cita.fecha_hora || cita.fecha_cita).toLocaleTimeString()} `}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>

                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                                        {formatStatusLabel(cita.estado)}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleOpenReschedule(cita)}
                                                    >
                                                        Reagendar
                                                    </Button>
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

                            {/* Adopciones */}
                            <Card sx={{ ...cardBaseSx, background: '#ffffff' }}>
                                <CardContent sx={{ ...sectionContentSx, p: 3 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
                                        <Box>
                                            <Typography sx={mutedLabelSx}>Adopciones</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Mis Solicitudes</Typography>
                                        </Box>
                                        <Button variant="contained" component={Link} to="/mascotas" sx={{ fontWeight: 700, boxShadow: 'none' }} >
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
                                                            label={formatStatusLabel(adopcion.estado)}
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
                            {/* Documentos oficiales */}
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
                                                : hasDoc
                                                    ? 'Documento cargado'
                                                    : 'Sin documento';
                                            const statusColor = pendingFile ? 'warning' : hasDoc ? 'success' : 'default';
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
                                                            sx={{ mt: { xs: 1, sm: 0 }, maxHeight: 120, maxWidth: '100%', borderRadius: 1.5, border: '1px solid #edf0f5' }}
                                                        />
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
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
                            src={profilePhotoSrc || undefined}
                            sx={{ width: 150, height: 150, mx: 'auto', mb: 3 }}
                        >
                            {!profilePhotoSrc && userData?.nombre?.charAt(0).toUpperCase()}
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

            {/* Modal: Agendar Cita */}
            <Dialog open={openBookCita} onClose={() => setOpenBookCita(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Agendar nueva cita
                    <IconButton onClick={() => setOpenBookCita(false)} sx={{ position: 'absolute', right: 8, top: 8 }} >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Fecha y hora"
                            type="datetime-local"
                            value={bookingForm.fecha_cita}
                            onChange={(e) => setBookingForm({ ...bookingForm, fecha_cita: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                            inputProps={{ min: toInputDateTime(new Date()) }}
                        />
                        <TextField
                            label="Motivo"
                            value={bookingForm.motivo}
                            onChange={(e) => setBookingForm({ ...bookingForm, motivo: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Mascota"
                            select
                            value={bookingForm.id_mascota}
                            onChange={(e) => setBookingForm({ ...bookingForm, id_mascota: e.target.value })}
                            fullWidth
                            required={hasMascotas}
                            disabled={!hasMascotas || adoptedMascotas.length === 0}
                            helperText={hasMascotas ? 'Selecciona tu mascota para la cita' : 'Aún no tienes mascotas adoptadas'}
                        >
                            <MenuItem value="">Selecciona una mascota</MenuItem>
                            {adoptedMascotas.map((m) => (
                                <MenuItem key={m.id_mascota || m.id} value={m.id_mascota || m.id}>
                                    {m.nombre || 'Mascota'}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Observaciones"
                            value={bookingForm.observaciones}
                            onChange={(e) => setBookingForm({ ...bookingForm, observaciones: e.target.value })}
                            fullWidth
                            multiline
                            minRows={2}
                        />
                        <TextField
                            label="Servicio"
                            select
                            value={bookingForm.id_servicio}
                            onChange={(e) => setBookingForm({ ...bookingForm, id_servicio: e.target.value })}
                            fullWidth
                            disabled={serviciosLoading}
                            required
                            helperText={
                                hasMascotas
                                    ? 'Selecciona el servicio'
                                    : filteredServicios.length
                                        ? 'Solo servicios relacionados con adopción'
                                        : 'Agrega una mascota adoptada para ver más servicios'
                            }
                        >
                            <MenuItem value="">Sin seleccionar</MenuItem>
                            {filteredServicios.map((srv) => (
                                <MenuItem key={srv.id_servicio || srv.id} value={srv.id_servicio || srv.id}>
                                    {srv.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                        {bookingError && (
                            <Alert severity="error" onClose={() => setBookingError(null)}>
                                {bookingError}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBookCita(false)} disabled={bookingLoading}>Cancelar</Button>
                    <Button
                        onClick={handleSubmitCita}
                        variant="contained"
                        disabled={bookingLoading}
                        startIcon={bookingLoading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Agendar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Reagendar Cita */}
            <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Reagendar cita
                    <IconButton onClick={() => setOpenReschedule(false)} sx={{ position: 'absolute', right: 8, top: 8 }} >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Nueva fecha y hora"
                            type="datetime-local"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            inputProps={{ min: toInputDateTime(new Date()) }}
                        />
                        {rescheduleTarget?.servicio?.nombre && (
                            <Alert severity="info">Servicio: {rescheduleTarget.servicio.nombre}</Alert>
                        )}
                        {rescheduleError && (
                            <Alert severity="error" onClose={() => setRescheduleError(null)}>
                                {rescheduleError}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReschedule(false)} disabled={rescheduleLoading}>Cancelar</Button>
                    <Button
                        onClick={handleSubmitReschedule}
                        variant="contained"
                        disabled={rescheduleLoading}
                        startIcon={rescheduleLoading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <PublicFooter />

        </ThemeProvider>
    );
};

export default PerfilPage;
