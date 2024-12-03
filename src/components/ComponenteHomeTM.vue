<template>
    <div class="dashboard-container">
      <div class="content">
        <h2>Estatísticas Visuais</h2>
        <div class="charts-container">
          <!-- Gráfico 1: Tempo médio de resolução -->
          <div class="chart-card">
            <h3>Tempo Médio de Resolução</h3>
            <canvas id="averageResolutionTimeChart"></canvas>
          </div>
  
          <!-- Gráfico 2: Problemas com maior índice de chamados -->
          <div class="chart-card">
            <h3>Problemas com Maior Índice de Chamados</h3>
            <canvas id="mostCalledIssuesChart"></canvas>
          </div>
  
          <!-- Gráfico 3: Tempo de resolução dos chamados -->
          <div class="chart-card">
            <h3>Tempo de Resolução dos Chamados</h3>
            <canvas id="resolutionTimeChart"></canvas>
          </div>
  
          <!-- Gráfico 4: Tempo de espera -->
          <div class="chart-card">
            <h3>Tempo de Espera</h3>
            <canvas id="waitingTimeChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'DashboardCharts',
    setup() {
      let averageResolutionTimeChart, mostCalledIssuesChart, resolutionTimeChart, waitingTimeChart;
  
      const createChart = (ctx, type, data, options) => {
        return new Chart(ctx, { type, data, options });
      };
  
      onMounted(() => {
        // Gráfico 1: Tempo médio de resolução
        averageResolutionTimeChart = createChart(document.getElementById('averageResolutionTimeChart'), 'bar', {
          labels: ['Categoria A', 'Categoria B', 'Categoria C'],
          datasets: [{
            label: 'Tempo Médio (horas)',
            data: [3.5, 2.8, 4.2],
            backgroundColor: '#36A2EB',
          }],
        });
  
        // Gráfico 2: Problemas com maior índice de chamados
        mostCalledIssuesChart = createChart(document.getElementById('mostCalledIssuesChart'), 'pie', {
          labels: ['Hardware', 'Software', 'Rede'],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          }],
        });
  
        // Gráfico 3: Tempo de resolução dos chamados
        resolutionTimeChart = createChart(document.getElementById('resolutionTimeChart'), 'line', {
          labels: ['Janeiro', 'Fevereiro', 'Março'],
          datasets: [{
            label: 'Tempo de Resolução (horas)',
            data: [5, 4.2, 6],
            borderColor: '#FF6384',
            fill: false,
          }],
        });
  
        // Gráfico 4: Tempo de espera
        waitingTimeChart = createChart(document.getElementById('waitingTimeChart'), 'bar', {
          labels: ['Chamado 1', 'Chamado 2', 'Chamado 3'],
          datasets: [{
            label: 'Tempo de Espera (horas)',
            data: [2, 1.5, 3],
            backgroundColor: '#4BC0C0',
          }],
        });
      });
  
      onUnmounted(() => {
        if (averageResolutionTimeChart) averageResolutionTimeChart.destroy();
        if (mostCalledIssuesChart) mostCalledIssuesChart.destroy();
        if (resolutionTimeChart) resolutionTimeChart.destroy();
        if (waitingTimeChart) waitingTimeChart.destroy();
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
