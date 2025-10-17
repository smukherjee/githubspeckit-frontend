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
  type Identifier,
  type RaRecord,
} from 'react-admin'
import { useMediaQuery, type Theme } from '@mui/material'
import { canViewUser } from '@/utils/authorization'

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

  // Custom row click that checks authorization
  const handleRowClick = (_id: Identifier, _resource: string, record: RaRecord<Identifier>) => {
    // Check if user can view this user record
    // Cast to include our user fields
    const userRecord = record as RaRecord<Identifier> & { user_id?: string; tenant_id?: string }
    if (canViewUser(userRecord)) {
      return 'show' // Navigate to show page
    }
    // If not authorized, don't navigate (could show error toast here)
    return false
  }

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
          // SimpleList doesn't support custom rowClick, users can still click
        />
      ) : (
        <Datagrid rowClick={handleRowClick} bulkActionButtons={<UserBulkActionButtons />}>
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
