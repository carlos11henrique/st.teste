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
      <!-- Seção Análise - sem drag e drop -->
      <div v-if="role === ROLES.NOA" class="kanban-column">
        <div v-show="mostrarTodosChamados || categoriaVisivel === 'Analise'" id="Análise">
          <h3 class="kanban-header bg-secondary text-white p-2 text-center">Análise</h3>
          <div v-for="chamado in chamadosAnalise" :key="chamado.id" class="kanban-item bg-light p-3 my-2">
            <p><strong>Setor:</strong> {{ chamado.setor }}</p>
            <p><strong>E-mail:</strong> {{ chamado.email }}</p>
            <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
            <p><em>Problema:</em> {{ chamado.problema }}</p>
            <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
            <p><em>Bloco:</em> {{ chamado.bloco }}</p>
            <p><em>Sala:</em> {{ chamado.sala }}</p>
            <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
          </div>
        </div>
      </div>
  
      <!-- Seção Concluído - sem drag e drop -->
      <div v-show="mostrarTodosChamados || categoriaVisivel === 'Concluído'" id="Concluido" class="kanban-column">
        <h3 class="kanban-header bg-success text-white p-2 text-center">Concluído</h3>
        <div v-for="chamado in chamadosConcluidos" :key="chamado.id" class="kanban-item bg-light p-3 my-2">
          <p><strong>Setor:</strong> {{ chamado.setor }}</p>
          <p><strong>E-mail:</strong> {{ chamado.email }}</p>
          <p><em>Ocupação:</em> {{ chamado.ocupacao }}</p>
          <p><em>Problema:</em> {{ chamado.problema }}</p>
          <p><em>Descrição:</em> {{ chamado.descricao_chamado }}</p>
          <p><em>Bloco:</em> {{ chamado.bloco }}</p>
          <p><em>Sala:</em> {{ chamado.sala }}</p>
          <p v-if="chamado.maquinas.length >= 1"><em>Maquina:</em> {{ chamado.maquinas.join(", ") }}</p>
          <button class="btn btn-success btn-sm" @click="ativarChamado(chamado.id)">Ativar</button>

        </div>

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
 
     // Função para alterar o setor de um chamado
     async alterarSetor(chamado, novoSetor) {
       chamado.setor_id = novoSetor; // Altera o setor localmente
       try {
         const token = localStorage.getItem("token");
         // Envia a atualização para o servidor
         await axios.put(`http://localhost:3000/chamados/${chamado.id}`, chamado, {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         });
         await this.carregarChamados(); // Recarrega os chamados após a alteração
         Swal.fire('Sucesso!', `O setor foi alterado para ${novoSetor}.`, 'success');
       } catch (erro) {
         if (erro.response) {
           console.error("Erro no servidor:", erro.response.data);
           Swal.fire('Erro', `Não foi possível alterar o setor. Detalhes: ${erro.response.data.error || 'Erro desconhecido'}`, 'error');
         } else {
           console.error("Erro desconhecido:", erro);
           Swal.fire('Erro', 'Não foi possível alterar o setor. Erro desconhecido.', 'error');
         }
       }
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

     // Função para ativar um chamado, movendo-o de "Concluído" para "Em Andamento"
     ativarChamado(id) {
       const chamadoParaAtivar = this.chamadosConcluidos.find(chamado => chamado.id === id);
       if (chamadoParaAtivar) {
         chamadoParaAtivar.status = "Em Andamento";
         this.chamadosConcluidos = this.chamadosConcluidos.filter(chamado => chamado.id !== id);
         this.chamadosAndamento.push(chamadoParaAtivar);
         Swal.fire('Sucesso!', 'Chamado ativado e movido para Em Andamento.', 'success');
         // Se necessário, faça uma atualização no servidor:
         // try {
         //   const token = localStorage.getItem("token");
         //   await axios.put(`http://localhost:3000/chamados/${id}`, chamadoParaAtivar, {
         //     headers: {
         //       Authorization: `Bearer ${token}`,
         //     },
         //   });
         // } catch (erro) {
         //   console.error("Erro ao ativar o chamado:", erro);
         //   Swal.fire('Erro', 'Não foi possível ativar o chamado.', 'error');
         // }
       }
     }
   },
   mounted() {
     this.carregarChamados();
     this.atualizarChamados();
   }
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
  
  