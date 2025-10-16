/**
 * Tenant Resource Components (T042-T043)
 * Superadmin-only resource for managing tenants
 */

import {
  List,
  Datagrid,
  TextField,
  DateField,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  SelectInput,
  required,
  BulkUpdateButton,
} from 'react-admin'

// T042: TenantList
const TenantBulkActionButtons = () => (
  <>
    <BulkUpdateButton label="Enable" data={{ status: 'active' }} />
    <BulkUpdateButton label="Disable" data={{ status: 'disabled' }} />
  </>
)

export function TenantList() {
  return (
    <List>
      <Datagrid bulkActionButtons={<TenantBulkActionButtons />}>
        <TextField source="name" label="Name" />
        <TextField source="status" label="Status" />
        <TextField source="config_version" label="Config Version" />
        <DateField source="created_at" label="Created" />
      </Datagrid>
    </List>
  )
}

// T043: TenantCreate
export function TenantCreate() {
  return (
    <Create>
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

// T043: TenantEdit
export function TenantEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" validate={[required()]} fullWidth />
        <SelectInput
          source="status"
          choices={[
            { id: 'active', name: 'Active' },
            { id: 'disabled', name: 'Disabled' },
          ]}
          validate={[required()]}
          fullWidth
        />
        <TextField source="config_version" label="Config Version" />
        <DateField source="created_at" />
        <DateField source="updated_at" />
      </SimpleForm>
    </Edit>
  )
}

// T043: TenantShow
export function TenantShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="tenant_id" label="Tenant ID" />
        <TextField source="name" label="Name" />
        <TextField source="status" label="Status" />
        <TextField source="config_version" label="Config Version" />
        <DateField source="created_at" label="Created" showTime />
        <DateField source="updated_at" label="Updated" showTime />
      </SimpleShowLayout>
    </Show>
  )
}
