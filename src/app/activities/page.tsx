'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import {
  DirectionsRun,
  Timer,
  TrendingUp,
  Terrain,
  Favorite,
  LocalFireDepartment,
  DirectionsRun as DirectionsRunIcon,
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
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const formatDistance = (km: number) => {
    return `${km.toFixed(2)} km`
  }

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getSortedActivities = () => {
    const sorted = [...activities]

    switch (sortBy) {
      case 'date-desc':
        return sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      case 'date-asc':
        return sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      case 'distance-desc':
        return sorted.sort((a, b) => b.distance - a.distance)
      case 'distance-asc':
        return sorted.sort((a, b) => a.distance - b.distance)
      case 'pace-asc':
        return sorted.sort((a, b) => a.pace - b.pace)
      case 'pace-desc':
        return sorted.sort((a, b) => b.pace - a.pace)
      default:
        return sorted
    }
  }

  const getPaginatedActivities = (sorted: Activity[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sorted.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(activities.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    setCurrentPage(1) // Reset to first page when sorting changes
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
          </CardContent>
        </Card>
      </Box>
    )
  }

  const sortedActivities = getSortedActivities()
  const paginatedActivities = getPaginatedActivities(sortedActivities)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)',
        py: 4,
        px: 2,
        pb: { xs: 10, md: 4 }, // Extra padding on mobile for bottom navigation
      }}
    >
      <Container maxWidth="lg">
        {/* Navigation */}
        <Box sx={{ mb: 4 }}>
          <Navigation />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h2" gutterBottom>
              Mes Activités
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Toutes vos courses importées
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Chip label={`${activities.length} activité(s)`} color="primary" size="medium" />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              label="Trier par"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="date-desc">Date (plus récent)</MenuItem>
              <MenuItem value="date-asc">Date (plus ancien)</MenuItem>
              <MenuItem value="distance-desc">Distance (plus long)</MenuItem>
              <MenuItem value="distance-asc">Distance (plus court)</MenuItem>
              <MenuItem value="pace-asc">Allure (plus rapide)</MenuItem>
              <MenuItem value="pace-desc">Allure (plus lent)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Stack spacing={2}>
          {paginatedActivities.map((activity) => (
            <Card
              key={activity.id}
              sx={{
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5">{activity.title}</Typography>
                      {activity.stravaId && (
                        <Chip
                          label="Strava"
                          size="small"
                          color="warning"
                          icon={
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
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
                          {formatDuration(activity.duration)}
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
                          {formatPace(activity.pace)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {activity.elevation !== null &&
                    activity.elevation !== undefined && (
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Terrain color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Dénivelé
                            </Typography>
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
                          <Typography variant="caption" color="text.secondary">
                            FC moy.
                          </Typography>
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
                          <Typography variant="caption" color="text.secondary">
                            Calories
                          </Typography>
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

          {activities.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <DirectionsRunIcon
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune activité importée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connectez-vous à Strava pour importer vos courses
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Pagination */}
        {activities.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => handlePageChange(page)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </Box>
  )
}
