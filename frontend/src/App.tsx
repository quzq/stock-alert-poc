function App() {
  return (
    <main className="page-shell">
      <section className="status-card" aria-labelledby="page-title">
        <p className="eyebrow">Stock Alert PoC</p>
        <h1 id="page-title">React Web build successful</h1>
        <p className="description">
          到達状況画面のWeb版は、ここから実装します。
        </p>
        <div className="status-row" role="status">
          <span className="status-dot" aria-hidden="true" />
          GitHub Pages deployment ready
        </div>
      </section>
    </main>
  )
}

export default App
