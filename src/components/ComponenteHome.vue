<template>
  <div class="dashboard-container">
    <!-- Sidebar de navegação -->

    <!-- Conteúdo Principal com cartões resumo e gráficos -->
    <div class="content">
      <h2>Resumo Geral</h2>
      <div class="dashboard-summary">
        <div class="summary-card"><h3>Total de Chamados Abertos</h3><p>150</p></div>
        <div class="summary-card"><h3>Total de Chamados Finalizados</h3><p>120</p></div>
        <div class="summary-card"><h3>Total de Chamados Em Andamento</h3><p>30</p></div>
        <div class="summary-card"><h3>Tempo Médio de Resolução</h3><p>4h 30m</p></div>
        <div class="summary-card"><h3>Problemas Mais Recorrentes</h3><p>Impressoras, Rede</p></div>
      </div>

      <!-- Gráficos -->
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">
        <!-- Gráfico de Pizza -->
        <div class="chart-card">
          <h3>Distribuição de Chamados por Categoria</h3>
          <canvas id="pieChart"></canvas>
        </div>

        <!-- Gráfico de Barra -->
        <div class="chart-card">
          <h3>Chamados por Mês</h3>
          <canvas id="barChart"></canvas>
        </div>

        <!-- Gráfico de Linha -->
        <div class="chart-card">
          <h3>Evolução dos Chamados</h3>
          <canvas id="lineChart"></canvas>
        </div>

        <!-- Gráfico de Degrau -->
        <div class="chart-card">
          <h3>Chamados em Degrau</h3>
          <canvas id="stepChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'ComponenteHome',
  setup() {
    let pieChart, barChart, lineChart, stepChart;

    // Função reutilizável para criação de gráficos
    const createChart = (ctx, type, data, options) => {
      return new Chart(ctx, {
        type,
        data,
        options
      });
    };

    // Montagem do componente (onMounted)
    onMounted(() => {
      pieChart = createChart(document.getElementById('pieChart'), 'pie', {
        labels: ['TI', 'Manutenção', 'Outros'],
        datasets: [{
          data: [20, 30, 20],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      });

      barChart = createChart(document.getElementById('barChart'), 'bar', {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
          label: 'Chamados por Mês',
          data: [20, 30, 40, 25, 35, 45],
          backgroundColor: '#4BC0C0'
        }]
      }, {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      });

      lineChart = createChart(document.getElementById('lineChart'), 'line', {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
          label: 'Evolução dos Chamados',
          data: [15, 25, 35, 45, 55, 65],
          borderColor: '#36A2EB',
          fill: false
        }]
      });

      stepChart = createChart(document.getElementById('stepChart'), 'line', {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
          label: 'Chamados em Degrau',
          data: [10, 15, 20, 30, 40, 50],
          borderColor: '#FF6384',
          stepped: true,
          fill: false
        }]
      });
    });

    // Desmontagem do componente (onUnmounted) para liberar recursos
    onUnmounted(() => {
      if (pieChart) pieChart.destroy();
      if (barChart) barChart.destroy();
      if (lineChart) lineChart.destroy();
      if (stepChart) stepChart.destroy();
    });
  }
};
</script>

<style scoped>

/* Cartões de resumo */
.dashboard-summary {
  display: flex;  
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 40px;
  margin-left: 90px;
}

.summary-card {
  background-color: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-10px);
}

.summary-card h3 {
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
  
}

.summary-card p {
  font-size: 32px;
  font-weight: bold;
  color: #0e85bd;
}

/* Gráficos */
.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-left: 95px;

}

.chart-card {
  background-color: #fff;
  padding: 20px;
  width: calc(50% - 20px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(33, 33, 33, 0.292);
  transition: transform 0.3s ease;
  
}

.chart-card:hover {
  transform: translateY(-10px);
}

.chart-card h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

/* Gráficos específicos */
canvas {
  width: 100%;
  height: 200px;
}

/* Responsividade */
@media (max-width: 1200px) {
  .dashboard-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }

  .sidebar {
    width: 400%;
  }

  .content {
    margin-left: 0;
  }

  .dashboard-summary {
    grid-template-columns: 1fr;
  }

  .chart-card {
    width: 100%;
  }
}

.h1, .h3, .h4, .h5, .h6, h1, h2, h3, h4, h5, h6 {
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 5px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--bs-heading-color);
}
.custom-logout-button {
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;
}

.custom-logout-button:hover {
  background-color: #c82333; /* Cor mais escura ao passar o mouse */
}
.bg-primary[data-v-6dec5f19] {
    background-color: #0d6efd !important;
}

</style>



