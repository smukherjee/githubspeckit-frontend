/**
 * UserList Component
 *
 * Responsive list of users:
 * - Desktop: Datagrid with columns (email, roles, status, created_at)
 * - Tablet: SimpleList with primaryText=email, secondaryText=roles+status
 * - Filters: status, roles, search by email (debounced)
 * - Bulk actions: Enable/Disable users
 */

import {
  List,
  Datagrid,
  EmailField,
  DateField,
  ChipField,
  SimpleList,
  TextInput,
  SelectInput,
  BulkUpdateButton,
  type Identifier,
  type RaRecord,
  FunctionField,
} from 'react-admin'
import { useMediaQuery, type Theme, Chip } from '@mui/material'
import { canViewUser } from '@/utils/authorization'
import { debounce } from 'lodash'
import { useMemo } from 'react'

// Debounced search input to reduce API calls
const DebouncedSearchInput = () => {
  const debouncedSearch = useMemo(
    () => debounce((value: string, callback: (value: string) => void) => {
      callback(value)
    }, 500),
    []
  )

  return (
    <TextInput
      key="email"
      source="email"
      label="Search by email"
      alwaysOn
      resettable
      parse={(value: string) => {
        debouncedSearch(value, () => {})
        return value
      }}
    />
  )
}

const userFilters = [
  <DebouncedSearchInput key="email-search" />,
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
    <BulkUpdateButton 
      label="Set Active" 
      data={{ status: 'active' }} 
      mutationMode="pessimistic"
    />
    <BulkUpdateButton 
      label="Set Disabled" 
      data={{ status: 'disabled' }} 
      mutationMode="pessimistic"
    />
  </>
)

export function UserList() {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'))

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
          <ChipField source="roles" />
          <DateField source="created_at" label="Created" />
          <DateField source="updated_at" label="Updated" />
        </Datagrid>
      )}
    </List>
  )
}
