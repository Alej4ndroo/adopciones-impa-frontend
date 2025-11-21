import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Grid, Paper, 
    CircularProgress, Alert, FormControlLabel, Checkbox, 
    Divider, useTheme, Card, CardContent, Chip, Stack,
    alpha, Fade, Zoom
} from '@mui/material';
import { 
    Pets as PetsIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;
const CREATE_PET_ENDPOINT = '/mascotas/crear';

const ESPECIE_OPTIONS = ['perro', 'gato', 'conejo', 'hamster', 'otro'];
const TAMANO_OPTIONS = [
    { value: 'pequeño', label: 'Pequeño' }, // usa n + tilde combinada para coincidir con enum DB
    { value: 'mediano', label: 'Mediano' },
    { value: 'grande', label: 'Grande' }
];
const TAMANO_LABELS = { 'pequeño': 'Pequeño', 'pequeño': 'Pequeño', pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };
const SEXO_OPTIONS = ['macho', 'hembra'];

const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); 
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const ImagePreview = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    return (
        <Card 
            elevation={3}
            sx={{ 
                position: 'relative', 
                overflow: 'hidden', 
                height: 160,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                }
            }}
        >
            {previewUrl ? (
                <Box 
                    component="img"
                    src={previewUrl}
                    alt={file.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                }}>
                    <CircularProgress size={30} />
                </Box>
            )}
            <Button
                size="small"
                onClick={onRemove}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: alpha('#000', 0.6),
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    '&:hover': { 
                        bgcolor: theme.palette.error.main,
                        transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                }}
            >
                <CloseIcon sx={{ fontSize: 18 }} />
            </Button>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: alpha('#000', 0.7),
                    backdropFilter: 'blur(8px)',
                    p: 1
                }}
            >
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'white',
                        display: 'block',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {file.name}
                </Typography>
            </Box>
        </Card>
    );
};

const MascotasCrearPage = () => {
    const theme = useTheme();
    
    const [formData, setFormData] = useState({
        nombre: '',
        especie: 'perro',
        raza: '',
        edad_en_meses: '',
        color: '',
        tamano: 'mediano',
        sexo: 'macho',
        descripcion: '',
        vacunado: false,
        esterilizado: false,
        estado_adopcion: 'disponible',
    });
    
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleRemoveFile = (fileName) => {
        setImageFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No autenticado. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        const userDataString = localStorage.getItem('userData');
        let id_usuario;

        try {
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                id_usuario = userData.id_usuario;
            }
        } catch (err) {
            console.error("Error al parsear userData de localStorage:", err);
            setError("Error al leer los datos del usuario. Inicie sesión de nuevo.");
            setLoading(false);
            return;
        }

        const base64Images = [];
        try {
            const conversions = imageFiles.map(file => convertFileToBase64(file));
            const results = await Promise.all(conversions);
            base64Images.push(...results);
        } catch (err) {
            console.error("Error al convertir a Base64:", err);
            setError("Error al procesar las imágenes. Intente de nuevo.");
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            imagenes_base64: base64Images, 
            edad_en_meses: parseInt(formData.edad_en_meses, 10) || 0,
            creado_por: id_usuario
        };

        try {
            const response = await axios.post(`${API_URL_BACKEND}${CREATE_PET_ENDPOINT}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess(`Mascota "${response.data.nombre}" creada con éxito con ${imageFiles.length} imagen(es).`);
            
            setFormData({
                nombre: '',
                especie: 'perro', 
                raza: '',
                edad_en_meses: '',
                color: '',
                tamano: 'mediano', 
                sexo: 'macho', 
                descripcion: '',
                vacunado: false,
                esterilizado: false,
                estado_adopcion: 'disponible',
            });
            setImageFiles([]); 

        } catch (err) {
            console.error("Error al crear mascota:", err);
            const errorMessage = err.response?.data?.error || "Error de red o del servidor. Inténtelo de nuevo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
            <Box sx={{ width: '100%', mx: 'auto' }}>
                
                {/* Header Mejorado */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3,
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
                                p: 2,
                                borderRadius: 2,
                                display: 'flex'
                            }}
                        >
                            <PetsIcon sx={{ fontSize: 40 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Registrar Nueva Mascota
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Complete el formulario para agregar una mascota al sistema de adopción
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Alertas con animación */}
                {success && (
                    <Zoom in={Boolean(success)}>
                        <Alert 
                            severity="success" 
                            icon={<CheckCircleIcon />}
                            sx={{ mb: 3, borderRadius: 2 }}
                            onClose={() => setSuccess(null)}
                        >
                            {success}
                        </Alert>
                    </Zoom>
                )}

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

                {/* Formulario Principal */}
                <Paper 
                    elevation={3} 
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ 
                        width: '100%',
                        p: { xs: 3, sm: 4, md: 5 },
                        borderRadius: 3
                    }}
                >
                    {/* Sección: Información Básica */}
                    <Box sx={{ mb: 5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Box 
                                sx={{ 
                                    width: 4, 
                                    height: 28, 
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }} 
                            />
                            <Typography variant="h6" fontWeight={600} color="primary">
                                Información Básica
                            </Typography>
                        </Stack>
                        
                        <Stack spacing={3}>
                            <TextField 
                                fullWidth 
                                required 
                                label="Nombre" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange}
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            
                            <FormControl fullWidth required>
                                <InputLabel>Especie</InputLabel>
                                <Select 
                                    name="especie" 
                                    value={formData.especie} 
                                    onChange={handleChange} 
                                    label="Especie"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {ESPECIE_OPTIONS.map(opt => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <TextField 
                                fullWidth 
                                label="Raza (Opcional)" 
                                name="raza" 
                                value={formData.raza} 
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            
                            <TextField 
                                fullWidth 
                                required 
                                label="Edad (meses)" 
                                name="edad_en_meses" 
                                type="number" 
                                inputProps={{ min: 0 }} 
                                value={formData.edad_en_meses} 
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            
                            <TextField 
                                fullWidth 
                                required 
                                label="Color" 
                                name="color" 
                                value={formData.color} 
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            
                            <FormControl fullWidth required>
                                <InputLabel>Tamaño</InputLabel>
                                <Select 
                                    name="tamano" 
                                    value={formData.tamano} 
                                    onChange={handleChange} 
                                    label="Tamaño"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {TAMANO_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth required>
                                <InputLabel>Sexo</InputLabel>
                                <Select 
                                    name="sexo" 
                                    value={formData.sexo} 
                                    onChange={handleChange} 
                                    label="Sexo"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {SEXO_OPTIONS.map(opt => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Sección: Fotografías */}
                    <Box sx={{ mb: 5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Box 
                                sx={{ 
                                    width: 4, 
                                    height: 28, 
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }} 
                            />
                            <Typography variant="h6" fontWeight={600} color="primary">
                                Fotografías de la Mascota
                            </Typography>
                        </Stack>

                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload-button"
                            type="file"
                            onChange={handleFileChange}
                            multiple 
                        />
                        <label htmlFor="image-upload-button">
                            <Card
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: `2px dashed ${imageFiles.length > 0 ? theme.palette.success.main : theme.palette.divider}`,
                                    bgcolor: imageFiles.length > 0 ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <CloudUploadIcon 
                                    sx={{ 
                                        fontSize: 60, 
                                        color: imageFiles.length > 0 ? theme.palette.success.main : theme.palette.primary.main,
                                        mb: 2 
                                    }} 
                                />
                                <Typography variant="h6" gutterBottom>
                                    {imageFiles.length > 0 
                                        ? `${imageFiles.length} imagen(es) seleccionada(s)` 
                                        : 'Seleccionar Imágenes'
                                    }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Haga clic o arrastre imágenes aquí • PNG, JPG, WEBP
                                </Typography>
                            </Card>
                        </label>

                        {imageFiles.length > 0 && (
                            <Fade in={imageFiles.length > 0}>
                                <Box sx={{ mt: 3 }}>
                                    <Grid container spacing={2}>
                                        {imageFiles.map((file, index) => (
                                            <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                                <ImagePreview 
                                                    file={file} 
                                                    onRemove={() => handleRemoveFile(file.name)} 
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Fade>
                        )}
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Sección: Descripción */}
                    <Box sx={{ mb: 5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Box 
                                sx={{ 
                                    width: 4, 
                                    height: 28, 
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }} 
                            />
                            <Typography variant="h6" fontWeight={600} color="primary">
                                Descripción
                            </Typography>
                        </Stack>
                        <TextField
                            fullWidth
                            label="Descripción de la Mascota"
                            name="descripcion"
                            multiline
                            rows={4}
                            value={formData.descripcion}
                            onChange={handleChange}
                            helperText="Personalidad, comportamiento, historial o necesidades especiales"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Sección: Estado y Salud */}
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Box 
                                sx={{ 
                                    width: 4, 
                                    height: 28, 
                                    borderRadius: 2,
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }} 
                            />
                            <Typography variant="h6" fontWeight={600} color="primary">
                                Estado y Salud
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        checked={formData.vacunado} 
                                        onChange={handleChange} 
                                        name="vacunado" 
                                        color="primary"
                                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                    />
                                } 
                                label={
                                    <Typography variant="body1" fontWeight={500}>
                                        Vacunado
                                    </Typography>
                                }
                            />
                            
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        checked={formData.esterilizado} 
                                        onChange={handleChange} 
                                        name="esterilizado" 
                                        color="primary"
                                        sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                    />
                                } 
                                label={
                                    <Typography variant="body1" fontWeight={500}>
                                        Esterilizado
                                    </Typography>
                                }
                            />
                        </Stack>
                    </Box>

                    {/* Botón de Envío */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={loading || !formData.nombre || !formData.edad_en_meses || !formData.color}
                            sx={{ 
                                borderRadius: 2, 
                                px: 5, 
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: theme.shadows[4],
                                '&:hover': {
                                    boxShadow: theme.shadows[8],
                                    transform: 'translateY(-2px)'
                                },
                                '&:disabled': {
                                    background: theme.palette.action.disabledBackground
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Registrando...' : 'Registrar Mascota'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
    );
};

export default MascotasCrearPage;
