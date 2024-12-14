<template>
  <div class="dashboard-container">
    <!-- Conteúdo Principal -->
    <div class="content">
      <h2>Resumo Geral</h2>
      <!-- Exibição de erro -->
      <div v-if="erro" class="alert alert-danger">
        {{ erro }}
      </div>

      <!-- Resumo -->
      <div class="dashboard-summary">
        <div class="summary-card">
          <h3>Total de Chamados Pendentes</h3>
          <p>{{ totalPendentes }}</p>
        </div>
        <div class="summary-card">
          <h3>Total de Chamados Em Andamento</h3>
          <p>{{ totalAndamento }}</p>
        </div>
        <div class="summary-card">
          <h3>Total de Chamados Concluídos</h3>
          <p>{{ totalConcluidos }}</p>
        </div>
        <div class="summary-card">
          <h3>Tempo Médio de Resolução</h3>
          <p>{{ tempoMedioResolucao }}</p>
        </div>
        <div class="summary-card">
          <h3>Problemas Mais Recorrentes</h3>
          <p class="problemas-recorrentes">{{ problemasRecorrentes }}</p>
        </div>
      </div>

      <!-- Gráficos -->
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">
        <!-- Gráfico de Pizza -->
        <div class="chart-card">
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Exportar Gráfico 
            </button>
            <ul class="dropdown-menu">
  <li><a class="dropdown-item" href="#" @click="exportPieChartExcel">Excel</a></li>
  <li><a class="dropdown-item" href="#" @click.prevent="exportPieChartImage">Imagem</a></li>
</ul>

          </div>
          <h3>Distribuição de Chamados por Categoria</h3>
          <div id="pieChartContainer"></div>
          
        </div>

        <!-- Gráficos Highcharts -->
        <div class="chart-card">
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Exportar Gráfico 
            </button>
            <ul class="dropdown-menu">
  <li><a class="dropdown-item" href="#" @click="exportPieChartExcel">Excel</a></li>
  <li><a class="dropdown-item" href="#" @click.prevent="exportPieChartImage">Imagem</a></li>
</ul>

          </div>
          <h3>Chamados por Mês</h3>
          <div id="barChartContainer"></div>
         
        </div>

        <div class="chart-card">
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Exportar Gráfico 
            </button>
            <ul class="dropdown-menu">
  <li><a class="dropdown-item" href="#" @click="exportPieChartExcel">Excel</a></li>
  <li><a class="dropdown-item" href="#" @click.prevent="exportPieChartImage">Imagem</a></li>
</ul>

          </div>
          <h3>Evolução dos Chamados</h3>
          <div id="lineChartContainer"></div>
          
        </div>

        <div class="chart-card">
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Exportar Gráfico 
            </button>
            <ul class="dropdown-menu">
  <li><a class="dropdown-item" href="#" @click="exportPieChartExcel">Excel</a></li>
  <li><a class="dropdown-item" href="#" @click.prevent="exportPieChartImage">Imagem</a></li>
</ul>

          </div>
          <h3>Chamados em Degrau</h3>
          <div id="stepChartContainer"></div>      
        </div>

      </div>
    </div>
  </div>
</template>




<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Highcharts from 'highcharts';
import * as XLSX from 'xlsx';
import exporting from 'highcharts/modules/exporting';


export default {
  name: 'ComponenteHome',
  setup() {
    // Dados de resumo
    const totalPendentes = ref(0);
    const totalAndamento = ref(0);
    const totalConcluidos = ref(0);
    const tempoMedioResolucao = ref('dias');
    const problemasRecorrentes = ref('');
    const erro = ref(null);

    // Função para criar gráfico de Pizza (já existente)
    const createOrUpdateHighchartsPie = (data) => {
      Highcharts.chart('pieChartContainer', {
        chart: { type: 'pie' },
        title: { text: 'Distribuição de Chamados por Categoria' },
        tooltip: {
          headerFormat: '',
          pointFormat: '<span style="color:{point.color}">\u25cf</span> {point.name}: <b>{point.percentage:.1f}%</b>',
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            },
            animation: { duration: 2000 },
          },
        },
        series: [
          {
            name: 'Chamados',
            colorByPoint: true,
            enableMouseTracking: false,
            data: data,
          },
        ],
      });
    };

    // Função para criar gráficos Highcharts
    const createHighchartsBar = (data) => {
      Highcharts.chart('barChartContainer', {
        chart: {
          type: 'column',
        },
        title: {
          text: 'Chamados por Mês',
        },
        xAxis: {
          categories: data.map((item) => item.mes),
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Chamados',
          },
        },
        series: [
          {
            name: 'Chamados por Mês',
            data: data.map((item) => item.total_chamados),
          },
        ],
      });
    };

    const createHighchartsLine = (data) => {
      Highcharts.chart('lineChartContainer', {
        chart: {
          type: 'line',
        },
        title: {
          text: 'Evolução dos Chamados',
        },
        xAxis: {
          categories: data.map((item) => item.mes),
        },
        yAxis: {
          title: {
            text: 'Chamados',
          },
        },
        series: [
          {
            name: 'Evolução dos Chamados',
            data: data.map((item) => item.total_chamados),
            color: '#FF9F40',
            marker: {
              enabled: false,
            },
          },
        ],
      });
    };

    const createHighchartsStep = (data) => {
      Highcharts.chart('stepChartContainer', {
        chart: {
          type: 'line',
        },
        title: {
          text: 'Chamados em Degrau',
        },
        xAxis: {
          categories: data.map((item) => item.data),
        },
        yAxis: {
          title: {
            text: 'Chamados',
          },
        },
        series: [
          {
            name: 'Chamados em Degrau',
            data: data.map((item) => item.total_chamados),
            color: '#36A2EB',
            step: true, // Gera o gráfico em degrau
          },
        ],
      });
    };

    // Função para buscar dados e renderizar gráficos
    const fetchData = async () => {
      erro.value = null;
      try {
        const baseURL = 'http://localhost:3000/home';
        const token = localStorage.getItem("token");

        // Chamados pendentes
        const resPendentes = await axios.get(`${baseURL}/total-pendentes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        totalPendentes.value = resPendentes.data.total;

        // Chamados em andamento
        const resAndamento = await axios.get(`${baseURL}/total-andamento`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        totalAndamento.value = resAndamento.data.total;

        // Chamados concluídos
        const resConcluidos = await axios.get(`${baseURL}/total-concluidos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        totalConcluidos.value = resConcluidos.data.total;

        // Tempo médio de resolução
        const resTempo = await axios.get(`${baseURL}/tempo-medio-resolucao`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        tempoMedioResolucao.value = `${resTempo.data.tempo_medio_resolucao_dias || 0} dias`;

        // Problemas recorrentes
        const resProblemas = await axios.get(`${baseURL}/problemas-recorrentes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        problemasRecorrentes.value = resProblemas.data.map(item => item.nome_problema).join(', ');

        // Gráfico de pizza
        const resDistribuicao = await axios.get(`${baseURL}/distribuicao-categoria`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pieData = resDistribuicao.data.map(item => ({
          name: item.nome_setor,
          y: item.total_chamados
        }));
        createOrUpdateHighchartsPie(pieData);

        // Chamados por mês (gráfico de barra)
        const resMeses = await axios.get(`${baseURL}/chamados-por-mes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsBar(resMeses.data);

        // Evolução dos chamados (gráfico de linha)
        const resEvolucao = await axios.get(`${baseURL}/evolucao-chamados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsLine(resEvolucao.data);

        // Chamados em degrau
        const resDegrau = await axios.get(`${baseURL}/chamados-degrau`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsStep(resDegrau.data);
        
      } catch (err) {
        erro.value = 'Ocorreu um erro ao buscar os dados. Por favor, tente novamente.';
      }
    };

    onMounted(() => {
      fetchData();
    });
// Função para exportar gráficos como imagem
const exportChartAsImage = (chartId, filename) => {
  const chart = Highcharts.charts.find(c => c.renderTo.id === chartId);
  if (chart) {
    chart.exportChart({
      type: 'image/png',
      filename: filename || 'grafico'
    });
  } else {
    console.error('Gráfico não encontrado:', chartId);
  }
};


// Funções específicas para cada gráfico
const exportPieChartImage = () => exportChartAsImage('pieChartContainer', 'distribuicao_chamados');
const exportBarChartImage = () => exportChartAsImage('barChartContainer', 'chamados_por_mes');
const exportLineChartImage = () => exportChartAsImage('lineChartContainer', 'evolucao_chamados');
const exportStepChartImage = () => exportChartAsImage('stepChartContainer', 'chamados_em_degrau');
  // Função para exportar o gráfico de Pizza como Excel
const exportPieChartExcel = () => {
  const chart = Highcharts.charts.find(c => c.renderTo.id === 'pieChartContainer');
  if (chart) {
    // Extrair os dados do gráfico
    const chartData = chart.series[0].data.map(point => ({
      Categoria: point.name,
      Chamados: point.y
    }));

    // Criar uma nova planilha com os dados
    const ws = XLSX.utils.json_to_sheet(chartData);
    
    // Criar um novo livro de trabalho
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Distribuição de Chamados');

    // Exportar o arquivo Excel
    XLSX.writeFile(wb, 'distribuicao_chamados.xlsx');
  } else {
    console.error('Gráfico de pizza não encontrado');
  }
};

    return {
      totalPendentes,
      totalAndamento,
      totalConcluidos,
      tempoMedioResolucao,
      problemasRecorrentes,
      exportPieChartImage,
      exportBarChartImage,
      exportLineChartImage,
      exportStepChartImage,

      erro,
    };
  },
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
  position: relative;
  overflow: hidden;
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
  font-size: 16px;
  font-weight: bold;
  color: #0e85bd;
}

/* Animação de rolagem para a parte de Problemas Mais Recorrentes */
@keyframes scrollProblemas {
  0% {
    transform: translateX(100%); /* Começa fora da tela à direita */
  }
  100% {
    transform: translateX(-100%); /* Move até fora da tela à esquerda */
  }
}

/* Aplica a animação apenas à parte de "Problemas Mais Recorrentes" */
.problemas-recorrentes {
  display: inline-block;
  white-space: nowrap; /* Impede que o texto quebre */
  animation: scrollProblemas 10s linear infinite; /* Animação de rolagem contínua */
  font-size: 18px; /* Tamanho da fonte */
  color: #0e85bd; /* Cor do texto */
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

.h1,
.h3,
.h4,
.h5,
.h6,
h1,
h3,
h4,
h5,
h6 {
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
  background-color: #c82333;
  /* Cor mais escura ao passar o mouse */
}

.bg-primary[data-v-6dec5f19] {
  background-color: #0d6efd !important;
}
/* Estilos do botão de dropdown */
.dropdown .btn {
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 4px;
  transition: background-color 0.3s, border-color 0.3s;
}

.dropdown .btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* Estilos do menu dropdown */
.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 0;
  min-width: 160px;
  background-color: #fff;
  border: 1px solid #ccc;
}

/* Estilos dos itens do dropdown */
.dropdown-menu .dropdown-item {
  padding: 12px 20px;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
}

.dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

/* Estilos adicionais para o dropdown aberto */
.dropdown-menu.show {
  display: block;
}

/* Ajustes para responsividade */
@media (max-width: 768px) {
  .dropdown .btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
  }

  .dropdown-menu .dropdown-item {
    padding: 10px 15px;
    font-size: 16px;
  }
}
h2 {
  font-size: 2.5rem; /* Tamanho do texto */
  font-weight: 600; /* Peso da fonte para destacar */
  color: #343a40; /* Cor do texto */
  text-align: center; /* Centralizar o texto */
  margin-bottom: 2rem; /* Espaço abaixo do título */
  padding-bottom: 0.5rem; /* Espaçamento interno na parte inferior */
  border-bottom: 3px solid #007bff; /* Linha destacando o título */
  display: inline-block; /* Alinha o título com a borda apenas ao redor do texto */
}
</style>
