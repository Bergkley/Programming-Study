import React from "react";

function Dashboard() {
  return (
    <div style={styles.container}>
      <h1>📊 Dashboard</h1>
      <p>Acompanhe os principais dados da aplicação.</p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h2>1.250</h2>
          <p>Usuários</p>
        </div>

        <div style={styles.card}>
          <h2>73%</h2>
          <p>Conversões</p>
        </div>

        <div style={styles.card}>
          <h2>94%</h2>
          <p>Performance</p>
        </div>
      </div>

      <div style={styles.info}>
        <h3>Desempenho da aplicação</h3>
        <p>
          Este componente foi carregado utilizando Lazy Loading,
          demonstrando Code Splitting no React.
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

  cards: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  card: {
    flex: "1",
    minWidth: "180px",
    padding: "25px",
    backgroundColor: "#f1f5f9",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  info: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#e0f2fe",
    borderRadius: "12px",
  },
};

export default Dashboard;
