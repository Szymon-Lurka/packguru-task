export const CHUNK_TYPE = Object.freeze({
  ProcessStage:   'process_stage',
  MachineElement: 'machine_element',
  MachinePart:    'machine_part',
  Procedure:      'procedure',
  Concept:        'concept',
})

export const TYPE_COLORS = {
  [CHUNK_TYPE.ProcessStage]:   '#4f8ef7',
  [CHUNK_TYPE.MachineElement]: '#27ae60',
  [CHUNK_TYPE.MachinePart]:    '#16a085',
  [CHUNK_TYPE.Procedure]:      '#e67e22',
  [CHUNK_TYPE.Concept]:        '#8e44ad',
}
