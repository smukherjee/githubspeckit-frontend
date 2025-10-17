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
  FunctionField,
} from 'react-admin'
import { Chip } from '@mui/material'
import type { AuditEvent } from '@/types/auditEvent'

const auditFilters = [
  <TextInput key="actor_user_id" source="actor_user_id" label="Actor User ID" resettable />,
  <TextInput key="action" source="action" label="Action" resettable />,
  <SelectInput
    key="category"
    source="category"
    label="Category"
    resettable
    choices={[
      { id: 'token', name: 'Token' },
      { id: 'user', name: 'User' },
      { id: 'tenant', name: 'Tenant' },
      { id: 'policy', name: 'Policy' },
    ]}
  />,
  <DateInput key="created_after" source="created_after" label="From Date" />,
  <DateInput key="created_before" source="created_before" label="To Date" />,
]

// Custom actions with CSV export for compliance (no delete for audit events)
const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
)

export function AuditEventList() {
  return (
    <List filters={auditFilters} actions={<ListActions />}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <DateField source="timestamp" label="Timestamp" showTime />
        <TextField source="action" label="Action" />
        <TextField source="category" label="Category" />
        <TextField source="actor_user_id" label="Actor User ID" />
        <FunctionField 
          label="Target Type" 
          render={(record: AuditEvent) => {
            if (typeof record.target === 'object' && record.target) {
              return record.target.type || 'N/A'
            }
            return 'N/A'
          }} 
        />
        <FunctionField 
          label="Target ID" 
          render={(record: AuditEvent) => {
            if (typeof record.target === 'object' && record.target) {
              return record.target.id || 'N/A'
            }
            return 'N/A'
          }} 
        />
      </Datagrid>
    </List>
  )
}

export function AuditEventShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="event_id" label="Event ID" />
        <DateField source="timestamp" label="Timestamp" showTime />
        <TextField source="action" label="Action" />
        <FunctionField
          label="Category"
          render={(record: AuditEvent) => (
            <Chip label={record?.category || 'N/A'} size="small" />
          )}
        />
        <TextField source="actor_user_id" label="Actor User ID" />
        <FunctionField 
          label="Target Type" 
          render={(record: AuditEvent) => {
            if (typeof record.target === 'object' && record.target) {
              return record.target.type || 'N/A'
            }
            return typeof record.target === 'string' ? record.target : 'N/A'
          }} 
        />
        <FunctionField 
          label="Target ID" 
          render={(record: AuditEvent) => {
            if (typeof record.target === 'object' && record.target) {
              return record.target.id || 'N/A'
            }
            return 'N/A'
          }} 
        />
        <FunctionField 
          label="Target Tenant ID" 
          render={(record: AuditEvent) => {
            if (typeof record.target === 'object' && record.target) {
              return record.target.tenant_id || 'N/A'
            }
            return 'N/A'
          }} 
        />
        <FunctionField
          label="Metadata"
          render={(record: AuditEvent) => (
            <pre style={{ fontSize: '0.85em', maxWidth: '100%', overflow: 'auto' }}>
              {JSON.stringify(record?.metadata || {}, null, 2)}
            </pre>
          )}
        />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
