'use client';

import { useState } from 'react';
import { 
  Box, Button, Typography, Container, Paper, Stack, IconButton, 
  Modal, Fade, Backdrop, Grid, Card, CardContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function DivulgacaoPage() {
  const [openModal, setOpenModal] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* HERO COM IMAGEM RESPONSIVA */}
      <Box
  sx={{
    position: 'relative',
    width: '100%',
    height: {
      xs: '70vh',
      sm: '85vh',
      md: '95vh',
      lg: '100vh'
    },
    backgroundImage: {
      xs: "url('/imgprincipalv.jpg')",
      sm: "url('/imgprincipalh.jpg')",
      md: "url('/imgprincipalh.jpg')"
    },
    backgroundSize: 'cover',
    backgroundPosition: {
      xs: 'center 60%', // sobe a imagem 20% no mobile
      sm: 'center center',
      md: 'center center',
      lg: 'center center'
    },
    backgroundRepeat: 'no-repeat',
  }}
>
        <Button
          onClick={handleOpenModal}
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: { xs: 40, sm: 60, md: 80, lg: 120 },
            left: '50%',
            transform: 'translateX(-50%)',
            px: { xs: 5, sm: 6, md: 7 },
            py: { xs: 2, sm: 2.5, md: 3 },
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.15rem' },
            fontWeight: 800,
            letterSpacing: { xs: 0.8, md: 1 },
            borderRadius: 4,
            color: '#fff',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFC400 100%)',
            boxShadow: `
              0 10px 30px rgba(0,0,0,0.35),
              inset 0 -2px 0 rgba(0,0,0,0.15)
            `,
            transition: 'all 0.35s ease',
            '&:hover': {
              transform: 'translateX(-50%) translateY(-4px)',
              boxShadow: `
                0 18px 40px rgba(0,0,0,0.45),
                0 0 25px rgba(255, 215, 0, 0.6)
              `,
              background: 'linear-gradient(135deg, #ca7300 0%, #ca7300 100%)',
            },
          }}
        >
          INSCREVA-SE AGORA
        </Button>
      </Box>

      {/* MODAL - MANTÉM DESKTOP IGUAL */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        disableScrollLock={true} 
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
          },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '95%', md: '400px' },
              maxWidth: '400px',
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 0,
              outline: 'none',
            }}
          >
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                pb: { xs: 2, md: 2 },
                borderBottom: '1px solid #eee',
                position: 'relative',
              }}
            >
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: '#666',
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
              
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  textAlign: 'center',
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                Inscrições
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2}>
                <Button
                  component={Link}
                  href="/inscricao/nova"
                  onClick={handleCloseModal}
                  variant="contained"
                  startIcon={<EditNoteIcon />}
                  fullWidth
                  sx={{
                    py: { xs: 1.5, md: 2 },
                    backgroundColor: '#FFD700',
                    color: '#1a1a1a',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#FFC400',
                    }
                  }}
                >
                  Nova Inscrição
                </Button>

                <Button
                  component={Link}
                  href="/inscricao/status"
                  onClick={handleCloseModal}
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  fullWidth
                  sx={{
                    py: { xs: 1.5, md: 2 },
                    borderColor: '#ddd',
                    color: '#555',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.05)',
                    }
                  }}
                >
                  Acompanhar Inscrição
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                  borderLeft: '3px solid #FFD700',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                    lineHeight: 1.4,
                  }}
                >
                  • Vagas limitadas<br/>
                  • Dúvidas: arthuremanuelgl@gmail.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* SEÇÃO SOBRE O EVENTO */}
      <Box 
        id="sobre" 
        sx={{ 
          minHeight: '100vh', 
          py: { xs: 6, sm: 8, md: 12 },
          px: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#F5F9F5',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                color: '#1a1a1a',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              SOBRE O EVENTO
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Conheça a segunda edição do PERNAS NA AREIA
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 4, md: 6 }}
            sx={{ mb: 8 }}
          >
            <Box sx={{ flex: 1 }}>
              <Paper 
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#000',
                  minHeight: { xs: '300px', sm: '350px', md: '400px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&:hover .play-button': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(255, 215, 0, 0.9)',
                    }
                  }}
                >
                  <IconButton
                    className="play-button"
                    sx={{
                      backgroundColor: 'rgba(255, 215, 0, 0.8)',
                      color: '#fff',
                      width: { xs: 70, md: 80 },
                      height: { xs: 70, md: 80 },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#FFD700',
                      }
                    }}
                    onClick={() => setOpenVideo(true)}
                  >
                    <PlayCircleOutlineIcon sx={{ fontSize: { xs: 40, md: 50 } }} />
                  </IconButton>
                </Box>
              </Paper>
              
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mt: 2, 
                textAlign: 'center', 
                color: '#666',
                fontSize: { xs: '0.8rem', md: '0.875rem' }
              }}>
                Assista ao vídeo da primeira edição
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 4, 
                color: '#1a1a1a',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                SEGUNDA EDIÇÃO
              </Typography>
              
              <Typography variant="body1" sx={{ 
                mb: 4, 
                color: '#555', 
                lineHeight: 1.8,
                fontSize: { xs: '0.95rem', md: '1rem' }
              }}>
                O <strong>PERNAS NA AREIA</strong> é um evento esportivo que reúne amantes de vôlei
                em uma competição saudável e divertida. Em sua segunda edição, prometemos superar todas as expectativas.
              </Typography>
              
              <Stack spacing={3} sx={{ mb: 4 }}>
                {[
                  {
                    icon: <CalendarTodayIcon sx={{ color: '#FFD700' }} />,
                    title: 'DATA DO EVENTO',
                    description: '28 FEV - 01 MAR de 2026'
                  },
                  {
                    icon: <LocationOnIcon sx={{ color: '#FFD700' }} />,
                    title: 'LOCAL',
                    description: 'Quadra Prof. Neto Roque, Lagoa Parque - Remígio - PB'
                  },
                ].map((item, index) => (
                  <Box 
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 2,
                      backgroundColor: '#FFF',
                      borderLeft: '4px solid #FFD700',
                    }}
                  >
                    <Box sx={{ fontSize: { xs: 24, md: 28 } }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        color: '#555',
                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 700, 
                        color: '#1a1a1a',
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* SEÇÃO DE REGULAMENTAÇÃO */}
      <Box 
        id="regulamentacao" 
        sx={{ 
          minHeight: '100vh', 
          py: { xs: 6, sm: 8, md: 12 },
          px: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#F5F9F5',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                color: '#1a1a1a',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              REGULAMENTAÇÃO
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#666',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Conheça as regras oficiais do evento e garanta sua participação
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 4, md: 6 }}
            sx={{ mb: 8 }}
          >
            <Paper 
              elevation={3}
              sx={{
                flex: 1,
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 4,
                backgroundColor: 'white',
                border: '2px solid #FFD700',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                }
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  borderRadius: '50%',
                  backgroundColor: '#FFF9C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: { xs: 3, md: 4 },
                  border: '3px solid #FFD700'
                }}
              >
                <DescriptionIcon sx={{ 
                  fontSize: { xs: 35, md: 50 }, 
                  color: '#F57C00' 
                }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#1a1a1a',
                fontSize: { xs: '1.3rem', md: '1.5rem' }
              }}>
                Documento Oficial
              </Typography>
              
              <Typography variant="body1" sx={{ 
                mb: { xs: 3, md: 4 }, 
                color: '#666',
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}>
                Regulamento completo da segunda edição do PERNAS NA AREIA com todas as regras, direitos e deveres dos participantes.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                width: '100%'
              }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href="/regulamento-oficial.pdf" 
                  download="Regulamento_Pernas_Na_Areia_2025.pdf"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#1a1a1a',
                    fontWeight: 700,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    borderRadius: 3,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '&:hover': {
                      backgroundColor: '#FFC400',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  BAIXAR PDF
                </Button>
              </Box>
              
              <Typography variant="caption" sx={{ 
                mt: { xs: 3, md: 4 }, 
                color: '#999',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}>
                Tamanho: 144 KB
              </Typography>
            </Paper>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 4, 
                color: '#1a1a1a',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Tópicos Importantes
              </Typography>
              
              <Stack spacing={3}>
                {[
                  {
                    icon: <PeopleIcon sx={{ color: '#4CAF50' }} />,
                    title: 'Categorias',
                    description: 'Sub-17, Sub-21 e Open (masc. e fem.), considerando apenas o ano de nascimento'
                  },
                  {
                    icon: <ChecklistIcon sx={{ color: '#2196F3' }} />,
                    title: 'Inscrições',
                    description: '15 vagas por categoria. Inscrição válida após formulário e pagamento. Sem reembolso'
                  },
                  {
                    icon: <SportsVolleyballIcon sx={{ color: '#FF9800' }} />,
                    title: 'Formato da Disputa',
                    description: 'Fase de grupos, mata-mata e repescagem para melhor dupla eliminada'
                  },
                  {
                    icon: <EmojiEventsIcon sx={{ color: '#9C27B0' }} />,
                    title: 'Premiação',
                    description: 'Até R$ 350 + troféu e medalhas (mín. 10 equipes por categoria)'
                  }
                ].map((item, index) => (
                  <Paper 
                    key={index}
                    elevation={1}
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: 3,
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 2, md: 3 },
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#FFFDE7',
                      }
                    }}
                  >
                    <Box sx={{ fontSize: { xs: 28, md: 32 } }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600, 
                        mb: 0.5,
                        fontSize: { xs: '0.95rem', md: '1rem' }
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#666',
                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>

          <Paper 
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              backgroundColor: '#FFF3E0',
              borderLeft: '6px solid #FF9800',
              mt: 4
            }}
          >
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              color: '#E65100',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              ⚠️ ATENÇÃO
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 1.5,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              • A leitura completa do regulamento é <strong>obrigatória</strong> para todos os participantes
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 1.5,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              • O não cumprimento de qualquer item do regulamento poderá resultar em desclassificação
            </Typography>
            <Typography variant="body1" sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              • Dúvidas sobre o regulamento devem ser encaminhadas para: 
              <strong> arthuremanuelgl@gmail.com </strong>
            </Typography>
          </Paper>
        </Container>
            
        <Dialog
          open={openVideo}
          onClose={() => setOpenVideo(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 2, md: 3 },
              width: '100%',
              maxWidth: { xs: '95vw', md: '800px' },
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%'
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/K03Igalphzo?autoplay=1"
                title="Vídeo do evento"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0
                }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}