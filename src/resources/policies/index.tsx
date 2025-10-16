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
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="condition_expression" label="Condition" />
        <TextField source="effect" label="Effect" />
        <TextField source="version" label="Version" />
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
              source="policy_id"
              label="Policy ID"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput
              source="version"
              label="Version"
              type="number"
              defaultValue={1}
              validate={[required()]}
              fullWidth
            />
          </Grid>
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
    <Edit>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput
              source="policy_id"
              label="Policy ID"
              validate={[required()]}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput
              source="version"
              label="Version"
              type="number"
              validate={[required()]}
              fullWidth
            />
          </Grid>
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
    </Edit>
  )
}

export function PolicyShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" label="ID" />
        <TextField source="policy_id" label="Policy ID" />
        <TextField source="version" label="Version" />
        <TextField source="resource_type" label="Resource Type" />
        <TextField source="condition_expression" label="Condition Expression" />
        <TextField source="effect" label="Effect" />
        <TextField source="created_by" label="Created By" />
        <TextField source="created_at" label="Created At" />
      </SimpleShowLayout>
    </Show>
  )
}
