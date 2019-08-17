<template>
  <Card class="menu" :padding="8">
    <div class="menu-container">
      <Button
        type="primary"
        shape="circle"
        icon="md-eye"
        v-on:click="handleRefreshClick"
      />
      <Button
        type="primary"
        shape="circle"
        icon="md-person"
        v-on:click="handlePersonClick"
      />
    </div>
  </Card>
</template>

<script>
export default {
  props: {
    onRefreshClick: Function,
    onPersonClick: Function
  },
  methods: {
    handleRefreshClick() {
      if(this.onRefreshClick) this.onRefreshClick();
    },
    handlePersonClick() {
      if(this.onPersonClick) this.onPersonClick();
    }
  }
}
</script>

<style>
.tree .menu {
  position: absolute;
  right: 32px; top: 50%;
  transform: translate(0, -50%);
  border-radius: 5px;
}

.tree .menu-container {
  display: flex;
  flex-direction: column;
}

.tree .menu button{
  margin: 8px;
}
</style>