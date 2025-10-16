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
          primaryText={(record) => record.name}
          secondaryText={(record) => `${record.flag_type} • ${record.status}`}
        />
      ) : (
        <Datagrid>
          <TextField source="name" />
          <TextField source="flag_type" label="Type" />
          <TextField source="status" />
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
            <TextInput source="name" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="flag_type"
              label="Type"
              choices={[
                { id: 'boolean', name: 'Boolean' },
                { id: 'string', name: 'String' },
                { id: 'number', name: 'Number' },
                { id: 'json', name: 'JSON' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="status"
              choices={[
                { id: 'enabled', name: 'Enabled' },
                { id: 'disabled', name: 'Disabled' },
              ]}
              defaultValue="enabled"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="values"
              label="Values (JSON)"
              multiline
              rows={4}
              fullWidth
            />
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
            <TextInput source="name" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="flag_type"
              label="Type"
              choices={[
                { id: 'boolean', name: 'Boolean' },
                { id: 'string', name: 'String' },
                { id: 'number', name: 'Number' },
                { id: 'json', name: 'JSON' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="status"
              choices={[
                { id: 'enabled', name: 'Enabled' },
                { id: 'disabled', name: 'Disabled' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="values"
              label="Values (JSON)"
              multiline
              rows={4}
              fullWidth
            />
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
        <TextField source="name" />
        <TextField source="flag_type" label="Type" />
        <TextField source="status" />
        <TextField source="values" label="Values (JSON)" />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
