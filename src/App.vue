<template>
  <MainLayout>
    <div id="app">
      <MainMenu :data="types"/>
      <div class="root">
        <router-view v-if="isLoaded"/>
        <Spin size="large" fix v-else/>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import MainMenu from './components/MainMenu';

import axios from 'axios';

export default {
  components: { 
    MainMenu,
    MainLayout: () => import('@/../../Layout//Main')
  },
  computed: {
    types() {
      return this.$store.state.types;
    }
  },
  data() {
    return {
      isLoaded: false
    }
  },
  async mounted() {
    const error = await this.$store.dispatch("readBoards");

    if(error) {
      this.$Message.error("Произошла ошибка");
    }

    this.isLoaded = true;
    // const error = await this.$store.dispatch("readBoards");

    // if(error) {
    //   this.$Message.error("Произошла ошибка");
    // }

    // const departmentsError = await this.$store.dispatch("readDepartmentsTree");

    // if(departmentsError) {
    //   this.$Message.error("Произошла ошибка");
    //   return;
    // }

    if(this.$route.path === '/') {
      const lastBoardType = localStorage.getItem('lastBoardType');
      const lastBoardId = localStorage.getItem('lastBoardId');

      if(!!lastBoardType && !!lastBoardId) {
        this.$router.push(`/${lastBoardType}/${lastBoardId}`);
      }
      else {
        this.$router.push(`/private/all`);
      }
    }
    
    // this.isLoaded = true;
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  overflow: hidden;
}
body {
  background: rgb(250, 250, 250);
}
#app {
  display: flex;
}
.root {
  padding: 8px;
  flex: 1;
}
.ivu-checkbox {
  margin-right: 4px;
}
.ivu-poptip-arrow {
  display: none !important;
}
.ivu-spin.ivu-spin-large.ivu-spin-fix {
  background-color: rgba(0, 0, 0, 0);
}
</style>
