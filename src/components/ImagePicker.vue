<template>
  <div class="image-picker">
    <div 
      v-for="image in images"
      :key="image"
      :class="{
        'image-container': true,
        'selected': image === value
      }">
      <img 
        width="150px" 
        :src="image"
        v-on:click="e => handleClick(image)">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    images: Array,
    value: String
  },
  methods: {
    handleClick(image) {
      this.$emit("input", image);
    }
  }
}
</script>

<style scoped>
.image-picker {
  overflow-y: auto;
  max-height: 300px;
  display: inline-flex;
  flex-wrap: wrap;
  width: 100%;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 3.5px;
}
.image-container {
  margin: 1.5px;
  padding: 2px;
  cursor: pointer;
  height: 88px;
  width: 151px;
  border-radius: 7px;
  overflow: hidden;
  border: 2px solid #ffffff;
}
img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  border-radius: 4px;
}
.selected {
  border: 2px solid #2b85e4;
}
</style>