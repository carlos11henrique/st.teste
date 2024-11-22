<template>
  <!-- Cabeçalho -->
  
  <!-- Estrutura principal com o Dashboard e Kanban -->
  <div class="d-flex">
    <!-- Sidebar (Dashboard) -->
    <div class="sidebar bg-primary text-white p-3 position-fixed" style="top: 0; bottom: 0; left: 0;">
      <h2>Menu</h2>
      <ul class="nav flex-column">
        <li class="nav-item" :class="{'active': selectedComponent === 'ComponenteHome'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteHome')" href="#">Home</a>
        </li>
        <li class="nav-item" :class="{'active': selectedComponent === 'ComponenteKaban'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteKaban')" href="#">Kanban</a>
        </li>
        <li  v-if="role === ROLES.NOA" class="nav-item" :class="{'active': selectedComponent === 'ComponenteCadastro'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteCadastro')" href="#">Cadastrar usuário</a>
        </li>
        <li v-if="role === ROLES.NOA" class="nav-item" :class="{'active': selectedComponent === 'ComponenteCadastroSala'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteCadastroSala')" href="#">Cadastrar Sala</a>
        </li>
        <li class="nav-item" :class="{'active': selectedComponent === 'ComponenteCadastroEquipamento'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteCadastroEquipamento')" href="#">Cadastrar Equipamento</a>
        </li>
        <li v-if="role === ROLES.NOA" class="nav-item" :class="{'active': selectedComponent === 'ComponenteControleUsuario'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteControleUsuario')" href="#">Controle de Usuários</a>
        </li>
        <li class="nav-item" :class="{'active': selectedComponent === 'ComponenteControleEquipamento'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteControleEquipamento')" href="#">Controle de Equipamentos</a>
        </li>
        <li v-if="role === ROLES.NOA" class="nav-item" :class="{'active': selectedComponent === 'ComponenteControleSala'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteControleSala')" href="#">Controle de Salas</a>
        </li>
        <li class="nav-item" :class="{'active': selectedComponent === 'ComponenteHistoricoChamados'}">
          <a class="nav-link text-white" @click="setComponent('ComponenteHistoricoChamados')" href="#">Historico de Chamados</a>
        </li>
      </ul>

      <!-- Botão de Logout -->
      <div class="mt-4 pt-2 border-top">
        <button @click="confirmLogout" class="btn btn-danger w-100 custom-logout-button">Sair</button>
      </div>
    </div>

    <!-- Conteúdo dinâmico (componente selecionado) -->
    <div class="content-container p-3" style="margin-left: 250px;">
      <component :is="selectedComponent" />
    </div>
  </div>
</template>

<script>
import { ROLES } from '../util/roles';

import ComponenteHome from './ComponenteHome.vue';
import ComponenteKaban from './ComponenteKaban.vue';
import ComponenteCadastro from './ComponenteCadastro.vue';
import ComponenteControleSala from './ComponenteControleSala.vue';
import ComponenteControleUsuario from './ComponenteControleUsuario.vue';
import ComponenteCadastroSala from './ComponenteCadastroSala.vue';
import ComponenteCadastroEquipamento from './ComponenteCadastroEquipamento.vue';
import ComponenteControleEquipamento from './ComponenteControleEquipamento.vue';
import ComponenteHistoricoChamados from './ComponenteHistoricoChamados.vue';

import Swal from 'sweetalert2';

export default {
  components: {
    ComponenteCadastroSala,
    ComponenteHome,
    ComponenteKaban,
    ComponenteCadastro,
    ComponenteControleSala,
    ComponenteControleUsuario,
    ComponenteCadastroEquipamento,
    ComponenteControleEquipamento,
    ComponenteHistoricoChamados
  },
  data() {
    return {
      ROLES,
      role: null, // Inicialize como null ou com o valor padrão
      selectedComponent: 'ComponenteHome', // Componente inicial
    };
  },
  created() {
    // Simulação de carregamento de role, substitua com chamada real
    this.role = localStorage.getItem('role') || ROLES.USER; // Por exemplo, "NOA"
  },
  methods: {
    setComponent(componentName) {
      this.selectedComponent = componentName;
    },
    confirmLogout() {
      Swal.fire({
        title: 'Tem certeza?',
        text: 'Você deseja realmente sair da sua conta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.logout();
        }
      });
    },
    logout() {
      localStorage.removeItem('authToken'); // Remove o token do localStorage
      this.$router.push('/login'); // Redireciona para a página de login
    },
  },
  watch: {
    role(newRole) {
    },
  },
};
</script>



<style scoped>
/* Estilo principal */
.sidebar {
  width: 250px; /* Largura da sidebar em telas grandes */
  height: 100vh;
  position: fixed; /* Fixa a sidebar na tela */
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000; /* Garante que a sidebar fique acima do conteúdo */
  background-color: #f8f9fa; /* Cor de fundo */
  overflow-y: auto; /* Permite rolagem se o conteúdo exceder a altura */
  transition: transform 0.3s ease, width 0.3s ease; /* Transição suave */
}

/* Para telas médias e pequenas */
@media (max-width: 768px) {
  .sidebar {
    width: 200px; /* Reduz a largura da sidebar em telas médias */
  }

  .content-container {
    margin-left: 200px; /* Ajusta a margem do conteúdo */
  }
}

/* Para dispositivos menores, como celulares */
@media (max-width: 576px) {
  .sidebar {
    width: 100%; /* Sidebar ocupa toda a largura da tela */
    height: auto; /* Ajusta a altura ao conteúdo */
    position: static; /* Remove a posição fixa em telas pequenas */
    margin-bottom: 20px; /* Adiciona margem inferior para separar da parte inferior da tela */
  }

  .content-container {
    margin-left: 0; /* Remove a margem da sidebar */
    padding-top: 20px; /* Ajuste o padding superior para não colidir com o conteúdo da sidebar */
  }

  /* Opcionalmente, esconda a sidebar em dispositivos muito pequenos se necessário */
  .sidebar.hide {
    display: none; /* Esconde a sidebar se necessário */
  }
}

/* Estilo adicional para dispositivos muito pequenos */
@media (max-width: 480px) {
  .sidebar {
    padding: 10px; /* Adiciona padding para melhorar a estética */
  }

  .custom-logout-button {
    font-size: 1rem; /* Ajusta o tamanho do botão de logout */
  }

  .nav-link {
    font-size: 0.9rem; /* Ajusta o tamanho dos links */
  }
}

.content-container {
  flex: 1;
  padding: 20px;
}

.custom-logout-button {
  font-weight: bold;
  font-size: 1.1rem;
}

.nav-item.active .nav-link {
  background-color: #0066ff; /* Cor de destaque para o item ativo */
}

.nav-link {
  transition: background-color 0.3s ease; /* Adiciona uma transição suave */
}

.nav-link:hover {
  background-color: #044e9c; /* Cor para hover */
}

.nav-item.active .nav-link {
  background-color: #0000003b; /* Cor de fundo para item ativo */
  font-weight: bold; /* Destaca o texto do item ativo */
}
.bg-primary {
    --bs-bg-opacity: 1;
     background: linear-gradient(to bottom, #0575e6, #02298a, #021b79);;
}
</style>
