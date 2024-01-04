export function usePermissions() {
  const { canEditLabels } = useRoute().query

  const permissions = {
    canEditLabels: canEditLabels === 'true',
  }

  return permissions
}
