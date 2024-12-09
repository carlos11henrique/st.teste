<template>
  <div class="dashboard-container">
    <div class="content">
      <h2>Estatísticas Visuais</h2>
      <div class="charts-container">

        <div class="chart-card">
          <h3>Problemas com Maior Índice de Chamados</h3>
         
          <canvas id="mostCalledIssuesChart"></canvas>
          <p v-if="problemasRecorrentes">Problemas: {{ problemasRecorrentes }}</p>
          <p v-else>Carregando...</p>
        </div>

        <div class="chart-card">
          <h3>Tempo Médio de Resolução</h3>
          
          <canvas id="averageResolutionTimeChart"></canvas>
          <p v-if="tempoMedioResolucao">Tempo Médio: {{ tempoMedioResolucao }} horas</p>
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
     // Criando gráfico de Tempo Médio de Resolução
const ctx1 = document.getElementById("averageResolutionTimeChart");
new Chart(ctx1, {
  type: "line", // Alterado para gráfico de linha
  data: {
    labels: ['Tempo Médio de Resolução'], // Rótulos do eixo X
    datasets: [{
      label: 'Tempo Médio de Resolução (horas)', // Legenda do gráfico
      data: [this.tempoMedioResolucao], // Dados a serem exibidos
      borderColor: '#42A5F5', // Cor da linha
      backgroundColor: 'rgba(66, 165, 245, 0.2)', // Cor de preenchimento
      borderWidth: 2, // Largura da linha
      pointBackgroundColor: '#1E88E5', // Cor dos pontos
      pointBorderColor: '#1E88E5', // Cor da borda dos pontos
      pointRadius: 5, // Tamanho dos pontos
    }],
  },
  options: {
    responsive: true,
    scales: {
      y: { 
        beginAtZero: true, 
        title: {
          display: true,
          text: 'Horas',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Indicador',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top', // Posição da legenda
      },
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
      backgroundColor: [
        '#6495ED', // Azul cobalto
        '#808080', // Cinza elegante
        '#708090', // Azul acinzentado
        '#DCDCDC', // Cinza claro
        '#B0E0E6', // Azul gelo
        '#4682B4', // Azul aço
      ],
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
            borderColor: '#5F9EA0	',
            backgroundColor: '#2F4F4F',
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
            backgroundColor: '#6495ED',
            borderColor: '#708090	',
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

