<template>
    <div v-if="mostrarFormulario" class="form-container">
      <h2>Cadastrar Equipamento</h2>
      <form @submit.prevent="cadastrarEquipamento">
        <!-- Seleção de Equipamento -->
        <div class="form-group">
          <label for="equipamento">Tipo de Equipamento:</label>
          <select v-model="novoEquipamento.tipo" id="equipamento" required>
            <option value="" disabled selected>Selecione um equipamento</option>
            <option value="Computador">Computador</option>
            <option value="Monitor">Monitor</option>
            <option value="Ar-condicionado">Ar-condicionado</option>
            <option value="Teclado">Teclado</option>
            <option value="Mouse">Mouse</option>
          </select>
        </div>
  
        <!-- Campos de Localização -->
        <div class="form-group">
          <label for="bloco">Bloco:</label>
          <input type="text" v-model="novoEquipamento.bloco" id="bloco" required />
        </div>
  
        <div class="form-group">
          <label for="sala">Sala:</label>
          <input type="text" v-model="novoEquipamento.sala" id="sala" required />
        </div>
  
        <button type="submit" class="btn btn-primary">Cadastrar</button>
      </form>
    </div>
  </template>
  
  <script>
  import jsPDF from "jspdf";
  
  export default {
    data() {
      return {
        mostrarFormulario: true,
        novoEquipamento: {
          tipo: "",
          bloco: "",
          sala: "",
        },
        equipamentos: [],
        proximoId: 1,
      };
    },
    methods: {
      cadastrarEquipamento() {
        if (!this.novoEquipamento.tipo || !this.novoEquipamento.bloco || !this.novoEquipamento.sala) {
          alert("Preencha todos os campos.");
          return;
        }
  
        // Adicionar equipamento à lista de equipamentos (se necessário)
        const novo = {
          id: this.proximoId++,
          tipo: this.novoEquipamento.tipo,
          bloco: this.novoEquipamento.bloco,
          sala: this.novoEquipamento.sala,
        };
        this.equipamentos.push(novo);
  
        // Resetar o formulário
        this.novoEquipamento.tipo = "";
        this.novoEquipamento.bloco = "";
        this.novoEquipamento.sala = "";
      }
    },
  };
  </script>
  
  <style scoped>
  .form-container {
    max-width: 400px;
    margin: 0 auto;
  }
  </style>
  