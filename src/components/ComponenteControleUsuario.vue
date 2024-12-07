<template>
  <div v-if="mostrarTabelaExibida" class="table-container p-3">
    <h2>Tabela de Usuários</h2>
    <input
      type="text"
      v-model="filtro"
      placeholder="Pesquisa por nome ou email"
      class="form-control mb-3"
    />
    <button class="btn btn-success mb-3" @click="exportarParaExcel">Exportar para Excel</button>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ocupação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <td data-label="Nome">{{ usuario.nome_completo }}</td>
            <td data-label="Email">{{ usuario.email }}</td>
            <td data-label="Ocupação">{{ usuario.ocupacao }}</td>
            <td data-label="Ações">
              <button class="btn btn-warning btn-sm" @click="buscarUsuario(usuario.id)">Editar</button>
              <button class="btn btn-danger btn-sm" @click="removerUsuario(usuario.id)">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Edição de Usuário -->
    <div v-if="usuarioParaEditar" class="modal fade show" style="display: block;" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Editar Usuário</h5>
            <button type="button" class="btn-close" @click="usuarioParaEditar = null" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="atualizarUsuario">
              <div class="form-group">
                <label>Nome</label>
                <input type="text" v-model="usuarioParaEditar.nome_completo" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="usuarioParaEditar.email" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary mt-2">Salvar Alterações</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagens de sucesso ou erro -->
    <div v-if="mensagem" class="alert" :class="mensagem.tipo">
      {{ mensagem.texto }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default {
  name: "ComponenteControleUsuario",
  data() {
    return {
      mostrarTabelaExibida: true,
      filtro: "",
      usuarios: [],
      usuarioParaEditar: null,
      mensagem: null,
    };
  },
  computed: {
    usuariosFiltrados() {
      return this.usuarios.filter((usuario) => {
        return (
          usuario.nome_completo.toLowerCase().includes(this.filtro.toLowerCase()) ||
          usuario.email.toLowerCase().includes(this.filtro.toLowerCase())
        );
      });
    },
  },
  methods: {
    async carregarUsuarios() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get("http://localhost:3000/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.usuarios = resposta.data;
      } catch (error) {
        console.error("Erro ao carregar usuários:", error.response || error.message);
      }
    },
    async buscarUsuario(id) {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get(`http://localhost:3000/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.usuarioParaEditar = resposta.data;
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    },
    async atualizarUsuario() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.put(
          `http://localhost:3000/usuarios/${this.usuarioParaEditar.id}`,
          this.usuarioParaEditar,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Usuário atualizado:", resposta.data);
        this.usuarioParaEditar = null;
        await this.carregarUsuarios();
        this.mostrarMensagem("success", "Usuário atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        this.mostrarMensagem("danger", "Erro ao atualizar o usuário.");
      }
    },
    async removerUsuario(id) {
      const token = localStorage.getItem("token");
      const { isConfirmed } = await Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá reverter esta ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar",
      });

      if (!isConfirmed) return;

      try {
        await axios.delete(`http://localhost:3000/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`Usuário com ID ${id} removido`);
        await this.carregarUsuarios();
        this.mostrarMensagem("success", "Usuário removido com sucesso!");
      } catch (error) {
        console.error("Erro ao remover usuário:", error);
        this.mostrarMensagem("danger", "Erro ao remover o usuário.");
      }
    },
    mostrarMensagem(tipo, texto) {
      this.mensagem = { tipo, texto };
      setTimeout(() => {
        this.mensagem = null;
      }, 5000);
    },
    exportarParaExcel() {
      const dados = this.usuariosFiltrados.map((usuario) => ({
        Nome: usuario.nome_completo,
        Email: usuario.email,
        Ocupação: usuario.ocupacao,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários");

      XLSX.writeFile(workbook, "Usuarios.xlsx");
    },
  },
  mounted() {
    this.carregarUsuarios();
  },
};
</script>

<style scoped>
.table-container {
  margin: 20px;
}

.modal {
  position: fixed; /* Fixa o modal na tela */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fundo semitransparente */
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Garantir que o modal fique acima de outros elementos */
}

.modal.show {
  display: flex; /* Exibe o modal quando a classe show é adicionada */
}

.modal-dialog {
  max-width: 500px;
  margin: 0;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-left: 140%;
  margin-top: 32%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header .btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #000;
  cursor: pointer;
}

.modal-body {
  padding: 15px 022px;
}

.edit-form h3 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.alert {
  margin-top: 20px;
}

.alert.success {
  background-color: #d4edda;
  color: #155724;
}

.alert.danger {
  background-color: #f8d7da;
  color: #721c24;
}
</style>

