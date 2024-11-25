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
        <input
          type="email"
          id="email"
          v-model="novoAluno.gmail"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmar-email">Confirmar E-mail:</label>
        <input
          type="email"
          id="confirmar-email"
          v-model="novoAluno.confirmarEmail"
          required
        />
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
        <small
          v-if="senhaInvalida"
          class="form-text text-danger"
        >
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
        <small
          v-if="senhasNaoCoincidem"
          class="form-text text-danger"
        >
          As senhas não coincidem.
        </small>
      </div>

      
      <button type="submit" class="btn btn-primary"><strong>Cadastrar</strong></button>
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
    // Monitorar alterações no campo de e-mail
    "novoAluno.gmail"(novoValor) {
      this.novoAluno.tipoUsuario = this.obterOcupacaoPorEmail(novoValor);
    },
  },
  methods: {
    obterOcupacaoPorEmail(email) {
      if (!email) return "FUNCIONARIOS"; // Valor padrão caso o e-mail não seja fornecido

      const dominio = email.split("@")[1]?.toLowerCase(); // Extrai o domínio do e-mail

      if (/\.fieb\./.test(dominio)) {
        return "NOA"; // Para domínios relacionados ao Fieb
      } else if (/\.fbest\./.test(dominio)) {
        return "ESTAGIARIO"; // Para domínios relacionados ao Fbest
      } else if (/\.ti\./.test(dominio)) {
        return "TI"; // Para domínios relacionados ao TI
      } else if (/\.manutencao\./.test(dominio)) {
        return "MANUTENCAO"; // Para domínios relacionados ao MANUTENCAO
      } else if (/\.manutencão\./.test(dominio)) {
        return "MANUTENCAO"; // Para domínios relacionados ao MANUTENCAO
      } else if (/\.fbt\./.test(dominio)) {
        return "TERCEIRO"; // Para domínios relacionados ao Fbt
      } else if (/\.estudante\./.test(dominio)) {
        return "ESTUDANTE"; // Para domínios relacionados ao estudante
      } else if (/\.docente\./.test(dominio)) {
        return "DOCENTE"; // Para domínios relacionados ao docente
      } else {
        return "FUNCIONARIOS"; // Valor padrão se o domínio não corresponder
      }
    },
    async cadastrarAluno() {
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
        console.error("Erro no cadastro:", error);
        alert("Erro ao cadastrar o usuário. Tente novamente.");
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
