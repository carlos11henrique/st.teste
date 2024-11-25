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
      <div class="tracking-container">
        <h2>Rastreamento do Chamado</h2>
        <ul class="tracking-list">
          <li :class="['tracking-step', chamadoDetalhes?.status === 'Aberto' ? 'completed' : '']">
            <div class="step-icon">✔</div>
            <div class="step-content">
              <h3>Aberto</h3>
              <p>O chamado foi registrado com sucesso.</p>
              <span class="step-time">Hoje, 10:00 AM</span>
            </div>
          </li>
          <li :class="['tracking-step', chamadoDetalhes?.status === 'Em análise' ? 'in-progress' : '']">
            <div class="step-icon">🔄</div>
            <div class="step-content">
              <h3>Em análise</h3>
              <p>A equipe está verificando o problema.</p>
              <span class="step-time">Hoje, 11:30 AM</span>
            </div>
          </li>
          <li :class="['tracking-step', chamadoDetalhes?.status === 'Em andamento' ? 'in-progress' : '']">
            <div class="step-icon">⏳</div>
            <div class="step-content">
              <h3>Em andamento</h3>
              <p>O técnico está trabalhando no problema.</p>
              <span class="step-time">Previsto para hoje, 3:00 PM</span>
            </div>
          </li>
          <li :class="['tracking-step', chamadoDetalhes?.status === 'Resolvido' ? 'completed' : '']">
            <div class="step-icon">✔</div>
            <div class="step-content">
              <h3>Resolvido</h3>
              <p>O chamado foi resolvido.</p>
              <span class="step-time">A definir</span>
            </div>
          </li>
        </ul>
        
        <!-- Botão para a página de login -->
        <router-link to="/login">
          <button class="btn btn-primary">Voltar para o Login</button>
        </router-link>
      </div>
    </div>
  </div>
</template>


  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  </script>
  
  
  <style scoped>
  /* Reset básico */
  body,
  html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-family: Arial, sans-serif;
  }
  
  .problem-report-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
    flex-direction: row;
  }
  
  /* Lado esquerdo com imagem e gradiente */
  .left-side {
    flex: 1;
    background: linear-gradient(to bottom, #0575e6, #02298a, #021b79);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  
  .left-side img {
    max-width: 80%;
    z-index: 2;
  }
  
  .bubbles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }
  
  .bubble {
    position: absolute;
    bottom: -50px;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    animation: bubble 6s infinite ease-in-out;
  }
  
  .bubble:nth-child(1) {
    left: 20%;
    width: 60px;
    height: 60px;
    animation-duration: 8s;
  }
  
  .bubble:nth-child(2) {
    left: 50%;
    animation-duration: 5s;
  }
  
  .bubble:nth-child(3) {
    left: 70%;
    width: 80px;
    height: 80px;
    animation-duration: 9s;
  }
  
  .bubble:nth-child(4) {
    left: 90%;
    width: 50px;
    height: 50px;
    animation-duration: 7s;
  }
  
  .bubble:nth-child(5) {
    left: 30%;
    animation-duration: 10s;
  }
  
  @keyframes bubble {
    0% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-300px) scale(1.2);
    }
    100% {
      transform: translateY(-600px) scale(0.8);
    }
  }
  
  /* Lado direito com formulário */
  .right-side {
    flex: 2;
    background-color: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .report-box {
    background-color: white;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
    width: 100%;
    max-width: 500px;
  }
  
  .report-box h2 {
    color: #0738b3;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .report-box label {
    font-weight: bold;
  }
  
  .report-box input,
  .report-box select,
  .report-box textarea {
    width: 100%;
    padding: 10px;
    margin-top: 8px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-sizing: border-box;
  }
  
  .report-box textarea {
    resize: none;
  }
  
  .report-box button {
    width: 100%;
    padding: 12px;
    background-color: #02298a;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .report-box button:hover {
    background-color: #0738b3;
  }
  
  .clickable-item {
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clickable-item:hover {
    background-color: #f1f1f1;
  }
  
  /* Link para voltar */
  .report-box .btn-link {
    color: #02298a;
    text-decoration: none;
    font-weight: bold;
  }
  
  .report-box .btn-link:hover {
    text-decoration: underline;
  }
  
  /* Responsividade */
  @media screen and (max-width: 768px) {
    .problem-report-container {
      flex-direction: column;
      height: auto;
    }
  
    .left-side {
      height: 200px;
      flex: none;
    }
  
    .right-side {
      flex: none;
      padding: 10px;
    }
  
    .report-box {
      max-width: 90%;
    }
  }
  
  @media screen and (max-width: 480px) {
    .report-box h2 {
      font-size: 18px;
    }
  
    .report-box button {
      font-size: 14px;
      padding: 10px;
    }
  
    .left-side img {
      max-width: 70%;
    }
  }
  .tracking-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.tracking-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #0738b3;
}

.tracking-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tracking-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.tracking-step:last-child {
  margin-bottom: 0;
}

.step-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;
  margin-right: 15px;
}

.completed .step-icon {
  background-color: #28a745; /* Verde */
}

.in-progress .step-icon {
  background-color: #007bff; /* Azul */
}

.pending .step-icon {
  background-color: #ffc107; /* Amarelo */
}

.step-content {
  flex-grow: 1;
}

.step-content h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.step-content p {
  margin: 5px 0 10px;
  font-size: 14px;
  color: #666;
}

.step-time {
  font-size: 12px;
  color: #999;
}
.pending .step-icon {
  background-color: #ffc107; /* Amarelo */
}

/* Estilos para o botão de Login */
button.btn-primary {
  background-color: #007bff; /* Cor de fundo azul */
  color: white; /* Cor do texto */
  border: 1px solid #007bff; /* Borda azul */
  padding: 10px 20px; /* Espaçamento interno */
  font-size: 16px; /* Tamanho da fonte */
  border-radius: 5px; /* Bordas arredondadas */
  cursor: pointer; /* Muda o cursor para indicar que é clicável */
  transition: all 0.3s ease; /* Animação suave para os efeitos */
  margin-top: 30px;
}

button.btn-primary:hover {
  background-color: #0056b3; /* Cor de fundo azul mais escuro quando o botão é hover */
  border-color: #0056b3; /* Borda mais escura */
}

button.btn-primary:focus {
  outline: none; /* Remove o contorno padrão do navegador */
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Efeito de sombra ao focar */
}

button.btn-primary:active {
  background-color: #004085; /* Cor de fundo ainda mais escura quando o botão é pressionado */
  border-color: #004085; /* Borda mais escura */
}


  </style>
  