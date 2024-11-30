<template>
  <div>
    <!-- Tela de Login -->
    <div class="login-container">
      <div class="left-side">
        <img src="/images/ST.png" alt="Logotipo" />

        <!-- Bubbles Animation (opcional) -->
        <div class="bubbles">
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
        </div>
      </div>

      <div class="right-side">
        <div class="login-box">
          <h2>Bem-vindo(a)!</h2>

          <input
            type="email"
            placeholder="Usuário"
            v-model="gmail"
            aria-label="Usuário"
            @keyup.enter="login"
          />
          <p v-if="usuarioInvalido" class="error-text">Usuário inválido!</p>

          <div class="password-container">
  <input
    :type="passwordFieldType"
    placeholder="Senha"
    v-model="password"
    aria-label="Senha"
    @keyup.enter="login"
  />
  <i @click="togglePasswordVisibility" class="password-icon">
    <!-- Se a senha estiver oculta, mostra o ícone de olho aberto -->
    <img
      :src="passwordFieldType === 'password' ? '/images/olho.png' : '/images/fechado.png'"
      :alt="passwordFieldType === 'password' ? 'Mostrar senha' : 'Ocultar senha'"
      class="eye-icon"
    />
  </i>
</div>
          <p v-if="senhaInvalida" class="error-text">Senha inválida!</p>

          <button @click="login" :disabled="isLoading">
            <span v-if="isLoading">Carregando...</span>
            <span v-else>Login</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      gmail: "",
      password: "",
      usuarioInvalido: false,
      senhaInvalida: false,
      passwordFieldType: "password",
      isLoading: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordFieldType =
        this.passwordFieldType === "password" ? "text" : "password";
    },
    async login() {
      this.usuarioInvalido = !this.gmail.trim();
      this.senhaInvalida = !this.password.trim();

      if (this.usuarioInvalido || this.senhaInvalida) return;

      this.isLoading = true;

      try {
        const response = await axios.post(
          "http://localhost:3000/auth/login",
          {
            email: this.gmail,
            senha: this.password,
          }
        );

        if (response.status === 200) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role",response.data.ocupacao)

          if (
            response.data.ocupacao.endsWith("ESTUDANTE") ||
            response.data.ocupacao.endsWith("DOCENTE")||
            response.data.ocupacao.endsWith("ESTAGIARIO")||
            response.data.ocupacao.endsWith("FUNCIONARIO")
          ) {
            this.$router.push("/openchamando");
          } else if (
            response.data.ocupacao.endsWith("MANUTENCAO") ||
            response.data.ocupacao.endsWith("TI")
          ) {
            this.$router.push("/sidebar");
          } else if (
            response.data.ocupacao.endsWith("NOA")) {
            this.$router.push("/sidebar");
          }
        } else {
          this.senhaInvalida = true;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: error.response
            ? error.response.data.message || "Usuário ou senha inválidos!"
            : "Erro de conexão. Tente novamente mais tarde.",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>


<style scoped>
/* Reset básico */
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #f4f7fc;
}

/* Container de login */
.login-container {
  display: flex;
  height: 100vh;
  position: relative;
  flex-wrap: wrap; /* Permite o layout quebrar em dispositivos menores */
}

/* Lado esquerdo - Imagem com gradiente */
.left-side {
  flex: 1;
  background: linear-gradient(to bottom, #0575e6, #02298a, #021b79);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 1px;
  box-sizing: border-box;
}

.left-side img {
  max-width: 100%;
  height: auto;
}

/* Lado direito - Formulário de login */
.right-side {
  flex: 2;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

/* Caixa de login */
.login-box {
  width: 100%;
  max-width: 400px;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Estilo do título */
.login-box h2 {
  margin-bottom: 25px;
  text-align: center;
  color: #0738b3;
  font-weight: 600;
  font-size: 1.5rem;
}

/* Estilo dos inputs */
.login-box input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 15px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-box input:focus {
  border-color: #0575e6;
  outline: none;
  box-shadow: 0 0 8px rgba(5, 117, 230, 0.3);
}

/* Botão de login */
.login-box button {
  width: 100%;
  padding: 12px;
  background-color: #02298a;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;
}

.login-box button:hover {
  background-color: #2059ea;
}

/* Imagem no canto */
.corner-img {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 750px;
  height: auto;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.corner-img:hover {
  opacity: 0.4;
}

/* Ícone do olho */
.eye-icon {
  width: 22px;
  height: 22px;
  cursor: pointer;
}

/* Responsividade */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .left-side {
    flex: 1;
    display: block;
    height: 50vh; /* Reduzindo a altura da imagem no mobile */
  }

  .right-side {
    flex: 1;
    padding: 15px;
  }

  .login-box {
    padding: 20px;
    max-width: 100%;
  }

  .corner-img {
    display: block;
    width: 100%;
    height: auto;
    opacity: 0.3;
    position: relative;
    bottom: 0;
    left: 0;
  }

  .corner-img:hover {
    opacity: 0.5;
  }
}

@media (max-width: 480px) {
  .login-box {
    width: 100%;
    padding: 15px;
  }

  .login-box input {
    padding: 10px;
    margin-bottom: 12px;
  }

  .login-box button {
    padding: 14px;
  }

  .eye-icon {
    width: 18px;
    height: 18px;
  }

  .corner-img {
    width: 120%; /* Aumentando um pouco para cobrir mais espaço em telas pequenas */
    opacity: 0.4;
  }
}

/* Container da senha */
.password-container {
  position: relative;
  width: 100%;
}

.password-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.eye-icon {
  width: 22px;
  height: 22px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.password-icon:hover .eye-icon {
  transform: scale(1.3);
  opacity: 0.8;
}

/* Bubbles Animation */
.bubbles {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: bubble 6s infinite;
  pointer-events: none;
}

.bubble:nth-child(1) {
  width: 80px;
  height: 80px;
  left: 10%;
  bottom: -120px;
  animation-duration: 7s;
}

.bubble:nth-child(2) {
  width: 100px;
  height: 100px;
  left: 35%;
  bottom: -150px;
  animation-duration: 9s;
}

.bubble:nth-child(3) {
  width: 90px;
  height: 90px;
  left: 60%;
  bottom: -200px;
  animation-duration: 8s;
}

.bubble:nth-child(4) {
  width: 120px;
  height: 120px;
  left: 80%;
  bottom: -250px;
  animation-duration: 10s;
}

@keyframes bubble {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-1000px) scale(0);
    opacity: 0;
  }
}
</style>
