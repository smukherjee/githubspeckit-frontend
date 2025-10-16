/**
 * Feature Flags Resource Components (T044)
 * Manage runtime configuration toggles per tenant
 */

import {
  List,
  Datagrid,
  SimpleList,
  TextField,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  SelectInput,
  required,
} from 'react-admin'
import { Grid, useMediaQuery, type Theme } from '@mui/material'

export function FeatureFlagList() {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))

  return (
    <List>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.key || 'Unknown'}
          secondaryText={(record) => `${record.state || 'unknown'} • ${record.variant || 'n/a'}`}
        />
      ) : (
        <Datagrid>
          <TextField source="key" label="Key" />
          <TextField source="state" label="State" />
          <TextField source="variant" label="Variant" />
        </Datagrid>
      )}
    </List>
  )
}

export function FeatureFlagCreate() {
  return (
    <Create>
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
    <Edit>
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
          <Grid item xs={12} md={6}>
            <TextInput source="flag_id" label="Flag ID" fullWidth />
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
        <TextField source="id" label="ID" />
        <TextField source="flag_id" label="Flag ID" />
        <TextField source="key" label="Key" />
        <TextField source="state" label="State" />
        <TextField source="variant" label="Variant" />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
