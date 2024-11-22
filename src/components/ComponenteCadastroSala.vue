<template>
  <div v-if="mostrarCadastroSala" class="table-container p-3">
    <form @submit.prevent="adicionarSala" class="mb-4">
      <h2>Cadastrar Salas</h2>
      <div class="form-group">
        <label for="bloco">Bloco da sala</label>
        <select id="bloco" v-model="novoBlocoId" class="form-control" required>
          <option value="" disabled>Selecione um bloco</option>
          <option v-for="bloco in blocos" :key="bloco.id" :value="bloco.id">
            {{ bloco.nome_bloco }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="numero">Número da sala</label>
        <input
          type="text"
          id="numero"
          v-model="novoNumero"
          placeholder="Digite o número da sala"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="nome-sala">Nome da sala</label>
        <input
          type="text"
          id="nome-sala"
          v-model="novoNomeSala"
          placeholder="Digite o nome da sala"
          class="form-control"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Adicionar Sala</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2"; // Importando o SweetAlert2

export default {
  name: "ComponenteCadastroSala",
  data() {
    return {
      mostrarCadastroSala: true,
      novoNumero: "",
      novoNomeSala: "", // Novo campo para o nome da sala
      novoBlocoId: null, // ID do bloco selecionado
      blocos: [], // Lista de blocos disponíveis
      salas: []
    };
  },
  created() {
    this.carregarBlocos(); // Carregar os blocos existentes ao criar o componente
  },
  methods: {
    // Função para carregar os blocos disponíveis do servidor
    async carregarBlocos() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Erro", "Token não encontrado. Faça login novamente.", "error");
          return;
        }
        const resposta = await axios.get("http://localhost:3000/blocos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.blocos = resposta.data;
      } catch (error) {
        console.error("Erro ao carregar blocos:", error.response ? error.response.data : error.message);
        Swal.fire("Erro", "Erro ao carregar blocos.", "error");
      }
    },
    // Função para adicionar uma nova sala
    async adicionarSala() {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Erro", "Token não encontrado. Faça login novamente.", "error");
        return;
      }

      const novaSala = {
        bloco_id: this.novoBlocoId,
        numero_sala: this.novoNumero,
        nome_sala: this.novoNomeSala // Inclui o nome da sala
      };

      try {
        const resposta = await axios.post("http://localhost:3000/salas", novaSala, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.salas.push(resposta.data);

        // Alerta de sucesso usando SweetAlert2
        Swal.fire("Sucesso!", "Sala cadastrada com sucesso!", "success");

        this.resetarFormulario();
      } catch (error) {
        console.error("Erro ao adicionar sala:", error.response ? error.response.data : error.message);

        // Exibir detalhes de erro completos
        const errorMessage = error.response?.data?.message || "Erro desconhecido. Tente novamente mais tarde.";
        Swal.fire("Erro", `Erro ao cadastrar sala: ${errorMessage}`, "error");

        if (error.response && error.response.status === 500) {
          console.log("Erro 500 - Erro Interno do Servidor: Verifique os logs do servidor para mais detalhes.");
        }
      }
    },
    // Função para resetar o formulário
    resetarFormulario() {
      this.novoNumero = "";
      this.novoNomeSala = ""; // Resetar o nome da sala
      this.novoBlocoId = null;
    }
  }
};
</script>

<style scoped>
.table-container {
  max-width: 1400px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

button {
  display: block;
  width: 20%;
  margin-top: 25px;
}
</style>
