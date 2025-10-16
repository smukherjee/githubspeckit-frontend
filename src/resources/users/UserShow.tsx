/**
 * UserShow Component
 *
 * Displays all user fields (read-only):
 * - Basic info: email, roles, status
 * - Metadata: created_at, updated_at, tenant_id
 */

import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  ChipField,
} from 'react-admin'

export function UserShow() {
  return (
    <Show>
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
