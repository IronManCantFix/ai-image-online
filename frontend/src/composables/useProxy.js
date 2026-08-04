export function useProxy() {
    async function request(options) {
        const forwardHeaders = JSON.stringify(options.headers || {});
        const resp = await fetch('/api/proxy', {
            method: options.method || 'POST',
            headers: {
                'X-Target-URL': options.targetUrl,
                'X-Forward-Headers': forwardHeaders,
            },
            body: options.body,
        });
        const body = await resp.text();
        const headers = {};
        resp.headers.forEach((value, key) => { headers[key] = value; });
        return { ok: resp.ok, status: resp.status, body, headers };
    }
    return { request };
}
//# sourceMappingURL=useProxy.js.map