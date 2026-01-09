'use client';

import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function DivulgacaoPage() {
  const theme = useTheme();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7)), url('/volei-praia-hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(
              135deg,
              ${alpha(theme.palette.primary.dark, 0.85)} 0%,
              ${alpha(theme.palette.secondary.dark, 0.85)} 100%
            )`,
            zIndex: 0,
          }}
        />

        {/* Conteúdo */}
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <Grid item xs={12} md={9} lg={8}>
              <Box
                sx={{
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                {/* Logo + título */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    mb: 3,
                    gap: 2,
                  }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha('#fff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#fff', 0.3)}`,
                    }}
                  >
                    <SportsVolleyballIcon
                      sx={{ fontSize: 42, color: '#fff' }}
                    />
                  </Paper>

                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2.4rem', md: '4rem' },
                      lineHeight: 1.1,
                      background: `linear-gradient(135deg, #fff, ${theme.palette.secondary.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 16px rgba(0,0,0,.4)',
                    }}
                  >
                    PERNAS NA AREIA
                  </Typography>
                </Box>

                {/* Subtítulo */}
                <Typography
                  sx={{
                    color: alpha('#fff', 0.9),
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    maxWidth: 640,
                    mb: 4,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  O maior campeonato de vôlei de areia dupla de Remígio-PB
                </Typography>

                {/* Frase destaque */}
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: { xs: '1.8rem', md: '2.8rem' },
                    fontWeight: 700,
                    mb: 5,
                    lineHeight: 1.2,
                  }}
                >
                  Emoção, competição e areia quente do começo ao fim.
                </Typography>

                {/* Botão */}
                <Button
                  size="large"
                  onClick={() => scrollToSection('inscricao')}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    color: '#000',
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 12px 32px rgba(0,0,0,.4)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 16px 40px rgba(0,0,0,.5)',
                    },
                  }}
                >
                  INSCREVA-SE AGORA
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SEÇÃO SOBRE (exemplo) */}
      <Box id="sobre" sx={{ minHeight: '100vh', p: 8 }}>
        <Typography variant="h4">Sobre o evento</Typography>
      </Box>

      {/* SEÇÃO Regulamentação (exemplo) */}
      <Box id="regulamentacao" sx={{ minHeight: '100vh', p: 8 }}>
        <Typography variant="h4">Inscrição</Typography>
      </Box>
    </Box>
  );
}
