import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Pets, Phone, Email, LocationOn } from '@mui/icons-material';

const PublicFooter = () => {
    return (
        <Box component="footer" sx={{ bgcolor: '#1a1a1a', color: 'white', py: 6 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Pets sx={{ mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                IMPA Adopciones
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Transformando vidas, una adopción a la vez.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Contacto
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Phone sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">(443) 123-4567</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Email sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">info@impa.org.mx</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">Morelia, Michoacán</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Síguenos
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Mantente al día con nuestras historias de éxito
                        </Typography>
                    </Grid>
                </Grid>
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        © 2025 IMPA Adopciones. Todos los derechos reservados.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicFooter;