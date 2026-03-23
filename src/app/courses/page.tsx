'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  DirectionsRun,
  EmojiEvents,
  Favorite,
  LocalFireDepartment,
  Terrain,
  Timer,
  TrendingUp,
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'

interface Activity {
  id: string
  title: string
  description?: string
  distance: number
  duration: number
  pace: number
  date: string
  startTime?: string
  elevation?: number
  heartRate?: number
  calories?: number
  stravaId?: string
  isRace?: boolean
}

interface YearGroup {
  year: number
  activities: Activity[]
  totalDistance: number
}

export default function CoursesPage() {
  const [yearGroups, setYearGroups] = useState<YearGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRaces()
  }, [])

  const fetchRaces = async () => {
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch activities')

      const data: Activity[] = await response.json()
      const races = data.filter((a) => a.isRace)

      // Group by year, sorted by date desc within each year
      const byYear = races.reduce<Record<number, Activity[]>>((acc, activity) => {
        const year = new Date(activity.date).getFullYear()
        if (!acc[year]) acc[year] = []
        acc[year].push(activity)
        return acc
      }, {})

      const groups: YearGroup[] = Object.entries(byYear)
        .map(([year, acts]) => ({
          year: Number(year),
          activities: acts.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          totalDistance: acts.reduce((sum, a) => sum + a.distance, 0),
        }))
        .sort((a, b) => b.year - a.year)

      setYearGroups(groups)
    } catch (err) {
      setError('Erreur lors du chargement des courses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes}min`
  }

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const totalRaces = yearGroups.reduce((sum, g) => sum + g.activities.length, 0)

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
        <Typography variant="h6">Chargement des courses...</Typography>
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
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)',
        py: 4,
        px: 2,
        pb: { xs: 10, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Navigation />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" gutterBottom>
            Mes Courses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Toutes vos compétitions et courses officielles
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<EmojiEvents />}
            label={`${totalRaces} course${totalRaces > 1 ? 's' : ''}`}
            color="primary"
            size="medium"
          />
        </Box>

        {yearGroups.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune course enregistrée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Marquez une activité comme &quot;Course&quot; depuis la vue Activités
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={4}>
            {yearGroups.map((group) => (
              <Box key={group.year}>
                {/* Year header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    {group.year}
                  </Typography>
                  <Chip
                    label={`${group.activities.length} course${group.activities.length > 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${group.totalDistance.toFixed(1)} km`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Activities for this year */}
                <Stack spacing={2}>
                  {group.activities.map((activity) => (
                    <Card
                      key={activity.id}
                      sx={{
                        transition: 'all 0.3s',
                        '&:hover': { boxShadow: 6 },
                        borderLeft: '3px solid #ff6b35',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                              <EmojiEvents sx={{ color: '#ff6b35', fontSize: 20 }} />
                              <Typography variant="h5">{activity.title}</Typography>
                              {activity.stravaId && (
                                <Chip
                                  label="Strava"
                                  size="small"
                                  color="warning"
                                  icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                                    </svg>
                                  }
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(activity.date)}
                            </Typography>
                            {activity.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {activity.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4} md={2}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <DirectionsRun color="primary" />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Distance</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {activity.distance.toFixed(2)} km
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={4} md={2}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Timer color="primary" />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Durée</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {formatDuration(activity.duration)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={4} md={2}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <TrendingUp color="primary" />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Allure</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {formatPace(activity.pace)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {activity.elevation != null && (
                            <Grid item xs={6} sm={4} md={2}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Terrain color="primary" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Dénivelé</Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {Math.round(activity.elevation)} m
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}

                          {activity.heartRate && (
                            <Grid item xs={6} sm={4} md={2}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Favorite color="error" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">FC moy.</Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {activity.heartRate} bpm
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}

                          {activity.calories && (
                            <Grid item xs={6} sm={4} md={2}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <LocalFireDepartment color="warning" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Calories</Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {activity.calories}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
