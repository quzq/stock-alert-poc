import { useEffect, useState } from 'react'

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '')

const alertStatusesEndpoint = `${apiBaseUrl}/api/alert-statuses`

let alertStatusesRequest: Promise<unknown> | undefined

function callBackend(): Promise<unknown> {
  alertStatusesRequest ??= fetch(alertStatusesEndpoint).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`)
    }

    return response.json() as Promise<unknown>
  })

  return alertStatusesRequest
}

function App() {
  const [alertStatuses, setAlertStatuses] = useState<unknown>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    void callBackend()
      .then(setAlertStatuses)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason))
      })
  }, [])

  return (
    <main className="page-shell">
      <section className="status-card" aria-labelledby="page-title">
        <p className="eyebrow">Stock Alert PoC</p>
        <h1 id="page-title">Merged alert status mock response</h1>
        <p className="description">
          スプレッドシート由来のモックと立花API形式の株価モックを、銘柄コードで結合したJSONです。
        </p>
        <p className="endpoint">GET {alertStatusesEndpoint}</p>

        {error ? (
          <pre className="json-output error-output">
            {JSON.stringify({ error }, null, 2)}
          </pre>
        ) : (
          <pre className="json-output">
            {alertStatuses === undefined
              ? 'Loading...'
              : JSON.stringify(alertStatuses, null, 2)}
          </pre>
        )}
      </section>
    </main>
  )
}

export default App
