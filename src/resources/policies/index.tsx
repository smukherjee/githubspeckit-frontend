/**
 * Policies Resource Components (T045)
 * RBAC policy engine rules
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
  NumberInput,
  SelectInput,
  required,
} from 'react-admin'
import { Grid } from '@mui/material'

// No bulk actions for policies - individual delete only

export function PolicyList() {
  return (
    <List>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="effect" label="Effect" />
        <TextField source="version" label="Version" />
        <TextField source="condition_expression" label="Condition" />
        <DateField source="created_at" label="Created" />
      </Datagrid>
    </List>
  )
}

export function PolicyCreate() {
  return (
    <Create redirect="list">
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
            <SelectInput
              source="effect"
              label="Effect"
              choices={[
                { id: 'Allow', name: 'Allow' },
                { id: 'Deny', name: 'Deny' },
              ]}
              defaultValue="Allow"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NumberInput
              source="version"
              label="Version"
              defaultValue={1}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="condition_expression"
              label="Condition Expression"
              multiline
              rows={4}
              validate={[required()]}
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
    <Edit redirect="list" mutationMode="pessimistic">
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
            <SelectInput
              source="effect"
              label="Effect"
              choices={[
                { id: 'Allow', name: 'Allow' },
                { id: 'Deny', name: 'Deny' },
              ]}
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <NumberInput
              source="version"
              label="Version"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="condition_expression"
              label="Condition Expression"
              multiline
              rows={4}
              validate={[required()]}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField source="policy_id" label="Policy ID" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField source="created_by" label="Created By" />
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

export function PolicyShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="policy_id" label="Policy ID" />
        <TextField source="version" label="Version" />
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="effect" label="Effect" />
        <TextField source="condition_expression" label="Condition Expression" />
        <TextField source="created_by" label="Created By" />
        <DateField source="created_at" label="Created" showTime />
        <DateField source="updated_at" label="Updated" showTime />
      </SimpleShowLayout>
    </Show>
  )
}
