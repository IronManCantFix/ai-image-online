export interface ProxyRequestOptions {
  targetUrl: string
  method?: string
  headers?: Record<string, string>
  body?: BodyInit
}

export interface ProxyResponse {
  ok: boolean
  status: number
  body: string
  headers: Record<string, string>
}

export function useProxy() {
  async function request(options: ProxyRequestOptions): Promise<ProxyResponse> {
    const forwardHeaders = JSON.stringify(options.headers || {})
    const resp = await fetch('/api/proxy', {
      method: options.method || 'POST',
      headers: {
        'X-Target-URL': options.targetUrl,
        'X-Forward-Headers': forwardHeaders,
      },
      body: options.body,
    })
    const body = await resp.text()
    const headers: Record<string, string> = {}
    resp.headers.forEach((value, key) => { headers[key] = value })
    return { ok: resp.ok, status: resp.status, body, headers }
  }
  return { request }
}
