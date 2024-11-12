<template>
  <div v-if="mostrarFormulario" class="form-container">
    <h2>Cadastrar usuário</h2>
    <form @submit.prevent="cadastrarAluno">
      <!-- Campos do formulário -->
      <div class="form-group">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" v-model="novoAluno.nome" required />
      </div>

      <div class="form-group">
        <label for="telefone">Telefone:</label>
        <input
          type="tel"
          id="telefone"
          v-model="novoAluno.telefone"
          @input="formatarTelefone"
          required
          maxlength="16"
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="novoAluno.gmail"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmar-email">Confirmar Email:</label>
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
          :title="'Senha deve ter pelo menos 8 caracteres'"
        />
        <small class="form-text text-muted">A senha deve ter pelo menos 8 caracteres.</small>
      </div>

      <div class="form-group">
        <label for="confirmar-senha">Confirmar Senha:</label>
        <input
          type="password"
          id="confirmar-senha"
          v-model="novoAluno.confirmarSenha"
          required
        />
      </div>

      <div class="form-group">
        <label>Tipo de Usuário:</label>
        <div class="radio-group">
          <input
            type="radio"
            id="estudante"
            value="ESTUDANTE"
            v-model="novoAluno.tipoUsuario"
          />
          <label for="estudante">Estudante</label>

          <input
            type="radio"
            id="tecnico"
            value="TI"
            v-model="novoAluno.tipoUsuario"
          />
          <label for="tecnico">Técnico de TI</label>

          <input
            type="radio"
            id="docente"
            value="DOCENTE"
            v-model="novoAluno.tipoUsuario"
          />
          <label for="docente">Docente</label>

          <input
            type="radio"
            id="manutencao"
            value="MANUTENCAO"
            v-model="novoAluno.tipoUsuario"
          />
          <label for="manutencao">Técnico de Manutenção</label>

          <input
            type="radio"
            id="administrativo"
            value="NOA"
            v-model="novoAluno.tipoUsuario"
          />
          <label for="administrativo">NOA</label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary">Cadastrar</button>
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
  methods: {
    formatarTelefone(event) {
      let telefone = this.novoAluno.telefone.replace(/\D/g, '');

      if (telefone.length <= 10) {
        this.novoAluno.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6, 10)}`;
      } else if (telefone.length <= 15) {
        this.novoAluno.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)} ${telefone.slice(11, 15)}`;
      } else if (telefone.length <= 20) {
        this.novoAluno.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7, 11)} ${telefone.slice(11, 15)} ${telefone.slice(15, 20)}`;
      }
    },

    async cadastrarAluno() {
      // Verificar se as senhas e emails são iguais
      if (this.novoAluno.senha !== this.novoAluno.confirmarSenha) {
        alert("As senhas não coincidem. Por favor, verifique.");
        return;
      }

      if (this.novoAluno.gmail !== this.novoAluno.confirmarEmail) {
        alert("Os e-mails não coincidem. Por favor, verifique.");
        return;
      }

      // Verificar se a senha tem pelo menos 8 caracteres
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
