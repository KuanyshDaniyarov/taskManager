<template>
  <div :class="{'user-avatar': true, primary: primary}">
    <Poptip
      transfer
      trigger="hover"
      :content="name"
      :disabled="disabled">
      <div 
        class="avatar" 
        :style="{pointerEvents: disabled ? 'none' : 'initial'}">
        <div 
          v-if="!avatar"
          class="initials">
          {{initials}}
        </div>
        <img 
          v-else 
          class="avatar" 
          :src="avatar"/>
      </div>
    </Poptip>
  </div>
</template>

<script>
export default {
  props: {
    avatar: String,
    name: String,
    initials: String,
    disabled: Boolean,
    primary: Boolean
  }
}
</script>

<style scoped>
.user-avatar {
  margin-right: 8px;
}
.avatar {
  cursor: pointer;
  position: relative;
  width: 25px;
  height: 25px;
  min-width: 25px;
  min-height: 25px;
  background: rgb(240, 240, 240);
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;
}
.primary .avatar {
  background: #2d8cf0;
}
.avatar::after {
  pointer-events: none;
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  opacity: 0;
  border-radius: 50%;
}
.avatar:hover::after {
  opacity: 0.2;
}
.avatar:first-child {
  margin-left: 0;
}
.icon {
  margin-left: 6px;
  margin-top: 5px;
}
.initials {
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
}
.primary .initials {
  color: #fff;
}
</style>