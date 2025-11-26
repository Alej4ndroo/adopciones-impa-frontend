// src/components/admin/EmpleadosListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert, Chip,
    IconButton, useTheme, Button, Stack, alpha, Avatar,
    Collapse, TextField, InputAdornment, Grid, Card,
    useMediaQuery, Divider, Dialog, DialogTitle, DialogContent, DialogActions
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
    School as SchoolIcon,
    CalendarToday as CalendarIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const EMPLEADOS_ENDPOINT = '/empleados/listar';

// --- Componente de tarjeta para móviles ---
const MobileEmployeeCard = ({ empleado, usuario, onToggleActive, onEdit }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const fullAddress = empleado.direccion?.calle
        ? `${empleado.direccion.calle || ''} ${empleado.direccion.numero_exterior || ''}, ${empleado.direccion.colonia || ''}, ${empleado.direccion.ciudad || ''}, ${empleado.direccion.estado || ''}, C.P. ${empleado.direccion.codigo_postal || ''}`.trim()
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
            onEdit(empleado);
        }
    };

    const handleToggleActive = (e) => {
        e.stopPropagation();
        const nextState = !usuario?.activo;
        const actionLabel = nextState ? 'activar' : 'desactivar';
        if (window.confirm(`¿Estás seguro de ${actionLabel} a ${usuario?.nombre || 'este empleado'}?`)) {
            onToggleActive(usuario?.id_usuario, nextState);
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
                        src={usuario?.foto_perfil_base64 || undefined}
                        sx={{
                            bgcolor: usuario?.activo ? '#1976d2' : theme.palette.grey[400],
                            width: 56,
                            height: 56,
                            fontSize: 20,
                            fontWeight: 700,
                            border: `3px solid ${usuario?.activo ? '#1976d2' : theme.palette.grey[400]}`
                        }}
                    >
                        {!usuario?.foto_perfil_base64 && usuario?.nombre?.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                                {usuario?.nombre}
                            </Typography>
                            <Chip
                                label={usuario?.activo ? 'Activo' : 'Inactivo'}
                                size="small"
                                color={usuario?.activo ? 'success' : 'default'}
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {empleado.numero_empleado}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {usuario?.correo_electronico}
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
                                    <Typography variant="body2" fontWeight={500}>{usuario?.correo_electronico}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                    <Typography variant="body2" fontWeight={500}>{empleado.telefono || usuario?.telefono || 'No registrado'}</Typography>
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

                    {/* Información profesional */}
                    <Card elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${alpha('#0d47a1', 0.2)}` }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#0d47a1" sx={{ mb: 1.5 }}>
                            Información Profesional
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Licenciatura</Typography>
                                <Typography variant="body2" fontWeight={500}>{empleado.licenciatura || 'No especificada'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Cédula Profesional</Typography>
                                <Typography variant="body2" fontWeight={500}>{empleado.cedula_profesional || 'No registrada'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Especialidad</Typography>
                                <Typography variant="body2" fontWeight={500}>{empleado.especialidad || 'Sin especialidad'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Fecha de Contratación</Typography>
                                <Typography variant="body2" fontWeight={500}>{formatDate(empleado.fecha_contratacion)}</Typography>
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
                            Editar Empleado
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            color={usuario?.activo ? 'error' : 'success'}
                            onClick={handleToggleActive}
                            sx={{ fontWeight: 600 }}
                        >
                            {usuario?.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                    </Stack>
                </Box>
            </Collapse>
        </Card>
    );
};

// --- Componente de fila expandible ---
const EmployeeRow = ({ empleado, onToggleActive, onEdit }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const fullAddress = empleado.direccion?.calle
        ? `${empleado.direccion.calle || ''} ${empleado.direccion.numero_exterior || ''}, ${empleado.direccion.colonia || ''}, ${empleado.direccion.ciudad || ''}, ${empleado.direccion.estado || ''}, C.P. ${empleado.direccion.codigo_postal || ''}`.trim()
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
            onEdit(empleado);
        }
    };

    const handleToggleActive = (e) => {
        e.stopPropagation();
        const nextState = !(empleado.usuarios?.activo ?? empleado.usuario?.activo);
        const actionLabel = nextState ? 'activar' : 'desactivar';
        if (window.confirm(`¿Seguro que deseas ${actionLabel} a ${empleado.usuarios?.nombre || empleado.usuario?.nombre || 'este empleado'}?`)) {
            const usuarioId = empleado.usuarios?.id_usuario || empleado.usuario?.id_usuario;
            onToggleActive(usuarioId, nextState);
        }
    };

    const toggleRow = () => {
        setOpen(!open);
    };

    // Normalizar acceso a datos (tu API puede devolver usuarios o usuario)
    const usuario = empleado.usuarios || empleado.usuario;
    const direccion = empleado.direccion;

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
                        label={empleado.numero_empleado}
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
                        src={usuario?.foto_perfil_base64 || undefined}
                        sx={{
                            bgcolor: usuario?.activo ? '#1976d2' : theme.palette.grey[400],
                            width: 45,
                            height: 45,
                            fontSize: 18,
                            fontWeight: 700,
                            border: `2px solid ${usuario?.activo ? '#1976d2' : theme.palette.grey[400]}`
                        }}
                    >
                        {!usuario?.foto_perfil_base64 && usuario?.nombre?.charAt(0).toUpperCase()}
                    </Avatar>
                </TableCell>
                <TableCell>
                    <Typography fontWeight={600} sx={{ color: '#333' }}>
                        {usuario?.nombre}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {usuario?.correo_electronico}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {empleado.telefono || usuario?.telefono || 'No registrado'}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    <Chip
                        label={usuario?.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={usuario?.activo ? 'success' : 'default'}
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
                                                        {usuario?.correo_electronico}
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
                                                        {empleado.telefono || usuario?.telefono || 'No registrado'}
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

                                {/* Información Profesional */}
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
                                                Información Profesional
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
                                                    <SchoolIcon sx={{ fontSize: 18, color: '#0d47a1' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Licenciatura
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {empleado.licenciatura || 'No especificada'}
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
                                                    <BadgeIcon sx={{ fontSize: 18, color: '#0d47a1' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Cédula Profesional
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {empleado.cedula_profesional || 'No registrada'}
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
                                                    <SchoolIcon sx={{ fontSize: 18, color: '#0d47a1' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Especialidad
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {empleado.especialidad || 'Sin especialidad'}
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
                                                        Fecha de Contratación
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {formatDate(empleado.fecha_contratacion)}
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
                                            color={usuario?.activo ? 'error' : 'success'}
                                            onClick={handleToggleActive}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                px: 3
                                            }}
                                        >
                                            {usuario?.activo ? 'Desactivar' : 'Activar'}
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
                                            Editar Empleado
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

const EmpleadosListarPage = ({ isManagementView = false }) => {
    const [empleados, setEmpleados] = useState([]);
    const [filteredEmpleados, setFilteredEmpleados] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ activo: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
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

    const fetchEmpleados = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL_BACKEND}${EMPLEADOS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const receivedEmpleados = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.empleados)
                    ? response.data.empleados
                    : [];

            if (!receivedEmpleados.length) {
                setError("No se encontraron empleados en el sistema.");
            }

            setEmpleados(receivedEmpleados);
            setFilteredEmpleados(receivedEmpleados);
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
        fetchEmpleados(); 
    }, []);

    // Filtro de búsqueda + estado
    useEffect(() => {
        let filtered = empleados;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(emp => {
                const usuario = emp.usuarios || emp.usuario;
                return (
                    usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.numero_empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    usuario?.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        if (filters.activo !== '') {
            filtered = filtered.filter((emp) => {
                const usuario = emp.usuarios || emp.usuario;
                return !!usuario?.activo === (filters.activo === 'true');
            });
        }

        setFilteredEmpleados(filtered);
    }, [searchTerm, filters, empleados]);

    const handleToggleActive = async (idUsuario, nextState = false) => {
        const token = localStorage.getItem('authToken');
        if (!idUsuario) {
            setError('No se pudo identificar el usuario del empleado.');
            return;
        }
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }

        try {
            await axios.put(
                `${API_URL_BACKEND}/usuarios/actualizar/${idUsuario}`,
                { activo: nextState },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updater = (list) =>
                list.map((emp) => {
                    const updated = { ...emp };
                    if (emp.usuarios?.id_usuario === idUsuario) {
                        updated.usuarios = { ...emp.usuarios, activo: nextState };
                    }
                    if (emp.usuario?.id_usuario === idUsuario) {
                        updated.usuario = { ...emp.usuario, activo: nextState };
                    }
                    return updated;
                });

            setEmpleados(updater);
            setFilteredEmpleados(updater);
        } catch (err) {
            console.error('Error al actualizar estado del empleado:', err);
            setError('No se pudo actualizar el estado. Verifica permisos o intenta más tarde.');
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const openEditDialog = (empleado) => {
        const usuario = empleado?.usuarios || empleado?.usuario || {};
        const direccion = empleado?.direccion || {};
        setSelectedEmployee(empleado);
        setEditForm({
            nombre: usuario.nombre || '',
            correo_electronico: usuario.correo_electronico || '',
            telefono: empleado.telefono || usuario.telefono || '',
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
        setSelectedEmployee(null);
    };

    const handleEditChange = (field) => (event) => {
        setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleEditSubmit = async () => {
        if (!selectedEmployee) return;

        const token = localStorage.getItem('authToken');
        const usuarioId = selectedEmployee?.usuarios?.id_usuario || selectedEmployee?.usuario?.id_usuario;
        if (!usuarioId) {
            setError('No se pudo identificar al usuario del empleado para editar.');
            return;
        }
        if (!token) {
            setError('No autenticado. Por favor, inicie sesión.');
            return;
        }

        const payload = { ...editForm };

        try {
            setSavingEdit(true);
            await axios.put(
                `${API_URL_BACKEND}/usuarios/actualizar/${usuarioId}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updater = (list) =>
                list.map((emp) => {
                    const match =
                        emp.usuarios?.id_usuario === usuarioId ||
                        emp.usuario?.id_usuario === usuarioId;
                    if (!match) return emp;

                    const usuarioActual = emp.usuarios || emp.usuario || {};
                    const direccionActual = emp.direccion || {};
                    const usuarioActualizado = {
                        ...usuarioActual,
                        nombre: editForm.nombre,
                        correo_electronico: editForm.correo_electronico,
                        telefono: editForm.telefono
                    };
                    const direccionActualizada = {
                        ...direccionActual,
                        calle: editForm.calle,
                        colonia: editForm.colonia,
                        codigo_postal: editForm.codigo_postal,
                        ciudad: editForm.ciudad,
                        estado: editForm.estado,
                        pais: editForm.pais
                    };

                    const actualizado = {
                        ...emp,
                        telefono: editForm.telefono,
                        direccion: direccionActualizada
                    };
                    if (emp.usuarios) actualizado.usuarios = usuarioActualizado;
                    if (emp.usuario) actualizado.usuario = usuarioActualizado;
                    return actualizado;
                });

            setEmpleados(updater);
            setFilteredEmpleados(updater);
            closeEditDialog();
        } catch (err) {
            console.error('Error al actualizar información de contacto:', err);
            setError('No se pudo actualizar la información de contacto. Intenta nuevamente.');
        } finally {
            setSavingEdit(false);
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
                    Cargando empleados...
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
                                Lista de Empleados
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filteredEmpleados.length} {filteredEmpleados.length === 1 ? 'empleado' : 'empleados'}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buscador */}
                    <TextField
                        placeholder="Buscar por nombre o número..."
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
                            color={filters.activo === '' ? 'primary' : 'default'}
                            onClick={() => handleFilterChange('activo', '')}
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

            {/* Tabla o Tarjetas según el dispositivo */}
            {filteredEmpleados.length === 0 ? (
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
                        No se encontraron empleados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                            ? 'Intenta con otros términos de búsqueda' 
                            : 'Los empleados que registres aparecerán aquí'}
                    </Typography>
                </Paper>
            ) : isMobile ? (
                // Vista de tarjetas para móviles
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredEmpleados.map((empleado) => {
                        const usuario = empleado.usuarios || empleado.usuario;
                        return (
                            <MobileEmployeeCard
                                key={empleado.id_empleado}
                                empleado={empleado}
                                usuario={usuario}
                                onToggleActive={handleToggleActive}
                                onEdit={openEditDialog}
                            />
                        );
                    })}
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
                                <TableCell>No. Empleado</TableCell>
                                <TableCell>Foto</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Correo Electrónico</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell align="center">Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmpleados.map((empleado) => (
                                <EmployeeRow
                                    key={empleado.id_empleado}
                                    empleado={empleado}
                                    onToggleActive={handleToggleActive}
                                    onEdit={openEditDialog}
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
                    Editar información de contacto
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
        </Box>
    );
};

export default EmpleadosListarPage;
