type MutationStatus = 'idle' | 'pending' | 'success' | 'error'

interface UseMutationOptions<Variables extends unknown[], Data> {
  mutationFn: (...variables: Variables) => Promise<Data>
  onMutate?: () => Promise<void> | void
  onSuccess?: (data: Data) => Promise<void> | void
  onError?: () => Promise<void> | void
  onSettled?: () => Promise<void> | void
}

interface UseMutationReturn<Parameters extends unknown[], Data> {
  data: Ref<Data | undefined>
  status: Ref<MutationStatus>
  isIdle: ComputedRef<boolean>
  isPending: ComputedRef<boolean>
  isSuccess: ComputedRef<boolean>
  isError: ComputedRef<boolean>
  mutate: (...variables: Parameters) => void
}

// Based on TanStack Query's useMutation https://tanstack.com/query/latest/docs/framework/vue/guides/mutations
export function useMutation<Variables extends unknown[], Data>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: UseMutationOptions<Variables, Data>): UseMutationReturn<Variables, Data> {
  const status = ref<MutationStatus>('idle')
  const data = shallowRef<Data | undefined>(undefined)

  function mutate(...variables: Variables): void {
    status.value = 'pending'
    onMutate?.()
    mutationFn(...variables)
      .then((mutationFnData) => {
        status.value = 'success'
        data.value = mutationFnData
        onSuccess?.(mutationFnData)
      })
      .catch(() => {
        status.value = 'error'
        onError?.()
      })
      .finally(() => {
        onSettled?.()
      })
  }

  const isIdle = computed(() => status.value === 'idle')
  const isPending = computed(() => status.value === 'pending')
  const isSuccess = computed(() => status.value === 'success')
  const isError = computed(() => status.value === 'error')

  const result: UseMutationReturn<Variables, Data> = {
    status,
    data,
    isIdle,
    isPending,
    isSuccess,
    isError,
    mutate,
  }

  return result
}
