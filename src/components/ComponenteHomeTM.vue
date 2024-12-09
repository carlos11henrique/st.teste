<template>
  <div class="dashboard-container">
    <div class="content">
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">
        <div class="chart-card">
          <h3>Tempo Médio de Resolução</h3>
          <canvas id="averageResolutionTimeChart"></canvas>
          <p v-if="tempoMedioResolucao">Tempo Médio: {{ tempoMedioResolucao }} horas</p>
          <p v-else>Carregando...</p>
        </div>
        <div class="chart-card">
          <h3>Problemas com Maior Índice de Chamados</h3>
          <canvas id="mostCalledIssuesChart"></canvas>
          <p v-if="problemasRecorrentes">Problemas: {{ problemasRecorrentes }}</p>
          <p v-else>Carregando...</p>
        </div>
        <div class="chart-card">
          <h3>Tempo de Fechamento</h3>
          <canvas id="closingTimeChart"></canvas>
          <p v-if="tempoFechamento">Tempo de Fechamento: {{ tempoFechamento }} horas</p>
          <p v-else>Carregando...</p>
        </div>
        <div class="chart-card">
          <h3>Tempo de Primeiro Contato</h3>
          <canvas id="firstContactTimeChart"></canvas>
          <p v-if="tempoPrimeiroContato">Tempo: {{ tempoPrimeiroContato }} horas</p>
          <p v-else>Carregando...</p>
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
      tempoMedioResolucao: null,
      problemasRecorrentes: null,
      tempoFechamento: null,
      tempoPrimeiroContato: null,
      erro: null,
      charts: [],
    };
  },
  methods: {
    async fetchData() {
      this.erro = null;
      const token = localStorage.getItem("token");

      if (!token) {
        this.erro = "Token não encontrado. O usuário precisa estar autenticado.";
        return;
      }

      try {
        const baseURL = 'http://localhost:3000/home';

        // Tempo Médio de Resolução
        const resTempo = await axios.get(`${baseURL}/tempo-medio-resolucao-tm`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.tempoMedioResolucao = resTempo.data.map(item => item.tempo_medio_resolucao_horas)[0]; // Pegando o primeiro valor
        console.log("Tempo Médio de Resolução:", this.tempoMedioResolucao);

        // Problemas com Maior Índice de Chamados
        const resProblemas = await axios.get(`${baseURL}/problemas-maior-indice`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.problemasRecorrentes = resProblemas.data.map(item => item.problema).join(', ');
        console.log("Problemas Recorrentes:", this.problemasRecorrentes);

        // Tempo de Fechamento
        const resFechamento = await axios.get(`${baseURL}/tempo-fechamento`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.tempoFechamento = resFechamento.data.map(item => item.tempo_total_resolucao_horas)[0]; // Pegando o primeiro valor
        console.log("Tempo de Fechamento:", this.tempoFechamento);

        // Tempo de Primeiro Contato
        const resPrimeiroContato = await axios.get(`${baseURL}/tempo-primeiro-contato`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.tempoPrimeiroContato = resPrimeiroContato.data.map(item => item.tempo_primeiro_contato_horas)[0]; // Pegando o primeiro valor
        console.log("Tempo de Primeiro Contato:", this.tempoPrimeiroContato);

        // Criação dos gráficos
        this.createCharts(resTempo, resProblemas, resFechamento, resPrimeiroContato);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        this.erro = "Erro ao buscar dados e criar os gráficos. Tente novamente mais tarde.";
      }
    },

    createCharts(resTempo, resProblemas, resFechamento, resPrimeiroContato) {
      // Criando gráfico de Tempo Médio de Resolução
      const ctx1 = document.getElementById("averageResolutionTimeChart");
      new Chart(ctx1, {
        type: "bar",
        data: {
          labels: ['Tempo Médio de Resolução'],
          datasets: [{
            label: 'Tempo Médio de Resolução (horas)',
            data: [this.tempoMedioResolucao],
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });

      // Criando gráfico de Problemas com Maior Índice de Chamados
      const ctx2 = document.getElementById("mostCalledIssuesChart");
      new Chart(ctx2, {
        type: "pie",
        data: {
          labels: resProblemas.data.map(item => item.problema),
          datasets: [{
            data: resProblemas.data.map(item => item.total_chamados),
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6'],
          }],
        },
        options: {
          responsive: true,
        },
      });

      // Criando gráfico de Tempo de Fechamento
      const ctx3 = document.getElementById("closingTimeChart");
      new Chart(ctx3, {
        type: "line",
        data: {
          labels: ['Tempo de Fechamento'],
          datasets: [{
            label: 'Tempo de Fechamento (horas)',
            data: [this.tempoFechamento],
            borderColor: '#FF9800',
            fill: false,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });

      // Criando gráfico de Tempo de Primeiro Contato
      const ctx4 = document.getElementById("firstContactTimeChart");
      new Chart(ctx4, {
        type: "bar",
        data: {
          labels: ['Tempo de Primeiro Contato'],
          datasets: [{
            label: 'Tempo de Primeiro Contato (horas)',
            data: [this.tempoPrimeiroContato],
            backgroundColor: '#8E24AA',
            borderColor: '#7B1FA2',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    },
  },
  mounted() {
    this.fetchData();
  },
  beforeUnmount() {
    // Destruir os gráficos antes de desmontar o componente
    this.charts.forEach((chart) => {
      if (chart) chart.destroy();
    });
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
  color: #007bff;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .chart-card {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>
