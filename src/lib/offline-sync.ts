import { get, set } from 'idb-keyval'

type SyncAction = {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  payload: any
  timestamp: number
}

const SYNC_QUEUE_KEY = 'reportwise-sync-queue'

export async function queueOfflineAction(url: string, method: 'POST' | 'PUT' | 'PATCH', payload: any) {
  const queue: SyncAction[] = (await get(SYNC_QUEUE_KEY)) || []
  queue.push({
    id: crypto.randomUUID(),
    url,
    method,
    payload,
    timestamp: Date.now()
  })
  await set(SYNC_QUEUE_KEY, queue)
  console.log('Action queued for offline sync:', url)
  
  if (typeof window !== 'undefined' && navigator.onLine) {
    processOfflineQueue()
  }
}

export async function processOfflineQueue() {
  const queue: SyncAction[] = (await get(SYNC_QUEUE_KEY)) || []
  if (queue.length === 0) return

  const remaining = []

  for (const action of queue) {
    try {
      const res = await fetch(action.url, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload)
      })
      if (!res.ok) {
        remaining.push(action)
      }
    } catch (e) {
      // Re-queue on network fail
      remaining.push(action)
    }
  }

  await set(SYNC_QUEUE_KEY, remaining)
}

// Global listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue)
}
