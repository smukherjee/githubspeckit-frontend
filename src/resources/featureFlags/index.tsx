/**
 * Feature Flags Resource Components (T044)
 * Manage runtime configuration toggles per tenant
 */

import {
  List,
  Datagrid,
  SimpleList,
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
  FunctionField,
  type RaRecord,
} from 'react-admin'
import { Grid, useMediaQuery, type Theme, Chip } from '@mui/material'
import { debounce } from 'lodash'
import { useMemo } from 'react'

// Debounced search input for feature flags
const DebouncedSearchInput = () => {
  const debouncedSearch = useMemo(
    () => debounce((value: string, callback: (value: string) => void) => {
      callback(value)
    }, 500),
    []
  )

  return (
    <TextInput
      key="key"
      source="key"
      label="Search by key"
      alwaysOn
      resettable
      parse={(value: string) => {
        debouncedSearch(value, () => {})
        return value
      }}
    />
  )
}

const featureFlagFilters = [
  <DebouncedSearchInput key="key-search" />,
  <SelectInput
    key="state"
    source="state"
    label="State"
    resettable
    choices={[
      { id: 'enabled', name: 'Enabled' },
      { id: 'disabled', name: 'Disabled' },
    ]}
  />,
]

// Bulk actions for feature flags
const FeatureFlagBulkActionButtons = () => (
  <>
    <BulkUpdateButton 
      label="Enable" 
      data={{ state: 'enabled' }} 
      mutationMode="pessimistic"
    />
    <BulkUpdateButton 
      label="Disable" 
      data={{ state: 'disabled' }} 
      mutationMode="pessimistic"
    />
  </>
)

export function FeatureFlagList() {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'))

  return (
    <List filters={featureFlagFilters}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.key || 'Unknown'}
          secondaryText={(record) => `${record.state || 'unknown'} • ${record.variant || 'n/a'}`}
        />
      ) : (
        <Datagrid rowClick="edit" bulkActionButtons={<FeatureFlagBulkActionButtons />}>
          <TextField source="key" label="Key" />
          <FunctionField
            label="State"
            render={(record: RaRecord) => {
              const state = record.state as string;
              return (
                <Chip
                  label={state.charAt(0).toUpperCase() + state.slice(1)}
                  color={state === 'enabled' ? 'success' : 'error'}
                  size="small"
                />
              );
            }}
          />
          <TextField source="variant" label="Variant" />
          <DateField source="created_at" label="Created" />
          <DateField source="updated_at" label="Updated" />
        </Datagrid>
      )}
    </List>
  )
}

export function FeatureFlagCreate() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput source="key" label="Key" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="state"
              label="State"
              choices={[
                { id: 'enabled', name: 'Enabled' },
                { id: 'disabled', name: 'Disabled' },
              ]}
              defaultValue="disabled"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput source="variant" label="Variant" fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput source="flag_id" label="Flag ID" fullWidth />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  )
}

export function FeatureFlagEdit() {
  return (
    <Edit redirect="list" mutationMode="pessimistic">
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput source="key" label="Key" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="state"
              label="State"
              choices={[
                { id: 'enabled', name: 'Enabled' },
                { id: 'disabled', name: 'Disabled' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput source="variant" label="Variant" fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField source="flag_id" label="Flag ID" />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateField source="created_at" label="Created" showTime />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateField source="updated_at" label="Updated" showTime />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  )
}

export function FeatureFlagShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="flag_id" label="Flag ID" />
        <TextField source="key" label="Key" />
        <TextField source="state" label="State" />
        <TextField source="variant" label="Variant" />
        <TextField source="tenant_id" label="Tenant ID" />
        <DateField source="created_at" label="Created" showTime />
        <DateField source="updated_at" label="Updated" showTime />
      </SimpleShowLayout>
    </Show>
  )
}
