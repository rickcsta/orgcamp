'use client';

import { useState } from 'react';
import {
  Container, Paper, TextField, Typography, Button,
  Alert, Snackbar
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      email,
      senha,
      redirect: false
    });

    if (result?.error) {
      setSnackbar({
        open: true,
        message: "Credenciais inválidas! Verifique seu email e senha.",
        severity: "error"
      });
      return;
    }

    setSnackbar({
      open: true,
      message: "Login realizado com sucesso!",
      severity: "success"
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        
        <LoginIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />

        <Typography variant="h4" gutterBottom>
          Entrar
        </Typography>

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Senha"
          type="password"
          margin="normal"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Button
          fullWidth
          variant="contained"
          startIcon={<LoginIcon />}
          sx={{ mt: 3, py: 1.2 }}
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={snackbar.severity === "error" ? 4000 : 2500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}