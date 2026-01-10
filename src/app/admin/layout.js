'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton,
  alpha,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Image from 'next/image';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAuthenticated = status === 'authenticated';

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };
  const handleNavigate = (href) => {
    setMobileOpen(false);
    handleMenuClose();
    router.push(href);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* CABEÇALHO */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
            theme.palette.primary.dark,
            0.9
          )} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 72 },
              px: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* LOGO */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                position: 'absolute',
                left: { xs: 16, sm: 24 },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={38}
                  height={38}
                  style={{ objectFit: 'contain' }}
                />
              </Box>

              <Typography
                variant="h6"
                noWrap
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  fontSize: { xs: '1.05rem', md: '1.25rem' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                PERNAS NA AREIA
              </Typography>
            </Box>

            {/* PERFIL */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 2, position: 'absolute', right: { xs: 16, sm: 24 } }}>
              {isAuthenticated && (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: alpha(theme.palette.common.white, 0.5),
                        backgroundColor: alpha(theme.palette.common.white, 0.2),
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {session?.user?.image ? (
                      <Avatar 
                        src={session.user.image} 
                        sx={{ width: 36, height: 36, border: `2px solid ${alpha(theme.palette.common.white, 0.5)}` }}
                      />
                    ) : (
                      <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    disableScrollLock={true} 
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      elevation: 3,
                      sx: { mt: 1.5, minWidth: 220, borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 1, py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: theme.palette.primary.main }}>
                          {session?.user?.name?.[0] || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{session?.user?.name || 'Usuário'}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{session?.user?.email}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleNavigate('/')} sx={{ py: 1.5 }}>
                      <HomeIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body2">Voltar ao site</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                      <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body2">Sair</Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* CONTEÚDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#F5F9F5', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {children} {/* Aqui a página vai renderizar */}
        </Container>
      </Box>
    </Box>
  );
}
