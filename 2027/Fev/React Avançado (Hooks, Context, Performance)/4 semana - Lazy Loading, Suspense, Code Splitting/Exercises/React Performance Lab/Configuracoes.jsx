import React, { useState } from "react";

function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [tema, setTema] = useState("Claro");

  return (
    <div style={styles.container}>
      <h1>⚙️ Configurações</h1>
      <p>Gerencie as configurações da aplicação.</p>

      <div style={styles.section}>
        <h3>🎨 Tema</h3>

        <select
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          style={styles.select}
        >
          <option value="Claro">☀️ Claro</option>
          <option value="Escuro">🌙 Escuro</option>
        </select>

        <p>Tema selecionado: {tema}</p>
      </div>

      <div style={styles.section}>
        <h3>🔔 Notificações</h3>

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={notificacoes}
            onChange={() => setNotificacoes(!notificacoes)}
          />

          Ativar notificações
        </label>

        <p>
          Status:{" "}
          {notificacoes ? "✅ Notificações ativadas" : "❌ Notificações desativadas"}
        </p>
      </div>

      <div style={styles.info}>
        <h3>🚀 Performance</h3>
        <p>
          Esta página também utiliza Lazy Loading e Code Splitting.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  section: {
    marginTop: "25px",
    padding: "25px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
  },

  label: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    cursor: "pointer",
  },

  info: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#dcfce7",
    borderRadius: "12px",
  },
};

export default Configuracoes;
