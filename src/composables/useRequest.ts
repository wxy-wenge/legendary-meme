import { ref, shallowRef } from 'vue'
import { RequestError } from '@/utils/request'

export interface UseRequestOptions<T> {
  initialData?: T
}

/**
 * 把「加载中 / 错误 / 数据」三态收敛到一处，页面里不用再手写 try-catch。
 *
 * 默认不向外抛异常（避免未处理的 Promise rejection），
 * 需要分支处理时读 `error` 即可。
 */
export function useRequest<T, P extends unknown[] = []>(
  service: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
) {
  const data = shallowRef<T | undefined>(options.initialData)
  const loading = ref(false)
  const error = ref<RequestError | null>(null)

  async function run(...args: P): Promise<T | undefined> {
    loading.value = true
    error.value = null

    try {
      const result = await service(...args)
      data.value = result
      return result
    } catch (err) {
      error.value =
        err instanceof RequestError
          ? err
          : new RequestError(err instanceof Error ? err.message : '未知错误')
      return undefined
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = options.initialData
    error.value = null
    loading.value = false
  }

  return { data, loading, error, run, reset }
}
