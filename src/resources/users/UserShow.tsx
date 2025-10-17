/**
 * UserShow Component
 *
 * Displays all user fields (read-only):
 * - Basic info: email, roles, status
 * - Metadata: created_at, updated_at, tenant_id
 * - Actions: Restore (if disabled), Reset Password
 */

import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  ChipField,
  Button,
  useRecordContext,
  useNotify,
  useRefresh,
  TopToolbar,
  EditButton,
} from 'react-admin'
import { Link } from 'react-router-dom'
import RestoreIcon from '@mui/icons-material/Restore'
import LockResetIcon from '@mui/icons-material/LockReset'
import PersonIcon from '@mui/icons-material/Person'
import { apiClient } from '@/utils/api'
import { canEditUser, canRestoreUser, canResetPassword, canViewProfile } from '@/utils/authorization'

/**
 * Restore Button - Restores a disabled user
 */
function RestoreUserButton() {
  const record = useRecordContext()
  const notify = useNotify()
  const refresh = useRefresh()

  // Check authorization: only show if user can restore AND status is disabled
  if (!record || record.status !== 'disabled') {
    return null
  }
  
  // Check if current user has permission to restore this user
  if (!canRestoreUser({ user_id: record.user_id, tenant_id: record.tenant_id })) {
    return null
  }

  const handleRestore = async () => {
    try {
      await apiClient.post(`/users/${record.user_id}/restore`)
      notify('User restored successfully', { type: 'success' })
      refresh()
    } catch (error) {
      console.error('Restore failed:', error)
      notify('Error: Failed to restore user', { type: 'error' })
    }
  }

  return (
    <Button
      label="Restore User"
      onClick={handleRestore}
      startIcon={<RestoreIcon />}
    />
  )
}

/**
 * Reset Password Button - Resets user password
 */
function ResetPasswordButton() {
  const record = useRecordContext()
  const notify = useNotify()

  if (!record) {
    return null
  }
  
  // Check if current user has permission to reset password for this user
  if (!canResetPassword({ user_id: record.user_id, tenant_id: record.tenant_id })) {
    return null
  }

  const handleResetPassword = async () => {
    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!${Date.now().toString().substring(8)}`
    
    try {
      await apiClient.post(`/users/${record.user_id}/reset-password`, {
        new_password: tempPassword
      })
      
      // Show the new temporary password
      notify(`Password reset successful. Temporary password: ${tempPassword}`, { 
        type: 'success',
        autoHideDuration: 15000, // Show for 15 seconds so admin can copy it
      })
    } catch (error) {
      console.error('Password reset failed:', error)
      notify('Error: Failed to reset password', { type: 'error' })
    }
  }

  return (
    <Button
      label="Reset Password"
      onClick={handleResetPassword}
      startIcon={<LockResetIcon />}
      color="warning"
    />
  )
}

/**
 * Custom actions for user show page
 */
function UserShowActions() {
  const record = useRecordContext()
  
  return (
    <TopToolbar>
      {/* Only show Edit button if user has permission to edit this user */}
      {record && canEditUser({ user_id: record.user_id, tenant_id: record.tenant_id }) && (
        <EditButton />
      )}
      
      {/* Only show Profile button if user has permission to view profile */}
      {record && canViewProfile(record.user_id, record.tenant_id) && (
        <Button
          component={Link}
          to={`/users/${record.user_id}/profile`}
          label="View Profile"
          startIcon={<PersonIcon />}
        />
      )}
      
      <RestoreUserButton />
      <ResetPasswordButton />
    </TopToolbar>
  )
}

export function UserShow() {
  return (
    <Show actions={<UserShowActions />}>
      <SimpleShowLayout>
        <TextField source="user_id" label="User ID" />
        <EmailField source="email" />
        <ChipField source="roles" label="Roles" />
        <TextField source="status" />
        <TextField source="tenant_id" label="Tenant ID" />
        <DateField source="created_at" label="Created At" showTime />
        <DateField source="updated_at" label="Updated At" showTime />
      </SimpleShowLayout>
    </Show>
  )
}
