'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material'
import {
  DirectionsRun as DirectionsRunIcon,
  ExpandMore,
  CalendarToday,
  FitnessCenter,
  TrendingUp,
  EmojiEvents,
  ShowChart,
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import programData from '../../../training-program/ecotrail.json'

interface Session {
  day?: string
  type: string
  duration_min: number
  expected_dplus_m?: number
  notes?: string
}

interface Week {
  week: number
  start_date: string
  end_date: string
  target_km_range: string
  target_dplus_range_m: string
  sessions: Session[]
}

interface TrainingProgram {
  meta: {
    race: string
    race_date: string
    plan_start_date: string
    weeks: number
    sessions_per_week: string
    starting_volume_km_per_week: string
    starting_long_run: string
    intensity_focus: string
    effort_zones: {
      EF: string
      AC: string
      COTES_DOUCES: string
    }
    strength_reco: string
    guidelines: string[]
  }
  weeks: Week[]
}

interface Activity {
  id: string
  title: string
  distance: number
  duration: number
  pace: number
  date: string
  elevation?: number
}

interface SessionCompletion {
  id: string
  userId: string
  weekNumber: number
  dayOfWeek: string | null
  sessionType: string
  completedAt: string
  createdAt: string
  updatedAt: string
}

export default function TrainingPage() {
  const program = programData as TrainingProgram
  const [activities, setActivities] = useState<Activity[]>([])
  const [completions, setCompletions] = useState<SessionCompletion[]>([])
  const [togglingSession, setTogglingSession] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
    fetchCompletions()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      setActivities(data)
    } catch (err) {
      console.error('Error fetching activities:', err)
    }
  }

  const fetchCompletions = async () => {
    try {
      const response = await fetch('/api/session-completions?userId=default-user')
      if (!response.ok) throw new Error('Failed to fetch completions')
      const data = await response.json()
      setCompletions(data)
    } catch (err) {
      console.error('Error fetching completions:', err)
    }
  }

  const isSessionCompleted = (weekNumber: number, dayOfWeek: string | undefined, sessionType: string): boolean => {
    return completions.some(
      c => c.weekNumber === weekNumber &&
           c.dayOfWeek === (dayOfWeek || null) &&
           c.sessionType === sessionType
    )
  }

  const getSessionKey = (weekNumber: number, dayOfWeek: string | undefined, sessionType: string): string => {
    return `${weekNumber}-${dayOfWeek || 'noday'}-${sessionType}`
  }

  const toggleSessionCompletion = async (weekNumber: number, dayOfWeek: string | undefined, sessionType: string) => {
    const sessionKey = getSessionKey(weekNumber, dayOfWeek, sessionType)
    const isCompleted = isSessionCompleted(weekNumber, dayOfWeek, sessionType)

    setTogglingSession(sessionKey)

    // Mise à jour optimiste
    if (isCompleted) {
      // Retirer de la liste
      setCompletions(prev =>
        prev.filter(c => !(
          c.weekNumber === weekNumber &&
          c.dayOfWeek === (dayOfWeek || null) &&
          c.sessionType === sessionType
        ))
      )
    } else {
      // Ajouter à la liste (optimistic - on devine l'ID)
      const optimisticCompletion: SessionCompletion = {
        id: 'temp-' + Date.now(),
        userId: 'default-user',
        weekNumber,
        dayOfWeek: dayOfWeek || null,
        sessionType,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCompletions(prev => [...prev, optimisticCompletion])
    }

    try {
      const response = await fetch('/api/session-completions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          weekNumber,
          dayOfWeek: dayOfWeek || null,
          sessionType,
        }),
      })

      if (!response.ok) throw new Error('Failed to toggle session')

      // Rafraîchir la liste pour avoir les vraies données
      await fetchCompletions()
    } catch (err) {
      console.error('Error toggling session:', err)
      // Annuler la mise à jour optimiste en cas d'erreur
      await fetchCompletions()
    } finally {
      setTogglingSession(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
    }
    return `${mins} min`
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} - ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}`
  }

  const isCurrentWeek = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  const isUpcomingWeek = (startDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    return start > now
  }

  const getWeekStatus = (startDate: string, endDate: string) => {
    if (isCurrentWeek(startDate, endDate)) return 'current'
    if (isUpcomingWeek(startDate)) return 'upcoming'
    return 'completed'
  }

  const getWeeklyChartData = () => {
    return program.weeks.map((week) => {
      // Calculate planned time
      const totalMinutes = week.sessions.reduce((sum, session) => sum + session.duration_min, 0)

      // Calculate actual time from activities
      const weekStart = new Date(week.start_date)
      const weekEnd = new Date(week.end_date)
      weekEnd.setHours(23, 59, 59, 999) // Include the entire end date

      const weekActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.date)
        return activityDate >= weekStart && activityDate <= weekEnd
      })

      const actualSeconds = weekActivities.reduce((sum, activity) => sum + activity.duration, 0)
      const actualMinutes = actualSeconds / 60

      return {
        week: `S${week.week}`,
        plannedMinutes: totalMinutes,
        actualMinutes: actualMinutes,
        formattedPlanned: formatDuration(totalMinutes),
        formattedActual: formatDuration(actualMinutes),
      }
    })
  }

  const formatYAxisTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins.toString().padStart(2, '0')}min`
  }

  const weeklyChartData = getWeeklyChartData()

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

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3
          }}>
            <Box>
              <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem' } }}>
                Programme d&apos;entraînement
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {program.meta.race}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Chip
                icon={<EmojiEvents />}
                label={new Date(program.meta.race_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                color="warning"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Program Meta Info */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #2d1b1b 0%, #1e1e1e 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Informations générales
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Durée du plan</Typography>
                  <Typography variant="h6">{program.meta.weeks} semaines</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Sessions par semaine</Typography>
                  <Typography variant="h6">{program.meta.sessions_per_week}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Volume de départ</Typography>
                  <Typography variant="h6">{program.meta.starting_volume_km_per_week} km/semaine</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Focus d&apos;intensité</Typography>
                  <Typography variant="body2">{program.meta.intensity_focus}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Renforcement recommandé</Typography>
                  <Typography variant="body2">{program.meta.strength_reco}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Zones d&apos;effort</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="success.main">EF - Endurance Facile</Typography>
                    <Typography variant="caption">{program.meta.effort_zones.EF}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.main">AC - Allure Course</Typography>
                    <Typography variant="caption">{program.meta.effort_zones.AC}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="error.main">Côtes Douces</Typography>
                    <Typography variant="caption">{program.meta.effort_zones.COTES_DOUCES}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Alert severity="info" sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Conseils importants</Typography>
              {program.meta.guidelines.map((guideline, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  • {guideline}
                </Typography>
              ))}
            </Alert>
          </CardContent>
        </Card>

        {/* Weekly Program */}
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Programme hebdomadaire
        </Typography>

        {program.weeks.map((week) => {
          const status = getWeekStatus(week.start_date, week.end_date)
          const isCurrent = status === 'current'
          const isUpcoming = status === 'upcoming'

          return (
            <Accordion
              key={week.week}
              defaultExpanded={isCurrent}
              sx={{
                mb: 2,
                background: isCurrent
                  ? 'linear-gradient(135deg, #1e3a5f 0%, #1e1e1e 100%)'
                  : isUpcoming
                  ? 'linear-gradient(135deg, #2d1b1b 0%, #1e1e1e 100%)'
                  : 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
                '&:before': {
                  display: 'none',
                },
                border: isCurrent ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 2,
                  },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Semaine {week.week}
                      </Typography>
                      {isCurrent && (
                        <Chip
                          label="En cours"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        icon={<CalendarToday />}
                        label={formatDateRange(week.start_date, week.end_date)}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      <TrendingUp sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {week.target_km_range} km
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <DirectionsRunIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {week.target_dplus_range_m} m D+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {week.sessions.length} session{week.sessions.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {week.sessions.map((session, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          opacity: isSessionCompleted(week.week, session.day, session.type) ? 0.7 : 1,
                          position: 'relative',
                        }}
                      >
                        <CardContent>
                          {/* Checkbox en haut à droite */}
                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            <Checkbox
                              checked={isSessionCompleted(week.week, session.day, session.type)}
                              onChange={() => toggleSessionCompletion(week.week, session.day, session.type)}
                              disabled={togglingSession === getSessionKey(week.week, session.day, session.type)}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.3)',
                                '&.Mui-checked': {
                                  color: 'success.main',
                                },
                              }}
                            />
                          </Box>

                          {/* Titre avec ligne barrée si complété */}
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              textDecoration: isSessionCompleted(week.week, session.day, session.type) ? 'line-through' : 'none',
                            }}
                          >
                            {session.type}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Chip
                              label={formatDuration(session.duration_min)}
                              size="small"
                              color="primary"
                            />
                            {session.expected_dplus_m && (
                              <Chip
                                label={`${session.expected_dplus_m} m D+`}
                                size="small"
                                color="secondary"
                              />
                            )}
                          </Box>
                          {session.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {session.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}

        {/* Training Volume Chart */}
        <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #1e1e2d 0%, #1e1e1e 100%)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShowChart sx={{ fontSize: { xs: 24, sm: 32 }, color: 'secondary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '2rem' } }}>
                Visualisation du programme
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: { xs: 300, sm: 400 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="week"
                    stroke="#999"
                    style={{ fontSize: '0.75rem' }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#999"
                    style={{ fontSize: '0.75rem' }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatYAxisTime}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1e1e',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'plannedMinutes') {
                        return [formatYAxisTime(value), 'Temps prévu']
                      }
                      if (name === 'actualMinutes') {
                        return [formatYAxisTime(value), 'Temps réalisé']
                      }
                      return [value, name]
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value: string) => {
                      if (value === 'plannedMinutes') return 'Temps prévu'
                      if (value === 'actualMinutes') return 'Temps réalisé'
                      return value
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="plannedMinutes"
                    name="plannedMinutes"
                    stroke="#ce93d8"
                    strokeWidth={3}
                    dot={{ fill: '#ce93d8', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualMinutes"
                    name="actualMinutes"
                    stroke="#4caf50"
                    strokeWidth={3}
                    dot={{ fill: '#4caf50', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(206, 147, 216, 0.1)', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Volume prévu total
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ce93d8', fontWeight: 600 }}>
                    {formatYAxisTime(Math.round(weeklyChartData.reduce((sum, d) => sum + d.plannedMinutes, 0)))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Volume réalisé total
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 600 }}>
                    {formatYAxisTime(Math.round(weeklyChartData.reduce((sum, d) => sum + d.actualMinutes, 0)))}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Taux de réalisation
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                    {(() => {
                      const totalPlanned = weeklyChartData.reduce((sum, d) => sum + d.plannedMinutes, 0)
                      const totalActual = weeklyChartData.reduce((sum, d) => sum + d.actualMinutes, 0)
                      const percentage = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0
                      return `${percentage}%`
                    })()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
