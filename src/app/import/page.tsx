'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Typography,
  Stack,
} from '@mui/material'
import {
  DirectionsRun,
  Timer,
  TrendingUp,
  Terrain,
  Favorite,
} from '@mui/icons-material'

interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  average_heartrate?: number
  calories?: number
  map?: {
    summary_polyline: string
  }
  isImported: boolean
}

function ImportContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(
    new Set()
  )
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `/api/strava/activities?userId=${userId}&perPage=50`
        )
        if (!response.ok) throw new Error('Failed to fetch activities')

        const data = await response.json()
        setActivities(data)
      } catch (err) {
        setError('Erreur lors du chargement des activités')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId])

  const handleSelectActivity = (activityId: number) => {
    const newSelected = new Set(selectedActivities)
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId)
    } else {
      newSelected.add(activityId)
    }
    setSelectedActivities(newSelected)
  }

  const handleSelectAll = () => {
    const notImportedActivities = activities
      .filter((a) => !a.isImported)
      .map((a) => a.id)

    if (selectedActivities.size === notImportedActivities.length) {
      setSelectedActivities(new Set())
    } else {
      setSelectedActivities(new Set(notImportedActivities))
    }
  }

  const handleImport = async () => {
    if (!userId || selectedActivities.size === 0) return

    setImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const activityId of selectedActivities) {
      const activity = activities.find((a) => a.id === activityId)
      if (!activity) continue

      try {
        const response = await fetch('/api/strava/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            stravaId: activity.id,
            name: activity.name,
            distance: activity.distance,
            moving_time: activity.moving_time,
            elapsed_time: activity.elapsed_time,
            total_elevation_gain: activity.total_elevation_gain,
            start_date: activity.start_date,
            average_heartrate: activity.average_heartrate,
            calories: activity.calories,
            map: activity.map,
          }),
        })

        if (response.ok) {
          successCount++
          activity.isImported = true
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
        console.error('Error importing activity:', err)
      }
    }

    setImporting(false)
    setSelectedActivities(new Set())
    setActivities([...activities])

    if (errorCount === 0) {
      alert(`${successCount} activité(s) importée(s) avec succès!`)
    } else {
      alert(
        `${successCount} activité(s) importée(s), ${errorCount} erreur(s)`
      )
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }

  const formatPace = (distance: number, time: number) => {
    const km = distance / 1000
    if (km === 0) return 'N/A'
    const paceMinPerKm = time / 60 / km
    const minutes = Math.floor(paceMinPerKm)
    const seconds = Math.round((paceMinPerKm - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (!userId) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card>
          <CardContent>
            <Typography color="error">User ID manquant</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Chargement des activités...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card>
          <CardContent>
            <Typography color="error">{error}</Typography>
            <Button component={Link} href="/" sx={{ mt: 2 }}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const notImportedCount = activities.filter((a) => !a.isImported).length

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h2" gutterBottom>
              Importer vos activités
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sélectionnez les activités que vous souhaitez importer
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            color="primary"
          >
            Retour à l&apos;accueil
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    notImportedCount > 0 &&
                    selectedActivities.size === notImportedCount
                  }
                  onChange={handleSelectAll}
                />
              }
              label="Tout sélectionner"
            />
            <Chip
              label={`${selectedActivities.size} sélectionnée(s)`}
              color="primary"
            />
            <Chip
              label={`${activities.filter((a) => a.isImported).length} déjà importée(s)`}
              color="success"
            />
          </Stack>

          <Button
            variant="contained"
            color="primary"
            disabled={selectedActivities.size === 0}
            onClick={handleImport}
            size="large"
            sx={{ minWidth: 150 }}
          >
            {importing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Importer (${selectedActivities.size})`
            )}
          </Button>
        </Box>

        <Stack spacing={2}>
          {activities.map((activity) => (
            <Card
              key={activity.id}
              sx={{
                opacity: activity.isImported ? 0.6 : 1,
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Checkbox
                    checked={selectedActivities.has(activity.id)}
                    onChange={() => handleSelectActivity(activity.id)}
                    disabled={activity.isImported}
                  />

                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          {activity.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(activity.start_date)}
                        </Typography>
                      </Box>
                      {activity.isImported && (
                        <Chip label="Importée" color="success" size="small" />
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <DirectionsRun color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Distance
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDistance(activity.distance)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Timer color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Durée
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDuration(activity.moving_time)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TrendingUp color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Allure
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatPace(activity.distance, activity.moving_time)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Terrain color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Dénivelé
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {Math.round(activity.total_elevation_gain)} m
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {activity.average_heartrate && (
                        <Grid item xs={6} sm={4} md={2}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Favorite color="error" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                FC moy.
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {Math.round(activity.average_heartrate)} bpm
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {activities.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Aucune activité de course trouvée
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

export default function ImportPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    }>
      <ImportContent />
    </Suspense>
  )
}
