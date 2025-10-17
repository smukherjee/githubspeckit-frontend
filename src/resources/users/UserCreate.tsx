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
    <Create redirect="list">
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
            <TextInput
              source="password"
              label="Password"
              type="password"
              validate={[
                required(),
                (value: string) => {
                  if (!value) return undefined
                  if (!/[A-Z]/.test(value)) {
                    return 'Password must contain at least one uppercase letter'
                  }
                  return undefined
                }
              ]}
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
          <Grid item xs={12} md={6}>
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
        </Grid>
      </SimpleForm>
    </Create>
  )
}
