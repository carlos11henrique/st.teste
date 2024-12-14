<template>
  <div class="dashboard-container">
    <div class="content">
      <h2>Resumo Geral</h2>
      <div v-if="erro" class="alert alert-danger">
        {{ erro }}
      </div>

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

      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">
        <div class="chart-card">
          <h3>Distribuição de Chamados por Categoria</h3>
          <div id="pieChartContainer"></div>
        </div>

        <div class="chart-card">
          <h3>Chamados por Mês</h3>
          <div id="barChartContainer"></div>
        </div>

        <div class="chart-card">
          <h3>Evolução dos Chamados</h3>
          <div id="lineChartContainer"></div>
        </div>

        <div class="chart-card">
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
    const totalPendentes = ref(0);
    const totalAndamento = ref(0);
    const totalConcluidos = ref(0);
    const tempoMedioResolucao = ref('dias');
    const problemasRecorrentes = ref('');
    const erro = ref(null);

    // Funções para criar gráficos
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
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                'downloadPNG',
                'downloadJPEG',
                'downloadPDF',
                'downloadSVG',
                {
                  text: 'Exportar Pizza como Excel',
                  onclick: function () { exportPieChartExcel(); }
                },
              ]
            }
          }
        }
      });
    };

    const createHighchartsBar = (data) => {
      Highcharts.chart('barChartContainer', {
        chart: { type: 'column' },
        title: { text: 'Chamados por Mês' },
        xAxis: { categories: data.map((item) => item.mes) },
        yAxis: {
          min: 0,
          title: { text: 'Chamados' }
        },
        series: [{
          name: 'Chamados por Mês',
          data: data.map((item) => item.total_chamados),
        }],
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                'downloadPNG',
                'downloadJPEG',
                'downloadPDF',
                'downloadSVG',
                {
                  text: 'Exportar Barra como Excel',
                  onclick: function () { exportBarChartExcel(); }
                },
              ]
            }
          }
        }
      });
    };

    const createHighchartsLine = (data) => {
      Highcharts.chart('lineChartContainer', {
        chart: { type: 'line' },
        title: { text: 'Evolução dos Chamados' },
        xAxis: { categories: data.map((item) => item.mes) },
        yAxis: {
          min: 0,
          title: { text: 'Chamados' }
        },
        series: [{
          name: 'Evolução dos Chamados',
          data: data.map((item) => item.total_chamados),
        }],
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                'downloadPNG',
                'downloadJPEG',
                'downloadPDF',
                'downloadSVG',
                {
                  text: 'Exportar Linha como Excel',
                  onclick: function () { exportLineChartExcel(); }
                },
              ]
            }
          }
        }
      });
    };

    const createHighchartsStep = (data) => {
  // Verifique se a estrutura dos dados é correta. Cada item de dados deve ter um valor de 'mes' e 'total_chamados'.
  Highcharts.chart('stepChartContainer', {
    chart: {
      type: 'line', // Usar 'line' porque o tipo 'step' é apenas uma variante do 'line'
      animation: true,
    },
    title: {
      text: 'Chamados em Degrau',
    },
    xAxis: {
      categories: data.map((item) => item.mes), // Defina as categorias com base nos meses
      title: {
        text: 'Meses',
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Chamados',
      },
    },
    series: [{
      name: 'Chamados em Degrau',
      data: data.map((item) => item.total_chamados), // Mapear os dados para o eixo Y
      step: true, // Ativar o gráfico de degrau
    }],
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            {
              text: 'Exportar Degrau como Excel',
              onclick: function () { exportStepChartExcel(); }
            },
          ]
        }
      }
    }
  });
};


    // Função de exportação para Excel
    const exportToExcel = (data, fileName) => {
      const ws = XLSX.utils.aoa_to_sheet([['Categoria', 'Valor'], ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    // Funções de exportação para cada gráfico
    const exportPieChartExcel = () => {
      const chart = Highcharts.charts[0];
      const data = chart.series[0].data.map((point) => [point.name, point.y]);
      exportToExcel(data, 'Grafico_Pizza');
    };

    const exportBarChartExcel = () => {
      const chart = Highcharts.charts[1];
      const data = chart.series[0].data.map((point) => [point.category, point.y]);
      exportToExcel(data, 'Grafico_Barra');
    };

    const exportLineChartExcel = () => {
      const chart = Highcharts.charts[2];
      const data = chart.series[0].data.map((point) => [point.category, point.y]);
      exportToExcel(data, 'Grafico_Linha');
    };

    const exportStepChartExcel = () => {
      const chart = Highcharts.charts[3];
      const data = chart.series[0].data.map((point) => [point.category, point.y]);
      exportToExcel(data, 'Grafico_Degrau');
    };

    // Função para buscar dados e renderizar gráficos
    const fetchData = async () => {
      erro.value = null;
      try {
        const baseURL = 'http://localhost:3000/home';
        const token = localStorage.getItem("token");

        // Dados para cada gráfico
        const resDistribuicao = await axios.get(`${baseURL}/distribuicao-categoria`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pieData = resDistribuicao.data.map(item => ({
          name: item.nome_setor,
          y: item.total_chamados,
        }));
        createOrUpdateHighchartsPie(pieData);

        // Gráficos de barra, linha e degrau podem ser gerados aqui
        const resChamadosPorMes = await axios.get(`${baseURL}/chamados-por-mes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsBar(resChamadosPorMes.data);

        const resEvolucao = await axios.get(`${baseURL}/evolucao-chamados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsLine(resEvolucao.data);

        const resChamadosDegrau = await axios.get(`${baseURL}/chamados-degrau`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createHighchartsStep(resChamadosDegrau.data);
      } catch (error) {
        erro.value = 'Erro ao buscar os dados';
        console.error(error);
      }
    };

    onMounted(fetchData);

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
