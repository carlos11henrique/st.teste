<template>
  <div v-if="mostrarFormulario" class="form-container">
    <h2><strong>Cadastrar usuário</strong></h2>
    <form @submit.prevent="cadastrarAluno">
      <!-- Campos do formulário -->
      <div class="form-group">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" v-model="novoAluno.nome" required />
      </div>

      <div class="form-group">
        <label for="email">E-mail:</label>
        <input type="email" id="email" v-model="novoAluno.gmail" required />
        <small v-if="!novoAluno.tipoUsuario && novoAluno.gmail" class="form-text text-danger">
        Use o e-mail institucional para se cadastrar.
        </small>
      </div>

      <div class="form-group">
        <label for="confirmar-email">Confirmar E-mail:</label>
        <input type="email" id="confirmar-email" v-model="novoAluno.confirmarEmail" required />
      </div>

      <div class="form-group">
        <label for="senha">Senha:</label>
        <input
          type="password"
          id="senha"
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
          v-model="novoAluno.confirmarSenha"
          required
        />
        <small v-if="senhasNaoCoincidem" class="form-text text-danger">
          As senhas não coincidem.
        </small>
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!novoAluno.nome || !novoAluno.gmail || !novoAluno.confirmarEmail || !novoAluno.senha || senhasNaoCoincidem || senhaInvalida || !novoAluno.tipoUsuario"
      >
        <strong>Cadastrar</strong>
      </button>
    </form>
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
      } else if (dominio.includes("ti.")) {
        return "TI";
      } else if (dominio.includes("manutencao.") || dominio.includes("manutenção.")) {
        return "MANUTENCAO";
      } else if (dominio.includes("fbt.")) {
        return "TERCEIRO";
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
  button {
    display: block;
    width: 20%;
    margin-top: 25px;
  }
  </style>
  