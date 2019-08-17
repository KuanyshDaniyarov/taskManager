<template>
  <div class="board">
    <div 
      class="image-container" 
      v-on:click="handleBoardClick" 
      :style="{ backgroundColor: color }">
      <img 
        class="image" 
        width="270px" 
        :src="image"/>
    </div>
    <div class="container">
      <div class='name' v-on:click="handleBoardClick">
        {{name}}
      </div>
      <Poptip
        v-if="!isReadOnly"
        trigger="click"
        placement="bottom-start"
        ref="poptip">
        <Icon
          class="icon"
          type="md-more"
          size="18"/>
        <div slot="content" class="more-content">
          <div>
            <Button
              v-if="onEditClick"
              type="text"
              icon="md-create"
              v-on:click="handleEditClick">
              Редактировать
            </Button>
          </div>
          <div>
            <Button 
              v-if="onArchiveClick"
              type="text" 
              icon="md-archive"
              v-on:click="handleArchiveClick">
              Архивировать
            </Button>
          </div>
          <div>
            <Button 
              v-if="onRestoreClick"
              type="text" 
              icon="md-undo"
              v-on:click="handleRestoreClick">
              Восстановить
            </Button>
          </div>
        </div>
      </Poptip>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: Number,
    image: String,
    color: String,
    name: String,
    isReadOnly: Boolean,
    onEditClick: Function,
    onArchiveClick: Function,
    onRestoreClick: Function
  },
  methods: {
    handleBoardClick() {
      this.$router.push(`/${this.$route.params.type}/${this.id}`);
    },
    handleEditClick() {
      this.$refs.poptip.cancel();

      this.onEditClick();
    },
    handleArchiveClick() {
      this.$refs.poptip.cancel();
      
      this.onArchiveClick();
    },
    handleRestoreClick() {
      this.$refs.poptip.cancel();
      
      this.onRestoreClick();
    }
  }
}
</script>

<style>
.board .ivu-poptip-body {
  padding: 6px 0;
}
</style>

<style scoped>
.board {
  position: relative;
  display: inline-block;
  width: 250px;
  cursor: pointer;
  margin: 8px;
  background: #fff;
  border-radius: 8px;
  /* overflow: hidden; */
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  color: #2c3e50;
  animation: opacity 300ms ease-in-out;
}
@keyframes opacity {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.board::after {
  pointer-events: none;
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  opacity: 0;
  border-radius: 8px;
}
.board:hover::after {
  opacity: 0.05;
}
.image-container {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  height: 150px;
  overflow: hidden;
  background-color: rgb(250, 250, 250);
}
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.name {
  flex: 1;
  font-size: 14px;
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.icon {
  padding: 6px;
  margin: 2px;
}
.icon:hover {
  background-color: rgb(240, 240, 240);
  border-radius: 50%;
}
</style>