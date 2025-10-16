/**
 * ForbiddenPage Component
 *
 * Displays 403 Forbidden error page:
 * - Shows "You don't have permission" message
 * - Includes "Go to Dashboard" button
 * - Used by react-admin when access is denied
 */

import { Box, Button, Typography, Paper } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()

  const handleGoToDashboard = () => {
    navigate('/')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <BlockIcon
          color="error"
          sx={{ fontSize: 64, mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You don't have permission to access this resource.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToDashboard}
          size="large"
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  )
}
