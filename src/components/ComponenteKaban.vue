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

  <div class="kanban-container">
    <!-- Tabelas do Kanban -->

    <div v-if="role === ROLES.NOA" class="kanban-column">
      <div v-show="mostrarTodosChamados || categoriaVisivel === 'Analise'" id="Análise" @drop="drop($event)" @dragover="allowDrop">
        <h3 class="kanban-header bg-secondary text-white p-2 text-center">Análise</h3>
        <div v-for="chamado in chamadosAnalise" :key="chamado.id" :id="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
          <p><strong>Setor:</strong> {{ chamado.setor }}</p>
          <p><strong>E-mail:</strong> {{ chamado.email }}</p>
          <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
          <p><em>Problema:</em> {{ chamado.problema }}</p>
          <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
          <p><em>Bloco:</em> {{ chamado.bloco }}</p>
          <p><em>Sala:</em> {{ chamado.sala }}</p>
          <p><em>Máquinas:</em> {{ chamado.maquina }}</p>

          <!-- Botões para alterar o setor -->
          <div class="mt-2">
            <button class="btn btn-warning btn-sm" @click="alterarSetor(chamado, 2)">Alterar para TI</button>
            <button class="btn btn-warning btn-sm ml-2" @click="alterarSetor(chamado, 3)">Alterar para Manutenção</button>
          </div>
          <button class="btn btn-danger btn-sm" @click="confirmarRemocao(chamado.id)">Remover</button>
        </div>
      </div>
    </div>

    <div v-show="mostrarTodosChamados || categoriaVisivel === 'Pendente'" id="Pendentes" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
      <h3 class="kanban-header bg-danger text-white p-2 text-center">Pendente</h3>
      <div v-for="chamado in chamadosPendentes" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
        <p><strong>Setor:</strong> {{ chamado.setor }}</p>
        <p><strong>E-mail:</strong> {{ chamado.email }}</p>
        <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
        <p><em>Problema:</em> {{ chamado.problema }}</p>
        <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
        <p><em>Bloco:</em> {{ chamado.bloco }}</p>
        <p><em>Sala:</em> {{ chamado.sala }}</p>
      </div>
    </div>

    <div v-show="mostrarTodosChamados || categoriaVisivel === 'Andamento'" id="Em Andamento" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
      <h3 class="kanban-header bg-primary text-white p-2 text-center">Andamento</h3>
      <div v-for="chamado in chamadosAndamento" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
        <p><strong>Setor:</strong> {{ chamado.setor }}</p>
        <p><strong>E-mail:</strong> {{ chamado.email }}</p>
        <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
        <p><em>Problema:</em> {{ chamado.problema }}</p>
        <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
        <p><em>Bloco:</em> {{ chamado.bloco }}</p>
        <p><em>Sala:</em> {{ chamado.sala }}</p>
      </div>
    </div>

    <div v-show="mostrarTodosChamados || categoriaVisivel === 'Concluído'" id="Concluido" class="kanban-column" @drop="drop($event)" @dragover="allowDrop">
      <h3 class="kanban-header bg-success text-white p-2 text-center">Concluído</h3>
      <div v-for="chamado in chamadosConcluidos" :key="chamado.id" class="kanban-item bg-light p-3 my-2" draggable="true" @dragstart="drag($event, chamado)">
        <p><strong>Setor:</strong> {{ chamado.setor }}</p>
        <p><strong>E-mail:</strong> {{ chamado.email }}</p>
        <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
        <p><em>Problema:</em> {{ chamado.problema }}</p>
        <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
        <p><em>Bloco:</em> {{ chamado.bloco }}</p>
        <p><em>Sala:</em> {{ chamado.sala }}</p>
        <button class="btn btn-danger btn-sm" @click="confirmarFinalizacao(chamado.id, chamado.status)">Finalizar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ROLES } from "../util/roles";
import Swal from 'sweetalert2';

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

    async alterarSetor(chamado, novoSetor) {
      chamado.setor_id = novoSetor;

      try {
        const token = localStorage.getItem("token");
        await axios.put(`http://localhost:3000/chamados/${chamado.id}`, chamado, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await this.carregarChamados();
        Swal.fire('Sucesso!', `O setor foi alterado para ${novoSetor}.`, 'success');
      } catch (erro) {
        console.error("Erro ao alterar setor:", erro);
        Swal.fire('Erro', 'Erro ao alterar o setor.', 'error');
      }
    },

    confirmarRemocao(chamadoId) {
    Swal.fire({
      title: 'Tem certeza que deseja finalizar?',
      text: "Esta ação moverá o chamado para o status 'Inválido'.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mudarStatus(chamadoId, 'Invalido');
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
  confirmarFinalizacao(chamadoId, statusAtual) {
    const novoStatus = statusAtual === "Concluído" ? "Finalizado" : "Finalizado";
    
    Swal.fire({
      title: 'Tem certeza que deseja finalizar?',
      text: `Esta ação moverá o chamado para o status '${novoStatus}'.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mudarStatus(chamadoId, novoStatus);
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
          headers: { Authorization: `Bearer ${token}` },
        });

        this.chamados = resposta.data;

        if (this.filterOcupacao !== "TODOS") {
          this.chamados = this.chamados.filter((chamado) => chamado.ocupacao === this.filterOcupacao);
        }

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
      statusMap[key] &&
      (statusMap[key] === event.target || statusMap[key].contains(event.target))
      );


      if (!status) return;

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
            headers: { Authorization: `Bearer ${token}` },
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

</style>

