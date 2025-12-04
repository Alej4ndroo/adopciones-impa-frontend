// src/components/admin/ClientesListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert, Chip,
    IconButton, useTheme, Button, Stack, alpha, Avatar,
    Collapse, TextField, InputAdornment, Grid, Card,
    useMediaQuery, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Link
} from '@mui/material';
import {
    Person as PersonIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowUp as ArrowUpIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
    Badge as BadgeIcon,
    CalendarToday as CalendarIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { sanitizeBase64Image } from '../../utils/base64';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CLIENTES_ENDPOINT = '/usuarios/listar-clientes';

// --- Componente de tarjeta para móviles ---
const MobileClientCard = ({ cliente, onDelete, onEdit }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const fullAddress = cliente.direccion?.calle
        ? `${cliente.direccion.calle || ''} ${cliente.direccion.numero_exterior || ''}, ${cliente.direccion.colonia || ''}, ${cliente.direccion.ciudad || ''}, ${cliente.direccion.estado || ''}, C.P. ${cliente.direccion.codigo_postal || ''}`.trim()
        : 'Dirección no registrada';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(cliente);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        const nextState = !cliente.activo;
        onDelete(cliente.id_usuario, nextState);
    };

    const fotoSrc = sanitizeBase64Image(cliente.foto_perfil_base64) || undefined;

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: open ? `2px solid #1976d2` : '2px solid transparent'
            }}
        >
            {/* Header de la tarjeta - clickeable */}
            <Box
                onClick={() => setOpen(!open)}
                sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: open ? alpha('#1976d2', 0.05) : 'white',
                    '&:active': {
                        bgcolor: alpha('#1976d2', 0.1)
                    }
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={fotoSrc}
                        sx={{
                            bgcolor: cliente.activo ? '#1976d2' : theme.palette.grey[400],
                            width: 56,
                            height: 56,
                            fontSize: 20,
                            fontWeight: 700,
                            border: `3px solid ${cliente.activo ? '#1976d2' : theme.palette.grey[400]}`
                        }}
                    >
                        {!cliente.foto_perfil_base64 && cliente.nombre?.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                                {cliente.nombre}
                            </Typography>
                            <Chip
                                label={cliente.activo ? 'Activo' : 'Inactivo'}
                                size="small"
                                color={cliente.activo ? 'success' : 'default'}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Cliente #{cliente.id_usuario}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {cliente.correo_electronico}
                        </Typography>
                    </Box>

                    <IconButton
                        sx={{
                            color: '#1976d2',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }}
                    >
                        <ArrowDownIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* Contenido expandible */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, bgcolor: alpha('#1976d2', 0.02) }}>
                    {/* Información de contacto */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha('#1976d2', 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#1976d2" sx={{ mb: 1.5 }}>
                            Información de Contacto
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body2" fontWeight={500}>{cliente.correo_electronico}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                    <Typography variant="body2" fontWeight={500}>{cliente.telefono || 'No registrado'}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Dirección</Typography>
                                    <Typography variant="body2" fontWeight={500}>{fullAddress}</Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Card>

                    {/* Información adicional */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha('#0d47a1', 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#0d47a1" sx={{ mb: 1.5 }}>
                            Información del Cliente
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ID de Cliente</Typography>
                                <Typography variant="body2" fontWeight={500}>#{cliente.id_usuario}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Fecha de Registro</Typography>
                                <Typography variant="body2" fontWeight={500}>{formatDate(cliente.fecha_creacion)}</Typography>
                            </Box>
                        </Stack>
                    </Card>

                    {/* Botones de acción */}
                    <Stack spacing={1.5}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                            sx={{
                                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                                fontWeight: 600
                            }}
                        >
                            Editar Cliente
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            color={cliente.activo ? 'error' : 'success'}
                            onClick={handleDelete}
                            sx={{ fontWeight: 600 }}
                        >
                            {cliente.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDocs && onViewDocs(cliente);
                            }}
                            sx={{ fontWeight: 600 }}
                        >
                            Ver documentación
                        </Button>
                    </Stack>
                </Box>
            </Collapse>
        </Card>
    );
};

// --- Componente de fila expandible ---
const ClientRow = ({ cliente, onDelete, onEdit, onViewDocs }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const fullAddress = cliente.direccion?.calle
        ? `${cliente.direccion.calle || ''} ${cliente.direccion.numero_exterior || ''}, ${cliente.direccion.colonia || ''}, ${cliente.direccion.ciudad || ''}, ${cliente.direccion.estado || ''}, C.P. ${cliente.direccion.codigo_postal || ''}`.trim()
        : 'Dirección no registrada';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(cliente);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        const nextState = !cliente.activo;
        onDelete(cliente.id_usuario, nextState);
    };

        const getVerificationInfo = () => {
            const raw = cliente.documentos_verificados ?? cliente.verificado ?? cliente.documentacion_verificada ?? cliente.estado_verificacion;
            const normalized = typeof raw === 'string' ? raw.toLowerCase() : raw;

        if (normalized === true || normalized === 'verificado' || normalized === 'verificada' || normalized === 'aprobado') {
            return { label: 'Verificado', color: 'success' };
        }

        return { label: 'En revisión', color: 'warning' };
    };

    const verification = getVerificationInfo();

    const toggleRow = () => {
        setOpen(!open);
    };

    const fotoSrc = sanitizeBase64Image(cliente.foto_perfil_base64) || undefined;

    return (
        <>
            <TableRow
                hover
                onClick={toggleRow}
                sx={{
                    cursor: 'pointer',
                    bgcolor: open ? alpha('#1976d2', 0.05) : 'transparent',
                    '&:hover': {
                        bgcolor: alpha('#1976d2', 0.08)
                    },
                    transition: 'all 0.2s ease'
                }}
            >
                <TableCell sx={{ width: 50 }}>
                    <IconButton
                        size="small"
                        sx={{
                            color: '#1976d2',
                            pointerEvents: 'none'
                        }}
                    >
                        {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Chip
                        label={`#${cliente.id_usuario}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: alpha('#1976d2', 0.1),
                            color: '#1976d2'
                        }}
                    />
                </TableCell>
                <TableCell sx={{ width: 60 }}>
                    <Avatar
                        src={fotoSrc}
                        sx={{
                            bgcolor: cliente.activo ? '#1976d2' : theme.palette.grey[400],
                            width: 45,
                            height: 45,
                            fontSize: 18,
                            fontWeight: 700,
                            border: `2px solid ${cliente.activo ? '#1976d2' : theme.palette.grey[400]}`
                        }}
                    >
                        {!cliente.foto_perfil_base64 && cliente.nombre?.charAt(0).toUpperCase()}
                    </Avatar>
                </TableCell>
                <TableCell>
                    <Typography fontWeight={600} sx={{ color: '#333' }}>
                        {cliente.nombre}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {cliente.correo_electronico}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {cliente.telefono || 'No registrado'}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    <Stack spacing={0.5} alignItems="center">
                        <Chip
                            label={cliente.activo ? 'Activo' : 'Inactivo'}
                            size="small"
                            color={cliente.activo ? 'success' : 'default'}
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={verification.label}
                            size="small"
                            color={verification.color}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Fila expandible con información detallada */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            py: { xs: 2, md: 3 }, 
                            px: { xs: 1, md: 2 },
                            bgcolor: alpha('#1976d2', 0.02),
                            borderRadius: 2,
                            my: 1
                        }}>
                            <Grid container spacing={{ xs: 2, md: 3 }}>
                                {/* Información de Contacto */}
                                <Grid item xs={12} md={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            height: '100%',
                                            border: `1px solid ${alpha('#1976d2', 0.2)}`,
                                            borderRadius: 2
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 4,
                                                    height: 20,
                                                    borderRadius: 2,
                                                    bgcolor: '#1976d2'
                                                }}
                                            />
                                            <Typography variant="h6" fontWeight={600} sx={{ color: '#1976d2' }}>
                                                Información de Contacto
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha('#1976d2', 0.1),
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <EmailIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {cliente.correo_electronico}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha('#1976d2', 0.1),
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <PhoneIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Teléfono
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {cliente.telefono || 'No registrado'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha('#1976d2', 0.1),
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <LocationOnIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Dirección
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {fullAddress}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Información del Cliente */}
                                <Grid item xs={12} md={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            height: '100%',
                                            border: `1px solid ${alpha('#0d47a1', 0.2)}`,
                                            borderRadius: 2
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 4,
                                                    height: 20,
                                                    borderRadius: 2,
                                                    bgcolor: '#0d47a1'
                                                }}
                                            />
                                            <Typography variant="h6" fontWeight={600} sx={{ color: '#0d47a1' }}>
                                                Información del Cliente
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha('#0d47a1', 0.1),
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <BadgeIcon sx={{ fontSize: 18, color: '#0d47a1' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID de Cliente
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        #{cliente.id_usuario}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha('#0d47a1', 0.1),
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <CalendarIcon sx={{ fontSize: 18, color: '#0d47a1' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fecha de Registro
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {formatDate(cliente.fecha_creacion)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Grid>

                                {/* Botones de Acción */}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack 
                                        direction={{ xs: 'column', sm: 'row' }} 
                                        spacing={2} 
                                        justifyContent="flex-end" 
                                        sx={{ mt: 2 }}
                                    >
                                        <Button
                                            fullWidth={{ xs: true, sm: false }}
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDocs && onViewDocs(cliente);
                                            }}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3
                                            }}
                                        >
                                            Ver documentación
                                        </Button>
                                        <Button
                                            fullWidth={{ xs: true, sm: false }}
                                            variant="outlined"
                                            startIcon={<DeleteIcon />}
                                            color={cliente.activo ? 'error' : 'success'}
                                            onClick={handleDelete}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3
                                            }}
                                        >
                                            {cliente.activo ? 'Desactivar' : 'Activar'}
                                        </Button>
                                        <Button
                                            fullWidth={{ xs: true, sm: false }}
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={handleEdit}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3,
                                                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                                                boxShadow: theme.shadows[4],
                                                '&:hover': {
                                                    boxShadow: theme.shadows[8],
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Editar Cliente
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// --------------------------------------------------------------------------

const ClientesListarPage = ({ isManagementView = false }) => {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ activo: '', docs: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [docsDialogOpen, setDocsDialogOpen] = useState(false);
    const [docsCliente, setDocsCliente] = useState(null);
    const [docsList, setDocsList] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [docsNotifyLoading, setDocsNotifyLoading] = useState(false);
    const handleFilterChange = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));
    const [editForm, setEditForm] = useState({
        nombre: '',
        correo_electronico: '',
        telefono: '',
        calle: '',
        colonia: '',
        codigo_postal: '',
        ciudad: '',
        estado: '',
        pais: ''
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchClientes = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${CLIENTES_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedClientes = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.clientes)
                    ? response.data.clientes
                    : [];

            if (!receivedClientes.length) {
                setError("No se encontraron clientes en el sistema.");
            }

            setClientes(receivedClientes);
            setFilteredClientes(receivedClientes);
        } catch (err) {
            if (err.response) {
                setError(
                    err.response.status === 401 || err.response.status === 403
                        ? "Acceso denegado. No tienes permisos para ver esta lista."
                        : `Error del servidor (${err.response.status}).`
                );
            } else {
                setError("Error de red. Asegúrate de que el backend esté corriendo y accesible.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchClientes(); 
    }, []);

    useEffect(() => {
        if (error) {
            setSuccessMessage(null);
        }
    }, [error]);

    // Filtro de búsqueda
    useEffect(() => {
        let filtered = clientes;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(cliente => 
                cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.id_usuario?.toString().includes(searchTerm) ||
                cliente.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.activo !== '') {
            filtered = filtered.filter((c) => !!c.activo === (filters.activo === 'true'));
        }

        if (filters.docs !== '') {
            filtered = filtered.filter((c) => {
                const estado = c.documentacion_verificada || c.documentacion;
                if (filters.docs === 'verificada') return estado === 'verificada';
                if (filters.docs === 'pendiente') return estado !== 'verificada';
                return true;
            });
        }

        setFilteredClientes(filtered);
    }, [searchTerm, filters, clientes]);

    const handleDelete = async (idCliente, nextState = false) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }
        const confirm = window.confirm(
            nextState
                ? '¿Deseas activar a este cliente?'
                : '¿Deseas marcar como inactivo a este cliente?'
        );
        if (!confirm) return;

        try {
            await axios.put(
                `${API_URL_BACKEND}/usuarios/actualizar/${idCliente}`,
                { activo: nextState },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setClientes((prev) =>
                prev.map((c) => (c.id_usuario === idCliente ? { ...c, activo: nextState } : c))
            );
            setFilteredClientes((prev) =>
                prev.map((c) => (c.id_usuario === idCliente ? { ...c, activo: nextState } : c))
            );
        } catch (err) {
            console.error('Error al desactivar cliente:', err);
            setError('No se pudo actualizar el estado. Verifica permisos o intenta más tarde.');
        }
    };

    const openEditDialog = (cliente) => {
        const direccion = cliente?.direccion || {};
        setSelectedCliente(cliente);
        setEditForm({
            nombre: cliente.nombre || '',
            correo_electronico: cliente.correo_electronico || '',
            telefono: cliente.telefono || '',
            calle: direccion.calle || '',
            colonia: direccion.colonia || '',
            codigo_postal: direccion.codigo_postal || '',
            ciudad: direccion.ciudad || '',
            estado: direccion.estado || '',
            pais: direccion.pais || ''
        });
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedCliente(null);
    };

    const handleEditChange = (field) => (event) => {
        setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleEditSubmit = async () => {
        if (!selectedCliente) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }

        try {
            setSavingEdit(true);
            await axios.put(
                `${API_URL_BACKEND}/usuarios/actualizar/${selectedCliente.id_usuario}`,
                { ...editForm },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updater = (list) =>
                list.map((c) => {
                    if (c.id_usuario !== selectedCliente.id_usuario) return c;
                    const direccionActual = c.direccion || {};
                    return {
                        ...c,
                        nombre: editForm.nombre,
                        correo_electronico: editForm.correo_electronico,
                        telefono: editForm.telefono,
                        direccion: {
                            ...direccionActual,
                            calle: editForm.calle,
                            colonia: editForm.colonia,
                            codigo_postal: editForm.codigo_postal,
                            ciudad: editForm.ciudad,
                            estado: editForm.estado,
                            pais: editForm.pais
                        }
                    };
                });

            setClientes(updater);
            setFilteredClientes(updater);
            closeEditDialog();
        } catch (err) {
            console.error('Error al actualizar cliente:', err);
            setError('No se pudo actualizar el cliente. Intenta nuevamente.');
        } finally {
            setSavingEdit(false);
        }
    };

    const guessMimeFromBase64 = (value) => {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (trimmed.startsWith('data:')) {
            const mime = trimmed.slice(5).split(';')[0];
            return mime || null;
        }
        if (trimmed.startsWith('/9j/')) return 'image/jpeg'; // jpg
        if (trimmed.startsWith('iVBORw0KGgo')) return 'image/png'; // png
        if (trimmed.startsWith('JVBER')) return 'application/pdf'; // pdf
        return 'application/octet-stream';
    };

    const asDataUrl = (value) => {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (trimmed.startsWith('data:')) return trimmed;
        const mime = guessMimeFromBase64(trimmed) || 'application/octet-stream';
        // Si ya viene en base64 sin prefijo, añadimos data URL
        return `data:${mime};base64,${trimmed}`;
    };

    const buildDocsList = (cliente) => {
        const docs = [];
        const posibles = [
            { key: 'identificacion_frontal', label: 'Identificación (frente)' },
            { key: 'identificacion_reverso', label: 'Identificación (reverso)' },
            { key: 'comprobante_domicilio', label: 'Comprobante de domicilio' },
            { key: 'url_ine', label: 'INE' },
            { key: 'url_acta', label: 'Acta de Nacimiento' },
            { key: 'url_comprobante', label: 'Comprobante de domicilio' },
            { key: 'documento1', label: 'Documento 1' },
            { key: 'documento2', label: 'Documento 2' },
            { key: 'documento3', label: 'Documento 3' },
        ];

        const fromColeccion = Array.isArray(cliente.documentos) ? cliente.documentos : [];
        fromColeccion.forEach((doc, idx) => {
            if (doc?.archivo_base64 || doc?.url) {
                docs.push({
                    label: doc.nombre || `Documento ${idx + 1}`,
                    url: doc.url || asDataUrl(doc.archivo_base64)
                });
            }
        });

        posibles.forEach(({ key, label }) => {
            const valor = cliente[key];
            if (valor) {
                const url = typeof valor === 'string' && valor.startsWith('http')
                    ? valor
                    : asDataUrl(valor);
                docs.push({ label, url });
            }
        });

        return docs.slice(0, 3);
    };

    const openDocsDialog = async (cliente) => {
        setDocsDialogOpen(true);
        setDocsCliente(cliente);
        setDocsLoading(true);

        const token = localStorage.getItem('authToken');
        const fallbackDocs = buildDocsList(cliente);

        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            setDocsList(fallbackDocs);
            setDocsLoading(false);
            return;
        }

        try {
            const detail = await axios.get(`${API_URL_BACKEND}/usuarios/${cliente.id_usuario}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = detail.data || {};
            setDocsList(buildDocsList({ ...cliente, ...data }));
        } catch (err) {
            console.error('Error al obtener documentos del cliente:', err);
            setError('No se pudieron cargar los documentos del cliente.');
            setDocsList(fallbackDocs);
        } finally {
            setDocsLoading(false);
        }
    };

    const closeDocsDialog = () => {
        setDocsDialogOpen(false);
        setDocsCliente(null);
        setDocsList([]);
        setDocsLoading(false);
        setDocsNotifyLoading(false);
    };

    const handleMarkDocsVerified = async () => {
        if (!docsCliente) return;
        const confirm = window.confirm(`¿Seguro que quieres verificar a ${docsCliente.nombre || 'este cliente'}?`);
        if (!confirm) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }
        try {
            await axios.put(
                `${API_URL_BACKEND}/usuarios/actualizar/${docsCliente.id_usuario}`,
                {
                    documentacion_verificada: 'verificada',
                    activo: docsCliente.activo
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updater = (list) =>
                list.map((c) =>
                    c.id_usuario === docsCliente.id_usuario
                        ? { ...c, documentacion_verificada: 'verificada' }
                        : c
                );
            setClientes(updater);
            setFilteredClientes(updater);
            closeDocsDialog();
            setError(null);
            setSuccessMessage('Documentación marcada como verificada.');
        } catch (err) {
            console.error('Error al marcar documentos verificados:', err);
            setError('No se pudo marcar la documentación como verificada.');
        }
    };

    const handleNotifyDocsIssue = async () => {
        if (!docsCliente) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }
        const confirm = window.confirm(`¿Enviar una notificación a ${docsCliente.nombre || 'este cliente'} para que revise sus documentos?`);
        if (!confirm) return;
        try {
            setDocsNotifyLoading(true);
            setError(null);
            setSuccessMessage(null);
            const response = await fetch(`${API_URL_BACKEND}/notificaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_usuario: docsCliente.id_usuario,
                    tipo_notificacion: 'documento_rechazado',
                    titulo: 'Actualiza tu documentación',
                    mensaje: 'Favor de verificar que su documentación esté vigente y correcta.'
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.mensaje || data.error || 'No se pudo enviar la notificación.');
            }
            setSuccessMessage('Notificación enviada al usuario.');
        } catch (err) {
            console.error('Error al notificar al usuario:', err);
            setError(err.message || 'No se pudo enviar la notificación.');
        } finally {
            setDocsNotifyLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                gap: 2
            }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                    Cargando clientes...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                    borderRadius: 3,
                    color: 'white'
                }}
            >
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                bgcolor: alpha('#fff', 0.2),
                                backdropFilter: 'blur(10px)',
                                p: 2,
                                borderRadius: 2,
                                display: 'flex'
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Box>
                        <Box>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
                                Lista de Clientes
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buscador */}
                    <TextField
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: { xs: '100%', sm: 300 },
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontWeight: 500
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Paper>

            <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 140 }}>
                        Filtros rápidos
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                            label="Todos"
                            color={filters.activo === '' && filters.docs === '' ? 'primary' : 'default'}
                            onClick={() => {
                                handleFilterChange('activo', '');
                                handleFilterChange('docs', '');
                            }}
                        />
                        <Chip
                            label="Activos"
                            color={filters.activo === 'true' ? 'primary' : 'default'}
                            onClick={() => handleFilterChange('activo', 'true')}
                        />
                        <Chip
                            label="Inactivos"
                            color={filters.activo === 'false' ? 'primary' : 'default'}
                            onClick={() => handleFilterChange('activo', 'false')}
                        />
                        <Chip
                            label="Docs verificados"
                            color={filters.docs === 'verificada' ? 'primary' : 'default'}
                            onClick={() => handleFilterChange('docs', 'verificada')}
                        />
                        <Chip
                            label="Docs pendientes"
                            color={filters.docs === 'pendiente' ? 'primary' : 'default'}
                            onClick={() => handleFilterChange('docs', 'pendiente')}
                        />
                    </Stack>
                </Stack>
            </Paper>

            {/* Alertas */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
            {successMessage && (
                <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setSuccessMessage(null)}
                >
                    {successMessage}
                </Alert>
            )}

            {/* Tabla o Tarjetas según el dispositivo */}
            {filteredClientes.length === 0 ? (
                <Paper
                    elevation={2}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha('#1976d2', 0.02)
                    }}
                >
                    <PersonIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No se encontraron clientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                            ? 'Intenta con otros términos de búsqueda' 
                            : 'Los clientes que registres aparecerán aquí'}
                    </Typography>
                </Paper>
            ) : isMobile ? (
                // Vista de tarjetas para móviles
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredClientes.map((cliente) => (
                        <MobileClientCard
                            key={cliente.id_usuario}
                            cliente={cliente}
                            onDelete={handleDelete}
                            onEdit={openEditDialog}
                            onViewDocs={openDocsDialog}
                        />
                    ))}
                </Box>
            ) : (
                // Vista de tabla para desktop/tablet
                <TableContainer
                    component={Paper}
                    elevation={3}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    '& th': {
                                        fontWeight: 700,
                                        bgcolor: alpha('#1976d2', 0.08),
                                        color: '#1976d2',
                                        borderBottom: `2px solid #1976d2`,
                                        py: 2,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }
                                }}
                            >
                                <TableCell sx={{ width: 50 }} />
                                <TableCell>No. Cliente</TableCell>
                                <TableCell>Foto</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Correo Electrónico</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Teléfono</TableCell>
                                <TableCell align="center">Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClientes.map((cliente) => (
                                <ClientRow
                                    key={cliente.id_usuario}
                                    cliente={cliente}
                                    onDelete={handleDelete}
                                    onEdit={openEditDialog}
                                    onViewDocs={openDocsDialog}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={editDialogOpen}
                onClose={closeEditDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Editar información de cliente
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.2}>
                        <TextField
                            label="Nombre"
                            value={editForm.nombre}
                            onChange={handleEditChange('nombre')}
                            fullWidth
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Correo electrónico"
                                    type="email"
                                    value={editForm.correo_electronico}
                                    onChange={handleEditChange('correo_electronico')}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Teléfono"
                                    value={editForm.telefono}
                                    onChange={handleEditChange('telefono')}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                            Dirección
                        </Typography>

                        <TextField
                            label="Calle"
                            value={editForm.calle}
                            onChange={handleEditChange('calle')}
                            fullWidth
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Colonia"
                                    value={editForm.colonia}
                                    onChange={handleEditChange('colonia')}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Código Postal"
                                    value={editForm.codigo_postal}
                                    onChange={handleEditChange('codigo_postal')}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Ciudad"
                                    value={editForm.ciudad}
                                    onChange={handleEditChange('ciudad')}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Estado"
                                    value={editForm.estado}
                                    onChange={handleEditChange('estado')}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            label="País"
                            value={editForm.pais}
                            onChange={handleEditChange('pais')}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeEditDialog} disabled={savingEdit}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSubmit}
                        disabled={savingEdit}
                    >
                        {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={docsDialogOpen}
                onClose={closeDocsDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Documentación del cliente
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        {[
                            { label: 'INE', key: 'ine', idx: 0 },
                            { label: 'Acta de Nacimiento', key: 'acta', idx: 1 },
                            { label: 'Comprobante de domicilio', key: 'comprobante', idx: 2 },
                        ].map((item) => {
                            const doc = docsList[item.idx];
                            const hasDoc = !!doc?.url;
                            return (
                                <Card
                                    key={item.label}
                                    variant="outlined"
                                    sx={{ p: 2, borderRadius: 2, borderColor: alpha('#1976d2', 0.2) }}
                                >
                                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                                        {item.label}
                                    </Typography>
                                    {docsLoading ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Cargando documento...
                                        </Typography>
                                    ) : hasDoc ? (
                                        <Box
                                            sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                bgcolor: alpha('#1976d2', 0.04),
                                                border: `1px solid ${alpha('#1976d2', 0.15)}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: 140,
                                                maxHeight: 220,
                                                p: 1
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={doc.url}
                                                alt={item.label}
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: 200,
                                                    objectFit: 'contain',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Sin documento cargado.
                                        </Typography>
                                    )}
                                </Card>
                            );
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeDocsDialog}>Cerrar</Button>
                    <Button
                        variant="outlined"
                        onClick={handleNotifyDocsIssue}
                        disabled={!docsCliente || docsNotifyLoading}
                    >
                        {docsNotifyLoading ? 'Enviando...' : 'Notificar error al usuario'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleMarkDocsVerified}
                        disabled={!docsCliente}
                    >
                        Marcar como verificado
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientesListarPage;
