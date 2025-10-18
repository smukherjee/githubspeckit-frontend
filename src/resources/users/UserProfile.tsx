/**
 * UserProfile Component
 * 
 * Manages user profile information separate from core user data
 * - Full name, phone, address
 * - Profile photo upload/delete
 * - Read from GET /api/v1/users/{user_id}/profile
 * - Update via PUT /api/v1/users/{user_id}/profile
 * - Photo via POST/DELETE /api/v1/users/{user_id}/profile/photo
 */

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Avatar,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import DeleteIcon from '@mui/icons-material/Delete'
import { apiClient } from '@/utils/api'
import { useParams } from 'react-router-dom'
import { canViewProfile, canEditProfile, getUnauthorizedMessage } from '@/utils/authorization'

// Helper to convert relative URLs to absolute
const getAbsoluteUrl = (relativePath: string | null | undefined): string | undefined => {
  if (!relativePath) return undefined
  // If already absolute, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  // Convert relative path to absolute using backend URL
  // In production, Vite proxy won't be available, so we need the actual backend URL
  // For now, use localhost:8000 as that's where the backend serves media files
  return `http://localhost:8000${relativePath}`
}

interface UserProfile {
  user_id: string
  full_name?: string | null
  phone?: string | null
  address?: string | null
  photo_display_url?: string | null
  photo_thumbnail_url?: string | null
  photo_avatar_url?: string | null
  created_at: string
  updated_at: string
}

export function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  
  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Check authorization
  useEffect(() => {
    if (id && profile) {
      if (!canViewProfile(id, profile.user_id)) {
        setUnauthorized(true)
        setError(getUnauthorizedMessage('view'))
      }
    }
  }, [id, profile])

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get(`/users/${id}/profile`)
        const profileData = response.data as UserProfile
        
        // Profile data loaded successfully
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setPhone(profileData.phone || '')
        setAddress(profileData.address || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id])

  // Save profile
  const handleSave = async () => {
    if (!id) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      await apiClient.put(`/users/${id}/profile`, {
        full_name: fullName || null,
        phone: phone || null,
        address: address || null,
      })

      setSuccess('Profile updated successfully')
      
      // Reload profile to get updated timestamps
      const response = await apiClient.get(`/users/${id}/profile`)
      setProfile(response.data as UserProfile)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Upload photo
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    const formData = new FormData()
    formData.append('photo', file) // Backend expects 'photo' not 'file'

    try {
      setError(null)
      setSuccess(null)
      
      await apiClient.post(`/users/${id}/profile/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Photo uploaded successfully')
      
      // Reload profile to get new photo URLs
      const response = await apiClient.get(`/users/${id}/profile`)
      setProfile(response.data as UserProfile)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setError('Failed to upload photo')
    }
  }

  // Delete photo
  const handlePhotoDelete = async () => {
    if (!id || !profile?.photo_display_url) return

    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      
      await apiClient.delete(`/users/${id}/profile/photo`)

      setSuccess('Photo deleted successfully')
      
      // Reload profile to clear photo URLs
      const response = await apiClient.get(`/users/${id}/profile`)
      setProfile(response.data as UserProfile)
    } catch (err) {
      console.error('Failed to delete photo:', err)
      setError('Failed to delete photo')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  // Check if user can edit this profile
  const canEdit = id ? canEditProfile(id, profile?.user_id) : false

  // Show unauthorized message if user can't view profile
  if (unauthorized) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Profile Photo Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Profile Photo" />
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={getAbsoluteUrl(profile?.photo_avatar_url)}
                  alt={fullName || 'User'}
                  sx={{ width: 150, height: 150 }}
                />
                
                {/* Only show upload/delete buttons if user can edit this profile */}
                {canEdit && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </Button>
                    
                    {profile?.photo_display_url && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handlePhotoDelete}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Profile Information" />
            <CardContent>
              <Grid container spacing={2}>
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                {success && (
                  <Grid item xs={12}>
                    <Alert severity="success">{success}</Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!canEdit}
                    InputProps={{ readOnly: !canEdit }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    disabled={!canEdit}
                    InputProps={{ readOnly: !canEdit }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!canEdit}
                    InputProps={{ readOnly: !canEdit }}
                  />
                </Grid>

                {/* Only show Save button if user can edit */}
                {canEdit && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </Grid>
                )}
                
                {/* Show read-only notice if user can only view */}
                {!canEdit && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      You are viewing this profile in read-only mode.
                    </Alert>
                  </Grid>
                )}

                {profile && (
                  <Grid item xs={12}>
                    <Box mt={2} color="text.secondary" fontSize="0.875rem">
                      <div>Created: {new Date(profile.created_at).toLocaleString()}</div>
                      <div>Last updated: {new Date(profile.updated_at).toLocaleString()}</div>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
