'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  alpha,
  useTheme,
  Card,
  CardContent,
  IconButton,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Image from 'next/image';

export default function DivulgacaoPage() {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section com imagem grande */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/volei-praia-hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Imagem de fundo alternativa caso não tenha a imagem */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Logo/Identidade */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 3 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 1.5,
                      mr: 2,
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: `2px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
                    }}
                  >
                    <SportsVolleyballIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Paper>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 900,
                      background: `linear-gradient(135deg, white 30%, ${theme.palette.secondary.light} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      lineHeight: 1.2,
                    }}
                  >
                    PERNAS NA AREIA
                  </Typography>
                </Box>

                {/* Subtítulo */}
                <Typography
                  variant="h5"
                  sx={{
                    color: alpha(theme.palette.common.white, 0.9),
                    mb: 4,
                    fontWeight: 400,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    maxWidth: 600,
                  }}
                >
                  O maior campeonato de vôlei dupla de Remígio-PB está de volta!
                </Typography>

                {/* Frase principal */}
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    mb: 6,
                    fontWeight: 700,
                    textShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    fontSize: { xs: '2rem', md: '3rem' },
                    lineHeight: 1.2,
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: '100%',
                      height: 4,
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                      borderRadius: 2,
                    },
                  }}
                >
                  Emocione-se na areia, conquiste na quadra!
                </Typography>

                {/* Botão de inscrição */}
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    py: 2,
                    px: 6,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover:before': {
                      left: '100%',
                    },
                  }}
                  onClick={() => scrollToSection('inscricao')}
                >
                  INSCREVA-SE JÁ!
                </Button>

                {/* Informações rápidas */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  sx={{ mt: 6, justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  {[
                    { icon: <EventIcon />, text: 'Temporada 2024' },
                    { icon: <LocationOnIcon />, text: 'Remígio-PB' },
                    { icon: <GroupsIcon />, text: 'Duplas Masculinas' },
                    { icon: <EmojiEventsIcon />, text: 'Premiação Especial' },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white',
                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        p: 1.5,
                        minWidth: 180,
                      }}
                    >
                      <Box sx={{ mr: 1.5, color: theme.palette.secondary.light }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Seta para baixo */}
        <IconButton
          onClick={() => scrollToSection('sobre')}
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: alpha(theme.palette.common.white, 0.2),
            backdropFilter: 'blur(10px)',
            border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
            color: 'white',
            animation: 'bounce 2s infinite',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.3),
              transform: 'translateX(-50%) scale(1.1)',
            },
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '50%': {
                transform: 'translateX(-50%) translateY(-10px)',
              },
            },
          }}
        >
          <ArrowDownwardIcon />
        </IconButton>
      </Box>

      {/* Seção Sobre Nós */}
      <Box
        id="sobre"
        sx={{
          py: 10,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: -50,
            left: 0,
            right: 0,
            height: 50,
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                color: theme.palette.primary.dark,
                fontWeight: 800,
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 100,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  borderRadius: 2,
                },
              }}
            >
              Sobre Nós
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 800,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Conheça a história por trás do maior campeonato de vôlei de praia de Remígio
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  height: 400,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Imagem ilustrativa */}
                <SportsVolleyballIcon sx={{ fontSize: 120, color: alpha(theme.palette.primary.main, 0.2) }} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.9),
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  Desde 2015
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.dark, mb: 2, fontWeight: 700 }}>
                    Nossa História
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    O <strong>Pernas na Areia</strong> nasceu em 2015 com um simples objetivo: 
                    reunir amantes do vôlei de praia em Remígio para competições saudáveis e 
                    momentos de diversão. O que começou como um pequeno torneio entre amigos 
                    transformou-se no maior campeonato da região.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Ao longo dos anos, temos promovido não apenas o esporte, mas também a 
                    integração social, a saúde e o desenvolvimento de atletas locais.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {[
                    { number: '8+', label: 'Edições Realizadas' },
                    { number: '500+', label: 'Atletas Participantes' },
                    { number: '100+', label: 'Duplas Formadas' },
                    { number: 'R$ 50k+', label: 'Em Premiações' },
                  ].map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 3,
                          textAlign: 'center',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 800,
                            mb: 1,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {stat.number}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Seção Regulamentação */}
      <Box
        id="regulamento"
        sx={{
          py: 10,
          backgroundColor: alpha(theme.palette.primary.dark, 0.05),
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                color: theme.palette.primary.dark,
                fontWeight: 800,
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 150,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  borderRadius: 2,
                },
              }}
            >
              Regulamentação
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 800,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Conheça as regras e baixe o regulamento completo
            </Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.dark, mb: 4, fontWeight: 700 }}>
                    Principais Regras do Campeonato
                  </Typography>
                  
                  <Stack spacing={3}>
                    {[
                      {
                        title: 'Formato da Competição',
                        content: 'O campeonato será disputado em formato de eliminatória simples, com partidas melhor de 3 sets. Cada set será disputado até 21 pontos, com diferença mínima de 2 pontos.'
                      },
                      {
                        title: 'Categorias e Inscrições',
                        content: 'Aberto para duplas masculinas. Cada atleta pode participar em apenas uma dupla. Inscrições mediante pagamento da taxa e preenchimento da ficha completa.'
                      },
                      {
                        title: 'Requisitos dos Atletas',
                        content: 'Todos os participantes devem apresentar documento oficial com foto. É obrigatório o uso de equipamento esportivo adequado e seguro.'
                      },
                      {
                        title: 'Premiação',
                        content: 'As três melhores duplas serão premiadas com valores em dinheiro e troféus. Premiação especial para atleta mais esportivo e jogada mais bonita.'
                      },
                      {
                        title: 'Código de Conduta',
                        content: 'Respeito aos adversários, árbitros e organização é fundamental. Qualquer atitude antidesportiva resultará em desclassificação.'
                      },
                    ].map((rule, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 3,
                          backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          borderRadius: 2,
                          borderLeft: `4px solid ${theme.palette.secondary.main}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Typography variant="h6" sx={{ color: theme.palette.primary.dark, mb: 1, fontWeight: 700 }}>
                          {rule.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                          {rule.content}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.dark, 0.95),
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.9)} 100%)`,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <EventIcon sx={{ fontSize: 60, color: theme.palette.secondary.light, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Regulamento Completo
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                    Baixe o documento oficial com todas as regras detalhadas, critérios de desempate, calendário completo e informações importantes.
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                      Tamanho do documento
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      2.5 MB (PDF)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                      Última atualização
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      15 de Março, 2024
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<DownloadIcon />}
                  sx={{
                    mt: 4,
                    py: 2,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    color: theme.palette.primary.dark,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  href="/regulamento-pernas-na-areia-2024.pdf"
                  download
                >
                  BAIXAR REGULAMENTO
                </Button>

                <Divider sx={{ my: 4, backgroundColor: alpha(theme.palette.common.white, 0.2) }} />

                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                    Precisa de ajuda com o regulamento?
                  </Typography>
                  <MuiLink
                    component={Link}
                    href="/contato"
                    sx={{
                      color: theme.palette.secondary.light,
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Entre em contato conosco →
                  </MuiLink>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Seção de Inscrição */}
          <Box
            id="inscricao"
            sx={{
              mt: 10,
              p: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" sx={{ color: theme.palette.primary.dark, mb: 3, fontWeight: 800 }}>
              Não perca sua vaga!
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 800, mx: 'auto' }}>
              As vagas são limitadas e as inscrições encerram em breve. Garanta sua participação no maior evento de vôlei de praia de Remígio.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: 8,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                },
              }}
              component={Link}
              href="/inscricao"
            >
              FAZER INSCRIÇÃO AGORA
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 3, color: theme.palette.text.secondary }}>
              Inscrições abertas até 30 de Abril de 2024
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}