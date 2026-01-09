'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
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
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import Image from 'next/image';

const navItems = [
  { name: 'Início', href: '/', icon: <HomeIcon /> },
  { name: 'Sobre', href: '/sobre-nos', icon: <InfoIcon /> },
  { name: 'Regulamentação', href: '/eventos', icon: <EventIcon /> },
];

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAuthenticated = status === 'authenticated';

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
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
            {/* LOGO - ESQUERDA */}
            <Box
              component={Link}
              href="/"
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

            {/* MENU DESKTOP - CENTRALIZADO */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                mx: 'auto',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.href}
                  startIcon={React.cloneElement(item.icon, { 
                    sx: { fontSize: 18, color: 'white' } 
                  })}
                  sx={{
                    color: 'white',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    letterSpacing: 0.5,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    mx: 0.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.15),
                      transform: 'translateY(-1px)',
                      '&::after': {
                        transform: 'scaleX(1)',
                      }
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: 3,
                      backgroundColor: theme.palette.secondary.main,
                      transform: 'scaleX(0)',
                      transition: 'transform 0.3s ease',
                      borderRadius: '2px 2px 0 0',
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* AÇÕES DIREITA */}
            <Box sx={{ 
              ml: 'auto', 
              display: { xs: 'none', lg: 'flex' }, 
              gap: 2,
              position: 'absolute',
              right: { xs: 16, sm: 24 },
            }}>
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    href="/admin"
                    variant="contained"
                    startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.grey[100],
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    Gerenciamento
                  </Button>

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
                        sx={{ 
                          width: 36, 
                          height: 36,
                          border: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                        }}
                      />
                    ) : (
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        color: 'white',
                      }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                      }
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 1, py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {session?.user?.name?.[0] || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {session?.user?.name || 'Usuário'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {session?.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      component={Link} 
                      href="/admin" 
                      onClick={handleMenuClose}
                      sx={{ py: 1.5 }}
                    >
                      <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body2">Painel Admin</Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ py: 1.5 }}
                    >
                      <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                      <Typography variant="body2">Sair</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    color: 'white',
                    borderColor: alpha(theme.palette.common.white, 0.3),
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Admin Login
                </Button>
              )}
            </Box>

            {/* HAMBÚRGUER MOBILE */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: 'none' },
                ml: 'auto',
                color: 'white',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                backdropFilter: 'blur(10px)',
                borderRadius: 1.5,
                p: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* DRAWER MOBILE */}
      <Drawer 
        anchor="right" 
        open={mobileOpen} 
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 280,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }
        }}
      >
        <Box sx={{ width: 280, height: '100%' }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Menu
            </Typography>
          </Box>
          
          <List sx={{ py: 2 }}>
            {navItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={handleDrawerToggle}
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <Box sx={{ 
                    color: theme.palette.primary.main,
                    mr: 2 
                  }}>
                    {item.icon}
                  </Box>
                  <ListItemText 
                    primary={item.name} 
                    primaryTypographyProps={{ 
                      fontWeight: 500,
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/admin"
                    onClick={handleDrawerToggle}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <Box sx={{ 
                      color: theme.palette.primary.main,
                      mr: 2 
                    }}>
                      <AdminPanelSettingsIcon />
                    </Box>
                    <ListItemText 
                      primary="Gerenciamento" 
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    <Box sx={{ 
                      color: theme.palette.error.main,
                      mr: 2 
                    }}>
                      <LogoutIcon />
                    </Box>
                    <ListItemText 
                      primary="Sair" 
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        color: theme.palette.error.main,
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  href="/login"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <Box sx={{ 
                    color: theme.palette.primary.main,
                    mr: 2 
                  }}>
                    <LoginIcon />
                  </Box>
                  <ListItemText 
                    primary="Login Admin" 
                    primaryTypographyProps={{ 
                      fontWeight: 500,
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}