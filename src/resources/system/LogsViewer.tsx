/**
 * Logs Viewer Component
 * 
 * Displays system logs with filtering:
 * - Filter by tenant, category, correlation ID
 * - Filter by time range (since/until)
 * - Limit results (max 10000)
 * - Shows redaction status
 * - Pagination support
 * 
 * GET /api/v1/logs/export
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
  TableRow,
  Paper,
  Chip,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RefreshIcon from '@mui/icons-material/Refresh'
import { apiClient } from '@/utils/api'
import type { LogsExportResponse, LogsExportParams } from '@/types'

export function LogsViewer() {
  const [logs, setLogs] = useState<LogsExportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [limit, setLimit] = useState(100)
  const [category, setCategory] = useState<string>('')
  const [tenantId, setTenantId] = useState('')
  const [correlationId, setCorrelationId] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: LogsExportParams = {
        limit,
      }
      
      if (category) params.category = category as 'info' | 'warning' | 'error'
      if (tenantId) params.tenant_id = tenantId
      if (correlationId) params.correlation_id = correlationId
      
      const response = await apiClient.get<LogsExportResponse>('/logs/export', { params })
      setLogs(response.data)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
      setError('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only fetch on mount

  const handleRefresh = () => {
    fetchLogs()
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'default'
    }
  }

  if (loading && !logs) {
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

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Filters" 
              action={
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Limit"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    inputProps={{ min: 1, max: 10000 }}
                    helperText="Max 10,000"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                      <MenuItem value="warning">Warning</MenuItem>
                      <MenuItem value="error">Error</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="Filter by tenant..."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Correlation ID"
                    value={correlationId}
                    onChange={(e) => setCorrelationId(e.target.value)}
                    placeholder="Filter by correlation..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Summary */}
        {logs && (
          <Grid item xs={12}>
            <Alert 
              severity={logs.truncated ? 'warning' : 'info'}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                Showing {logs.records.length} of {logs.total_available} available logs
                {logs.truncated && logs.reason && ` (truncated: ${logs.reason})`}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Logs Table */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title={`Logs (${logs?.records.length || 0})`} />
            <CardContent>
              {!logs || logs.records.length === 0 ? (
                <Typography color="text.secondary" align="center" py={4}>
                  No logs found
                </Typography>
              ) : (
                <Box>
                  {logs.records.map((log, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          <Chip 
                            label={log.level.toUpperCase()} 
                            color={getLevelColor(log.level)}
                            size="small"
                          />
                          <Typography variant="body2" fontFamily="monospace">
                            {new Date(log.ts).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {log.msg}
                          </Typography>
                          {log.had_redaction && (
                            <Chip label="Redacted" size="small" color="warning" />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableBody>
                              {log.http_method && (
                                <TableRow>
                                  <TableCell><strong>Method</strong></TableCell>
                                  <TableCell>{log.http_method}</TableCell>
                                </TableRow>
                              )}
                              {log.path && (
                                <TableRow>
                                  <TableCell><strong>Path</strong></TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace' }}>{log.path}</TableCell>
                                </TableRow>
                              )}
                              {log.status_code && (
                                <TableRow>
                                  <TableCell><strong>Status</strong></TableCell>
                                  <TableCell>{log.status_code}</TableCell>
                                </TableRow>
                              )}
                              {log.duration_ms !== undefined && (
                                <TableRow>
                                  <TableCell><strong>Duration</strong></TableCell>
                                  <TableCell>{log.duration_ms.toFixed(2)} ms</TableCell>
                                </TableRow>
                              )}
                              {log.tenant_id && (
                                <TableRow>
                                  <TableCell><strong>Tenant ID</strong></TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace' }}>{log.tenant_id}</TableCell>
                                </TableRow>
                              )}
                              {log.correlation_id && (
                                <TableRow>
                                  <TableCell><strong>Correlation ID</strong></TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace' }}>{log.correlation_id}</TableCell>
                                </TableRow>
                              )}
                              {log.headers && (
                                <TableRow>
                                  <TableCell><strong>Headers</strong></TableCell>
                                  <TableCell>
                                    <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                      {JSON.stringify(log.headers, null, 2)}
                                    </pre>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
