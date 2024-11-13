<template>
  <!-- Tabelas do Kanban -->
  <div v-show="mostrarTodosChamados || categoriaVisivel === 'Analise'" id="Análise" class="kanban-column"
    @drop="drop($event)" @dragover="allowDrop($event)">
    <h3 class="kanban-header bg-warning text-white p-2 text-center">
      ANÁLISE
    </h3>
    <div v-for="chamado in chamadosAnalise" :key="chamado.id" :id="chamado.id" class="kanban-item bg-light p-3 my-2"
      draggable="true" @dragstart="drag($event, chamado)">
      <p><strong>Setor:</strong> {{ chamado.setor }}</p>
      <p><strong>E-mail:</strong> {{ chamado.email }}</p>
      <p><strong>Ocupação:</strong> {{ chamado.ocupacao }}</p>
      <p><strong>Problema:</strong> {{ chamado.problema }}</p>
      <p><strong>Descrição:</strong> {{ chamado.descricao_chamado }}</p>
      <p><strong>Bloco:</strong> {{ chamado.bloco }}</p>
      <p><strong>Sala:</strong> {{ chamado.sala }}</p>
      <p v-if="chamado.maquinas.length >= 1"><em>Máquina(s):</em> {{ chamado.maquinas.join(", ") }}</p>
      <button class="btn btn-danger btn-sm" @click="confirmarRemocao(chamado.id)">Remover</button>
      <div class="tags"></div>
    </div>
  </div>
<div v-show="mostrarTodosChamados || categoriaVisivel === 'TI'" id="Pendentes" class="kanban-column" 
    @drop="drop($event)" @dragover="allowDrop($event)">
  <h3 class="kanban-header bg-danger text-white p-2 text-center">
    TI
  </h3>
  <div v-for="chamado in chamadosPendentes" :key="chamado.id" class="kanban-item bg-light p-3 my-2" 
      draggable="true" @dragstart="drag($event, chamado)">
    <p><strong>E-mail:</strong> {{ chamado.email }}</p>
    <p><strong>Ocupação:</strong> {{ chamado.ocupacao }}</p>
    <p><strong>Problema:</strong> {{ chamado.problema }}</p>
    <p><strong>Descrição:</strong> {{ chamado.descricao_chamado }}</p>
    <p><strong>Bloco:</strong> {{ chamado.bloco }}</p>
    <p><strong>Sala:</strong> {{ chamado.sala }}</p>
    <p v-if="chamado.maquinas.length >= 1"><em>Máquina(s):</em> {{ chamado.maquinas.join(", ") }}</p>
  </div>
</div>

<!-- Coluna Em Andamento -->
<div v-show="mostrarTodosChamados || categoriaVisivel === 'Andamento'" id="Em Andamento" class="kanban-column" 
    @drop="drop($event)" @dragover="allowDrop($event)">
  <h3 class="kanban-header bg-primary text-white p-2 text-center">
    MANUTENÇÃO
  </h3>
  <div v-for="chamado in chamadosAndamento" :key="chamado.id" class="kanban-item bg-light p-3 my-2" 
    draggable="true" @dragstart="drag($event, chamado)">
    <p><strong>E-mail:</strong> {{ chamado.email }}</p>
    <p><strong>Ocupação:</strong> {{ chamado.ocupacao }}</p>
    <p><strong>Problema:</strong> {{ chamado.problema }}</p>
    <p><strong>Descrição:</strong> {{ chamado.descricao_chamado }}</p>
    <p><strong>Bloco:</strong> {{ chamado.bloco }}</p>
    <p><strong>Sala:</strong> {{ chamado.sala }}</p>
    <p v-if="chamado.maquinas.length >= 1"><em>Máquina(s):</em> {{ chamado.maquinas.join(", ") }}</p>
  </div>
</div>
  <!-- Outras colunas aqui (Pendentes, Em Andamento, etc) -->

</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';  // Certifique-se de importar o SweetAlert2

export default {
  name: "ComponenteKaban",
  data() {
    return {
      filterOcupacao: "TODOS",
      chamadosAnalise: [],
      chamadosAndamento: [],
      chamadosConcluidos: [],
      chamadosPendentes: [],
      chamados: [],
      categoriaVisivel: '', // Controle da categoria visível
      mostrarTodosChamados: true, // Para exibir todos os chamados
    };
  },
  methods: {
    // Função para confirmar remoção de um chamado
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

    // Função que deleta o chamado
    deletarChamado(id) {
      this.chamadosAnalise = this.chamadosAnalise.filter(chamado => chamado.id !== id);
      Swal.fire('Deletado!', 'O chamado foi removido.', 'success');
    },

    // Atualiza a lista de chamados
    async atualizarFiltro() {
      await this.carregarChamados();
    },

    // Carrega os chamados da API
    async carregarChamados() {
      try {
        const token = localStorage.getItem("token");
        const resposta = await axios.get('http://localhost:3000/chamados', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.chamados = resposta.data;

        // Filtra os chamados conforme o filtro de ocupação
        this.chamados = this.filterOcupacao !== "TODOS"
          ? this.chamados.filter((chamado) => chamado.ocupacao === this.filterOcupacao)
          : this.chamados;

        // Classifica os chamados por status
        this.chamadosAnalise = this.chamados.filter((chamado) => chamado.status === "Análise");
        this.chamadosAndamento = this.chamados.filter((chamado) => chamado.status === "Em Andamento");
        this.chamadosConcluidos = this.chamados.filter((chamado) => chamado.status === "Concluido");
        this.chamadosPendentes = this.chamados.filter((chamado) => chamado.status === "Pendentes");

      } catch (erro) {
        console.error("Erro ao carregar os chamados:", erro);
      }
    },

    // Função chamada quando o componente é montado
    mounted() {
      this.carregarChamados();
      this.atualizarChamados();
    },

    // Atualiza a lista de chamados a cada 60 segundos
    atualizarChamados() {
      setInterval(() => {
        this.carregarChamados();
      }, 1000 * 60);
    },

    // Permite o drop de um item
    allowDrop(event) {
      event.preventDefault();
    },

    // Função chamada quando o item é arrastado
    drag(event, chamado) {
      event.dataTransfer.setData("chamado", JSON.stringify(chamado));
    },

    // Função chamada ao soltar o item
    async drop(event) {
      const statusMap = {
        'Pendentes': document.getElementById("Pendentes"),
        'Análise': document.getElementById("Análise"),
        'Concluido': document.getElementById("Concluido"),
        'Em Andamento': document.getElementById("Em Andamento")
      };

      let status = '';
      for (const [key, element] of Object.entries(statusMap)) {
        if (element === event.target || element.contains(event.target)) {
          status = key;
          break;
        }
      }

      event.preventDefault();
      const chamado = JSON.parse(event.dataTransfer.getData("chamado"));

      const result = await Swal.fire({
        title: "Você tem certeza?",
        text: "Você deseja mudar o status do chamado?",
        showCancelButton: true,
        icon: "question",
      });

      if (!result.isConfirmed) {
        return;
      }

      chamado.status = status;
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/chamados/${chamado.id}`, chamado, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await this.carregarChamados();
    },
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
