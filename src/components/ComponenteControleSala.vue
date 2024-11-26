<template>
  <div class="table-container p-3">
    <h2>Tabela de salas cadastradas</h2>
    <input
      type="text"
      v-model="filtroPesquisa"
      placeholder="Buscar por bloco ou número da sala..."
      class="form-control mb-3"
    />
    <button class="btn btn-success mb-3" @click="exportarParaExcel">Exportar para Excel</button>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Bloco</th>
          <th>Nome/Número da sala</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sala in salasFiltradas" :key="sala.id">
          <td>{{ sala.nome_bloco }}</td>
          <td>{{ sala.numero_sala }}</td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editarSala(sala)">
              Editar
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="confirmarRemoverSala(sala.id)"
            >
              Remover
            </button>
          </td>
        </tr>
        <tr v-if="salasFiltradas.length === 0">
          <td colspan="3">Nenhuma sala encontrada</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de Edição -->
    <div v-if="salaEmEdicao" class="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Sala</h5>
            <button type="button" class="close" @click="cancelarEdicao">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarEdicao">
              <div class="form-group">
                <label>Bloco</label>
                <input v-model="salaEmEdicao.nome_bloco" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Nome/Número da Sala</label>
                <input
                  v-model="salaEmEdicao.numero_sala"
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-success">Salvar</button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="cancelarEdicao"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default {
  name: "ComponenteControleSala",
  data() {
    return {
      mostrarCadastroSala: false,
      mostrarTabelaSalas: true,
      filtroPesquisa: "",
      salas: [],
      salaEmEdicao: null,
    };
  },
  computed: {
    salasFiltradas() {
      if (!Array.isArray(this.salas)) return [];
      const filtro = this.filtroPesquisa.toLowerCase();
      return this.salas.filter((sala) => {
        const bloco = sala.nome_bloco ? sala.nome_bloco.toLowerCase() : "";
        const numero = sala.numero_sala ? sala.numero_sala.toLowerCase() : "";
        return bloco.includes(filtro) || numero.includes(filtro);
      });
    },
  },
  methods: {
    async carregarSalas() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get("http://localhost:3000/salas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.salas = Array.isArray(resposta.data) ? resposta.data : [];
      } catch (error) {
        console.error("Erro ao carregar salas:", error);
        Swal.fire("Erro", "Não foi possível carregar as salas.", "error");
      }
    },

    editarSala(sala) {
      this.salaEmEdicao = { ...sala };
    },

    async salvarEdicao() {
      const token = localStorage.getItem("token");
      try {
        await axios.put(
          `http://localhost:3000/salas/${this.salaEmEdicao.id}`,
          this.salaEmEdicao,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const index = this.salas.findIndex(
          (sala) => sala.id === this.salaEmEdicao.id
        );
        if (index !== -1) {
          this.salas.splice(index, 1, { ...this.salaEmEdicao });
        }
        this.salaEmEdicao = null;
        Swal.fire("Sucesso", "Sala editada com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao salvar a edição da sala:", error);
        Swal.fire("Erro", "Não foi possível salvar a edição.", "error");
      }
    },

    cancelarEdicao() {
      this.salaEmEdicao = null;
    },

    async confirmarRemoverSala(id) {
      const result = await Swal.fire({
        title: "Tem certeza?",
        text: "Você não poderá reverter essa ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      });

      if (result.isConfirmed) {
        this.removerSala(id);
      }
    },

    async removerSala(id) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`http://localhost:3000/salas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.salas = this.salas.filter((sala) => sala.id !== id);
        Swal.fire("Sucesso", "Sala removida com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao remover sala:", error);
        Swal.fire("Erro", "Não foi possível remover a sala.", "error");
      }
    },

    exportarParaExcel() {
      try {
        const dados = this.salasFiltradas.map((sala) => ({
          Bloco: sala.nome_bloco,
          "Nome/Número da Sala": sala.numero_sala,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Salas");

        XLSX.writeFile(workbook, "SalasCadastradas.xlsx");
        Swal.fire("Sucesso", "Arquivo Excel exportado com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao exportar para Excel:", error);
        Swal.fire("Erro", "Não foi possível exportar os dados.", "error");
      }
    },
  },
  mounted() {
    this.carregarSalas();
  },
};
</script>


<style scoped>
.table-container {
  margin: 20px;
}

/* Estilos para o modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
}

.modal-content {
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 15px;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>