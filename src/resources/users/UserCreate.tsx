/**
 * UserCreate Component
 *
 * Form to create new user:
 * - Fields: email, roles (multi-select), status
 * - Validation: Email format, required fields
 * - Responsive: Grid layout (xs=12, md=6 for side-by-side on desktop)
 */

import {
  Create,
  SimpleForm,
  TextInput,
  SelectArrayInput,
  SelectInput,
  required,
  email,
} from 'react-admin'
import { Grid } from '@mui/material'

export function UserCreate() {
  return (
    <Create>
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
              defaultValue="invited"
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
        </Grid>
      </SimpleForm>
    </Create>
  )
}
