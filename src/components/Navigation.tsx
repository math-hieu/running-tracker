'use client'

import { Box, Chip, Stack, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import {
  Home,
  DirectionsRun as DirectionsRunIcon,
  CloudUpload,
  FitnessCenter,
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation - Chips */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          overflowX: 'auto',
          mb: 3,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: 'fit-content', pb: 1 }}>
          <Chip
            icon={<Home />}
            label="Accueil"
            component={Link}
            href="/"
            clickable
            color={pathname === '/' ? 'primary' : 'default'}
            sx={{
              fontWeight: pathname === '/' ? 600 : 400,
              fontSize: '0.95rem',
            }}
          />
          <Chip
            icon={<DirectionsRunIcon />}
            label="Activités"
            component={Link}
            href="/activities"
            clickable
            color={pathname === '/activities' ? 'primary' : 'default'}
            sx={{
              fontWeight: pathname === '/activities' ? 600 : 400,
              fontSize: '0.95rem',
            }}
          />
          <Chip
            icon={<FitnessCenter />}
            label="Programme"
            component={Link}
            href="/training"
            clickable
            color={pathname === '/training' ? 'primary' : 'default'}
            sx={{
              fontWeight: pathname === '/training' ? 600 : 400,
              fontSize: '0.95rem',
            }}
          />
          <Chip
            icon={<CloudUpload />}
            label="Importer"
            component={Link}
            href="/strava"
            clickable
            color={pathname === '/strava' ? 'primary' : 'default'}
            sx={{
              fontWeight: pathname === '/strava' ? 600 : 400,
              fontSize: '0.95rem',
            }}
          />
        </Stack>
      </Box>

      {/* Mobile Navigation - Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', md: 'none' },
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={pathname}
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0 8px',
              color: '#ffffff',
              '&.Mui-selected': {
                color: '#ff6b35',
              },
            },
            '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                color: '#ffffff',
                opacity: '1'
            },
            '& .Mui-selected .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                color: '#ff6b35',
                opacity: '1'
            },
          }}
        >
          <BottomNavigationAction
            label="Accueil"
            value="/"
            icon={<Home />}
            component={Link}
            href="/"
          />
          <BottomNavigationAction
            label="Activités"
            value="/activities"
            icon={<DirectionsRunIcon />}
            component={Link}
            href="/activities"
          />
          <BottomNavigationAction
            label="Programme"
            value="/training"
            icon={<FitnessCenter />}
            component={Link}
            href="/training"
          />
          <BottomNavigationAction
            label="Importer"
            value="/strava"
            icon={<CloudUpload />}
            component={Link}
            href="/strava"
          />
        </BottomNavigation>
      </Paper>
    </>
  )
}
