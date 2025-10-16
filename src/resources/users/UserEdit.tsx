/**
 * UserEdit Component
 *
 * Form to edit existing user:
 * - Same fields as UserCreate
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
} from 'react-admin'
import { Grid } from '@mui/material'

export function UserEdit() {
  return (
    <Edit>
      <SimpleForm>
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
            />
          </Grid>
          <Grid item xs={12}>
            <SelectArrayInput
              source="roles"
              label="Roles"
              choices={[
                { id: 'superadmin', name: 'Superadmin' },
                { id: 'tenant_admin', name: 'Tenant Admin' },
                { id: 'standard', name: 'Standard' },
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
