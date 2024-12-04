<template>
  <div class="dashboard-container">
    <div class="content">
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">
        <div class="chart-card">
          <h3>Tempo Médio de Resolução</h3>
          <canvas id="averageResolutionTimeChart"></canvas>
          <p>{{ tempoMedioResolucao }}</p>
        </div>
        <div class="chart-card">
          <h3>Problemas com Maior Índice de Chamados</h3>
          <canvas id="mostCalledIssuesChart"></canvas>
          <p>{{ problemasMaisChamados }}</p>
        </div>
        <div class="chart-card">
          <h3>Tempo de Resolução dos Chamados</h3>
          <canvas id="resolutionTimeChart"></canvas>
          <p>{{ tempoResolucaoChamados }}</p>
        </div>
        <div class="chart-card">
          <h3>Tempo de Espera</h3>
          <canvas id="waitingTimeChart"></canvas>
          <p>{{ tempoEspera }}</p>
        </div>
      </div>
      <div v-if="erro" class="error-message">
        <p>{{ erro }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "DashboardCharts",
  data() {
    return {
      averageResolutionTimeChart: null,
      mostCalledIssuesChart: null,
      resolutionTimeChart: null,
      waitingTimeChart: null,
      tempoMedioResolucao: null,
      problemasMaisChamados: null,
      tempoResolucaoChamados: null,
      tempoEspera: null,
      erro: null,
    };
  },
  methods: {
    async createCharts() {
      const token = localStorage.getItem("token");

      if (!token) {
        this.erro = "Token não encontrado. O usuário precisa estar autenticado.";
        return;
      }

      try {
        // Gráfico 1: Tempo médio de resolução
        const averageResolutionResponse = await axios.get("http://localhost:3000/tempo-medio-resolucao-tm", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ctx1 = document.getElementById("averageResolutionTimeChart");
        this.tempoMedioResolucao = averageResolutionResponse.data.tempoMedio;
        this.averageResolutionTimeChart = new Chart(ctx1, {
          type: "bar",
          data: averageResolutionResponse.data.chartData,
        });

        // Gráfico 2: Problemas com maior índice de chamados
        const mostCalledIssuesResponse = await axios.get("http://localhost:3000/problemas-maior-indice", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ctx2 = document.getElementById("mostCalledIssuesChart");
        this.problemasMaisChamados = mostCalledIssuesResponse.data.problemas;
        this.mostCalledIssuesChart = new Chart(ctx2, {
          type: "pie",
          data: mostCalledIssuesResponse.data.chartData,
        });

        // Gráfico 3: Tempo de resolução dos chamados
        const resolutionTimeResponse = await axios.get("http://localhost:3000/tempo-fechamento", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ctx3 = document.getElementById("resolutionTimeChart");
        this.tempoResolucaoChamados = resolutionTimeResponse.data.tempoMedio;
        this.resolutionTimeChart = new Chart(ctx3, {
          type: "line",
          data: resolutionTimeResponse.data.chartData,
        });

        // Gráfico 4: Tempo de espera
        const waitingTimeResponse = await axios.get("http://localhost:3000/tempo-primeiro-contato", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ctx4 = document.getElementById("waitingTimeChart");
        this.tempoEspera = waitingTimeResponse.data.tempoMedio;
        this.waitingTimeChart = new Chart(ctx4, {
          type: "bar",
          data: waitingTimeResponse.data.chartData,
        });
      } catch (error) {
        this.erro = "Erro ao buscar dados e criar os gráficos. Tente novamente mais tarde.";
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.createCharts();
    });
  },

  beforeUnmount() {
    if (this.averageResolutionTimeChart) this.averageResolutionTimeChart.destroy();
    if (this.mostCalledIssuesChart) this.mostCalledIssuesChart.destroy();
    if (this.resolutionTimeChart) this.resolutionTimeChart.destroy();
    if (this.waitingTimeChart) this.waitingTimeChart.destroy();
  },
};
</script>


 <style scoped>
  .charts-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
    margin: 20px 0;
  }

  .chart-card {
    flex: 1 1 calc(50% - 20px);
    max-width: calc(50% - 20px);
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .chart-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .chart-card h2 {
    color: #007bff; /* Azul para os títulos */
    margin-bottom: 10px;
    font-size: 1.5rem; /* Tamanho de fonte aprimorado */
  }

  @media (max-width: 768px) {
    .chart-card {
      flex: 1 1 100%;
      max-width: 100%;
    }
  }
</style>
