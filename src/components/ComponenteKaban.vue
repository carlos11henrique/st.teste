<template>
  <!-- Tabelas do Kanban -->
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

  <!-- Tabelas do Kanban -->
  <div v-if="role === ROLES.NOA" class="kanban-column">
    <div v-show="mostrarTodosChamados || categoriaVisivel === 'Analise'" id="Análise" @drop="drop($event)" @dragover="allowDrop">
      <h3 class="kanban-header bg-secondary text-white p-2 text-center">Análise</h3>
      <div v-for="chamado in chamadosAnalise" :key="chamado.id" :id="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
        <p><strong>Nome:</strong> {{ chamado.nome_usuario }}</p>
        <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
        <p><em>Problema:</em> {{ chamado.problema }}</p>
        <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
        <p><em>Bloco:</em> {{ chamado.bloco }}</p>
        <p><em>Sala:</em> {{ chamado.sala }}</p>
        <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
        <button class="btn btn-danger btn-sm" @click="confirmarRemocao(chamado.id)">Remover</button>
        <div class="tags"></div>
      </div>
    </div>
  </div>

  <div v-show="mostrarTodosChamados || categoriaVisivel === 'Pendente'" id="Pendentes" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
    <h3 class="kanban-header bg-danger text-white p-2 text-center">Pendente</h3>
    <div v-for="chamado in chamadosPendentes" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
      <p><strong>Nome:</strong> {{ chamado.nome_usuario }}</p>
      <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
      <p><em>Problema:</em> {{ chamado.problema }}</p>
      <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
      <p><em>Bloco:</em> {{ chamado.bloco }}</p>
      <p><em>Sala:</em> {{ chamado.sala }}</p>
      <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
    </div>
  </div>

  <div v-show="mostrarTodosChamados || categoriaVisivel === 'Andamento'" id="Em Andamento" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
    <h3 class="kanban-header bg-primary text-white p-2 text-center">Andamento</h3>
    <div v-for="chamado in chamadosAndamento" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
      <p><strong>Setor:</strong> {{ chamado.setor }}</p>
      <p><strong>Nome:</strong> {{ chamado.nome_usuario }}</p>
      <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
      <p><em>Problema:</em> {{ chamado.problema }}</p>
      <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
      <p><em>Bloco:</em> {{ chamado.bloco }}</p>
      <p><em>Sala:</em> {{ chamado.sala }}</p>
      <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
    </div>
  </div>

  <div v-show="mostrarTodosChamados || categoriaVisivel === 'Concluído'" id="Concluido" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
    <h3 class="kanban-header bg-success text-white p-2 text-center">Concluído</h3>
    <div v-for="chamado in chamadosConcluidos" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
      <p><strong>Nome:</strong> {{ chamado.nome_usuario }}</p>
      <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
      <p><em>Problema:</em> {{ chamado.problema }}</p>
      <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
      <p><em>Bloco:</em> {{ chamado.bloco }}</p>
      <p><em>Sala:</em> {{ chamado.sala }}</p>
      <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
      <button class="btn btn-danger btn-sm" @click="confirmarRemocao(chamado.id)">Remover</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ROLES } from "../util/roles";
import Swal from 'sweetalert2';  // Certifique-se de importar o SweetAlert2

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
    };
  },
  methods: {
    async atualizarFiltro(event) {
      await this.carregarChamados();
    },

    confirmarRemocao(id) {
      Swal.fire({
        title: 'Tem certeza que deseja deletar?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deletarChamado(id);
        }
      });
    },

    deletarChamado(id) {
      this.chamadosAnalise = this.chamadosAnalise.filter(chamado => chamado.id !== id);
      Swal.fire('Deletado!', 'O chamado foi removido.', 'success');
    },

    async carregarChamados() {
      try {
        const token = localStorage.getItem("token");
        const resposta = await axios.get('http://localhost:3000/chamados', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.chamados = resposta.data;
        console.log(this.chamados);

        this.chamados = this.filterOcupacao !== "TODOS"
          ? this.chamados.filter((chamado) => chamado.ocupacao === this.filterOcupacao)
          : this.chamados;
        this.chamadosAnalise = this.chamados.filter((chamado) => chamado.status === "Análise");
        this.chamadosAndamento = this.chamados.filter((chamado) => chamado.status === "Em Andamento");
        this.chamadosConcluidos = this.chamados.filter((chamado) => chamado.status === "Concluido");
        this.chamadosPendentes = this.chamados.filter((chamado) => chamado.status === "Pendentes");
      } catch (erro) {
        console.error("Erro ao carregar os chamados:", erro);
      }
    },

    atualizarChamados() {
      setInterval(() => {
        this.carregarChamados();
      }, 1000 * 60);
    },

    allowDrop(event) {
      event.preventDefault();
    },

    drag(event, chamado) {
      event.dataTransfer.setData("chamado", JSON.stringify(chamado));
    },

    async drop(event) {
      const statusMap = {
        Pendentes: document.getElementById("Pendentes"),
        Análise: document.getElementById("Análise"),
        Concluido: document.getElementById("Concluido"),
        "Em Andamento": document.getElementById("Em Andamento"),
      };

      let status = Object.keys(statusMap).find((key) =>
        statusMap[key] === event.target || statusMap[key].contains(event.target)
      );

      if (!status) {
        return;
      }

      const chamado = JSON.parse(event.dataTransfer.getData("chamado"));
      chamado.status = status;

      const result = await Swal.fire({
        title: `Mover para ${status}?`,
        text: `Você deseja mudar o status do chamado para "${status}"?`,
        icon: "question",
        showCancelButton: true,
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.put(`http://localhost:3000/chamados/${chamado.id}`, chamado, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          await this.carregarChamados();
        } catch (erro) {
          console.error("Erro ao atualizar o chamado:", erro);
        }
      }
    },
  },
  mounted() {
    this.carregarChamados();
    this.atualizarChamados();
  },
};
</script>

<style scoped>

.kanban-column{
  width: 32%;
  margin: 0.5rem;
  display: inline-block;
  vertical-align: top;
  min-height: 300px;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.kanban-header {
  padding: 0.75rem;
  border-radius: 0.25rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
}

.kanban-item {
  background-color: #fff;
  border-radius: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  cursor: grab;
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
  background-color: #ffcc00 !important;
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

</style>
