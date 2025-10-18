/**
 * Tenant Resource Components (T042-T043)
 * Superadmin-only resource for managing tenants
 * 
 * Backend supports:
 * - GET /tenants (list)
 * - POST /tenants (create)
 * - DELETE /tenants/{id} (soft delete)
 * - POST /tenants/{id}/restore (restore)
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  Button,
  useRecordContext,
  useNotify,
  useRefresh,
  FunctionField,
  type RaRecord,
} from 'react-admin'
import RestoreIcon from '@mui/icons-material/Restore'
import DeleteIcon from '@mui/icons-material/Delete'
import { Chip } from '@mui/material'
import { apiClient } from '@/utils/api'

/**
 * Soft Delete Button - Archives a tenant
 */
function SoftDeleteTenantButton() {
  const record = useRecordContext()
  const notify = useNotify()
  const refresh = useRefresh()

  if (!record || record.status === 'disabled') {
    return null // Don't show delete button for already deleted tenants
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to disable tenant "${record.name}"? This can be reversed.`)) {
      return
    }

    try {
      await apiClient.delete(`/tenants/${record.tenant_id}`)
      notify('Tenant disabled successfully', { type: 'success' })
      refresh()
    } catch (error) {
      console.error('Soft delete failed:', error)
      notify('Error: Failed to disable tenant', { type: 'error' })
    }
  }

  return (
    <Button
      label="Disable"
      onClick={handleDelete}
      startIcon={<DeleteIcon />}
      color="error"
    />
  )
}

/**
 * Restore Button - Restores a disabled tenant
 */
function RestoreTenantButton() {
  const record = useRecordContext()
  const notify = useNotify()
  const refresh = useRefresh()

  if (!record || record.status !== 'disabled') {
    return null // Only show for disabled tenants
  }

  const handleRestore = async () => {
    try {
      await apiClient.post(`/tenants/${record.tenant_id}/restore`)
      notify('Tenant restored successfully', { type: 'success' })
      refresh()
    } catch (error) {
      console.error('Restore failed:', error)
      notify('Error: Failed to restore tenant', { type: 'error' })
    }
  }

  return (
    <Button
      label="Restore"
      onClick={handleRestore}
      startIcon={<RestoreIcon />}
      color="primary"
    />
  )
}

// T042: TenantList
export function TenantList() {
  return (
    <List>
      <Datagrid>
        <TextField source="name" label="Name" />
        <FunctionField
          label="Status"
          render={(record: RaRecord) => {
            const status = record.status as string;
            return (
              <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                color={
                  status === 'active'
                    ? 'success'
                    : status === 'disabled'
                    ? 'error'
                    : 'default'
                }
                size="small"
              />
            );
          }}
        />
        <TextField source="config_version" label="Config Version" />
        <DateField source="created_at" label="Created" />
        <SoftDeleteTenantButton />
        <RestoreTenantButton />
      </Datagrid>
    </List>
  )
}

// T043: TenantCreate
export function TenantCreate() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <TextInput source="name" validate={[required()]} fullWidth />
        <SelectInput
          source="status"
          choices={[
            { id: 'active', name: 'Active' },
            { id: 'disabled', name: 'Disabled' },
          ]}
          defaultValue="active"
          validate={[required()]}
          fullWidth
        />
      </SimpleForm>
    </Create>
  )
}

// T043: TenantEdit - NOT SUPPORTED
// Backend returns 405 Method Not Allowed for PUT /tenants/{id}
// Commenting out until backend implements individual tenant operations

// T043: TenantShow - NOT SUPPORTED  
// Backend returns 405 Method Not Allowed for GET /tenants/{id}
// Commenting out until backend implements individual tenant operations
