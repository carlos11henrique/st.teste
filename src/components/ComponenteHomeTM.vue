<template>
  <div class="dashboard-container">
    <div class="content">
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">

        <div class="chart-card">
          <div id="mostCalledIssuesChart"></div>
          <p v-if="problemasRecorrentes"></p>
          <p v-else>Carregando...</p>
        </div>

        <div class="chart-card">
          <div id="averageResolutionTimeChart"></div>
          <p v-if="tempoMedioResolucao"> </p>
          <p v-else>Carregando...</p>
        </div>
       
        <div class="chart-card">
          <div id="closingTimeChart"></div>
          <p v-if="tempoFechamento"></p>
          <p v-else>Carregando...</p>
        </div>
        <div class="chart-card">
          <div id="firstContactTimeChart"></div>
          <p v-if="tempoPrimeiroContato"></p>
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
import Highcharts from "highcharts";

export default {
  name: "DashboardCharts",
  data() {
    return {
      tempoMedioResolucao: null,
      problemasRecorrentes: null,
      tempoFechamento: null,
      tempoPrimeiroContato: null,
      erro: null,
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

        // Tempo de Fechamento
        const resFechamento = await axios.get(`${baseURL}/tempo-fechamento`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.tempoFechamento = resFechamento.data.map(item => item.tempo_total_resolucao_horas)[0]; // Pegando o primeiro valor

        // Tempo de Primeiro Contato
        const resPrimeiroContato = await axios.get(`${baseURL}/tempo-primeiro-contato`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.tempoPrimeiroContato = resPrimeiroContato.data.map(item => ({
          setor: item.setor,
          tempo: item.tempo_medio_primeiro_contato_horas
        }));

        // Criação dos gráficos
        this.createCharts(resTempo, resProblemas, resFechamento, resPrimeiroContato);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        this.erro = "Erro ao buscar dados e criar os gráficos. Tente novamente mais tarde.";
      }
    },

    createCharts(resTempo, resProblemas, resFechamento, resPrimeiroContato) {
  // Gráfico de Tempo Médio de Resolução
  Highcharts.chart("averageResolutionTimeChart", {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Tempo Médio de Resolução por Setor'
    },
    xAxis: {
      type: 'category',
      title: {
        text: 'Setor'
      }
    },
    yAxis: {
      title: {
        text: 'Tempo Médio de Resolução (horas)'
      }
    },
    series: [{
      name: 'Horas',
      data: resTempo.data.map(item => ({
        name: item.setor,
        y: parseFloat(item.tempo_medio_resolucao_horas) // Convertendo para número
      }))
    }]
  });

  // Gráfico de Problemas com Maior Índice de Chamados
  Highcharts.chart("mostCalledIssuesChart", {
    chart: {
      type: "pie",
    },
    title: {
      text: "Problemas com Maior Índice de Chamados",
    },
    series: [{
      name: 'Chamados',
      data: resProblemas.data.map(item => ({
        name: item.problema,
        y: item.total_chamados,
      })),
      colorByPoint: true,
    }],
  });

  // Gráfico de Tempo de Fechamento
  Highcharts.chart("closingTimeChart", {
    chart: {
      type: "line",
    },
    title: {
      text: "Tempo de Fechamento (horas)",
    },
    xAxis: {
    },
    yAxis: {
      title: {
        text: 'Horas',
      },
    },
    series: [{
      name: 'Tempo de Fechamento',
      data: [parseFloat(this.tempoFechamento)], // Garantir que o valor seja numérico
      color: '#5F9EA0',
    }],
  });

  // Gráfico de Tempo de Primeiro Contato
  Highcharts.chart("firstContactTimeChart", {
    chart: {
      type: "bar",
    },
    title: {
      text: "Tempo Médio de Primeiro Contato por Setor (horas)",
    },
    xAxis: {
      categories: this.tempoPrimeiroContato.map(item => item.setor),
      title: {
        text: "Setor",
      },
    },
    yAxis: {
   
    },
    series: [{
      name: "Horas",
      data: this.tempoPrimeiroContato.map(item => parseFloat(item.tempo)), // Convertendo para número
      color: '#6495ED',
    }],
  });
}

  },
  mounted() {
    this.fetchData();
  },
};
</script>



<style scoped>

/* Cartões de resumo */
.dashboard-summary {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 40px;
  margin-left: 90px;
  flex-wrap: wrap; /* Garante que os cartões se ajustem em telas menores */
}

.summary-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  width: 30%; /* Garante que os cartões tenham o mesmo tamanho */
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
  white-space: nowrap;
  animation: scrollProblemas 10s linear infinite;
  font-size: 18px;
  color: #0e85bd;
}

/* Gráficos */
.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-left: 95px;
  justify-content: space-between;
}

.chart-card {
  background-color: #fff;
  padding: 20px;
  width: 48%; /* Garante que os gráficos fiquem do mesmo tamanho */
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
    width: 100%;
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

/* Estilo para os cabeçalhos */
h1, h3, h4, h5, h6, .h1, .h3, .h4, .h5, .h6 {
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 5px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--bs-heading-color);
}

/* Estilo do botão de logout */
.custom-logout-button {
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;
}

.custom-logout-button:hover {
  background-color: #c82333;
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
/* Estilo do título H2 */
h2 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #343a40;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #007bff;
  display: inline-block;
}
</style>