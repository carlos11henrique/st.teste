<template>
  <div class="problem-report-container">
    <!-- Lado esquerdo com imagem e gradiente -->
    <div class="left-side">
      <div class="bubbles">
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
      </div>
      <img src="/images/ST.png" alt="Logotipo" />
    </div>

    <!-- Lado direito com o formulário -->
    <div class="right-side">
      <div class="report-box">
        <h2>Informe seu problema</h2>

        <!-- Seletor de tipo de problema -->
        <b-form-group label="Selecione o problema" label-for="problema">
          <b-form-select v-model="problema" id="problema">
            <option value="" disabled>Selecione um problema</option>
            <option v-for="(problema, index) in problemas" :key="index" :value="problema.id">
              {{ problema.descricao }}
            </option>
          </b-form-select>
        </b-form-group>

        <!-- Campo para descrição do problema -->
        <b-form-group
          v-if="problemas.some(p => (p.descricao === 'outros' || p.descricao === 'Computadores e Periféricos' || p.descricao === 'Softwares e Programas Específicos') && (p.id === problema))"
          label="Descreva o problema específico"
          label-for="descricaoProblema"
        >
          <b-form-input
            v-model="descricaoProblema"
            id="descricaoProblema"
            placeholder="Digite mais detalhes sobre o problema"
          ></b-form-input>
        </b-form-group>

        <!-- Caixa de pesquisa para código do equipamento -->
        <b-form-group label="Código do Equipamento" label-for="codigoEquipamento">
          <b-form-input
            v-model="codigoEquipamento"
            id="codigoEquipamento"
            placeholder="Digite o código ou nome da máquina"
            @input="filterEquipamentos"
          ></b-form-input>
          <b-list-group v-if="filteredEquipamentos.length > 0" class="mt-2">
            <b-list-group-item
              v-for="equipamento in filteredEquipamentos"
              :key="equipamento.numero_maquina"
              @click="selectEquipamento(equipamento)"
              class="clickable-item"
            >
              {{ equipamento.numero_maquina }} - {{ equipamento.descricao }}
            </b-list-group-item>
          </b-list-group>
        </b-form-group>

        <!-- Seletor de bloco da sala -->
        <b-form-group label="Bloco da Sala*" label-for="blocodasala">
          <b-form-select v-model="blocodaSala" id="blocodasala" @change="updateSalas($event)">
            <option value="" disabled>Selecione um bloco</option>
            <option v-for="(bloco, index) in blocos" :key="index" :value="bloco.id">
              {{ bloco.nome_bloco }}
            </option>
          </b-form-select>
        </b-form-group>

        <!-- Seletor de número da sala -->
        <b-form-group v-if="blocodaSala" label="Selecione a Sala*" label-for="numerodaSala">
          <b-form-select v-model="numerodaSala" id="numerodaSala">
            <option value="" disabled>Selecione a sala</option>
            <option v-for="sala in salas" :key="sala.id" :value="sala.id">
              {{ sala.numero_sala }}
            </option>
          </b-form-select>
        </b-form-group>

        <!-- Botão de submissão -->
        <b-button
          type="submit"
          variant="primary"
          class="w-100 my-3"
          @click="reportProblem"
        >
          Relatar Problema
        </b-button>

        <!-- Link para voltar -->
        <div class="text-center mt-3">
          <router-link to="/" class="btn btn-link">Voltar à página inicial</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";

export default {
  data() {
    return {
      problema: "",
      problemas: [],
      blocodaSala: "",
      numerodaSala: "",
      codigoEquipamento: "", // Código da máquina
      salas: [],
      blocos: [],
      descricaoProblema: "",
      equipamentos: [],
      filteredEquipamentos: [],
      setor_id: "1", // Setor fixo como ADMINISTRACAO
    };
  },
  mounted() {
    this.fetchBlocos();
    this.exibirProblema();
    this.carregarEquipamentos();
  },
  methods: {
    async carregarEquipamentos() {
      const token = localStorage.getItem("token");
      try {
        const resposta = await axios.get("http://localhost:3000/maquinas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.equipamentos = resposta.data;
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
        Swal.fire("Erro", "Não foi possível carregar as máquinas.", "error");
      }
    },
    fetchBlocos(event) {
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:3000/blocos/com/salas", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.blocos = response.data;
        })
        .catch((error) => {
          console.error("Erro ao carregar blocos:", error);
          Swal.fire("Erro", "Não foi possível carregar os blocos.", "error");
        });
    },
    updateSalas(value) {
      const bloco = this.blocos.find((bloco) => bloco.id === value);
      this.salas = bloco ? bloco.salas : [];
      this.numerodaSala = "";
    },
    async exibirProblema() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/problemas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.problemas = response.data;
      } catch (error) {
        console.error("Erro ao exibir problema:", error);
        Swal.fire("Erro", "Não foi possível exibir o problema.", "error");
      }
    },
    filterEquipamentos() {
      const searchTerm = this.codigoEquipamento.toLowerCase();
      this.filteredEquipamentos = searchTerm
        ? this.equipamentos.filter(
            (equipamento) =>
              equipamento.numero_maquina.toLowerCase().includes(searchTerm) ||
              equipamento.descricao.toLowerCase().includes(searchTerm)
          )
        : [];
    },
    selectEquipamento(equipamento) {
      this.codigoEquipamento = equipamento.numero_maquina;
      this.filteredEquipamentos = [];
    },
    limparFormulario() {
      this.problema = "";
      this.blocodaSala = "";
      this.numerodaSala = "";
      this.codigoEquipamento = "";
      this.descricaoProblema = "";
      this.filteredEquipamentos = [];
    },
    async cadastrarChamado() {
      const token = localStorage.getItem("token");
      const chamado = {
        problema_id: this.problema,
        bloco_id: this.blocodaSala,
        sala_id: this.numerodaSala,
        descricao: this.descricaoProblema || "",
        maquina_id: this.codigoEquipamento,
        setor_id: this.setor_id,
      };

      try {
        await axios.post("http://localhost:3000/chamados", chamado, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Sucesso", "Chamado cadastrado com sucesso!", "success");
        this.limparFormulario();
      } catch (error) {
        console.error("Erro ao cadastrar chamado:", error);
        Swal.fire("Erro", "Não foi possível cadastrar o chamado.", "error");
      }
    },
    reportProblem() {
      // Verificação dos campos obrigatórios
      if (this.blocodaSala && this.numerodaSala && this.problema && this.codigoEquipamento) {
        // Exibe o resumo do chamado antes da confirmação
        Swal.fire({
          title: 'Revise seu Chamado',
          html: `
            <p><strong>Problema:</strong> ${this.problema}</p>
            <p><strong>Bloco da Sala:</strong> ${this.blocodaSala}</p>
            <p><strong>Sala:</strong> ${this.numerodaSala}</p>
            <p><strong>Código do Equipamento:</strong> ${this.codigoEquipamento}</p>
            <p><strong>Descrição do Problema:</strong> ${this.descricaoProblema || 'Nenhuma descrição fornecida'}</p>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Confirmar Chamado',
          cancelButtonText: 'Editar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Se o usuário confirmar, chama o método para cadastrar o chamado
            this.cadastrarChamado().then(() => {
              // Redireciona para a página '/openchamando' após o sucesso
              this.$router.push('/openchamando');
            });
          }
        });
      } else {
        Swal.fire("Erro", "Preencha todos os campos obrigatórios.", "error");
      }
    },
  },
};
</script>

<style scoped>
/* Reset básico */
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: Arial, sans-serif;
}

.problem-report-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  flex-direction: row;
}

/* Lado esquerdo com imagem e gradiente */
.left-side {
  flex: 1;
  background: linear-gradient(to bottom, #0575e6, #02298a, #021b79);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.left-side img {
  max-width: 80%;
  z-index: 2;
}

.bubbles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  bottom: -50px;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: bubble 6s infinite ease-in-out;
}

.bubble:nth-child(1) {
  left: 20%;
  width: 60px;
  height: 60px;
  animation-duration: 8s;
}

.bubble:nth-child(2) {
  left: 50%;
  animation-duration: 5s;
}

.bubble:nth-child(3) {
  left: 70%;
  width: 80px;
  height: 80px;
  animation-duration: 9s;
}

.bubble:nth-child(4) {
  left: 90%;
  width: 50px;
  height: 50px;
  animation-duration: 7s;
}

.bubble:nth-child(5) {
  left: 30%;
  animation-duration: 10s;
}

@keyframes bubble {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-300px) scale(1.2);
  }
  100% {
    transform: translateY(-600px) scale(0.8);
  }
}

/* Lado direito com formulário */
.right-side {
  flex: 2;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.report-box {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
}

.report-box h2 {
  color: #0738b3;
  text-align: center;
  margin-bottom: 20px;
}

.report-box label {
  font-weight: bold;
}

.report-box input,
.report-box select,
.report-box textarea {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
}

.report-box textarea {
  resize: none;
}

.report-box button {
  width: 100%;
  padding: 12px;
  background-color: #02298a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.report-box button:hover {
  background-color: #0738b3;
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-item:hover {
  background-color: #f1f1f1;
}

/* Link para voltar */
.report-box .btn-link {
  color: #02298a;
  text-decoration: none;
  font-weight: bold;
}

.report-box .btn-link:hover {
  text-decoration: underline;
}

/* Responsividade */
@media screen and (max-width: 768px) {
  .problem-report-container {
    flex-direction: column;
    height: auto;
  }

  .left-side {
    height: 200px;
    flex: none;
  }

  .right-side {
    flex: none;
    padding: 10px;
  }

  .report-box {
    max-width: 90%;
  }
}

@media screen and (max-width: 480px) {
  .report-box h2 {
    font-size: 18px;
  }

  .report-box button {
    font-size: 14px;
    padding: 10px;
  }

  .left-side img {
    max-width: 70%;
  }
}
</style>
