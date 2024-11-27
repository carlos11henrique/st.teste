<template>
  <div class="problem-report-container">
    <div class="left-side">
      <div class="bubbles">
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
      </div>
      <img src="/images/ST.png" alt="Logotipo" />
    </div>

    <div class="right-side">
      <h2>Rastreamento do Chamado</h2>

      <div class="progress-tracking">
        <div class="progress-step" :class="{ completed: currentStep >= 1 }">
          <div class="circle">1</div>
          <span>Chamado Aberto</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 2 }">
          <div class="circle">2</div>
          <span>Em Análise</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 3 }">
          <div class="circle">3</div>
          <span>Em Andamento</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 4 }">
          <div class="circle">4</div>
          <span>Concluído</span>
        </div>
      </div>

      <router-link to="/login">
        <button class="btn btn-primary">Voltar para o Login</button>
      </router-link>
      <router-link to="/openticketpage">
        <button class="btn btn-primary">Voltar para o Abrir Chamado</button>
      </router-link>

      <div v-if="chamado" class="call-details mt-4">
        <h3>Detalhes do Chamado</h3>
        <p><strong>Problema:</strong> {{ chamado.problema }}</p>
        <p><strong>Bloco:</strong> {{ chamado.bloco }}</p>
        <p><strong>Sala:</strong> {{ chamado.sala }}</p>
        <p><strong>Código do Equipamento:</strong> {{ chamado.maquina }}</p>
        <p>
          <strong>Descrição do Problema:</strong>
          {{ chamado.descricao_chamado || "Nenhuma descrição fornecida" }}
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      currentStep: 1, // Etapa atual
      chamado: null,  // Dados do chamado
    };
  },
  mounted() {
    const chamadoId = this.$route.params.id;
    this.carregarChamado(chamadoId);
  },
  methods: {
    async carregarChamado(id) {
      try {
        const token = localStorage.getItem("token");
        console.log("Carregando chamado com ID:", id);

        const resposta = await axios.get(`http://localhost:3000/chamados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resposta.data.length > 0) {
          this.chamado = resposta.data[0]; 
          this.currentStep = this.definirEtapa(this.chamado.status);
        } else {
          console.warn("Nenhum chamado encontrado com este ID.");
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar o chamado:",
          erro.response?.data || "Erro desconhecido"
        );
      }
    },

    definirEtapa(status) {
      const etapas = {
        "Análise": 1,
        "Pendentes": 2,
        "Em Andamento": 3,
        "Concluído": 4,
      };
      return etapas[status] || 1; 
    },
  },
};
</script>


<style scoped>
.problem-report-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: Arial, sans-serif;
}

/* Estilizando a coluna da esquerda */
.left-side {
  width: 30%;
  background: #45a049;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.left-side img {
  max-width: 80%;
  height: auto;
  margin-bottom: 20px;
}

.bubbles {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bubble {
  width: 30px;
  height: 30px;
  margin: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: float 3s ease-in-out infinite;
}

.bubble:nth-child(2) {
  width: 40px;
  height: 40px;
  animation-duration: 4s;
}

.bubble:nth-child(3) {
  width: 50px;
  height: 50px;
  animation-duration: 5s;
}

.bubble:nth-child(4) {
  width: 60px;
  height: 60px;
  animation-duration: 6s;
}

.bubble:nth-child(5) {
  width: 70px;
  height: 70px;
  animation-duration: 7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Estilizando a coluna da direita */
.right-side {
  width: 70%;
  padding: 40px;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.right-side h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #4caf50;
}

/* Linha de progresso */
.progress-tracking {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.progress-step {
  text-align: center;
  flex: 1;
  position: relative;
}

.progress-step .circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 16px;
  font-weight: bold;
  color: #555;
  z-index: 1;
}

.progress-step.completed .circle {
  background: #4caf50;
  color: white;
}

.progress-step span {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.progress-tracking::before {
  content: "";
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  background: #ddd;
  z-index: 0;
}

.progress-step.completed::after {
  content: "";
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  background: #4caf50;
  z-index: 0;
}

/* Container que envolve os botões */
.button-container {
  display: flex;
  justify-content: space-between;
  gap: 10px; /* Espaço entre os botões */
  margin-top: 20px;
}

/* Estilizando os botões */
.button-container .btn {
  background-color: #28a745; /* Cor verde */
  color: white; /* Cor do texto do botão */
  border: none; /* Remove borda */
  padding: 10px 20px; /* Espaçamento interno */
  font-size: 16px; /* Tamanho da fonte */
  border-radius: 5px; /* Bordas arredondadas */
  cursor: pointer; /* Cursor de pointer */
  transition: background-color 0.3s; /* Animação suave para a cor de fundo */
}

/* Alteração da cor quando o botão é hover */
.button-container .btn:hover {
  background-color: #218838; /* Verde mais escuro ao passar o mouse */
}

/* Ajuste para telas menores */
@media (max-width: 768px) {
  .button-container {
    flex-direction: column; /* Empilha os botões em telas menores */
    align-items: center; /* Centraliza os botões */
  }
}

@media (max-width: 768px) {
  .left-side,
  .right-side {
    width: 100%;
    text-align: center;
  }

  .progress-tracking {
    flex-direction: column;
  }

  .progress-step {
    margin-bottom: 20px;
  }

  .progress-tracking::before {
    top: auto;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: 4px;
  }
}
a {
  color: #45a049;
    text-decoration: underline;
}
.call-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.call-details h3 {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 15px;
}

.call-details p {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
}

.call-details strong {
  color: #000000; /* Cor para os rótulos */
  font-weight: 600;
}

.call-details p:last-child {
  margin-bottom: 0;
}

.call-details .no-description {
  font-style: italic;
  color: #999;
}

@media (max-width: 768px) {
  .call-details {
    padding: 15px;
  }

  .call-details h3 {
    font-size: 20px;
  }

  .call-details p {
    font-size: 14px;
  }
}

</style>
