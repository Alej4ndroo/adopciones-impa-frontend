// src/components/LoginMUI.jsx (El formulario de login REAL)

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { LockOpen } from '@mui/icons-material';

// ⚠️ Ajusta esta URL al puerto de tu backend (probablemente 3000)
const API_URL_BACKEND = import.meta.env.VITE_API_URL_BACKEND;

const LoginMUI = ({ onLoginSuccess }) => {
  const [correo_electronico, setcorreo_electronico] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Petición al backend
    const response = await axios.post(`${API_URL_BACKEND}/login`, {
        correo_electronico: correo_electronico,
        contrasena: password, 
    });
      // Se asume que el backend devuelve { token: "...", usuario: {...} }
      const { token, usuario } = response.data; 

      if (!token) {
          throw new Error("El servidor no proporcionó un token.");
      }
      
      // Almacenar el token
      localStorage.setItem('authToken', token);
      
      // Llamar al manejador de éxito en App.jsx
      onLoginSuccess({ token, user: usuario });

    } catch (err) {
      console.error('Error de autenticación:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        setError('Usuario o contraseña incorrectos.');
      } else if (err.request) {
        setError(`No se pudo conectar con el servidor en ${API_URL_BACKEND}.`);
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 3, 
          borderRadius: 2
        }}
      >
        <LockOpen color="primary" sx={{ m: 1, fontSize: 40 }} />
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo electrónico o Usuario"
            name="correo_electronico"
            autoComplete="correo_electronico"
            autoFocus
            value={correo_electronico}
            onChange={(e) => setcorreo_electronico(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginMUI;