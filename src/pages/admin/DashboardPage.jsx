import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ◀️ Importado para las citas
import { 
    Grid, Typography, Box, Paper, CircularProgress, 
    useTheme, Divider
} from '@mui/material';
import { 
    CalendarMonth, Pets, HourglassEmpty, AttachMoney, 
    Event
} from '@mui/icons-material';
import { LayoutDashboard } from 'lucide-react'; 

// --- 📅 Imports de FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es'; // ◀️ Para poner el calendario en español

// --- URLs de API ---
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const API_URLS = {
    MASCOTAS_DISPONIBLES: `${API_URL_BACKEND}/mascotas/contar`,
    SOLICITUDES_PENDIENTES: `${API_URL_BACKEND}/adopciones/pendientes`, 
    CITAS_HOY: `${API_URL_BACKEND}/citas/contar`, 
    INGRESOS_MES: `${API_URL_BACKEND}/finanzas/ingresos/mes`,
    // --- ⬇️ NUEVA RUTA ---
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
                borderLeft: `5px solid ${color}`,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 8 }
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

    // --- ⬇️ NUEVO ESTADO PARA EL CALENDARIO ---
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(true);

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

    // --- ⬇️ NUEVO useEffect PARA CARGAR CITAS DEL CALENDARIO ---
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
                const events = response.data.map(cita => ({
                    id: cita.id_cita,
                    title: cita.motivo || `Cita (ID: ${cita.id_cita})`, // Usamos 'motivo' como título
                    start: cita.fecha_cita, // FullCalendar entiende fechas ISO 8601
                    // Puedes cambiar el color según el estado
                    color: cita.estado_cita === 'programada' 
                        ? theme.palette.info.main 
                        : (cita.estado_cita === 'completada' ? theme.palette.success.main : theme.palette.grey[500]),
                    extendedProps: {
                        // Aquí puedes guardar más datos si quieres usarlos en un 'eventClick'
                        ...cita
                    }
                }));
                
                setCalendarEvents(events);

            } catch (error) {
                console.error("Error al cargar las citas del calendario:", error);
            } finally {
                setCalendarLoading(false);
            }
        };

        fetchCitas();
    }, [theme]); // Depende de 'theme' para los colores

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
                        elevation={4} 
                        sx={{ 
                            p: { xs: 1, sm: 2, md: 3 }, // Padding responsivo
                            borderRadius: 3,
                            minHeight: '70vh', // Altura mínima
                            height: 'auto', // Se ajusta al contenido
                            // Estilos para que FullCalendar se integre con MUI
                            '& .fc-button': {
                                backgroundColor: theme.palette.primary.main,
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            },
                            '& .fc-daygrid-day.fc-day-today': {
                                backgroundColor: theme.palette.action.hover,
                            },
                            '& .fc-list-event-title': {
                                // Mejora la legibilidad en la vista de lista
                                whiteSpace: 'normal !important', 
                            },
                        }}
                    >
                        {calendarLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                                <CircularProgress size={50} />
                                <Typography variant="h6" sx={{ ml: 2 }}>Cargando calendario...</Typography>
                            </Box>
                        ) : (
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,listWeek' // Controles responsivos
                                }}
                                initialView="dayGridMonth"
                                locale={esLocale} // ◀️ Español
                                events={calendarEvents}
                                weekends={true}
                                editable={false} // Citas no se pueden arrastrar
                                selectable={false}
                                height="auto" // Se ajusta al Paper
                                contentHeight="auto"
                                handleWindowResize={true} // Clave para responsividad
                                // Alerta simple al hacer clic en un evento
                                eventClick={(clickInfo) => {
                                    alert(`Cita: ${clickInfo.event.title}\nEstado: ${clickInfo.event.extendedProps.estado_cita}\nFecha: ${clickInfo.event.start.toLocaleString()}`);
                                }}
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>

        </Box>
    );
};

export default DashboardContentMUI;