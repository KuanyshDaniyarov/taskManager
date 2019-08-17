<template>
  <div id="archive">
    <div v-if="isLoaded">
      <div class="title">
        {{$t(`${$route.params.type}-archive`)}}
      </div>

      <Board
        v-for="board in $store.state.archivedBoards" :key="board.id"
        :id="board.id"
        :image="board.bg_img"
        :name="board.name"
        :onRestoreClick="() => handleRestoreClick(board)"/>
    </div>

    <Spin size="large" fix v-else/>
  </div>
</template>

<script>
import Board from '../components/Board'

export default {
  components: { Board },
  watch: {
    $route(to) {
      this.readArchivedBoards(to.params.type);
    }
  },
  data() {
    return {
      isLoaded: false
    }
  },
  async mounted() {
    document.body.style.background = 'rgb(250, 250, 250)';
    
    this.readArchivedBoards(this.$route.params.type);
  },
  methods: {
    async readArchivedBoards(type) {
      this.isLoaded = false;

      const error = await this.$store.dispatch("readArchivedBoards", {
        type: this.$route.params.type
      });

      if(error) {
        this.$Message.error("Произошла ошибка");
      }
      else {
        this.isLoaded = true;
      }
    },
    async handleRestoreClick(board) {
      this.$Modal.confirm({
        loading: true,
        title: "Восстановить",
        content: "<p>" + "Вы уверены, что хотите восстановить доску из архива?" + "</p>",
        onOk: async () => {
          const error = await this.$store.dispatch('restoreBoard', { 
            board,
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
#archive {
  height: calc(100% - 64px);
  overflow-y: auto;
}
.title {
  padding-left: 8px;
  line-height: 2;
  font-size: 24px;
  font-weight: bold;
  color: #464c5b;
}
</style>
