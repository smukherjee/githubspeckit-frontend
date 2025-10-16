/**
 * Invitations Resource Components (T046)
 * User invitation workflow (immutable after creation, can revoke)
 */

import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  ChipField,
  Create,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  SelectArrayInput,
  DateTimeInput,
  required,
  email,
  Button,
  useRecordContext,
  useNotify,
  useRefresh,
} from 'react-admin'
import { Grid } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import { apiClient } from '@/utils/api'

// Custom revoke button
function RevokeButton() {
  const record = useRecordContext()
  const notify = useNotify()
  const refresh = useRefresh()

  const handleRevoke = async () => {
    if (!record) return

    try {
      await apiClient.post(`/api/v1/invitations/${record.invitation_id}/revoke`)
      notify('Invitation revoked successfully', { type: 'success' })
      refresh()
    } catch {
      notify('Error: Failed to revoke invitation', { type: 'error' })
    }
  }

  // Only show if invitation is pending
  if (record?.status !== 'pending') {
    return null
  }

  return (
    <Button label="Revoke" onClick={handleRevoke} startIcon={<BlockIcon />} />
  )
}

export function InvitationList() {
  return (
    <List>
      <Datagrid>
        <EmailField source="email" />
        <ChipField source="roles" />
        <TextField source="status" />
        <DateField source="expires_at" label="Expires" />
        <DateField source="created_at" />
      </Datagrid>
    </List>
  )
}

export function InvitationCreate() {
  return (
    <Create>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="email"
              validate={[required(), email()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateTimeInput
              source="expires_at"
              label="Expires At"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <SelectArrayInput
              source="roles"
              choices={[
                { id: 'superadmin', name: 'Superadmin' },
                { id: 'tenant_admin', name: 'Tenant Admin' },
                { id: 'standard', name: 'Standard' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  )
}

export function InvitationShow() {
  return (
    <Show actions={<RevokeButton />}>
      <SimpleShowLayout>
        <TextField source="invitation_id" label="Invitation ID" />
        <EmailField source="email" />
        <ChipField source="roles" />
        <TextField source="status" />
        <DateField source="expires_at" label="Expires At" showTime />
        <DateField source="created_at" showTime />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
