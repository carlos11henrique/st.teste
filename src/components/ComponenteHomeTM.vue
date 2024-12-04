<template>
    <div class="dashboard-container">
      <div class="content">
        <h2>Estatísticas Visuais</h2>
        <div class="charts-container">
          <div class="chart-card">
            <h3>Tempo Médio de Resolução</h3>
            <canvas id="averageResolutionTimeChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Problemas com Maior Índice de Chamados</h3>
            <canvas id="mostCalledIssuesChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Tempo de Resolução dos Chamados</h3>
            <canvas id="resolutionTimeChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Tempo de Espera</h3>
            <canvas id="waitingTimeChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'DashboardCharts',
    data() {
      return {
        averageResolutionTimeChart: null,
        mostCalledIssuesChart: null,
        resolutionTimeChart: null,
        waitingTimeChart: null,
      };
    },
    methods: {
      async fetchChartData(url) {
        try {
          const response = await axios.get(url);
          return response.data;
        } catch (error) {
          console.error(`Erro ao buscar dados de ${url}:`, error);
          return null;
        }
      },async createCharts() {
  // Gráfico 1: Tempo médio de resolução
  const averageResolutionData = await this.fetchChartData('http://localhost:3000/tempo-medio-resolucao-tm');
  if (averageResolutionData) {
    this.averageResolutionTimeChart = new Chart(
      document.getElementById('averageResolutionTimeChart'),
      {
        type: 'bar',
        data: averageResolutionData,
      }
    );
  }

  // Gráfico 2: Problemas com maior índice de chamados
  const mostCalledIssuesData = await this.fetchChartData('http://localhost:3000/problemas-maior-indice');
  if (mostCalledIssuesData) {
    this.mostCalledIssuesChart = new Chart(
      document.getElementById('mostCalledIssuesChart'),
      {
        type: 'pie',
        data: mostCalledIssuesData,
      }
    );
  }

  // Gráfico 3: Tempo de resolução dos chamados
  const resolutionTimeData = await this.fetchChartData('http://localhost:3000/tempo-fechamento');
  if (resolutionTimeData) {
    this.resolutionTimeChart = new Chart(
      document.getElementById('resolutionTimeChart'),
      {
        type: 'line',
        data: resolutionTimeData,
      }
    );
  }

  // Gráfico 4: Tempo de espera
  const waitingTimeData = await this.fetchChartData('http://localhost:3000/tempo-primeiro-contato');
  if (waitingTimeData) {
    this.waitingTimeChart = new Chart(
      document.getElementById('waitingTimeChart'),
      {
        type: 'bar',
        data: waitingTimeData,
      }
    );
  }
},

    mounted() {
      this.createCharts();
    },
    beforeDestroy() {
      if (this.averageResolutionTimeChart) this.averageResolutionTimeChart.destroy();
      if (this.mostCalledIssuesChart) this.mostCalledIssuesChart.destroy();
      if (this.resolutionTimeChart) this.resolutionTimeChart.destroy();
      if (this.waitingTimeChart) this.waitingTimeChart.destroy();
    },
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
