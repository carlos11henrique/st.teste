<template>
  <div class="container-fluid">
    <!-- Tela de Login -->
    <div class="row">
      <div class="col-md-6 left-container">
        <div class="left-side d-flex flex-column align-items-center justify-content-center">
          <img src="/images/ST.png" alt="Logotipo" class="img-fluid mb-4" />
          
          <!-- Bubbles Animation (opcional) -->
          <div class="bubbles">
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div v-if="mostrarFormulario" class="form-container">
          <h2 class="text-center"><strong>Cadastrar usuário</strong></h2>
          <form @submit.prevent="cadastrarAluno">
            <!-- Campos do formulário -->
            <div class="form-group">
              <label for="nome">Nome:</label>
              <input type="text" id="nome" class="form-control" v-model="novoAluno.nome" required />
            </div>

            <div class="form-group">
              <label for="email">E-mail:</label>
              <input type="email" id="email" class="form-control" v-model="novoAluno.gmail" required />
              <small v-if="!novoAluno.tipoUsuario && novoAluno.gmail" class="form-text text-danger">
                Use o e-mail institucional para se cadastrar.
              </small>
            </div>

            <div class="form-group">
              <label for="confirmar-email">Confirmar E-mail:</label>
              <input type="email" id="confirmar-email" class="form-control" v-model="novoAluno.confirmarEmail" required />
            </div>

            <div class="form-group">
              <label for="senha">Senha:</label>
              <input
                type="password"
                id="senha"
                class="form-control"
                v-model="novoAluno.senha"
                required
                minlength="8"
              />
              <small v-if="senhaInvalida" class="form-text text-danger">
                A senha deve ter pelo menos 8 caracteres.
              </small>
            </div>

            <div class="form-group">
              <label for="confirmar-senha">Confirmar Senha:</label>
              <input
                type="password"
                id="confirmar-senha"
                class="form-control"
                v-model="novoAluno.confirmarSenha"
                required
              />
              <small v-if="senhasNaoCoincidem" class="form-text text-danger">
                As senhas não coincidem.
              </small>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="!novoAluno.nome || !novoAluno.gmail || !novoAluno.confirmarEmail || !novoAluno.senha || senhasNaoCoincidem || senhaInvalida || !novoAluno.tipoUsuario"
            >
              <strong>Cadastrar</strong>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CadastroUsarioComum",
  data() {
    return {
      mostrarFormulario: true,
      novoAluno: {
        nome: "",
        telefone: "",
        gmail: "",
        confirmarEmail: "",
        senha: "",
        confirmarSenha: "",
        tipoUsuario: "",
      },
    };
  },
  computed: {
    senhaInvalida() {
      return this.novoAluno.senha && this.novoAluno.senha.length < 8;
    },
    senhasNaoCoincidem() {
      return (
        this.novoAluno.senha &&
        this.novoAluno.confirmarSenha &&
        this.novoAluno.senha !== this.novoAluno.confirmarSenha
      );
    },
  },
  watch: {
    "novoAluno.gmail"(novoValor) {
      this.novoAluno.tipoUsuario = this.obterOcupacaoPorEmail(novoValor);
    },
  },
  methods: {
    obterOcupacaoPorEmail(email) {
      if (!email) return null;

      const dominio = email.split("@")[1]?.toLowerCase();

      if (!dominio) return null;

      if (dominio.includes("fieb.")) {
        return "NOA";
      } else if (dominio.includes("fbest.")) {
        return "ESTAGIARIO";
      } else if (dominio.includes("fbt.")) {
        return "TERCEIROS";
      } else if (dominio.includes("estudante.")) {
        return "ESTUDANTE";
      } else if (dominio.includes("docente.")) {
        return "DOCENTE";
      } else {
        return null;
      }
    },
    async cadastrarAluno() {
      if (!this.novoAluno.tipoUsuario) {
        alert("O e-mail fornecido é inválido. Por favor, insira um e-mail válido.");
        return;
      }

      if (this.novoAluno.senha !== this.novoAluno.confirmarSenha) {
        alert("As senhas não coincidem. Por favor, verifique.");
        return;
      }

      if (this.novoAluno.gmail !== this.novoAluno.confirmarEmail) {
        alert("Os e-mails não coincidem. Por favor, verifique.");
        return;
      }

      if (this.novoAluno.senha.length < 8) {
        alert("A senha deve ter pelo menos 8 caracteres.");
        return;
      }

      const dadosUsuario = {
        nome_completo: this.novoAluno.nome,
        senha: this.novoAluno.senha,
        email: this.novoAluno.gmail,
        telefone: this.novoAluno.telefone,
        ocupacao: this.novoAluno.tipoUsuario,
      };

      const token = localStorage.getItem("token");

      try {
        const resposta = await axios.post(
          "http://localhost:3000/auth/register",
          dadosUsuario,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (resposta.status === 201) {
          alert("Cadastro realizado com sucesso!");
          this.novoAluno = {
            nome: "",
            telefone: "",
            gmail: "",
            confirmarEmail: "",
            senha: "",
            confirmarSenha: "",
            tipoUsuario: "",
          };
        } else {
          alert("Erro ao cadastrar o usuário");
        }
      } catch (error) {
        console.error("Erro no cadastro:", error.response?.data || error);
        alert(
          `Erro ao cadastrar o usuário: ${
            error.response?.data?.message || "Tente novamente mais tarde."
          }`
        );
      }
    },
  },
};
</script>

<style scoped>
.left-container {
  background-color: #007bff; /* Azul */
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-side {
  color: white;
  text-align: center;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

button {
  display: block;
  width: 100%;
  margin-top: 25px;
}

@media (max-width: 576px) {
  .form-container {
    padding: 10px;
  }

  button {
    width: 100%;
  }
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
