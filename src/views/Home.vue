<template>
  <div id="home">
    <div v-if="isLoaded">
      <Board
        v-for="board in boards" :key="board.id"
        :id="board.id"
        :image="board.bg_img"
        :color="board.bg_color"
        :name="board.name"
        :isReadOnly="!board.permissions.can_all"
        :onEditClick="() => handleEditClick(board)"
        :onArchiveClick="() => handleArchiveClick(board)"/>
    </div>

    <Spin size="large" fix v-else/>
    <router-view/>
  </div>
</template>

<script>
import Board from '../components/Board';

export default {
  components: { Board },
  computed: {
    boards() {
      const type = this.$route.params.type;
      const types = this.$store.state.types;

      const current = types.find(e => e.id === type);

      return !current ? [] : current.children;
    }
  },
  data() {
    return {
      isLoaded: false
    }
  },
  async mounted() {
    document.body.style.background = 'rgb(250, 250, 250)';

    const departmentsError = await this.$store.dispatch("readDepartmentsTree");

    if(departmentsError) {
      this.$Message.error("Произошла ошибка");
      return;
    }

    this.isLoaded = true;
  },
  methods: {
    handleEditClick(board) {
      this.$router.push({
        path: `/${this.$route.params.type}/manage`,
        query: { id: board.id }
      });
    },
    async handleArchiveClick(board) {
      this.$Modal.confirm({
        loading: true,
        title: "Архивировать",
        content: "<p>" + "Вы уверены, что хотите добавить доску в архив?" + "</p>",
        onOk: async () => {
          const error = await this.$store.dispatch('archiveBoard', { 
            id: board.id,
            type: this.$route.params.type
          });

          if(!error) {
            this.$Modal.remove();
          }
          else {
            this.$Message.error("Произошла ошибка");
          }
        }
      })
    }
  }
}
</script>

<style>
#home {
  height: calc(100% - 64px);
  overflow-y: auto;
}
</style>
