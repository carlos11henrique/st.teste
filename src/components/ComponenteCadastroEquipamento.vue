<template>
  <div v-if="mostrarFormulario" class="form-container">
    <h2>Cadastrar Equipamento</h2>
    <form @submit.prevent="cadastrarEquipamento">
      <!-- Número da Máquina -->
      <div class="form-group">
        <label for="numero_maquina">Código da Máquina:</label>
        <input
          v-model="novoEquipamento.numero_maquina"
          type="text"
          id="numero_maquina"
          required
          placeholder="Ex: MAQ"
        />
      </div>

      <!-- Seleção de Equipamento -->
      <div class="form-group">
        <label for="equipamento">Tipo de Equipamento:</label>
        <select v-model="novoEquipamento.tipo_equipamento" id="equipamento" required>
          <option value="" disabled selected>Selecione um equipamento</option>
          <option value="Computador">Computador</option>
          <option value="Monitor">Monitor</option>
          <option value="Ar-condicionado">Ar-condicionado</option>
          <option value="Teclado">Teclado</option>
          <option value="Mouse">Mouse</option>
          <option value="Caixa de Som">Caixa de Som</option>
          <option value="Projetores">Projetores</option>
        </select>
      </div>

      <!-- Campo de Descrição do Equipamento -->
      <div class="form-group">
        <label for="descricao">Descrição do Equipamento:</label>
        <textarea v-model="novoEquipamento.descricao" id="descricao" required></textarea>
      </div>

      <!-- Seleção de Bloco -->
      <div class="form-group">
        <label for="bloco">Bloco:</label>
        <select v-model="novoEquipamento.bloco" id="bloco" required @change="filtrarSalasPorBloco" :disabled="isLoading || !blocos.length">
          <option value="" disabled selected>Selecione um bloco</option>
          <option v-for="bloco in blocos" :key="bloco.id" :value="bloco.id">{{ bloco.nome_bloco }}</option>
        </select>
      </div>

      <!-- Seleção de Sala -->
      <div class="form-group">
        <label for="sala">Sala:</label>
        <select v-model="novoEquipamento.sala_id" id="sala" required :disabled="!novoEquipamento.bloco || isLoading">
          <option value="" disabled selected>Selecione uma sala</option>
          <option v-for="sala in salasFiltradas" :key="sala.id" :value="sala.id">{{ sala.numero_sala }}</option>
        </select>
      </div>

      <!-- Campo de Quantidade -->
      <div class="form-group">
        <label for="quantidade">Quantidade:</label>
        <input
          v-model="quantidade"
          id="quantidade"
          type="number"
          min="1"
          class="form-control"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isLoading || !isFormValid">Cadastrar</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      mostrarFormulario: true,
      isLoading: false,
      quantidade: 1, // Quantidade para cadastro em massa
      novoEquipamento: {
        numero_maquina: "",
        tipo_equipamento: "",
        descricao: "",
        bloco: "",
        sala_id: "",
      },
      blocos: [],
      salasFiltradas: [],
    };
  },
  computed: {
    isFormValid() {
      return (
        this.novoEquipamento.numero_maquina &&
        this.novoEquipamento.tipo_equipamento &&
        this.novoEquipamento.descricao &&
        this.novoEquipamento.sala_id &&
        this.quantidade > 0
      );
    },
  },
  methods: {
    async carregarBlocos() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Erro", "Token não encontrado. Faça login novamente.", "error");
          return;
        }

        const resposta = await axios.get("http://localhost:3000/blocos/com/salas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resposta.data && Array.isArray(resposta.data)) {
          this.blocos = resposta.data;
        } else {
          Swal.fire("Erro", "Erro ao carregar blocos.", "error");
        }
      } catch (error) {
        Swal.fire("Erro", "Erro ao carregar blocos.", "error");
      }
    },

    filtrarSalasPorBloco() {
      const blocoSelecionado = this.blocos.find(
        (bloco) => bloco.id === this.novoEquipamento.bloco
      );
      this.salasFiltradas = blocoSelecionado ? blocoSelecionado.salas : [];

      if (!this.salasFiltradas.length) {
        Swal.fire("Aviso", "Não há salas para o bloco selecionado.", "warning");
      }
    },

    async cadastrarEquipamento() {
      if (!this.isFormValid) {
        Swal.fire("Erro", "Preencha todos os campos obrigatórios.", "error");
        return;
      }

      const numeroBase = this.novoEquipamento.numero_maquina;
      const cadastros = [];

      for (let i = 1; i <= this.quantidade; i++) {
        const numeroSequencial = `${numeroBase}-${i}`;
        cadastros.push({
          numero_maquina: numeroSequencial,
          tipo_equipamento: this.novoEquipamento.tipo_equipamento,
          descricao: this.novoEquipamento.descricao,
          sala_id: this.novoEquipamento.sala_id,
        });
      }

      this.isLoading = true;

      try {
        const token = localStorage.getItem("token");
        for (const equipamento of cadastros) {
          await axios.post(
            "http://localhost:3000/maquinas",
            equipamento,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        Swal.fire("Sucesso", "Todos os equipamentos foram cadastrados com sucesso!", "success");
        this.novoEquipamento = {
          numero_maquina: "",
          tipo_equipamento: "",
          descricao: "",
          sala_id: "",
          bloco: "",
        };
        this.quantidade = 1;
        this.salasFiltradas = [];
      } catch (error) {
        Swal.fire("Erro", "Erro ao cadastrar os equipamentos. Tente novamente mais tarde.", "error");
      } finally {
        this.isLoading = false;
      }
    },
  },
  created() {
    this.carregarBlocos();
  },
};
</script>




<style scoped>
.form-container {
  max-width: 1500px;
  margin: 0 auto;
}
textarea {
  width: 100%;
}

</style>
