<template>
  <div v-if="mostrarTabelaEquipamentos" class="table-container p-3">
    <h2>Tabela de Equipamentos Cadastrados</h2>

    <!-- Barra de pesquisa -->
    <div class="mb-3">
      <input 
        type="text" 
        v-model="filtroPesquisa" 
        placeholder="Pesquise por nome ou ID de equipamento" 
        class="form-control"
      />
    </div>

    <!-- Botões para ações -->
    <div class="mb-3 text-right">
      <button 
        class="btn btn-info" 
        :disabled="equipamentosSelecionados.length === 0"
        @click="gerarPDFSelecionados"
      >
        Gerar PDF Selecionados
      </button>
      <button class="btn btn-success" @click="exportarParaExcel">
        Exportar para Excel
      </button>
    </div>

    <!-- Tabela de equipamentos -->
    <table class="table table-bordered table-hover">
      <thead class="thead-dark">
        <tr>
          <th>
            <input 
              type="checkbox" 
              @change="toggleSelecionarTodos($event)" 
              :checked="selecionarTodos"
            />
          </th>
          <th>Nome do Equipamento</th>
          <th>ID</th>
          <th>Localização</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody v-if="equipamentosFiltrados.length > 0">
        <tr v-for="equipamento in equipamentosFiltrados" :key="equipamento.id">
          <td>
            <input 
              type="checkbox" 
              :value="equipamento" 
              v-model="equipamentosSelecionados"
            />
          </td>
          <td>{{ equipamento.numero_maquina }}</td>
          <td>{{ equipamento.id }}</td>
          <td>{{ equipamento.numero_sala || 'Sem localização' }}</td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editarEquipamento(equipamento)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="removerEquipamento(equipamento.id)">Remover</button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center">Nenhum equipamento encontrado</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal de Edição -->
  <div v-if="modalAberto" class="modal fade show" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Equipamento</h5>
          <button type="button" class="close" @click="cancelarEdicao">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEquipamentoEditado">
            <div class="form-group">
              <label for="numero_maquina">Número da Máquina:</label>
              <input
                id="numero_maquina"
                v-model="equipamentoEditando.numero_maquina"
                type="text"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="tipo_equipamento">Tipo de Equipamento:</label>
              <input
                id="tipo_equipamento"
                v-model="equipamentoEditando.tipo_equipamento"
                type="text"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="descricao">Descrição:</label>
              <textarea
                id="descricao"
                v-model="equipamentoEditando.descricao"
                class="form-control"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="sala_id">Sala ID:</label>
              <input
                id="sala_id"
                v-model="equipamentoEditando.sala_id"
                type="number"
                class="form-control"
              />
            </div>
            <button type="submit" class="btn btn-primary">Salvar</button>
            <button type="button" class="btn btn-secondary" @click="cancelarEdicao">Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import * as XLSX from "xlsx"; // Importando a biblioteca XLSX para exportar Excel

export default {
  data() {
    return {
      mostrarTabelaEquipamentos: true,
      filtroPesquisa: "",
      equipamentos: [],
      equipamentosSelecionados: [],
      selecionarTodos: false,
      equipamentoEditando: null,
      modalAberto: false,
    };
  },
  computed: {
    equipamentosFiltrados() {
      return this.equipamentos.filter((equipamento) => {
        const nome = equipamento.numero_maquina ? String(equipamento.numero_maquina) : "";
        const id = equipamento.id ? String(equipamento.id) : "";
        return (
          nome.toLowerCase().includes(this.filtroPesquisa.toLowerCase()) ||
          id.toLowerCase().includes(this.filtroPesquisa.toLowerCase())
        );
      });
    },
  },
  methods: {
    async carregarEquipamentos() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get("http://localhost:3000/maquinas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.equipamentos = resposta.data;
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
      }
    },
    toggleSelecionarTodos(event) {
      this.selecionarTodos = event.target.checked;
      this.equipamentosSelecionados = this.selecionarTodos
        ? [...this.equipamentosFiltrados]
        : [];
    },
    gerarPDFSelecionados() {
      if (this.equipamentosSelecionados.length === 0) return;

      const doc = new jsPDF();
      let y = 10;

      this.equipamentosSelecionados.forEach((equipamento, index) => {
        doc.text(`Equipamento ${index + 1}:`, 10, y);
        doc.text(`  - Nome: ${equipamento.numero_maquina}`, 20, y + 10);
        doc.text(`  - ID: ${equipamento.id}`, 20, y + 20);
        doc.text(`  - Localização: ${equipamento.numero_sala || "Sem localização"}`, 20, y + 30);
        y += 50;

        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });

      doc.save("equipamentos_selecionados.pdf");
    },
    exportarParaExcel() {
      const dados = this.equipamentosFiltrados.map((equipamento) => ({
        Nome: equipamento.numero_maquina,
        ID: equipamento.id,
        Localização: equipamento.numero_sala || "Sem localização",
      }));

      const ws = XLSX.utils.json_to_sheet(dados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Equipamentos");

      XLSX.writeFile(wb, "equipamentos_cadastrados.xlsx");
    },
    async removerEquipamento(id) {
      const confirmacao = await Swal.fire({
        title: "Você tem certeza?",
        text: "Isso removerá o equipamento permanentemente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar",
      });

      if (confirmacao.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:3000/maquinas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.equipamentos = this.equipamentos.filter((equip) => equip.id !== id);
          Swal.fire("Removido!", "O equipamento foi removido com sucesso.", "success");
        } catch (error) {
          Swal.fire("Erro!", "Não foi possível remover o equipamento.", "error");
        }
      }
    },
    editarEquipamento(equipamento) {
      this.equipamentoEditando = { ...equipamento };
      this.modalAberto = true;
    },
    async salvarEquipamentoEditado() {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:3000/maquinas/${this.equipamentoEditando.id}`,
          {
            numero_maquina: this.equipamentoEditando.numero_maquina,
            tipo_equipamento: this.equipamentoEditando.tipo_equipamento,
            descricao: this.equipamentoEditando.descricao,
            sala_id: this.equipamentoEditando.sala_id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const index = this.equipamentos.findIndex(
          (equip) => equip.id === this.equipamentoEditando.id
        );

        if (index !== -1) {
          this.equipamentos.splice(index, 1, { ...this.equipamentoEditando });
        }

        Swal.fire("Sucesso!", "O equipamento foi atualizado.", "success");
        this.modalAberto = false;
        this.equipamentoEditando = null;
      } catch (error) {
        console.error("Erro ao salvar equipamento:", error);
        Swal.fire("Erro!", "Não foi possível atualizar o equipamento.", "error");
      }
    },
    cancelarEdicao() {
      this.modalAberto = false;
      this.equipamentoEditando = null;
    },
  },
  mounted() {
    this.carregarEquipamentos();
  },
};
</script>


<style scoped>
.table-container {
  margin: 20px;
}

.edit-container {
  margin: 20px;
}

.table-bordered {
  border: 1px solid #ddd;
  width: 100%;
  table-layout: auto;
}

.table-bordered th, .table-bordered td {
  border: 1px solid #ddd;
  word-wrap: break-word;
  padding: 8px;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: #f9f9f9;
}

.text-right {
  text-align: right;
}

.thead-dark {
  background-color: #343a40;
  color: white;
}

.btn-sm {
  margin-right: 5px;
}

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
  width: 90%;
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

/* Responsividade */
@media (max-width: 768px) {
  .table-container, .edit-container {
    margin: 10px;
  }

  .table-bordered th, .table-bordered td {
    padding: 6px;
    font-size: 0.9rem;
  }

  .modal-dialog {
    max-width: 90%;
    padding: 10px;
  }

  .modal-content {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .table-container, .edit-container {
    margin: 5px;
  }

  .table-bordered th, .table-bordered td {
    font-size: 0.8rem;
  }

  .modal-dialog {
    width: 100%;
    margin: 5px;
  }
}
</style>
