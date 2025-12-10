'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Stack,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function StravaPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleStravaConnect = () => {
    window.location.href = '/api/strava/auth'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Connexion Strava
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Importez vos activités de course depuis Strava
          </Typography>
        </Box>

        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="#ff6b35"
                style={{ margin: '0 auto' }}
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
                Connectez-vous à Strava
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Erreur lors de la connexion à Strava. Veuillez réessayer.
              </Alert>
            )}

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <CheckCircle color="success" />
                <Typography>Accédez à toutes vos activités de course</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <CheckCircle color="success" />
                <Typography>Choisissez les activités à importer</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <CheckCircle color="success" />
                <Typography>Synchronisez automatiquement vos données</Typography>
              </Box>
            </Stack>

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleStravaConnect}
              >
                Se connecter avec Strava
              </Button>

              <Button
                component={Link}
                href="/"
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
              >
                Retour à l'accueil
              </Button>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 2 }}
            >
              Vos données Strava ne seront utilisées que pour importer vos
              activités
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
