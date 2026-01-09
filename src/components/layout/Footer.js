'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Paper,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');
  const theme = useTheme();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: alpha(theme.palette.primary.dark, 0.95),
        color: 'white',
        py: 6,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.8)})`,
        }
      }}
    >
      {/* Elemento decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Logo e Sobre */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
             <Box
  sx={{
    position: 'relative',
    width: 74,
    height: 74,
    mr: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  }}
>
  <Image
    src="/logo.png"
    alt="Logo Pernas na Areia"
    width={60}
    height={60}
    style={{
      objectFit: 'contain',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
    }}
  />
</Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800,
                    letterSpacing: 1,
                    background: `linear-gradient(white 30%, white 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  PERNAS NA AREIA
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: alpha(theme.palette.common.white, 0.8),
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  CAMPEONATO DE VOLEI DE AREIA
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                opacity: 0.9,
                lineHeight: 1.7,
                pl: 0.5,
              }}
            >
              Reunindo atletas em competições emocionantes na areia.
            </Typography>
          </Grid>

          {/* Contato */}
          <Grid item xs={12} sm={6} md={4}  sx={{ ml: { md: 'auto' } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                color: alpha(theme.palette.common.white, 0.95),
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  background: `linear-gradient(180deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  mr: 2,
                  borderRadius: 1,
                }}
              />
              Contato
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Paper
                  sx={{
                    p: 1,
                    mr: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 20, color: 'white' }} />
                </Paper>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    teste@gmail.com
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Paper
                  sx={{
                    p: 1,
                    mr: 2,
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 20, color: 'white' }} />
                </Paper>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                    Localização
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Remígio - Paraíba, Brasil
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Divisor */}
        <Divider sx={{ 
          my: 4, 
          backgroundColor: alpha(theme.palette.common.white, 0.2),
          border: 'none',
          height: 1,
        }} />

        {/* Redes Sociais e Créditos */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3
        }}>
          
          {/* Créditos */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                mb: 1,
                fontWeight: 500,
              }}
            >
              © {currentYear || '2024'} Campeonato organizado por .... Todos os direitos reservados.
            </Typography>

           <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
              Site desenvolvido por{' '}
              <Link
                href="https://www.linkedin.com/in/henrique-bruno-4522073a0/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ color: 'inherit' }}
              >
                Henrique Bruno da Costa Oliveira
              </Link>
            </Typography>
          </Box>

          {/* Redes Sociais */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                textAlign: { xs: 'center', md: 'right' }, 
                opacity: 0.9,
                fontWeight: 500,
              }}
            >
              Siga-nos nas redes sociais:
            </Typography>
            <Stack 
              direction="row" 
              spacing={1}
              justifyContent={{ xs: 'center', md: 'flex-end' }}
            >
              {[
                { 
                  icon: <InstagramIcon />, 
                  href: 'https://www.instagram.com/perna_sports/',
                  color: '#E4405F'
                },
              ].map((social, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 0,
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.05)',
                    }
                  }}
                >
                  <IconButton 
                    color="inherit" 
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                      width: 44,
                      height: 44,
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(social.color, 0.9),
                        borderColor: alpha(social.color, 0.5),
                        transform: 'scale(1.1)',
                        boxShadow: `0 6px 16px ${alpha(social.color, 0.4)}`,
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Copyright adicional */}
        <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center',
              opacity: 0.6,
              lineHeight: 1.5,
            }}
          >
            Este evento esportivo é realizado em Remígio-PB.
            Consulte nosso regulamento para mais informações sobre inscrições e participação.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}