export const getPhase = (name: string) => {
  if (
    [
      'prepare_phase2',
      'new_constrained',
      'compute_constrained',
      'verify_transform_constrained',
    ].includes(name)
  ) {
    return 1;
  }

  if (
    [
      'new',
      'contribute',
      'verify_contribution',
    ]
  ) {
    return 2
  }

  return 0;
}
