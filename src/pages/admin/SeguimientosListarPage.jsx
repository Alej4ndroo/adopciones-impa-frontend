import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
  ImageList,
  ImageListItem,
  useTheme
} from '@mui/material';
import { Calendar, PawPrint, User, Phone, Mail, AlertTriangle } from 'lucide-react';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const SeguimientosListarPage = () => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchSeguimientos = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No autenticado. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL_BACKEND}/seguimientosAdopcion/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeguimientos(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error al obtener seguimientos:', err);
        setError('No se pudieron obtener los seguimientos. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeguimientos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Typography variant="h4" fontWeight={700}>Seguimientos de Mascotas</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Revisa las visitas y fotos del seguimiento post-adopción.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {seguimientos.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">No hay seguimientos registrados todavía.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {seguimientos.map((seg) => {
            const adopcion = seg.adopcion || {};
            const mascota = adopcion.mascota || {};
            const persona = adopcion.persona || {};
            const user = seg.realizado_por || {};
            const fotos = Array.isArray(seg.fotos) ? seg.fotos : [];
            return (
              <Grid item xs={12} md={6} key={seg.id_seguimiento}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 56,
                          height: 56,
                          fontWeight: 700
                        }}
                      >
                        <PawPrint />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {mascota.nombre || 'Mascota sin nombre'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seguimiento #{seg.id_seguimiento}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<Calendar size={18} />}
                        label={new Date(seg.fecha_seguimiento).toLocaleDateString()}
                        sx={{ ml: 'auto' }}
                      />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" color="text.secondary">Estado de la mascota</Typography>
                      <Typography variant="body1">{seg.estado_mascota}</Typography>
                      {seg.observaciones && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary">Observaciones</Typography>
                          <Typography variant="body2">{seg.observaciones}</Typography>
                        </>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={mascota.especie || 'Especie'}
                          variant="outlined"
                          size="small"
                        />
                        {seg.requiere_atencion && (
                          <Chip
                            icon={<AlertTriangle size={14} />}
                            label="Requiere atención"
                            color="error"
                            size="small"
                          />
                        )}
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" color="text.secondary">Persona responsable</Typography>
                      <Stack direction="row" spacing={2}>
                        <Avatar>{(persona.nombre || 'U').charAt(0)}</Avatar>
                        <Box>
                          <Typography fontWeight={600}>{persona.nombre || 'Nombre no disponible'}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Phone size={16} />
                            <Typography variant="body2">{persona.telefono || 'Sin teléfono'}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Mail size={16} />
                            <Typography variant="body2">{persona.correo_electronico || 'Sin correo'}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" color="text.secondary">Seguimiento registrado por</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <User size={16} />
                        <Typography variant="body2">
                          {user.nombre || 'Personal interno'} {user.correo_electronico ? `(${user.correo_electronico})` : ''}
                        </Typography>
                      </Stack>
                    </Stack>

                    {fotos.length > 0 && (
                      <>
                        <Typography variant="subtitle2">Galería de fotos</Typography>
                        <ImageList cols={3} rowHeight={120} sx={{ m: 0 }}>
                          {fotos.map((foto) => (
                            <ImageListItem key={foto.id_foto}>
                              <img
                                src={foto.url}
                                alt={foto.descripcion || 'Foto seguimiento'}
                                loading="lazy"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default SeguimientosListarPage;
