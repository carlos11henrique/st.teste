<template>
    <div v-if="mostrarCadastroSala" class="table-container p-3">
      <form @submit.prevent="adicionarSala" class="mb-4">
        <h2>Cadastrar Salas</h2>
        <div class="form-group">
          <label for="bloco">Bloco da sala</label>
          <select id="bloco" v-model="novoBlocoId" class="form-control" required>
            <option v-for="bloco in blocos" :key="bloco.id" :value="bloco.id">
              {{ bloco.nome }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="nome">Nome da sala</label>
          <input type="text" id="nome" v-model="novoNome" placeholder="Digite o nome da sala" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="numero">Número da sala</label>
          <input type="number" id="numero" v-model="novoNumero" placeholder="Digite o número da sala" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary">Adicionar Sala</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "ComponenteCadastroSala",
    data() {
      return {
        mostrarCadastroSala: true,
        novoNome: "",
        novoNumero: "",
        novoBlocoId: null, // ID do bloco selecionado
        blocos: [], // Lista de blocos disponíveis
        salas: []
      };
    },
    created(event) {

      this.carregarBlocos(); // Carregar os blocos existentes ao criar o componente
    },
    methods: {
      // Função para carregar os blocos disponíveis do servidor
      async carregarBlocos() {
        try {
          const token = localStorage.getItem("token");
          const resposta = await axios.get("http://localhost:3000/blocos", {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.blocos = resposta.data; 
        } catch (error) {
          console.error("Erro ao carregar blocos:", error);
          alert("Erro ao carregar blocos.");
        }
      },
      // Função para adicionar uma nova sala
      async adicionarSala() {
        const token = localStorage.getItem("token");
        const novaSala = {
          blocoId: this.novoBlocoId, // Associando a sala ao bloco selecionado
          nome: this.novoNome,
          numero: this.novoNumero
        };
  
        try {
          const resposta = await axios.post("http://localhost:3000/salas", novaSala, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.salas.push(resposta.data);
          this.resetarFormulario();
        } catch (error) {
          console.error("Erro ao adicionar sala:", error.response ? error.response.data : error.message);
          alert("Erro ao cadastrar sala. Tente novamente.");
        }
      },
      // Função para resetar o formulário
      resetarFormulario() {
        this.novoNome = "";
        this.novoNumero = "";
        this.novoBlocoId = null;
      }
    }
  };
  </script>
  