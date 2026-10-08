export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  return (
    <main className="admin-login-shell">
      <form className="admin-login-card" action="/landing-api/auth/login" method="post">
        <div className="admin-eyebrow">Plugando IA</div>
        <h1>Acessar analytics</h1>
        <p>Entre para consultar acessos, cliques, campanhas e vendas das landing pages.</p>
        {searchParams.error === "config" ? <div className="admin-error">Configuração incompleta no servidor. Verifique ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_SESSION_SECRET.</div> : null}
        {searchParams.error === "1" ? <div className="admin-error">E-mail ou senha inválidos.</div> : null}
        <input type="hidden" name="next" value={searchParams.next || "/landing-admin"} />
        <label>
          E-mail
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Senha
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
