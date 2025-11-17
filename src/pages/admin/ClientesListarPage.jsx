// src/components/admin/ClientesListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert, Chip,
    IconButton, useTheme, Button, Stack, alpha, Avatar,
    Collapse, TextField, InputAdornment, Tooltip, Grid, Card,
    useMediaQuery, Divider
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
import { useNavigate } from 'react-router-dom';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CLIENTES_ENDPOINT = '/usuarios/listar-clientes';

// --- Componente de tarjeta para móviles ---
const MobileClientCard = ({ cliente, onDelete }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

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
        navigate(`/admin/clientes/editar/${cliente.id_usuario}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre}?`)) {
            onDelete(cliente.id_usuario);
        }
    };

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
                        src={cliente.foto_perfil_base64 || undefined}
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
                            color="error"
                            onClick={handleDelete}
                            sx={{ fontWeight: 600 }}
                        >
                            Eliminar
                        </Button>
                    </Stack>
                </Box>
            </Collapse>
        </Card>
    );
};

// --- Componente de fila expandible ---
const ClientRow = ({ cliente, onDelete }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

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
        navigate(`/admin/clientes/editar/${cliente.id_usuario}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre}?`)) {
            onDelete(cliente.id_usuario);
        }
    };

    const toggleRow = () => {
        setOpen(!open);
    };

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
                        src={cliente.foto_perfil_base64 || undefined}
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
                    <Chip
                        label={cliente.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={cliente.activo ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                    />
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
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            onClick={handleDelete}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3
                                            }}
                                        >
                                            Eliminar
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Filtro de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter(cliente =>
                cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.id_usuario?.toString().includes(searchTerm) ||
                cliente.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClientes(filtered);
        }
    }, [searchTerm, clientes]);

    const handleDelete = async (idCliente) => {
        // Aquí implementarías la lógica de eliminación
        console.log('Eliminar cliente:', idCliente);
        // Después de eliminar, vuelve a cargar la lista
        fetchClientes();
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
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ClientesListarPage;