import { useEffect, useState } from 'react'

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '')

const marketPriceEndpoint = `${apiBaseUrl}/api/tachibana/market-price`

let marketPriceRequest: Promise<unknown> | undefined

function callBackend(): Promise<unknown> {
  marketPriceRequest ??= fetch(marketPriceEndpoint).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`)
    }

    return response.json() as Promise<unknown>
  })

  return marketPriceRequest
}

function App() {
  const [tachibanaResponse, setTachibanaResponse] = useState<unknown>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    void callBackend()
      .then(setTachibanaResponse)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason))
      })
  }, [])

  return (
    <main className="page-shell">
      <section className="status-card" aria-labelledby="page-title">
        <p className="eyebrow">Stock Alert PoC</p>
        <h1 id="page-title">Tachibana API mock response</h1>
        <p className="description">
          BackendのcallTachibana()が返したJSONを加工せず表示しています。
        </p>
        <p className="endpoint">GET {marketPriceEndpoint}</p>

        {error ? (
          <pre className="json-output error-output">
            {JSON.stringify({ error }, null, 2)}
          </pre>
        ) : (
          <pre className="json-output">
            {tachibanaResponse === undefined
              ? 'Loading...'
              : JSON.stringify(tachibanaResponse, null, 2)}
          </pre>
        )}
      </section>
    </main>
  )
}

export default App
