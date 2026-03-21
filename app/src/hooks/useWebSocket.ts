import { useEffect, useRef } from 'react'

interface WebSocketOptions {
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (event: MessageEvent) => void
}

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { onOpen, onClose, onMessage } = options

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('[WS] Connected')
        if (reconnectRef.current) clearTimeout(reconnectRef.current)
        onOpen?.()
      }
      ws.onmessage = (event) => onMessage?.(event)
      ws.onclose = () => {
        console.log('[WS] Disconnected. Reconnecting in 3s...')
        onClose?.()
        reconnectRef.current = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      socketRef.current?.close()
    }
  }, [url])

  return { socket: socketRef.current }
}
