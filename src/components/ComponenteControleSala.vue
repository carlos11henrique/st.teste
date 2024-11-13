uer outro estilo que você prefira para criar um efeito de pop-up.
Aqui está como você pode modificar o código:

html
Copiar código
<template>
  <!-- Tabela de Salas -->
  <div v-if="mostrarTabelaSalas" class="table-container p-3">
    <h2>Tabela de salas cadastradas</h2>
    <input type="text" v-model="filtroPesquisa" placeholder="Pesquisa por salas ou laboratórios cadastrados" class="form-control mb-3" />
    
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Bloco</th>
          <th>Nome/Número da sala</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody v-if="salas.length > 0">
        <tr v-for="sala in salasFiltradas" :key="sala.id">
          <td>{{ sala.bloco_id }}</td>
          <td>{{ sala.numero_sala }}</td>
          <td>
            <button class="btn btn-warning btn-sm" @click="editarSala(sala)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="removerSala(sala.id)">Remover</button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="4">Nenhuma sala encontrada</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal de Edição -->
  <div v-if="salaEmEdicao" class="modal" tabindex="-1" role="dialog" style="display: block;">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Sala</h5>
          <button type="button" class="close" @click="cancelarEdicao">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvarEdicao">
            <div class="form-group">
              <label for="editBloco">Bloco</label>
              <input type="text" id="editBloco" v-model="salaEmEdicao.bloco_id" class="form-control" />
            </div>
            <div class="form-group">
              <label for="editNumero">Nome / Número da Sala</label>
              <input type="text" id="editNumero" v-model="salaEmEdicao.numero_sala" class="form-control" />
            </div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn btn-secondary" @click="cancelarEdicao">Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'ComponenteControleUsuario',
  data() {
    return {
      mostrarCadastroSala: true,
      mostrarTabelaSalas: true,
      filtroPesquisa: '',
      salas: [],
      salaEmEdicao: null,
    };
  },
  computed: {
    salasFiltradas() {
      return this.salas.filter((sala) => {
        const bloco = sala.bloco_id ? String(sala.bloco_id) : ''; 
        const numero = sala.numero_sala ? String(sala.numero_sala) : ''; 

        return (
          bloco.toLowerCase().includes(this.filtroPesquisa.toLowerCase()) ||
          numero.toLowerCase().includes(this.filtroPesquisa.toLowerCase())
        );
      });
    },
  },
  methods: {
    async carregarSalas() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get("http://localhost:3000/salas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.salas = resposta.data;
      } catch (error) {
        console.error("Erro ao carregar salas:", error);
      }
    },

    editarSala(sala) {
      this.salaEmEdicao = { ...sala }; // Cria uma cópia da sala para edição
    },

    async salvarEdicao() {
      const token = localStorage.getItem("token");
      try {
        // Requisição PUT para atualizar a sala
        await axios.put(`http://localhost:3000/salas/${this.salaEmEdicao.id}`, this.salaEmEdicao, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Atualiza a lista de salas
        const index = this.salas.findIndex(sala => sala.id === this.salaEmEdicao.id);
        if (index !== -1) {
          this.salas[index] = { ...this.salaEmEdicao }; // Atualiza a sala editada
        }
        this.salaEmEdicao = null; // Limpa a sala em edição
      } catch (error) {
        console.error("Erro ao salvar a edição da sala:", error);
      }
    },

    cancelarEdicao() {
      this.salaEmEdicao = null; // Cancela a edição
    },

    async removerSala(id) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`http://localhost:3000/salas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.salas = this.salas.filter(sala => sala.id !== id);
      } catch (error) {
        console.error("Erro ao remover sala:", error);
      }
    },
  },
  mounted() {
    this.carregarSalas();
  },
  props: {
    filterOcupacao: {
      type: String,
      required: false,
    },
}
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