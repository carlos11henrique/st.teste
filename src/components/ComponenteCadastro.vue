<template>
  <div v-if="mostrarFormulario" class="form-container">
    <h2><strong>Cadastrar Usuário</strong></h2>
    <form @submit.prevent="cadastrarAluno">
      <!-- Nome -->
      <div class="form-group">
        <label for="nome">Nome:</label>
        <input 
          type="text" 
          id="nome" 
          v-model="novoAluno.nome" 
          required 
          placeholder="Digite seu nome completo"
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">E-mail:</label>
        <input 
          type="email" 
          id="email" 
          v-model="novoAluno.gmail" 
          required 
          placeholder="Digite seu e-mail"
        />
      </div>

      <!-- Confirmar Email -->
      <div class="form-group">
        <label for="confirmar-email">Confirmar E-mail:</label>
        <input 
          type="email" 
          id="confirmar-email" 
          v-model="novoAluno.confirmarEmail" 
          required 
          placeholder="Confirme seu e-mail"
        />
        <small v-if="emailsNaoCoincidem" class="form-text text-danger">
          Os e-mails não coincidem.
        </small>
      </div>

      <!-- Senha -->
      <div class="form-group">
        <label for="senha">Senha:</label>
        <input 
          type="password" 
          id="senha" 
          v-model="novoAluno.senha" 
          required 
          minlength="8" 
          placeholder="Crie uma senha (mín. 8 caracteres)"
        />
        <small v-if="senhaInvalida" class="form-text text-danger">
          A senha deve ter pelo menos 8 caracteres.
        </small>
      </div>

      <!-- Confirmar Senha -->
      <div class="form-group">
        <label for="confirmar-senha">Confirmar Senha:</label>
        <input 
          type="password" 
          id="confirmar-senha" 
          v-model="novoAluno.confirmarSenha" 
          required 
          placeholder="Confirme sua senha"
        />
        <small v-if="senhasNaoCoincidem" class="form-text text-danger">
          As senhas não coincidem.
        </small>
      </div>

      <!-- Tipo de Usuário -->
      <div class="form-group">
        <label for="tipoUsuario">Tipo de Usuário:</label>
        <select id="tipoUsuario" v-model="novoAluno.tipoUsuario" required>
          <option disabled value="">Selecione uma opção</option>
          <option value="ESTUDANTE">Estudante</option>
          <option value="TI">Técnico de TI</option>
          <option value="DOCENTE">Docente</option>
          <option value="MANUTENCAO">Técnico de Manutenção</option>
          <option value="NOA">NOA</option>
        </select>
      </div>

      <!-- Botão de Cadastro -->
      <button type="submit" class="btn"><strong>Cadastrar</strong></button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "ComponenteCadastro",
  data() {
    return {
      mostrarFormulario: true,
      novoAluno: {
        nome: "",
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
      return this.novoAluno.senha !== this.novoAluno.confirmarSenha;
    },
    emailsNaoCoincidem() {
      return this.novoAluno.gmail !== this.novoAluno.confirmarEmail;
    },
  },
  methods: {
    async cadastrarAluno() {
      
      if (this.senhasNaoCoincidem) {
        Swal.fire("Erro", "As senhas não coincidem.", "error");
        return;
      }

      if (this.emailsNaoCoincidem) {
        Swal.fire("Erro", "Os e-mails não coincidem.", "error");
        return;
      }

      if (this.senhaInvalida) {
        Swal.fire("Erro", "A senha deve ter pelo menos 8 caracteres.", "error");
        return;
      }

      // Dados para envio
      const dadosUsuario = {
        nome_completo: this.novoAluno.nome,
        email: this.novoAluno.gmail,
        senha: this.novoAluno.senha,
        ocupacao: this.novoAluno.tipoUsuario,
      };


      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Erro", "Usuário não autenticado. Faça login novamente.", "error");
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const resposta = await axios.post("http://localhost:3000/auth/register", dadosUsuario, config);

        if (resposta.status === 201) {
          Swal.fire("Sucesso", "Cadastro realizado com sucesso!", "success");
          this.limparFormulario();
        } else {
          Swal.fire("Erro", `Erro ao cadastrar: ${resposta.data.message || "Erro desconhecido."}`, "error");
        }
      } catch (error) {
        Swal.fire("Erro", `Erro no cadastro: ${error.response?.data?.message || "Tente novamente."}`, "error");
        console.error("Erro ao cadastrar:", error);
      }
    },
    limparFormulario() {
      this.novoAluno = {
        nome: "",
        gmail: "",
        confirmarEmail: "",
        senha: "",
        confirmarSenha: "",
        tipoUsuario: "",
      };
      this.mostrarFormulario = false;
      setTimeout(() => (this.mostrarFormulario = true), 0);
    },
  },
};
</script>


<style scoped>
/* Contêiner esquerdo com gradiente e bolhas */
.left-container {
  background: linear-gradient(to bottom, #0575e6, #02298a, #021b79);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Estilização principal do formulário */
.form-container {
  max-width: 990px;
  margin: 0 auto;
  padding: 25px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #076adb;
  font-weight: bold;
}

/* Grupos de formulário */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0575e6;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(5, 117, 230, 0.4);
}

/* Texto de erro */
.form-text.text-danger {
  color: #e63946;
  font-size: 14px;
  margin-top: 5px;
  font-weight: 500;
}

/* Botão */
button[type="submit"] {
  background: linear-gradient(to right, #0575e6, #021b79);
  color: white;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
  font-weight: bold;
}

button[type="submit"]:hover {
  background: linear-gradient(to right, #021b79, #0575e6);
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(5, 117, 230, 0.5);
}

/* Animação das bolhas */
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
    transform: translateY(-1000px) scale(0.5);
    opacity: 0;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  button[type="submit"] {
    font-size: 14px;
  }
}
</style>

