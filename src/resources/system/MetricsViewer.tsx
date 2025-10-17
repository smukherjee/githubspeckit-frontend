/**
 * Metrics Snapshot Component
 * 
 * Displays available metrics in the system
 * 
 * GET /api/v1/metrics/snapshot
 */

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Typography,
} from '@mui/material'
import { apiClient } from '@/utils/api'
import type { MetricsSnapshot } from '@/types'

export function MetricsViewer() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get<MetricsSnapshot>('/metrics/snapshot')
        setMetrics(response.data)
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
        setError('Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Available Metrics" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {metrics.metrics.length} metrics available
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1}>
                {metrics.metrics.map((metric) => (
                  <Chip 
                    key={metric} 
                    label={metric} 
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box mt={3}>
                <Alert severity="info">
                  <Typography variant="body2">
                    For detailed Prometheus metrics, visit: <br />
                    <Typography 
                      component="a" 
                      href="/metrics" 
                      target="_blank"
                      sx={{ fontFamily: 'monospace', textDecoration: 'underline' }}
                    >
                      /metrics
                    </Typography>
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
