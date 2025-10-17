/**
 * Configuration Viewer Component
 * 
 * Displays system configuration:
 * - Config hash (for change detection)
 * - All config entries with values
 * - Secret masking for sensitive values
 * - Configuration errors (if any)
 * 
 * GET /api/v1/config
 * GET /api/v1/config/errors
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  TextField,
} from '@mui/material'
import { apiClient } from '@/utils/api'
import type { Config, ConfigErrors } from '@/types'

export function ConfigViewer() {
  const [config, setConfig] = useState<Config | null>(null)
  const [errors, setErrors] = useState<ConfigErrors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch both config and errors in parallel
        const [configResponse, errorsResponse] = await Promise.all([
          apiClient.get<Config>('/config'),
          apiClient.get<ConfigErrors>('/config/errors'),
        ])
        
        setConfig(configResponse.data)
        setErrors(errorsResponse.data)
      } catch (err) {
        console.error('Failed to fetch config:', err)
        setError('Failed to fetch configuration')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
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

  if (!config) {
    return null
  }

  // Filter config entries by search term
  const filteredEntries = Object.entries(config.entries).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Config Errors */}
        {errors && errors.errors.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="error">
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Configuration Errors ({errors.errors.length})
              </Typography>
              {errors.errors.map((err, index) => (
                <Typography key={index} variant="body2">
                  • {err.key}: {err.error}
                </Typography>
              ))}
            </Alert>
          </Grid>
        )}

        {/* Config Hash */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Configuration" />
            <CardContent>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Config Hash (SHA256)
                </Typography>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace" 
                  sx={{ wordBreak: 'break-all' }}
                  mt={1}
                >
                  {config.hash}
                </Typography>
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                label="Search Configuration"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by key name..."
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" mb={2}>
                Showing {filteredEntries.length} of {Object.keys(config.entries).length} entries
              </Typography>

              {/* Config Entries Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Key</strong></TableCell>
                      <TableCell><strong>Value</strong></TableCell>
                      <TableCell align="center"><strong>Type</strong></TableCell>
                      <TableCell align="center"><strong>Secret</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary" py={2}>
                            No configuration entries match your search
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map(([key, entry]) => (
                        <TableRow key={key} hover>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              fontFamily="monospace"
                              fontWeight="medium"
                            >
                              {key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              fontFamily="monospace"
                            >
                              {entry.secret ? '••••••••' : String(entry.value)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={typeof entry.value} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {entry.secret ? (
                              <Chip 
                                label="Secret" 
                                size="small" 
                                color="warning"
                              />
                            ) : (
                              <Chip 
                                label="Public" 
                                size="small" 
                                color="default"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
