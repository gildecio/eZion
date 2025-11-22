export default function Dashboard(): JSX.Element {
  return (
    <main className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Painel detalhado</p>
      </div>

      <section className="grid cards">
        <div className="card">
          <div className="card-title">Faturamento (Mês)</div>
          <div className="card-value">R$ 18.100</div>
        </div>
        <div className="card">
          <div className="card-title">Produtos</div>
          <div className="card-value">892</div>
        </div>
        <div className="card">
          <div className="card-title">Estoque Baixo</div>
          <div className="card-value">12</div>
        </div>
      </section>

      <section className="panel">
        <h2>Atividade recente</h2>
        <p className="muted">Nenhuma atividade crítica nas últimas 24 horas.</p>
      </section>
    </main>
  )
}
