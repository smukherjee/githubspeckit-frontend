/**
 * Health Check Component
 * 
 * Displays system health status:
 * - Overall status (ok, degraded, error)
 * - Migrations status
 * - Key rotation version
 * 
 * GET /api/v1/health (public endpoint, no auth required)
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import axios from 'axios'
import type { HealthCheck } from '@/types'

export function HealthStatus() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true)
        setError(null)
        // Health endpoint doesn't require authentication
        const response = await axios.get<HealthCheck>('/api/v1/health')
        setHealth(response.data)
      } catch (err) {
        console.error('Failed to fetch health status:', err)
        setError('Failed to fetch health status')
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
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

  if (!health) {
    return null
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'ok':
        return <CheckCircleIcon color="success" fontSize="large" />
      case 'degraded':
        return <WarningIcon color="warning" fontSize="large" />
      case 'error':
        return <ErrorIcon color="error" fontSize="large" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (health.status) {
      case 'ok':
        return 'success'
      case 'degraded':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Overall Status */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="System Health" 
              avatar={getStatusIcon()}
            />
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">Status:</Typography>
                <Chip 
                  label={health.status.toUpperCase()} 
                  color={getStatusColor()}
                  size="medium"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Database Migrations
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {health.migrations_applied ? (
                        <>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography>Applied</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon color="error" fontSize="small" />
                          <Typography>Not Applied</Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Key Rotation Version
                    </Typography>
                    <Typography variant="h6" mt={1}>
                      v{health.key_rotation_version}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date().toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Auto-refreshes every 30 seconds
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
