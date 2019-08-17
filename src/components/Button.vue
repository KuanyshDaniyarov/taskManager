<template lang="pug">
  button(v-on:click="click")
    slot
</template>

<script lang="coffee">
export default
  methods:
    click: (event) -> this.$emit('click', event);
</script>

<style lang="stylus" scoped>
  button
    cursor pointer
    background-color rgb(98, 0, 238)
    color rgb(255, 255, 255)
    border none
    border-radius 4px
    line-height 1.5
    text-align center
    padding 5px 15px 6px
    font-size 12px
    user-select none
    box-shadow 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
    transition all 0.25s ease-in-out
    &:focus
      outline none
    &:hover
      box-shadow 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)
</style>