import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // ◀Importado para las citas
import { 
    Grid, Typography, Box, Paper, CircularProgress, 
    Divider, Chip, Stack, Dialog, DialogTitle, 
    DialogContent, DialogActions, Button
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
    Pets, HourglassEmpty, AttachMoney, 
    Event, AccessTimeRounded, CheckCircleRounded, CancelRounded,
    MedicalServicesRounded, PersonOutline, PetsOutlined, 
    WorkOutline, NotesRounded, AttachMoneyRounded, EventAvailableRounded
} from '@mui/icons-material';
import { LayoutDashboard } from 'lucide-react'; 

// --- Imports de FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es'; // ◀Para poner el calendario en español

// --- URLs de API ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const API_URLS = {
    MASCOTAS_DISPONIBLES: `${API_URL_BACKEND}/mascotas/contar`,
    SOLICITUDES_PENDIENTES: `${API_URL_BACKEND}/adopciones/pendientes`, 
    CITAS_HOY: `${API_URL_BACKEND}/citas/contar`, 
    INGRESOS_MES: `${API_URL_BACKEND}/finanzas/ingresos/mes`,
    // --- NUEVA RUTA ---
    CITAS_LISTAR: `${API_URL_BACKEND}/citas/listar`, 
};

// -------------------------------------------------------------------
// COMPONENTE 1: MÉTRICAS DIRECTAS (KPIs) - Se mantiene igual
// -------------------------------------------------------------------
const KpiCard = ({ title, value, icon: IconComponent, color, subtitle, loading = false, isCurrency = false }) => {
    const theme = useTheme();
    
    // Si el valor es null, undefined, o 0, mostramos 'N/A' si no está cargando
    const displayValue = loading ? value : (value === null || value === undefined ? 'N/A' : value);
    
    const formattedValue = isCurrency 
        ? (loading ? '' : `$${displayValue?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        : displayValue;
    
    return (
        <Paper 
            elevation={4} 
            sx={{ 
                p: 2, 
                height: 180, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: '0.3s',
                borderLeft: `5px solid ${color}`
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: color }} />
                    ) : (
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: color }}>
                            {formattedValue}
                        </Typography>
                    )}
                    <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                </Box>
                {IconComponent && <IconComponent size={40} color={color} />}
            </Box>
            
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {subtitle}
                </Typography>
            )}
        </Paper>
    );
};

// -------------------------------------------------------------------
// COMPONENTE 2: CONTENEDOR DE GRÁFICAS (GraphCard) - Eliminado
// -------------------------------------------------------------------
// Se eliminó GraphCard y todas las definiciones de gráficas
// (AdopcionBarChart, SpeciesPieChart, RevenueAreaChart, ExpedientesList, SeguimientosList)
// y también se eliminó 'simulatedMetrics'.

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL MODIFICADO
// -------------------------------------------------------------------
const DashboardContentMUI = () => {
    const theme = useTheme();

    // 1. ESTADO PARA LOS KPIS
    const [kpiMetrics, setKpiMetrics] = useState({
        mascotasDisponibles: null,
        solicitudesPendientes: null,
        citasProgramadasHoy: null,
        ingresosMes: null,
        loadingKpis: true, 
    });

    // --- NUEVO ESTADO PARA EL CALENDARIO ---
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [selectedCita, setSelectedCita] = useState(null);
    const [eventDialogOpen, setEventDialogOpen] = useState(false);

    const statusColors = useMemo(() => ({
        programada: theme.palette.info.main,
        completada: theme.palette.success.main,
        cancelada: theme.palette.error.main,
        no_asistio: theme.palette.warning.main,
        default: theme.palette.grey[500],
    }), [theme]);

    const statusLegend = [
        { key: 'programada', label: 'Programadas', icon: AccessTimeRounded },
        { key: 'completada', label: 'Completadas', icon: CheckCircleRounded },
        { key: 'cancelada', label: 'Canceladas', icon: CancelRounded },
    ];

    const statusSummary = useMemo(() => {
        return calendarEvents.reduce((acc, event) => {
            const key = event.extendedProps?.estado_cita || 'default';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [calendarEvents]);

    const formatDateTime = (dateInput) => {
        if (!dateInput) return 'Sin fecha';
        return new Date(dateInput).toLocaleString('es-MX', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    };

    const getEstadoLabel = (estado) => {
        const labels = {
            programada: 'Programada',
            completada: 'Completada',
            cancelada: 'Cancelada',
            no_asistio: 'No asistió'
        };
        return labels[estado] || estado || 'Estado';
    };


    // 2. FUNCIÓN ASÍNCRONA PARA EL FETCH DE KPIs (Se mantiene)
    useEffect(() => {
        const fetchNumericValue = async (url) => {
            // Asumimos que no necesitas token para estos contadores públicos
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`ERROR HTTP en ${url}: ${response.status} ${response.statusText}`);
                throw new Error(`Fallo en la petición a ${url}`);
            }
            
            const data = await response.json(); 
            
            if (typeof data === 'number' && !isNaN(data)) {
                return data; 
            }
            const parsedNumber = parseFloat(data);
            if (!isNaN(parsedNumber)) {
                return parsedNumber;
            }

            return 0;
        };

        const fetchKpis = async () => {
            setKpiMetrics(prev => ({ ...prev, loadingKpis: true }));

            try {
                // Hacemos las peticiones en paralelo
                const [mascotasCount, citasCount, solicitudesCount, ingresosTotal] = await Promise.allSettled([
                    fetchNumericValue(API_URLS.MASCOTAS_DISPONIBLES),
                    fetchNumericValue(API_URLS.CITAS_HOY),
                    fetchNumericValue(API_URLS.SOLICITUDES_PENDIENTES),
                    fetchNumericValue(API_URLS.INGRESOS_MES)
                ]);

                // Actualizamos el estado, manejando resultados exitosos o fallidos
                setKpiMetrics({
                    mascotasDisponibles: mascotasCount.status === 'fulfilled' ? mascotasCount.value : null,
                    solicitudesPendientes: solicitudesCount.status === 'fulfilled' ? solicitudesCount.value : null,
                    citasProgramadasHoy: citasCount.status === 'fulfilled' ? citasCount.value : null,
                    ingresosMes: ingresosTotal.status === 'fulfilled' ? ingresosTotal.value : null,
                    loadingKpis: false,
                });

            } catch (error) {
                console.error("Error FATA_L al obtener KPIs:", error);
                setKpiMetrics(prev => ({ 
                    ...prev, 
                    loadingKpis: false, 
                    mascotasDisponibles: null,
                    solicitudesPendientes: null, 
                    citasProgramadasHoy: null, 
                    ingresosMes: null 
                }));
            }
        };

        fetchKpis();
    }, []);

    // --- NUEVO useEffect PARA CARGAR CITAS DEL CALENDARIO ---
    useEffect(() => {
        const fetchCitas = async () => {
            setCalendarLoading(true);
            const token = localStorage.getItem('authToken');

            // Asumimos que esta ruta requiere autenticación
            if (!token) {
                console.error("No se encontró token de autenticación para cargar citas.");
                setCalendarLoading(false);
                return;
            }

            try {
                const response = await axios.get(API_URLS.CITAS_LISTAR, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Transformamos los datos para FullCalendar
                const events = response.data.map(cita => {
                    const statusColor = statusColors[cita.estado_cita] || statusColors.default;
                    const serviceName = cita.servicio?.nombre || 'Servicio';
                    return {
                        id: cita.id_cita,
                        title: serviceName, // Mostrar tipo de servicio
                        start: cita.fecha_cita, // FullCalendar entiende fechas ISO 8601
                        backgroundColor: alpha(statusColor, 0.14),
                        borderColor: 'transparent',
                        textColor: theme.palette.text.primary,
                        extendedProps: {
                            // Aquí puedes guardar más datos si quieres usarlos en un 'eventClick'
                            ...cita,
                            statusColor,
                            serviceName,
                        }
                    };
                });
                
                setCalendarEvents(events);

            } catch (error) {
                console.error("Error al cargar las citas del calendario:", error);
            } finally {
                setCalendarLoading(false);
            }
        };

        fetchCitas();
    }, [statusColors, theme]); // Depende de 'theme' para los colores

    const renderEventContent = (eventInfo) => {
        const isTimeGrid = eventInfo.view.type.includes('timeGrid');
        const accent = eventInfo.event.extendedProps.statusColor || statusColors.default;
        const timeLabel = eventInfo.timeText;

        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: isTimeGrid ? 0.25 : 0.4,
                px: isTimeGrid ? 0.9 : 1.1,
                py: isTimeGrid ? 0.8 : 0.9,
                borderRadius: isTimeGrid ? 1.5 : 2,
                backgroundColor: alpha(accent, 0.12),
                borderLeft: isTimeGrid ? 'none' : `4px solid ${accent}`,
                border: isTimeGrid ? `1px solid ${alpha(accent, 0.35)}` : 'none',
                boxShadow: isTimeGrid ? '0 6px 16px rgba(15,23,42,0.12)' : 'none',
            }}>
                <Typography variant="caption" sx={{ color: accent, fontWeight: 800, lineHeight: 1.2 }}>
                    {timeLabel}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    {eventInfo.event.title}
                </Typography>
            </Box>
        );
    };

    const renderMoreLink = (args) => (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1,
                py: 0.4,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.75rem'
            }}
        >
            <Typography component="span" variant="caption" sx={{ fontWeight: 800 }}>
                +{args.num}
            </Typography>
            <Typography component="span" variant="caption">
                citas
            </Typography>
        </Box>
    );

    const handleEventClick = (clickInfo) => {
        setSelectedCita({
            ...clickInfo.event.extendedProps,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            calendarTitle: clickInfo.event.title,
        });
        setEventDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setSelectedCita(null);
        setEventDialogOpen(false);
    };

    // -------------------------------------------------------------------

    return (
        <Box sx={{ p: 0 }}>
            
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.dark }}>
                <LayoutDashboard size={30} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Panel de Control - Resumen Operativo IMPA
            </Typography>
            
            <Divider sx={{ mb: 4 }} />

            {/* ------------------------------------------------------------------- */}
            {/* 🔑 FILA SUPERIOR: Métricas Clave (KPIs) - Se mantiene                  */}
            {/* ------------------------------------------------------------------- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* 1. Mascotas Disponibles */}
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard 
                        title="Mascotas Disponibles" 
                        value={kpiMetrics.mascotasDisponibles} 
                        icon={Pets} 
                        color={theme.palette.success.main}
                        subtitle="Listas para adopción."
                        loading={kpiMetrics.loadingKpis} 
                    />
                </Grid>
                
                {/* 2. Solicitudes de Adopción Pendientes */}
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard 
                        title="Solicitudes Pendientes" 
                        value={kpiMetrics.solicitudesPendientes} 
                        icon={HourglassEmpty} 
                        color={theme.palette.warning.dark}
                        subtitle="En revisión: Revisa expedientes."
                        loading={kpiMetrics.loadingKpis} 
                    />
                </Grid>
                
                {/* 3. Citas Programadas Hoy */}
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard 
                        title="Citas Programadas (Hoy)" 
                        value={kpiMetrics.citasProgramadasHoy} 
                        icon={Event} 
                        color={theme.palette.info.main}
                        subtitle="Adopción y Veterinaria."
                        loading={kpiMetrics.loadingKpis} 
                    />
                </Grid>
                
                {/* 4. Ingresos por Servicios */}
                <Grid item xs={12} sm={6} lg={3}>
                    <KpiCard 
                        title="Ingresos Netos (Mes)" 
                        value={kpiMetrics.ingresosMes} 
                        icon={AttachMoney} 
                        color={theme.palette.success.dark}
                        subtitle="Ingresos por servicios veterinarios."
                        loading={kpiMetrics.loadingKpis} 
                        isCurrency={true}
                    />
                </Grid>
                
            </Grid>
            
            {/* ------------------------------------------------------------------- */}
            {/* 🔑 FILA INFERIOR: CALENDARIO DE CITAS                              */}
            {/* ------------------------------------------------------------------- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: { xs: 1.5, sm: 2.5, md: 3 }, // Padding responsivo
                            borderRadius: 1,
                            minHeight: '70vh', // Altura mínima
                            position: 'relative',
                            overflow: 'hidden',
                            background: theme.palette.background.paper,
                            boxShadow: 'none',
                            // Estilos para que FullCalendar se integre con MUI
                            '& .fc': { zIndex: 1 },
                            '& .fc-toolbar-title': {
                                fontWeight: 800,
                                letterSpacing: 0.4,
                                color: theme.palette.primary.dark,
                                },
                            '& .fc .fc-button-primary': {
                                backgroundColor: theme.palette.primary.main,
                                border: 'none',
                                textTransform: 'capitalize',
                                borderRadius: '12px',
                                padding: '0.45rem 0.85rem',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                                '&:focus': {
                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
                                },
                            },
                            '& .fc .fc-button-primary:not(:disabled).fc-button-active': {
                                backgroundColor: theme.palette.secondary?.main || theme.palette.primary.dark,
                            },
                            '& .fc .fc-col-header-cell-cushion': {
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                color: theme.palette.text.secondary,
                            },
                            '& .fc .fc-daygrid-day-number': {
                                fontWeight: 700,
                                borderRadius: '8px',
                                padding: '4px 8px',
                                transition: 'background-color 0.2s ease',
                            },
                            '& .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                color: theme.palette.primary.dark,
                            },
                            '& .fc-theme-standard td, & .fc-theme-standard th': {
                                borderColor: alpha(theme.palette.divider, 0.4),
                            },
                            '& .fc .fc-daygrid-event, & .fc .fc-list-event': {
                                borderRadius: '12px',
                                border: 'none',
                            },
                            '& .fc .fc-event-main': { padding: 0 },
                            '& .fc .fc-list-day-cushion': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                color: theme.palette.primary.dark,
                                fontWeight: 700,
                            },
                            '& .fc .fc-list-event-time': { fontWeight: 700 },
                            '& .fc .fc-list-event:hover td': { backgroundColor: alpha(theme.palette.action.hover, 0.4) },
                            '& .fc .fc-scrollgrid': { overflow: 'hidden', borderColor: alpha(theme.palette.divider, 0.25) },
                            '& .fc .fc-daygrid-day.fc-day-today': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                            '& .fc .fc-daygrid-day-frame': {
                                padding: '6px',
                            },
                            '& .fc .fc-view-harness': {
                                width: '100%',
                                minWidth: '100%',
                            },
                            '& .fc .fc-list': {
                                width: '100%',
                                minWidth: '100%',
                            },
                            '& .fc .fc-list-table': {
                                width: '100%',
                                minWidth: '100%',
                                tableLayout: 'fixed',
                            },
                            '& .fc .fc-timegrid-event-harness': {
                                padding: '3px',
                            },
                            '& .fc .fc-timegrid-event': {
                                margin: '0 2px',
                            },
                        }}
                    >
                        {calendarLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                                <CircularProgress size={50} />
                                <Typography variant="h6" sx={{ ml: 2 }}>Cargando calendario...</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
                                    <Box sx={{ maxWidth: 600 }}>
                                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, color: theme.palette.primary.main, fontWeight: 700 }}>
                                            Agenda
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}>
                                            Calendario de citas
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {statusLegend.map(({ key, label, icon: IconComp }) => (
                                            <Chip
                                                key={key}
                                                icon={<IconComp fontSize="small" />}
                                                label={`${label} (${statusSummary[key] || 0})`}
                                                sx={{ 
                                                    backgroundColor: alpha(statusColors[key], 0.12),
                                                    color: statusColors[key],
                                                    fontWeight: 700,
                                                    borderRadius: 999,
                                                    border: `1px solid ${alpha(statusColors[key], 0.3)}`,
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>

                                <Box sx={{ width: '100%' }}>
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,listWeek'
                                        }}
                                        buttonText={{
                                            today: 'Hoy',
                                            month: 'Mes',
                                            week: 'Semana',
                                            list: 'Agenda',
                                        }}
                                        initialView="dayGridMonth"
                                        locale={esLocale} // Español
                                        firstDay={1}
                                        events={calendarEvents}
                                        weekends={true}
                                        editable={false} // Citas no se pueden arrastrar
                                        selectable={false}
                                        height="auto" // Se ajusta al Paper
                                        contentHeight="auto"
                                        handleWindowResize={true} // Clave para responsividad
                                        nowIndicator
                                        eventDisplay="block"
                                        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
                                        eventContent={renderEventContent}
                                        views={{
                                            dayGridMonth: {
                                                dayMaxEventRows: 1,
                                                moreLinkContent: renderMoreLink,
                                                moreLinkClick: 'popover',
                                            },
                                            timeGridWeek: {
                                                dayMaxEventRows: false,
                                                slotEventOverlap: false,
                                                slotLabelFormat: [
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        meridiem: false
                                                    }
                                                ],
                                            }
                                        }}
                                        eventClick={handleEventClick}
                                    />
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog 
                open={eventDialogOpen} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalServicesRounded color="primary" />
                    Detalle de la cita
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCita ? (
                        <Stack spacing={2.4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <MedicalServicesRounded sx={{ color: theme.palette.primary.main }} />
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Servicio</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                            {selectedCita.serviceName || selectedCita.servicio?.nombre || 'Servicio no especificado'}
                                        </Typography>
                                        {selectedCita.servicio?.descripcion && (
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedCita.servicio.descripcion}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                {selectedCita.estado_cita && (
                                    <Chip 
                                        label={getEstadoLabel(selectedCita.estado_cita)}
                                        sx={{ 
                                            textTransform: 'capitalize', 
                                            backgroundColor: alpha(statusColors[selectedCita.estado_cita] || statusColors.default, 0.12),
                                            color: statusColors[selectedCita.estado_cita] || statusColors.default,
                                            fontWeight: 700
                                        }}
                                    />
                                )}
                            </Box>

                            <Stack spacing={1.2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <EventAvailableRounded sx={{ color: theme.palette.info.main }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Fecha y hora</Typography>
                                        <Typography variant="body1" fontWeight={700}>{formatDateTime(selectedCita.start)}</Typography>
                                    </Box>
                                </Stack>

                                {selectedCita.usuario?.nombre && (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <PersonOutline sx={{ color: theme.palette.primary.main }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Cliente</Typography>
                                            <Typography variant="body1" fontWeight={600}>{selectedCita.usuario.nombre}</Typography>
                                            {selectedCita.usuario.telefono && (
                                                <Typography variant="body2" color="text.secondary">{selectedCita.usuario.telefono}</Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                )}

                                {selectedCita.mascota?.nombre && (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <PetsOutlined sx={{ color: theme.palette.success.main }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Mascota</Typography>
                                            <Typography variant="body1" fontWeight={600}>{selectedCita.mascota.nombre}</Typography>
                                            {(selectedCita.mascota.especie || selectedCita.mascota.raza) && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {[selectedCita.mascota.especie, selectedCita.mascota.raza].filter(Boolean).join(' • ')}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                )}

                                {selectedCita.empleado?.nombre && (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <WorkOutline sx={{ color: theme.palette.warning.main }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Empleado asignado</Typography>
                                            <Typography variant="body1" fontWeight={600}>{selectedCita.empleado.nombre}</Typography>
                                            {selectedCita.empleado.especialidad && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedCita.empleado.especialidad}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                )}

                                {selectedCita.motivo && (
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <NotesRounded sx={{ color: theme.palette.text.secondary }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Motivo</Typography>
                                            <Typography variant="body2">{selectedCita.motivo}</Typography>
                                        </Box>
                                    </Stack>
                                )}

                                {selectedCita.observaciones && (
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <NotesRounded sx={{ color: theme.palette.text.secondary }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                                            <Typography variant="body2">{selectedCita.observaciones}</Typography>
                                        </Box>
                                    </Stack>
                                )}

                                {selectedCita.costo && (
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <AttachMoneyRounded sx={{ color: theme.palette.success.main }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Costo</Typography>
                                            <Typography variant="body1" fontWeight={700}>
                                                ${parseFloat(selectedCita.costo).toFixed(2)} MXN
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )}
                            </Stack>
                        </Stack>
                    ) : (
                        <Typography variant="body2">Selecciona una cita para ver los detalles.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default DashboardContentMUI;
