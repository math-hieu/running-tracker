'use client'

import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material'
import {
  Home,
  DirectionsRun as DirectionsRunIcon,
  CloudUpload,
  ExpandMore,
  CalendarToday,
  FitnessCenter,
  TrendingUp,
  EmojiEvents,
  ShowChart,
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function TrainingPage() {
  const program = programData as TrainingProgram
  const pathname = usePathname()

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
      const totalMinutes = week.sessions.reduce((sum, session) => sum + session.duration_min, 0)
      const hours = totalMinutes / 60

      return {
        week: `S${week.week}`,
        totalMinutes,
        hours: parseFloat(hours.toFixed(2)),
        formattedTime: formatDuration(totalMinutes),
      }
    })
  }

  const formatYAxisTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h${mins}`
    } else if (hours > 0) {
      return `${hours}h`
    }
    return `${mins}min`
  }

  const weeklyChartData = getWeeklyChartData()

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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h2" gutterBottom>
                Programme d'entraînement
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {program.meta.race}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                icon={<EmojiEvents />}
                label={new Date(program.meta.race_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                color="warning"
                sx={{ fontSize: '1rem', px: 2, py: 3 }}
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
                  <Typography variant="caption" color="text.secondary">Focus d'intensité</Typography>
                  <Typography variant="body2">{program.meta.intensity_focus}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Renforcement recommandé</Typography>
                  <Typography variant="body2">{program.meta.strength_reco}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Zones d'effort</Typography>
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
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 1 }}>
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
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShowChart sx={{ fontSize: 32, color: 'secondary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Visualisation du programme d'entraînement
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="week"
                    stroke="#999"
                    style={{ fontSize: '0.875rem' }}
                    label={{ value: 'Semaines', position: 'insideBottom', offset: -5, fill: '#999' }}
                  />
                  <YAxis
                    dataKey="totalMinutes"
                    stroke="#999"
                    style={{ fontSize: '0.875rem' }}
                    label={{ value: 'Temps de course', angle: -90, position: 'insideLeft', fill: '#999' }}
                    tickFormatter={formatYAxisTime}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1e1e',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'totalMinutes') {
                        return [formatYAxisTime(value), 'Temps total']
                      }
                      return [value, name]
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalMinutes"
                    stroke="#ce93d8"
                    strokeWidth={3}
                    dot={{ fill: '#ce93d8', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Volume minimum
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {formatYAxisTime(Math.min(...weeklyChartData.map(d => d.totalMinutes)))}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Volume maximum
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {formatYAxisTime(Math.max(...weeklyChartData.map(d => d.totalMinutes)))}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Volume moyen
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {formatYAxisTime(Math.round(weeklyChartData.reduce((sum, d) => sum + d.totalMinutes, 0) / weeklyChartData.length))}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
