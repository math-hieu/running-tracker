'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Button,
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
  CalendarMonth,
  DateRange,
  EmojiEvents,
  Home,
  DirectionsRun as DirectionsRunIcon,
  CloudUpload,
  BarChart as BarChartIcon,
  Timer,
  FitnessCenter,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Activity {
  id: string
  title: string
  distance: number
  duration: number
  pace: number
  date: string
  elevation?: number
}

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()

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

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }

  const calculateMonthlyStats = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return (
        activityDate.getMonth() === currentMonth &&
        activityDate.getFullYear() === currentYear
      )
    })

    if (monthlyActivities.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        avgPace: 0,
        totalElevation: 0,
        totalActivities: 0,
      }
    }

    const totalDistance = monthlyActivities.reduce(
      (sum, a) => sum + a.distance,
      0
    )
    const totalDuration = monthlyActivities.reduce(
      (sum, a) => sum + a.duration,
      0
    )
    const avgPace =
      monthlyActivities.reduce((sum, a) => sum + a.pace, 0) /
      monthlyActivities.length
    const totalElevation = monthlyActivities.reduce(
      (sum, a) => sum + (a.elevation || 0),
      0
    )

    return {
      totalDistance,
      totalDuration,
      avgPace,
      totalElevation,
      totalActivities: monthlyActivities.length,
    }
  }

  const calculateWeeklyStats = () => {
    const now = new Date()
    const weekStart = getMonday(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weeklyActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return activityDate >= weekStart && activityDate < weekEnd
    })

    if (weeklyActivities.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        avgPace: 0,
        totalElevation: 0,
        totalActivities: 0,
      }
    }

    const totalDistance = weeklyActivities.reduce(
      (sum, a) => sum + a.distance,
      0
    )
    const totalDuration = weeklyActivities.reduce(
      (sum, a) => sum + a.duration,
      0
    )
    const avgPace =
      weeklyActivities.reduce((sum, a) => sum + a.pace, 0) /
      weeklyActivities.length
    const totalElevation = weeklyActivities.reduce(
      (sum, a) => sum + (a.elevation || 0),
      0
    )

    return {
      totalDistance,
      totalDuration,
      avgPace,
      totalElevation,
      totalActivities: weeklyActivities.length,
    }
  }

  const calculateTotalStats = () => {
    const now = new Date()
    const currentYear = now.getFullYear()

    const yearActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return activityDate.getFullYear() === currentYear
    })

    if (yearActivities.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        totalActivities: 0,
      }
    }

    const totalDistance = yearActivities.reduce((sum, a) => sum + a.distance, 0)
    const totalDuration = yearActivities.reduce((sum, a) => sum + a.duration, 0)

    return {
      totalDistance,
      totalDuration,
      totalActivities: yearActivities.length,
    }
  }

  const getCurrentMonthName = () => {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())
  }

  const getMonday = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day // Si dimanche (0), reculer de 6 jours, sinon reculer à lundi
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const calculateWeeklyDistance = () => {
    const now = new Date()
    const weeks: { [key: string]: number } = {}

    // Générer les 12 dernières semaines (du lundi au dimanche)
    for (let i = 11; i >= 0; i--) {
      const weekStart = getMonday(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekKey = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`
      weeks[weekKey] = 0
    }

    // Ajouter les distances des activités
    activities.forEach((activity) => {
      const activityDate = new Date(activity.date)
      const weekStart = getMonday(activityDate)
      const weekKey = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`

      if (weeks.hasOwnProperty(weekKey)) {
        weeks[weekKey] += activity.distance
      }
    })

    return Object.entries(weeks).map(([week, distance]) => ({
      week,
      distance: parseFloat(distance.toFixed(1)),
    }))
  }

  const calculateWeeklyDuration = () => {
    const now = new Date()
    const weeks: { [key: string]: number } = {}

    // Générer les 12 dernières semaines (du lundi au dimanche)
    for (let i = 11; i >= 0; i--) {
      const weekStart = getMonday(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekKey = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`
      weeks[weekKey] = 0
    }

    // Ajouter les durées des activités (en heures)
    activities.forEach((activity) => {
      const activityDate = new Date(activity.date)
      const weekStart = getMonday(activityDate)
      const weekKey = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`

      if (weeks.hasOwnProperty(weekKey)) {
        weeks[weekKey] += activity.duration / 3600 // Convertir en heures
      }
    })

    return Object.entries(weeks).map(([week, duration]) => ({
      week,
      duration: parseFloat(duration.toFixed(1)),
    }))
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

  const monthlyStats = calculateMonthlyStats()
  const weeklyStats = calculateWeeklyStats()
  const totalStats = calculateTotalStats()
  const weeklyData = calculateWeeklyDistance()
  const weeklyDurationData = calculateWeeklyDuration()

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
        {/* Navigation */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" gutterBottom>
                Running Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Suivez vos performances de course à pied
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/strava"
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
            >
              Importer
            </Button>
          </Box>
        </Box>

        {/* Monthly Stats Widget */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #2d1b1b 0%, #1e1e1e 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CalendarMonth sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {getCurrentMonthName()}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Distance
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {monthlyStats.totalDistance.toFixed(1)} km
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    sur {monthlyStats.totalActivities} course(s)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Temps
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {Math.floor(monthlyStats.totalDuration / 3600)}h{' '}
                    {Math.floor((monthlyStats.totalDuration % 3600) / 60)}min
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Allure moyenne
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {monthlyStats.avgPace > 0 ? formatPace(monthlyStats.avgPace) : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Dénivelé total
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {Math.round(monthlyStats.totalElevation)} m
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Weekly Stats Widget */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1e1e2d 0%, #1e1e1e 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <DateRange sx={{ fontSize: 32, color: 'info.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Semaine en cours
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Distance
                  </Typography>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {weeklyStats.totalDistance.toFixed(1)} km
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    sur {weeklyStats.totalActivities} course(s)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Temps
                  </Typography>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {Math.floor(weeklyStats.totalDuration / 3600)}h{' '}
                    {Math.floor((weeklyStats.totalDuration % 3600) / 60)}min
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Allure moyenne
                  </Typography>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {weeklyStats.avgPace > 0 ? formatPace(weeklyStats.avgPace) : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Dénivelé total
                  </Typography>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {Math.round(weeklyStats.totalElevation)} m
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Total Stats Widget */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <EmojiEvents sx={{ fontSize: 32, color: 'warning.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Statistiques {new Date().getFullYear()}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Distance totale
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {totalStats.totalDistance.toFixed(1)} km
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Temps total
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {Math.floor(totalStats.totalDuration / 3600)}h{' '}
                    {Math.floor((totalStats.totalDuration % 3600) / 60)}min
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Nombre de courses
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {totalStats.totalActivities}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Weekly Distance Chart */}
        {activities.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BarChartIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Distance par semaine
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="week"
                      stroke="#999"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                      stroke="#999"
                      style={{ fontSize: '0.875rem' }}
                      label={{ value: 'km', angle: -90, position: 'insideLeft', fill: '#999' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value} km`, 'Distance']}
                    />
                    <Line
                      type="monotone"
                      dataKey="distance"
                      stroke="#ff6b35"
                      strokeWidth={3}
                      dot={{ fill: '#ff6b35', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Weekly Duration Chart */}
        {activities.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Timer sx={{ fontSize: 32, color: 'secondary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Temps par semaine
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyDurationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="week"
                      stroke="#999"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                      stroke="#999"
                      style={{ fontSize: '0.875rem' }}
                      label={{ value: 'heures', angle: -90, position: 'insideLeft', fill: '#999' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => {
                        const hours = Math.floor(value)
                        const minutes = Math.round((value - hours) * 60)
                        return [`${hours}h ${minutes}min`, 'Temps']
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#ce93d8"
                      strokeWidth={3}
                      dot={{ fill: '#ce93d8', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
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
              <Button
                component={Link}
                href="/strava"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CloudUpload />}
              >
                Importer depuis Strava
              </Button>
            </CardContent>
          </Card>
        )}

        {activities.length > 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" gutterBottom>
                Voir toutes vos activités
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Consultez le détail de vos {activities.length} course(s) importée(s)
              </Typography>
              <Button
                component={Link}
                href="/activities"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DirectionsRunIcon />}
              >
                Voir les activités
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}
