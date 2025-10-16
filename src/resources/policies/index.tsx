/**
 * Policies Resource Components (T045)
 * RBAC policy engine rules
 */

import {
  List,
  Datagrid,
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
import { Grid } from '@mui/material'

export function PolicyList() {
  return (
    <List>
      <Datagrid>
        <TextField source="resource_type" label="Resource" />
        <TextField source="action" />
        <TextField source="effect" />
      </Datagrid>
    </List>
  )
}

export function PolicyCreate() {
  return (
    <Create>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="resource_type"
              label="Resource Type"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput source="action" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="effect"
              choices={[
                { id: 'ALLOW', name: 'Allow' },
                { id: 'DENY', name: 'Deny' },
                { id: 'ABSTAIN', name: 'Abstain' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="conditions"
              label="Conditions (JSON)"
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

export function PolicyEdit() {
  return (
    <Edit>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="resource_type"
              label="Resource Type"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput source="action" validate={[required()]} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectInput
              source="effect"
              choices={[
                { id: 'ALLOW', name: 'Allow' },
                { id: 'DENY', name: 'Deny' },
                { id: 'ABSTAIN', name: 'Abstain' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="conditions"
              label="Conditions (JSON)"
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

export function PolicyShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="policy_id" label="Policy ID" />
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="action" />
        <TextField source="effect" />
        <TextField source="conditions" label="Conditions (JSON)" />
        <TextField source="tenant_id" label="Tenant ID" />
      </SimpleShowLayout>
    </Show>
  )
}
