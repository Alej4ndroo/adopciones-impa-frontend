import React, { useState, useEffect } from 'react';
import { 
    Grid, Card, CardContent, Typography, Box, Paper, CircularProgress, 
    Icon, useTheme, Divider, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { 
    CalendarMonth, BarChart, Pets, CheckCircle, HourglassEmpty, AttachMoney, 
    Event, WarningAmber, TrendingUp, Info
} from '@mui/icons-material';
import { Users, Heart, Stethoscope, FileText, LayoutDashboard, Microscope } from 'lucide-react'; 
import { 
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// -------------------------------------------------------------------
// 🔑 CONFIGURACIÓN DE RUTAS DE API ACTUALIZADA
// -------------------------------------------------------------------
const BASE_URL = 'http://localhost:3000'; // Tu servidor de backend
const API_URLS = {
    // Estas rutas deben devolver un ARRAY de elementos que contaremos con .length
    MASCOTAS_DISPONIBLES: `${BASE_URL}/mascotas/contar`,
    SOLICITUDES_PENDIENTES: `${BASE_URL}/adopciones/pendientes`, 
    CITAS_HOY: `${BASE_URL}/citas/contar`, 
    // Asumo que esta ruta devuelve un único objeto con el total de ingresos.
    INGRESOS_MES: `${BASE_URL}/finanzas/ingresos/mes`, 
};

// -------------------------------------------------------------------
// COMPONENTE 1: MÉTRICAS DIRECTAS (KPIs) - Se mantiene igual
// -------------------------------------------------------------------
const KpiCard = ({ title, value, icon: IconComponent, color, subtitle, loading = false, isCurrency = false }) => {
    // ... (el código de KpiCard se mantiene IGUAL)
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
// COMPONENTE 2: CONTENEDOR DE GRÁFICAS (GraphCard) - Se mantiene igual
// -------------------------------------------------------------------
const GraphCard = ({ title, height = 300, icon: IconComponent, loading = false, children }) => (
    <Card sx={{ height: '100%', minHeight: height, transition: 'box-shadow 0.3s' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                {IconComponent && <IconComponent size={24} color="#007BFF" />}
            </Box>
            
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: height - 80 
                }}
            >
                {loading ? (
                    <CircularProgress size={30} />
                ) : (
                    children
                )}
            </Box>
        </CardContent>
    </Card>
);

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

    // 2. FUNCIÓN ASÍNCRONA PARA EL FETCH
    // 2. FUNCIÓN ASÍNCRONA PARA EL FETCH
useEffect(() => {
        
        // FUNCIÓN UNIFICADA (Asume que el backend devuelve un número directo)
        const fetchNumericValue = async (url) => {
            const response = await fetch(url);

            if (!response.ok) {
                // ⚠️ IMPORTANTE: Si una promesa falla, lanzamos un error que será capturado abajo.
                console.error(`ERROR HTTP en ${url}: ${response.status} ${response.statusText}`);
                throw new Error(`Fallo en la petición a ${url}`);
            }
            
            const data = await response.json(); 
            
            // Lógica para devolver el número o 0.
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
                // 🔑 CAMBIO CLAVE: Solo se ejecuta la promesa de mascotasCount
                const mascotasCount = await fetchNumericValue(API_URLS.MASCOTAS_DISPONIBLES);
            
                //const solicitudesCount = await fetchNumericValue(API_URLS.SOLICITUDES_PENDIENTES);
                const citasCount = await fetchNumericValue(API_URLS.CITAS_HOY);
                //const ingresosTotal = await fetchNumericValue(API_URLS.INGRESOS_MES);

                // Actualizamos el estado
                setKpiMetrics({
                    mascotasDisponibles: mascotasCount,
                    // Dejamos los demás en null para que se muestren como N/A
                    solicitudesPendientes: null, 
                    citasProgramadasHoy: citasCount, 
                    ingresosMes: null, 
                    loadingKpis: false,
                });

            } catch (error) {
                // Este catch solo se ejecutará si falla la promesa de mascotasCount
                console.error("Error FATAL al obtener KPIs (Mascotas):", error);
                
                setKpiMetrics(prev => ({ 
                    ...prev, 
                    loadingKpis: false, 
                    mascotasDisponibles: null, // Si falla, sigue siendo null/N/A
                    solicitudesPendientes: null, 
                    citasProgramadasHoy: null, 
                    ingresosMes: null 
                }));
            }
        };

        fetchKpis();
    }, []);

    // 3. DATOS SIMULADOS RESTANTES (Gráficos y Listas)
    // Se mantienen los datos simulados para el resto del dashboard que no se está modificando.
    const simulatedMetrics = {
        adopcionTrend: [
            { name: 'Ene', Solicitudes: 15, Aprobaciones: 10 },
            { name: 'Feb', Solicitudes: 20, Aprobaciones: 14 },
            { name: 'Mar', Solicitudes: 18, Aprobaciones: 12 },
            { name: 'Abr', Solicitudes: 25, Aprobaciones: 19 },
            { name: 'May', Solicitudes: 30, Aprobaciones: 25 },
            { name: 'Jun', Solicitudes: 35, Aprobaciones: 28 },
        ],
        speciesDistribution: [
            { name: 'Perros Disponibles', value: 5, color: '#007BFF' },
            { name: 'Gatos Disponibles', value: 3, color: '#32CD32' },
            { name: 'Conejos Disponibles', value: 1, color: '#FFC107' },
            { name: 'Perros en Proceso', value: 2, color: '#dc3545' },
            { name: 'Gatos en Proceso', value: 1, color: '#fd7e14' },
        ],
        monthlyRevenue: [
            { name: 'Ene', Ingresos: 3500 },
            { name: 'Feb', Ingresos: 4200 },
            { name: 'Mar', Ingresos: 3800 },
            { name: 'Abr', Ingresos: 5100 },
            { name: 'May', Ingresos: 5500 },
            { name: 'Jun', Ingresos: 6000 },
        ],
        expedientesSinConsulta: [
            { id: 1, nombre: 'Max (Labrador)', dias: 95 }, 
            { id: 2, nombre: 'Nala (Angora)', dias: 70 }
        ],
        proximosSeguimientos: [
            { id: 1, mascota: 'Rocky', fecha: '2025-10-25', dias: 2 },
            { id: 2, mascota: 'Thor', fecha: '2025-10-28', dias: 5 }
        ],
    };

    // --- Definiciones de Gráficos y Listas (usan simulatedMetrics) ---
    const AdopcionBarChart = (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={simulatedMetrics.adopcionTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none', borderRadius: 4 }}
                    formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Bar dataKey="Solicitudes" fill={theme.palette.primary.light} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Aprobaciones" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
        </ResponsiveContainer>
    );

    const SpeciesPieChart = (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={simulatedMetrics.speciesDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                >
                    {simulatedMetrics.speciesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none', borderRadius: 4 }}
                    formatter={(value, name) => [value, name]}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
            </PieChart>
        </ResponsiveContainer>
    );

    const RevenueAreaChart = (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulatedMetrics.monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis 
                    stroke={theme.palette.text.secondary} 
                    tickFormatter={(tick) => `$${tick.toLocaleString()}`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none', borderRadius: 4 }}
                    formatter={(value, name) => [`$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, name]}
                />
                <Area type="monotone" dataKey="Ingresos" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} fillOpacity={0.6} />
            </AreaChart>
        </ResponsiveContainer>
    );

    const ExpedientesList = (
        <List sx={{ width: '100%' }}>
            {simulatedMetrics.expedientesSinConsulta.map((item) => (
                <ListItem key={item.id} divider>
                    <ListItemIcon>
                        <Microscope size={20} color={theme.palette.error.main} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.nombre} 
                        secondary={`Última consulta hace ${item.dias} días`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                    />
                </ListItem>
            ))}
             <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'right' }}>
                Total: {simulatedMetrics.expedientesSinConsulta.length} Mascotas
            </Typography>
        </List>
    );

    const SeguimientosList = (
        <List sx={{ width: '100%' }}>
            {simulatedMetrics.proximosSeguimientos.map((item) => (
                <ListItem key={item.id} divider>
                    <ListItemIcon>
                        <Heart size={20} color={theme.palette.warning.main} />
                    </ListItemIcon>
                    <ListItemText 
                        primary={`Seguimiento de ${item.mascota}`} 
                        secondary={`Fecha: ${item.fecha} (en ${item.dias} días)`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                    />
                </ListItem>
            ))}
             <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'right' }}>
                Total: {simulatedMetrics.proximosSeguimientos.length} Próximos
            </Typography>
        </List>
    );
    // -------------------------------------------------------------------

    return (
        <Box sx={{ p: 0 }}>
            
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.dark }}>
                <LayoutDashboard size={30} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Panel de Control - Resumen Operativo IMPA
            </Typography>
            
            <Divider sx={{ mb: 4 }} />

            {/* ------------------------------------------------------------------- */}
            {/* 🔑 FILA SUPERIOR: Métricas Clave (KPIs) - AHORA USAN EL ESTADO REAL  */}
            {/* ------------------------------------------------------------------- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* 1. Mascotas Disponibles (PRIORIDAD) */}
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
                
                {/* 2. Solicitudes de Adopción Pendientes (PRIORIDAD ALTA) */}
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
                
                {/* 4. Ingresos por Servicios (KPI Financiero) */}
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
            {/* ... Resto del dashboard con gráficas simuladas ... */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* Cuadro 5: Tendencias de Adopción (Gráfico de Barras) */}
                <Grid item xs={12} lg={8}>
                    <GraphCard 
                        title="Tendencia Mensual: Solicitudes vs. Aprobaciones" 
                        icon={BarChart} 
                        height={400} 
                    >
                        {AdopcionBarChart}
                    </GraphCard>
                </Grid>
                
                {/* Cuadro 6: Distribución de Inventario (Gráfico de Pastel) */}
                <Grid item xs={12} lg={4}>
                    <GraphCard 
                        title="Inventario por Especie y Estado" 
                        icon={Pets}
                        height={400} 
                    >
                        {SpeciesPieChart}
                    </GraphCard>
                </Grid>
            </Grid>
            
            <Grid container spacing={3}>
                
                {/* Cuadro 7: Ingresos por Servicios Veterinarios (Gráfico de Área) */}
                <Grid item xs={12} sm={6} lg={4}>
                    <GraphCard 
                        title="Desempeño Financiero Mensual" 
                        icon={TrendingUp}
                        height={300} 
                    >
                        {RevenueAreaChart}
                    </GraphCard>
                </Grid>

                {/* Cuadro 8: Tareas Veterinarias (Lista) */}
                <Grid item xs={12} sm={6} lg={4}>
                    <GraphCard 
                        title="Alerta: Expedientes sin Consulta Reciente" 
                        icon={Microscope}
                        height={300} 
                    >
                        {ExpedientesList}
                    </GraphCard>
                </Grid>
                
                    {/* Cuadro 9: Seguimientos Próximos (Lista) */}
                <Grid item xs={12} lg={4}>
                    <GraphCard 
                        title="Próximos Seguimientos Post-Adopción" 
                        icon={CalendarMonth}
                        height={300} 
                    >
                        {SeguimientosList}
                    </GraphCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardContentMUI;