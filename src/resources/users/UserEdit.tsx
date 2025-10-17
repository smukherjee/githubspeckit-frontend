/**
 * UserEdit Component
 *
 * Form to edit existing user:
 * - Email: Can be changed
 * - Status: Maps to is_disabled in API (disabled = is_disabled:true)
 * - Roles: Maps to roles array in API
 * - Shows: created_at, updated_at (read-only)
 * - Responsive grid layout
 */

import {
  Edit,
  SimpleForm,
  TextInput,
  SelectArrayInput,
  SelectInput,
  DateField,
  required,
  email,
  useNotify,
  useRedirect,
  useRefresh,
  useRecordContext,
} from 'react-admin'
import { Grid } from '@mui/material'
import { useEffect } from 'react'
import { canEditUser, getUnauthorizedMessage } from '@/utils/authorization'

// Authorization check component
function EditAuthCheck() {
  const record = useRecordContext()
  const redirect = useRedirect()
  const notify = useNotify()

  useEffect(() => {
    if (record && !canEditUser({ user_id: record.user_id, tenant_id: record.tenant_id })) {
      notify(getUnauthorizedMessage('edit'), { type: 'error' })
      redirect('/forbidden')
    }
  }, [record, redirect, notify])

  return null
}

export function UserEdit() {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();

  const onSuccess = () => {
    notify('User updated successfully');
    redirect('list');
    refresh();
  };

  const onError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    notify(`Error updating user: ${errorMessage}`, { type: 'error' });
  };
  
  return (
    <Edit redirect="list" mutationOptions={{ onSuccess, onError }}>
      <SimpleForm>
        <EditAuthCheck />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="email"
              label="Email"
              validate={[required(), email()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="status"
              label="Status"
              choices={[
                { id: 'invited', name: 'Invited' },
                { id: 'active', name: 'Active' },
                { id: 'disabled', name: 'Disabled' },
              ]}
              validate={[required()]}
              fullWidth
              helperText="'Disabled' status maps to is_disabled:true in API"
            />
          </Grid>
          <Grid item xs={12}>
            <SelectArrayInput
              source="roles"
              label="Roles"
              choices={[
                { id: 'superadmin', name: 'Superadmin' },
                { id: 'tenant_admin', name: 'Tenant Admin' },
                { id: 'admin', name: 'Admin' },
                { id: 'developer', name: 'Developer' },
                { id: 'analyst', name: 'Analyst' },
                { id: 'user', name: 'User' },
                { id: 'support_readonly', name: 'Support (Read-Only)' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateField source="created_at" label="Created At" />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateField source="updated_at" label="Updated At" />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  )
}
