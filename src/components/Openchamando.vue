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

      <!-- Linha de progresso -->
      <div v-if="chamado" class="progress-tracking">
        <div class="progress-step" :class="{ completed: currentStep >= 1 }">
          <div class="circle">🔎</div>
          <span>Em Análise</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 2 }">
          <div class="circle">❗</div>
          <span>Chamado Pendente</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 3 }">
          <div class="circle">🏃🏻‍♂️</div>
          <span>Em Andamento</span>
        </div>
        <div class="progress-step" :class="{ completed: currentStep >= 4 }">
          <div class="circle">✅</div>
          <span>Concluído</span>
        </div>
      </div>

      <div v-if="chamados.length" class="call-list mt-4">
        <h3>Seus Chamados</h3>
        <p v-if="exibirMensagemInfo" class="info-text">
          🔍 <span>Clique no problema para visualizar os detalhes:</span>
        </p>

        <ul>
          <li
            v-for="(chamado, index) in chamados"
            :key="index"
            @click="selecionarChamado(chamado)"
            class="chamado-item"
          >
            <strong>Problema:</strong> {{ chamado.problema }}
          </li>
        </ul>
      </div>

      <!-- Detalhes do chamado -->
      <div v-if="chamado" class="call-details mt-4">
        <h3>Detalhes do Chamado</h3>
        <p><strong>Setor:</strong> {{ chamado.setor }}</p>
        <p><strong>Problema:</strong> {{ chamado.problema }}</p>
        <p><strong>Bloco:</strong> {{ chamado.bloco }}</p>
        <p><strong>Sala:</strong> {{ chamado.sala }}</p>
        <p><strong>Código do Equipamento:</strong> {{ chamado.maquina }}</p>
        <p>
          <strong>Descrição do Problema:</strong>
          {{ chamado.descricao_chamado || "Nenhuma descrição fornecida" }}
        </p>
      </div>

      <!-- Botões de navegação -->
      <router-link to="/">
        <button class="btn btn-primary">Voltar para o Login</button>
      </router-link>
      <router-link to="/openticketpage">
        <button class="btn btn-primary">Voltar para o Abrir Chamado</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      currentStep: 1,
      chamado: null,
      chamados: [],
      exibirMensagemInfo: true,
      intervalId: null,
    };
  },
  mounted() {
    this.carregarChamados();
    this.atualizarChamados();
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Limpa o intervalo ao destruir o componente
    }
  },
  methods: {
    async carregarChamados() {
      try {
        const token = localStorage.getItem("token");
        const resposta = await axios.get(`http://localhost:3000/chamados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resposta.data.length > 0) {
          this.chamados = resposta.data; // Armazena a lista de chamados
        } else {
          console.warn("Nenhum chamado encontrado.");
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar os chamados:",
          erro.response?.data || "Erro desconhecido"
        );
      }
    },
    selecionarChamado(chamado) {
      this.chamado = chamado;
      this.currentStep = this.definirEtapa(chamado.status);
      this.exibirMensagemInfo = false;
    },
    definirEtapa(status) {
      const etapas = {
        "Em Análise": 1,
        Pendentes: 2,
        "Em Andamento": 3,
        Concluído: 4,
        Finalizado: 5, // Define o estado de Finalizado
      };
      return etapas[status] || 1;
    },
    atualizarChamados() {
      this.intervalId = setInterval(() => {
        this.carregarChamados();
      }, 1000 * 60); // Atualiza a cada 60 segundos
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
  color: white;
  background: linear-gradient(to bottom, #077df3, #02298a, #021b79);
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
  color: #0e66e9;
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
  background: #056ef89c;
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
  background: #089fdb;
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
  background-color: #0890c5; /* Cor verde */
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
  color: #1630c5;
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
  color: #1b82d6;
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
.chamado-item {
  display: block; /* Faz o elemento ocupar toda a largura disponível */
  padding: 10px 15px; /* Espaçamento interno */
  margin-bottom: 10px; /* Espaçamento entre itens */
  background-color: #f8f9fa; /* Cor de fundo clara */
  color: #212529; /* Cor do texto */
  border: 1px solid #dee2e6; /* Borda sutil */
  border-radius: 5px; /* Arredondamento das bordas */
  font-size: 16px; /* Tamanho do texto */
  cursor: pointer; /* Muda o cursor para indicar interatividade */
  transition: all 0.3s ease; /* Suaviza a transição para hover */
}

.chamado-item:hover {
  background-color: #e9ecef; /* Muda o fundo ao passar o mouse */
  color: #495057; /* Escurece o texto */
  transform: translateY(-2px); /* Eleva o botão levemente */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Adiciona sombra */
}

.chamado-item:active {
  background-color: #dee2e6; /* Fica um pouco mais escuro quando clicado */
  transform: translateY(0); /* Remove a elevação ao pressionar */
  box-shadow: none; /* Remove a sombra ao pressionar */
}
/* Estilo base para os botões */
.btn {
  display: inline-block; /* Permite personalização como botão */
  padding: 10px 20px; /* Espaçamento interno */
  margin: 10px; /* Espaçamento externo */
  font-size: 16px; /* Tamanho do texto */
  font-weight: 500; /* Peso do texto */
  color: #fff; /* Cor do texto */
  background-color: #007bff; /* Cor de fundo padrão (azul) */
  border: none; /* Remove bordas padrão */
  border-radius: 5px; /* Bordas arredondadas */
  cursor: pointer; /* Mostra que é clicável */
  text-align: center; /* Centraliza o texto */
  text-decoration: none; /* Remove sublinhado se usado em links */
  transition: all 0.3s ease; /* Suaviza transições */
}

.btn-primary {
  background-color: #007bff; /* Cor de fundo azul */
}

.btn-primary:hover {
  background-color: #0056b3; /* Azul mais escuro ao passar o mouse */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra no hover */
  transform: translateY(-2px); /* Eleva ligeiramente */
}

.btn-primary:active {
  background-color: #004085; /* Azul ainda mais escuro ao clicar */
  transform: translateY(0); /* Remove elevação */
  box-shadow: none; /* Remove a sombra */
}

/* Responsividade */
@media (max-width: 768px) {
  .btn {
    font-size: 14px; /* Reduz o tamanho do texto */
    padding: 8px 16px; /* Ajusta o espaçamento interno */
  }
}




.info-text {
  font-size: 1.1rem;
  color: #555;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-block;
  margin-bottom: 10px;
}

.info-text span {
  font-weight: bold;
  color: #333;
}

</style>
