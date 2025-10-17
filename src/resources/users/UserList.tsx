/**
 * UserList Component
 *
 * Responsive list of users:
 * - Desktop: Datagrid with columns (email, roles, status, created_at)
 * - Tablet: SimpleList with primaryText=email, secondaryText=roles+status
 * - Filters: status, roles, search by email
 * - Bulk actions: Enable/Disable users
 */

import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  ChipField,
  SimpleList,
  TextInput,
  SelectInput,
  BulkUpdateButton,
  BulkDeleteButton,
} from 'react-admin'
import { useMediaQuery, type Theme } from '@mui/material'

const userFilters = [
  <TextInput key="email" source="email" label="Search by email" alwaysOn resettable />,
  <SelectInput
    key="status"
    source="status"
    label="Status"
    resettable
    choices={[
      { id: 'invited', name: 'Invited' },
      { id: 'active', name: 'Active' },
      { id: 'disabled', name: 'Disabled' },
    ]}
  />,
  <SelectInput
    key="roles"
    source="roles"
    label="Role"
    resettable
    choices={[
      { id: 'superadmin', name: 'Superadmin' },
      { id: 'tenant_admin', name: 'Tenant Admin' },
      { id: 'standard', name: 'Standard' },
    ]}
  />,
]

const UserBulkActionButtons = () => (
  <>
    <BulkUpdateButton label="Enable" data={{ status: 'active' }} />
    <BulkUpdateButton label="Disable" data={{ status: 'disabled' }} />
    <BulkDeleteButton />
  </>
)

export function UserList() {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))

  return (
    <List filters={userFilters}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.email}
          secondaryText={(record) =>
            `${record.roles.join(', ')} • ${record.status}`
          }
          tertiaryText={(record) =>
            new Date(record.created_at).toLocaleDateString()
          }
        />
      ) : (
        <Datagrid rowClick="show" bulkActionButtons={<UserBulkActionButtons />}>
          <EmailField source="email" />
          <ChipField source="roles" />
          <TextField source="status" />
          <DateField source="created_at" label="Created" />
          <DateField source="updated_at" label="Updated" />
        </Datagrid>
      )}
    </List>
  )
}
