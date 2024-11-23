<template>
  <!-- Tabela de Equipamentos Cadastrados -->
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

    <!-- Tabela de equipamentos -->
    <table class="table table-bordered table-hover">
      <thead class="thead-dark">
        <tr>
          <th>Nome do Equipamento</th>
          <th>ID</th>
          <th>Localização</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody v-if="equipamentosFiltrados.length > 0">
        <tr v-for="equipamento in equipamentosFiltrados" :key="equipamento.id">
          <td>{{ equipamento.numero_maquina }}</td>
          <td>{{ equipamento.id }}</td>
          <td>{{ equipamento.numero_sala || 'Sem localização' }}</td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editarEquipamento(equipamento)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="removerEquipamento(equipamento.id)">Remover</button>
            <button class="btn btn-info btn-sm" @click="gerarPDF(equipamento)">Gerar PDF</button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="4" class="text-center">Nenhum equipamento encontrado</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Formulário de edição -->
  <div v-if="equipamentoEmEdicao" class="modal" tabindex="-1" role="dialog" style="display: block;">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Equipamento</h5>
          <button type="button" class="close" @click="cancelarEdicao">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEdicao">
            <div class="form-group">
              <label for="editId">ID</label>
              <input type="text" id="editId" v-model="equipamentoEmEdicao.id" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label for="editNome">Nome do Equipamento</label>
              <input type="text" id="editNome" v-model="equipamentoEmEdicao.numero_maquina" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="editLocalizacao">Localização</label>
              <input type="text" id="editLocalizacao" v-model="equipamentoEmEdicao.numero_sala" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="editTipo">Tipo de Equipamento</label>
              <input type="text" id="editTipo" v-model="equipamentoEmEdicao.tipo_equipamento" class="form-control" />
            </div>
            <div class="form-group">
              <label for="editDescricao">Descrição</label>
              <textarea id="editDescricao" v-model="equipamentoEmEdicao.descricao" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label for="editSalaId">ID da Sala</label>
              <input type="number" id="editSalaId" v-model="equipamentoEmEdicao.sala_id" class="form-control" />
            </div>
            <div class="form-group text-right">
              <button type="submit" class="btn btn-success">Salvar</button>
              <button type="button" class="btn btn-secondary" @click="cancelarEdicao">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

export default {
  name: 'ComponenteControleEquipamento',
  data() {
    return {
      mostrarTabelaEquipamentos: true,
      filtroPesquisa: '',
      equipamentos: [],
      equipamentoEmEdicao: {
        id: null,
        numero_maquina: '',
        numero_sala: '',
        tipo_equipamento: '', // Campo inicializado
        descricao: '',        // Campo inicializado
        sala_id: null,        // Campo inicializado
      },
    };
  },
  computed: {
    equipamentosFiltrados() {
      return this.equipamentos.filter((equipamento) => {
        const nome = equipamento.numero_maquina ? String(equipamento.numero_maquina) : '';
        const id = equipamento.id ? String(equipamento.id) : '';
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
    editarEquipamento(equipamento) {
      this.equipamentoEmEdicao = { 
        ...equipamento,
        tipo_equipamento: equipamento.tipo_equipamento || '', 
        descricao: equipamento.descricao || '', 
        sala_id: equipamento.sala_id || null,
      };
    },
    cancelarEdicao() {
      this.equipamentoEmEdicao = null;
    },
    async salvarEdicao() {
  const { tipo_equipamento, descricao, sala_id, numero_maquina } = this.equipamentoEmEdicao;

  // Verifique se os campos obrigatórios estão preenchidos
  if (!tipo_equipamento || !descricao || !sala_id || !numero_maquina) {
    alert("Todos os campos obrigatórios devem ser preenchidos.");
    return;
  }

  try {
    const resposta = await axios.put(
      `http://localhost:3000/maquinas/${this.equipamentoEmEdicao.id}`,
      { numero_maquina, tipo_equipamento, descricao, sala_id },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    console.log("Resposta da API:", resposta.data);
    this.carregarEquipamentos();
    this.equipamentoEmEdicao = null;
  } catch (error) {
    console.error("Erro ao salvar edição:", error.response?.data || error);
  }
},

    async removerEquipamento(id) {
      const token = localStorage.getItem("token");
      const result = await Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter essa ação!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover!',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/maquinas/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.carregarEquipamentos();
          Swal.fire('Removido!', 'O equipamento foi removido com sucesso.', 'success');
        } catch (error) {
          console.error("Erro ao remover equipamento:", error);
          Swal.fire('Erro!', 'Ocorreu um erro ao tentar remover o equipamento.', 'error');
        }
      }
    },
    gerarPDF(equipamento) {
      const width = 200 * 2.83465; // Largura em pontos
      const height = 155 * 2.83465; // Altura em pontos
      const doc = new jsPDF({
        unit: 'pt',
        format: [width, height],
      });
      doc.text(`Equipamento: ${equipamento.numero_maquina}`, 10, 20);
      doc.text(`ID: ${equipamento.id}`, 10, 40);
      doc.text(`Localização: ${equipamento.numero_sala}`, 10, 60);
      doc.save(`equipamento_${equipamento.id}.pdf`);
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
