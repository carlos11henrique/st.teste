<template>
  <div class="dashboard-container">
    <!-- Sidebar de navegação -->

    <!-- Conteúdo Principal com cartões resumo e gráficos -->
    <div class="content">
      <h2>Resumo Geral</h2>
      <!-- Exibição de erro se houver -->
      <div v-if="erro" class="alert alert-danger">
        {{ erro }}
      </div>

      <div class="dashboard-summary">
        <div class="summary-card"><h3>Total de Chamados Pendentes</h3><p>{{ totalPendentes }}</p></div>
        <div class="summary-card"><h3>Total de Chamados Em Andamento</h3><p>{{ totalAndamento }}</p></div>
        <div class="summary-card"><h3>Total de Chamados Concluídos</h3><p>{{ totalConcluidos }}</p></div>
        <div class="summary-card"><h3>Tempo Médio de Resolução</h3><p>{{ tempoMedioResolucao }}</p></div>
        <div class="summary-card"><h3>Problemas Mais Recorrentes</h3><p>{{ problemasRecorrentes }}</p></div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default {
  name: 'ComponenteHome',
  setup() {
    // Dados de resumo
    const totalPendentes = ref(0);
    const totalAndamento = ref(0);
    const totalConcluidos = ref(0);
    const tempoMedioResolucao = ref('0h 0m');
    const problemasRecorrentes = ref('');
    const erro = ref(null); // Propriedade para armazenar erros

    // Gráficos
    let pieChart, barChart, lineChart, stepChart;

    const createChart = (ctx, type, data, options) => {
      return new Chart(ctx, {
        type,
        data,
        options
      });
    };

    const fetchData = async () => {
      erro.value = null; 
      try {
        const baseURL = 'http://localhost:3000/home';
        
        const token = localStorage.getItem("token");

        const resPendentes = await axios.get(`${baseURL}/total-pendentes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        totalPendentes.value = resPendentes.data.total;

        const resAndamento = await axios.get(`${baseURL}/total-andamento`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        totalAndamento.value = resAndamento.data.total;

        const resConcluidos = await axios.get(`${baseURL}/total-concluidos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        totalConcluidos.value = resConcluidos.data.total;

        const resTempo = await axios.get(`${baseURL}/tempo-medio-resolucao`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        tempoMedioResolucao.value = `${Math.floor(resTempo.data.tempo_medio_resolucao / 60)}h ${resTempo.data.tempo_medio_resolucao % 60}m`;

        const resProblemas = await axios.get(`${baseURL}/problemas-recorrentes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        problemasRecorrentes.value = resProblemas.data.map(item => item.nome_problema).join(', ');

        // Gráfico de Pizza
        const resDistribuicao = await axios.get(`${baseURL}/distribuicao-categoria`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (resDistribuicao.data) {
          pieChart = createChart(document.getElementById('pieChart'), 'pie', {
            labels: resDistribuicao.data.map(item => item.nome_setor),
            datasets: [{
              data: resDistribuicao.data.map(item => item.total_chamados),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0']
            }]
          });
        }

        // Gráfico de Barra
        const resMeses = await axios.get(`${baseURL}/chamados-por-mes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (resMeses.data) {
          barChart = createChart(document.getElementById('barChart'), 'bar', {
            labels: resMeses.data.map(item => item.mes),
            datasets: [{
              label: 'Chamados por Mês',
              data: resMeses.data.map(item => item.total_chamados),
              backgroundColor: '#4BC0C0'
            }]
          });
        }

        // Gráfico de Linha
        const resEvolucao = await axios.get(`${baseURL}/evolucao-chamados`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (resEvolucao.data) {
          lineChart = createChart(document.getElementById('lineChart'), 'line', {
            labels: resEvolucao.data.map(item => item.mes),
            datasets: [{
              label: 'Evolução dos Chamados',
              data: resEvolucao.data.map(item => item.total_chamados),
              borderColor: '#36A2EB',
              fill: false
            }]
          });
        }

        // Gráfico de Degrau
        const resDegrau = await axios.get(`${baseURL}/chamados-degrau`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (resDegrau.data) {
          stepChart = createChart(document.getElementById('stepChart'), 'line', {
            labels: resDegrau.data.map(item => item.mes),
            datasets: [{
              label: 'Chamados em Degrau',
              data: resDegrau.data.map(item => item.total_chamados),
              borderColor: '#FF6384',
              stepped: true,
              fill: false
            }]
          });
        }

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        erro.value = "Erro ao carregar os dados. Tente novamente mais tarde."; 
      }
    };

    // Montagem do componente (onMounted)
    onMounted(() => {
      fetchData();
    });

    // Desmontagem do componente (onUnmounted) para liberar recursos
    onUnmounted(() => {
      if (pieChart) pieChart.destroy();
      if (barChart) barChart.destroy();
      if (lineChart) lineChart.destroy();
      if (stepChart) stepChart.destroy();
    });

    return {
      totalPendentes,
      totalAndamento,
      totalConcluidos,
      tempoMedioResolucao,
      problemasRecorrentes,
      erro
    };
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



