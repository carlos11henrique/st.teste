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
      <tbody v-if="equipamentos.length > 0">
        <tr v-for="equipamento in equipamentosFiltrados" :key="equipamento.id">
          <td>{{ equipamento.numero_maquina }}</td>
          <td>{{ equipamento.id }}</td>
          <td>{{ equipamento.numero_sala || 'Sem localização' }}</td> <!-- Ajuste para exibir localização -->
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
            <input
              type="text"
              id="editId"
              v-model="equipamentoEmEdicao.id"
              class="form-control"
              disabled
            />
          </div>
          <div class="form-group">
            <label for="editNome">Nome do Equipamento</label>
            <input
              type="text"
              id="editNome"
              v-model="equipamentoEmEdicao.numero_maquina"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="editLocalizacao">Localização</label>
            <input
              type="text"
              id="editLocalizacao"
              v-model="equipamentoEmEdicao.numero_sala"
              class="form-control"
              required
            />
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
import Swal from 'sweetalert2'; // Importe o SweetAlert2

export default {
  name: 'ComponenteControleEquipamento',
  data() {
    return {
      mostrarTabelaEquipamentos: true,
      filtroPesquisa: '',
      equipamentos: [],
      equipamentoEmEdicao: null,
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

    // Editar Equipamento
    editarEquipamento(equipamento) {
      this.equipamentoEmEdicao = { ...equipamento };
    },

    // Cancelar Edição
    cancelarEdicao() {
      this.equipamentoEmEdicao = null;
    },

    // Salvar edição do equipamento
    async salvarEdicao() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.put(`http://localhost:3000/maquinas/${this.equipamentoEmEdicao.id}`, this.equipamentoEmEdicao, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.carregarEquipamentos();
        this.equipamentoEmEdicao = null;
      } catch (error) {
        console.error("Erro ao salvar edição:", error);
      }
    },

    // Remover equipamento
    async removerEquipamento(id) {
      const token = localStorage.getItem("token");

      // Usando SweetAlert2 para confirmação e exibição de alerta bonito
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
          Swal.fire(
            'Removido!',
            'O equipamento foi removido com sucesso.',
            'success'
          );
        } catch (error) {
          console.error("Erro ao remover equipamento:", error);
          Swal.fire(
            'Erro!',
            'Ocorreu um erro ao tentar remover o equipamento.',
            'error'
          );
        }
      }
    },

    // Gerar PDF com tamanho de cartão de crédito
    gerarPDF(equipamento) {
      // Dimensões do cartão de crédito em pontos
      // Dimensões do ingresso em pontos
const width = 200 * 2.83465; // Largura em mm convertido para pontos (≈ 396.85 pontos)
const height = 155 * 2.83465; // Altura em mm convertido para pontos (≈ 155.91 pontos)

      // Criando o PDF com o tamanho personalizado
      const doc = new jsPDF({
        unit: 'pt',
        format: [width, height]
      });

      // Adicionando informações ao PDF
      doc.text(`Equipamento: ${equipamento.numero_maquina}`, 10, 20); // Ajustado para caber melhor
      doc.text(`ID: ${equipamento.id}`, 10, 40);
      doc.text(`Localização: ${equipamento.numero_sala}`, 10, 60);

      // Salvando o PDF
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
  }
  
  .table-bordered th, .table-bordered td {
    border: 1px solid #ddd;
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
  