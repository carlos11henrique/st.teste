<template>
  <li class="nav-item">
    <select v-model="filterOcupacao" class="form-select text-white bg-dark" aria-label="Chamados Ti" @change="atualizarFiltro" @click="chamadosTi">
      <option value="TODOS" selected>Todos os Chamados</option>
      <option value="ESTUDANTE">Alunos</option>
      <option value="DOCENTE">Docentes</option>
      <option value="MANUTENCAO">Manutenção</option>
      <option value="TI">Técnico de TI</option>
      <option value="NOA">ADM</option>
    </select>
  </li>

  <!-- Botão para exportar para Excel -->
  <div class="button-container">
  <button class="btn-warning" @click="exportarExcel">Converter para Excel</button>
</div>


  <div class="kanban-container">
    <!-- Seção Análise -->
    <div v-if="role === ROLES.NOA" class="kanban-column">
      <div v-show="mostrarTodosChamados || categoriaVisivel === 'Analise'" id="Análise">
        <h3 class="kanban-header bg-secondary text-white p-2 text-center">Inválido</h3>
        <div v-for="chamado in chamadosAnalise" :key="chamado.id" class="kanban-item bg-light p-3 my-2">
          <p><strong>Setor:</strong> {{ chamado.setor }}</p>
          <p><strong>E-mail:</strong> {{ chamado.email }}</p>
          <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
          <p><em>Problema:</em> {{ chamado.problema }}</p>
          <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
          <p><em>Bloco:</em> {{ chamado.bloco }}</p>
          <p><em>Sala:</em> {{ chamado.sala }}</p>
          <p v-if="Array.isArray(chamado.maquinas) && chamado.maquinas.length > 0"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
          <p><strong>Feedback:</strong> {{ chamado.feedback || "Nenhum feedback fornecido" }}</p>
          <button class="btn btn-primary btn-sm mt-2" :disabled="isUpdating(chamado.id)" @click="confirmarRemocao(chamado.id)">Mover para Análise</button>
        </div>
      </div>
    </div>

    <!-- Seção Concluído -->
    <div v-show="mostrarTodosChamados || categoriaVisivel === 'Concluído'" id="Concluido" class="kanban-column">
      <h3 class="kanban-header bg-success text-white p-2 text-center">Finalizado</h3>
      <div v-for="chamado in chamadosConcluidos" :key="chamado.id" class="kanban-item bg-light p-3 my-2">
        <p><strong>Setor:</strong> {{ chamado.setor }}</p>
        <p><strong>E-mail:</strong> {{ chamado.email }}</p>
        <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
        <p><em>Problema:</em> {{ chamado.problema }}</p>
        <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
        <p><em>Bloco:</em> {{ chamado.bloco }}</p>
        <p><em>Sala:</em> {{ chamado.sala }}</p>
        <p v-if="Array.isArray(chamado.maquinas) && chamado.maquinas.length > 0"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
        <p><strong>Feedback:</strong> {{ chamado.feedback || "Nenhum feedback fornecido" }}</p>
        <button class="btn btn-success btn-sm mt-2" 
        :disabled="isUpdating(chamado.id)" 
        @click="mudarStatus(chamado.id, 'Concluido')">
        Relatar inconsistência
      </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ROLES } from "../util/roles";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';  // Importando a biblioteca para exportação Excel

export default {
  name: "ComponenteKaban",
  data() {
    return {
      filterOcupacao: "TODOS",
      chamadosAnalise: [],
      ROLES,
      chamadosAndamento: [],
      chamadosConcluidos: [],
      chamadosPendentes: [],
      chamados: [],
      categoriaVisivel: '', 
      mostrarTodosChamados: true, 
      role: localStorage.getItem('role') || null,
      updatingStatusIds: [],  // Guarda os chamados que estão sendo atualizados
    };
  },
  methods: {
    async atualizarFiltro(event) {
      await this.carregarChamados();
    },

    // Função para exportar os chamados para Excel
    exportarExcel() {
      const chamadosExportados = this.chamados.map(chamado => ({
        'Setor': chamado.setor,
        'E-mail': chamado.email,
        'Ocupação': chamado.ocupacao,
        'Problema': chamado.problema,
        'Descrição': chamado.descricao_chamado,
        'Bloco': chamado.bloco,
        'Sala': chamado.sala,
        'Máquinas': chamado.maquinas ? chamado.maquinas.join(", ") : '',
        'Feedback': chamado.feedback || "Nenhum feedback fornecido",
      }));

      const ws = XLSX.utils.json_to_sheet(chamadosExportados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Chamados");

      // Gerar o arquivo Excel e baixar
      XLSX.writeFile(wb, 'chamados.xlsx');
    },

    // Função para verificar se o chamado está sendo atualizado
    isUpdating(chamadoId) {
      return this.updatingStatusIds.includes(chamadoId);
    },

    confirmarRemocao(chamadoId) {
      Swal.fire({
        title: 'Tem certeza que deseja finalizar?',
        text: "Esta ação moverá o chamado para o status 'Análise'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.mudarStatus(chamadoId, 'Análise');
        }
      });
    },

    async mudarStatus(chamadoId, novoStatus) {
      const chamado = this.chamados.find(ch => ch.id === chamadoId);
      if (chamado) {
        chamado.status = novoStatus;
        try {
          const token = localStorage.getItem("token");
          await axios.put(`http://localhost:3000/chamados/${chamadoId}`, chamado, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await this.carregarChamados();
          Swal.fire('Status Atualizado!', `O chamado foi movido para "${novoStatus}".`, 'success');
        } catch (erro) {
          console.error(`Erro ao mover para ${novoStatus}:`, erro);
          Swal.fire('Erro', `Erro ao mover para ${novoStatus}.`, 'error');
        }
      }
    },

    async carregarChamados() {
      try {
        const token = localStorage.getItem("token");
        const resposta = await axios.get('http://localhost:3000/chamados', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.chamados = Array.isArray(resposta.data) ? resposta.data : [];

        this.chamados = this.filterOcupacao !== "TODOS"
          ? this.chamados.filter((chamado) => chamado.ocupacao === this.filterOcupacao)
          : this.chamados;

        this.chamadosAnalise = this.chamados.filter((chamado) => chamado.status === "Invalido");
        this.chamadosConcluidos = this.chamados.filter((chamado) => chamado.status === "Finalizado");
       
      } catch (erro) {
        console.error("Erro ao carregar os chamados:", erro);
      }
    },

    atualizarChamados() {
      setInterval(() => {
        this.carregarChamados();
      }, 1000 * 60);
    },
  },

  created() {
    this.carregarChamados();
    this.atualizarChamados();
  },
};
</script>


  <style scoped>
  /* Estilo para o seletor de filtro acima das colunas */
  .filter-container {
    display: flex;
    justify-content: center; /* Centraliza o seletor horizontalmente */
    margin-bottom: 1rem; /* Espaçamento entre o seletor e as colunas do Kanban */
  }
  
  .nav-item {
    list-style-type: none; /* Remove os marcadores de lista */
    margin: 0 0.5rem; /* Espaçamento lateral */
  }
  
  .form-select {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid #ced4da; /* Cor de borda leve */
    border-radius: 0.25rem;
    background-color: #343a40; /* Fundo escuro consistente */
    color: #ffffff; /* Texto branco */
    transition: all 0.2s ease-in-out;
  }
  
  .form-select:hover,
  .form-select:focus {
    border-color: #007bff; /* Muda a borda ao focar */
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Efeito de foco */
  }
  
  .form-select option {
    color: #000; /* Torna o texto das opções em preto */
  }
  
  .form-select.text-white {
    color: #ffffff; /* Mantém o texto branco no seletor */
  }
  
  /* Estilos do Kanban */
  .kanban-container {
    display: flex;
    flex-wrap: nowrap; /* Impede que as colunas quebrem para a próxima linha */
    overflow-x: auto; /* Adiciona a barra de rolagem horizontal */
    gap: 10px; /* Adiciona espaçamento entre as colunas */
    padding: 1rem; /* Adiciona espaçamento interno */
  
  }
  
  .kanban-column {
    flex: 1 1 32%;
    min-width: 300px;
    min-height: 300px;
    border-radius: 0.5rem;
    background-color: #f8f9fa;
    padding: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    margin: 0; /* Remove margin lateral adicional */
  
  }
  
  .kanban-header {
    padding: 0.75rem;
    border-radius: 0.25rem;
    text-align: center;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .kanban-item {
    margin-bottom: 1rem;
    background-color: #fff;
    border-radius: 5px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
  }
  
  .kanban-item:hover {
    transform: translateY(-5px);
  }
  
  .kanban-item p {
    margin: 0.5rem 0;
  }
  
  .kanban-item button {
    margin-top: 1rem;
  }
  
  /* Cores para cada categoria */
  .bg-warning {
    background-color: #ffee00 !important;
  }
  
  .bg-danger {
    background-color: #f44336 !important;
  }
  
  .bg-primary {
    background-color: #2196f3 !important;
  }
  
  /* Responsividade */
  @media (max-width: 1024px) {
    .kanban-column {
      width: 48%;
    }
  }
  
  @media (max-width: 768px) {
    .kanban-column {
      width: 100%;
      margin: 0.5rem 0;
    }
  
    .kanban-header {
      font-size: 1.25rem;
      padding: 0.5rem;
    }
  
    .kanban-item {
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  
    .kanban-item p {
      font-size: 0.9rem;
    }
  }
  
  /* Drag and Drop */
  .kanban-column {
    position: relative;
    padding-bottom: 2rem;
  }
  
  .kanban-item[draggable="true"]:hover {
    cursor: grabbing;
  }
  
  /* Estilo adicional */
  .bg-dark {
    --bs-bg-opacity: 1;
    background-color: #007bff !important;
  }
  .mt-2 {
    margin-top: 8px;
  }
  
  .btn {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .btn-warning {
    background-color: #039ef7;
    border: 1px solid #fff;
    color: #fff;
  }
  
  .btn-warning:hover {
    background-color: #0855bb;
    color: #000;
  }
  
  .btn-sm {
    font-size: 0.875rem;
    padding: 6px 10px;
  }
  
  .ml-2 {
    margin-left: 8px;
  }
  /* Alinha o botão à direita */
.button-container {
  display: flex;
  justify-content: flex-end; /* Alinha os itens à direita */
  margin-top: 1rem; /* Espaço superior para o botão */
}

/* Estilo do botão */
.button-container .btn-warning {
  background-color: #198754;
  border: 1px solid #fff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-container .btn-warning:hover {
  background-color: #036127;
  color: #000;
}

  </style>
  
  