/**
 * Audit Events Resource Components (T047)
 * Immutable audit log entries (read-only, no create/edit/delete)
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
  SelectInput,
  DateInput,
  Show,
  SimpleShowLayout,
  ExportButton,
  TopToolbar,
} from 'react-admin'

const auditFilters = [
  <TextInput key="actor_id" source="actor_id" label="Actor ID" />,
  <TextInput key="action" source="action" label="Action" />,
  <SelectInput
    key="resource_type"
    source="resource_type"
    label="Resource Type"
    choices={[
      { id: 'user', name: 'User' },
      { id: 'tenant', name: 'Tenant' },
      { id: 'feature_flag', name: 'Feature Flag' },
      { id: 'policy', name: 'Policy' },
      { id: 'invitation', name: 'Invitation' },
    ]}
  />,
  <DateInput key="created_after" source="created_after" label="From Date" />,
  <DateInput key="created_before" source="created_before" label="To Date" />,
]

// Custom actions with CSV export for compliance
const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
)

export function AuditEventList() {
  return (
    <List filters={auditFilters} actions={<ListActions />}>
      <Datagrid>
        <DateField source="timestamp" showTime />
        <TextField source="actor_id" label="Actor" />
        <TextField source="action" />
        <TextField source="resource_type" label="Resource" />
        <TextField source="resource_id" label="Resource ID" />
      </Datagrid>
    </List>
  )
}

export function AuditEventShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="event_id" label="Event ID" />
        <DateField source="timestamp" showTime />
        <TextField source="actor_id" label="Actor ID" />
        <TextField source="action" />
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="resource_id" label="Resource ID" />
        <TextField source="metadata" label="Metadata (JSON)" />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
