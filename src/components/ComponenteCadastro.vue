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
/* Container do formulário */
/* Container do formulário */
.form-container {
  max-width: 950px;
  margin: 50px auto;
  padding: 25px;
  background: #ffffff71;
  border-radius: 12px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.), -4px -4px 10px rgba(255, 255, 255, 0.7);
}

/* Título do formulário */
.form-container h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
  color: #076adb;
}

/* Grupo de formulário */
.form-group {
  margin-bottom: 20px;
}

/* Labels */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #000000;
  font-size: 16px;
  font-weight: bold;

}

/* Campos de entrada */
.form-group input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
}

/* Foco nos campos */
.form-group input:focus {
  border-color: #007bff;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
}

/* Texto de erro */
.form-text.text-danger {
  color: #e63946;
  font-size: 14px;
  margin-top: 5px;
  font-weight: 500;
}

/* Botão de cadastro */
.form-container button[type="submit"] {
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 35%;
}

.btn:hover {
  background: linear-gradient(90deg, #0056b3, #007bff);
  box-shadow: 2px 4px 10px rgba(0, 123, 255, 0.4);
}

/* Efeito de transição para campos com erro */
.form-group input:invalid {
  border-color: #e63946;
  box-shadow: 0 0 6px rgba(230, 57, 70, 0.3);
}

/* Responsividade */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .form-group input {
    padding: 10px 12px;
    font-size: 14px;
  }

  .btn {
    padding: 12px;
    font-size: 16px;
  }
}

</style>
