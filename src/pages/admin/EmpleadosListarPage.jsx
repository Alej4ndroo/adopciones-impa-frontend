// src/components/admin/EmpleadosListarPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Box, CircularProgress, Alert, Chip,
    Drawer, IconButton, List, ListItem, ListItemText, useTheme, Divider,
    Button, Grid, Stack, alpha, Card, useMediaQuery, Tooltip, Avatar
} from '@mui/material';
import {
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
    Edit as EditIcon,
    Badge as BadgeIcon,
    School as SchoolIcon,
    WorkOutline as WorkOutlineIcon
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const EMPLEADOS_ENDPOINT = '/empleados/listar';

// --- Componente para mostrar el detalle completo (Drawer mejorado) ---
const EmployeeDetailDrawer = ({ empleado, open, onClose, isManagementView }) => {
    const theme = useTheme();

    if (!empleado) return null;

    const fullAddress = empleado.usuarios.direccion
        ? `${empleado.usuarios.direccion.calle || ''} ${empleado.usuarios.direccion.numero_exterior || ''}, ${empleado.usuarios.direccion.colonia || ''}, ${empleado.usuarios.direccion.ciudad || ''}, C.P. ${empleado.usuarios.direccion.codigo_postal || ''}`.trim()
        : 'Dirección no registrada';

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: 480 },
                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
                },
            }}
        >
            {/* Header del Drawer */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    p: 3,
                    position: 'relative'
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        bgcolor: alpha('#000', 0.2),
                        '&:hover': { bgcolor: alpha('#000', 0.4) }
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                    <Avatar
                        sx={{
                            width: 72,
                            height: 72,
                            bgcolor: alpha('#fff', 0.3),
                            backdropFilter: 'blur(10px)',
                            fontSize: 32,
                            fontWeight: 700
                        }}
                    >
                        {empleado.usuarios.nombre.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            {empleado.usuarios.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            No. Empleado: {empleado.numero_empleado || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Contenido del Drawer */}
            <Box sx={{ p: 3 }}>
                {/* Sección: Información de Contacto */}
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 4,
                                height: 24,
                                borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }}
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Contacto
                        </Typography>
                    </Stack>

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <EmailIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Correo Electrónico
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.usuarios.correo_electronico}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <PhoneIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Teléfono
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.telefono || 'No registrado'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <LocationOnIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Dirección
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {fullAddress}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Card>

                {/* Sección: Información Profesional */}
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 4,
                                height: 24,
                                borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }}
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Información Profesional
                        </Typography>
                    </Stack>

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <SchoolIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Licenciatura
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.licenciatura || 'No especificada'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <BadgeIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Cédula Profesional
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.cedula_profesional || 'No registrada'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    p: 1,
                                    borderRadius: 2,
                                    display: 'flex'
                                }}
                            >
                                <WorkOutlineIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Especialidad
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.especialidad || 'Sin especialidad'}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Card>

                {/* Sección: Roles */}
                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                width: 4,
                                height: 24,
                                borderRadius: 2,
                                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }}
                        />
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Roles Asignados
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {empleado.usuarios.roles && empleado.usuarios.roles.length > 0
                            ? empleado.usuarios.roles.map((rol, index) => (
                                <Chip
                                    key={index}
                                    label={rol.nombre || rol}
                                    size="medium"
                                    sx={{
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        color: 'white',
                                        '& .MuiChip-label': { px: 2 }
                                    }}
                                />
                            ))
                            : <Chip label="Sin Roles Asignados" size="medium" variant="outlined" />
                        }
                    </Box>
                </Card>

                {/* Botones de Acción */}
                {isManagementView && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<EditIcon />}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

// --------------------------------------------------------------------------

const EmpleadosListarPage = ({ isManagementView = false }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

    useEffect(() => { fetchEmpleados(); }, []);

    const handleOpenDrawer = (empleado) => {
        setSelectedEmpleado(empleado);
        setOpenDrawer(true);
    };

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedEmpleado(null);
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

    // Vista de tarjetas para móviles
    const MobileCardView = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {empleados.map(empleado => (
                <Card
                    key={empleado.numero_empleado || empleado.id}
                    elevation={2}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8]
                        }
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        width: 48,
                                        height: 48,
                                        fontWeight: 700
                                    }}
                                >
                                    {empleado.usuarios.nombre.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {empleado.usuarios.nombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        No. {empleado.numero_empleado || empleado.id}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Tooltip title="Ver detalles">
                                <IconButton
                                    onClick={() => handleOpenDrawer(empleado)}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                    }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: 1.5,
                            pt: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {empleado.usuarios.correo_electronico}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Especialidad
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {empleado.especialidad || 'Sin especialidad'}
                                </Typography>
                            </Box>
                        </Box>

                        {empleado.usuarios.roles && empleado.usuarios.roles.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 1 }}>
                                {empleado.usuarios.roles.slice(0, 2).map((rol, index) => (
                                    <Chip
                                        key={index}
                                        label={rol.nombre || rol}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                        color="primary"
                                    />
                                ))}
                                {empleado.usuarios.roles.length > 2 && (
                                    <Chip
                                        label={`+${empleado.usuarios.roles.length - 2}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                    </Stack>
                </Card>
            ))}
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 'auto', mx: 'auto' }}>
            {/* Header Mejorado */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    borderRadius: 3,
                    color: 'white'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: alpha('#fff', 0.2),
                            backdropFilter: 'blur(10px)',
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: 2,
                            display: 'flex'
                        }}
                    >
                        <PersonIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                    </Box>
                    <Box>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
                            Lista de Empleados
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {empleados.length} {empleados.length === 1 ? 'empleado registrado' : 'empleados registrados'}
                        </Typography>
                    </Box>
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

            {/* Contenido principal */}
            {empleados.length === 0 ? (
                <Paper
                    elevation={2}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <PersonIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay empleados registrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Los empleados que registres aparecerán aquí
                    </Typography>
                </Paper>
            ) : isMobile ? (
                <MobileCardView />
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={3}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow
                                sx={{
                                    '& th': {
                                        fontWeight: 700,
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        py: 2
                                    }
                                }}
                            >
                                <TableCell>No. Empleado</TableCell>
                                <TableCell>Nombre Completo</TableCell>
                                {!isTablet && <TableCell>Correo</TableCell>}
                                <TableCell>Especialidad</TableCell>
                                <TableCell>Roles</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {empleados.map((empleado, index) => (
                                <TableRow
                                    key={empleado.numero_empleado || empleado.id}
                                    hover
                                    sx={{
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            transform: 'scale(1.01)'
                                        },
                                        bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.02)
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                        #{empleado.numero_empleado || empleado.id}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar
                                                sx={{
                                                    bgcolor: theme.palette.primary.main,
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 16,
                                                    fontWeight: 700
                                                }}
                                            >
                                                {empleado.usuarios.nombre.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography fontWeight={600}>
                                                {empleado.usuarios.nombre}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    {!isTablet && (
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {empleado.usuarios.correo_electronico}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Chip
                                            label={empleado.especialidad || 'Sin especialidad'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {empleado.usuarios.roles && empleado.usuarios.roles.length > 0
                                                ? empleado.usuarios.roles.slice(0, 2).map((rol, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={rol.nombre || rol}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                                : <Chip label="Sin roles" size="small" variant="outlined" />
                                            }
                                            {empleado.usuarios.roles && empleado.usuarios.roles.length > 2 && (
                                                <Chip
                                                    label={`+${empleado.usuarios.roles.length - 2}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Ver detalles">
                                            <IconButton
                                                onClick={() => handleOpenDrawer(empleado)}
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Drawer de Detalles */}
            <EmployeeDetailDrawer
                empleado={selectedEmpleado}
                open={openDrawer}
                onClose={handleCloseDrawer}
                isManagementView={isManagementView}
            />
        </Box>
    );
};

export default EmpleadosListarPage;