<template lang="pug">
  //- div {{msg}}
  //-   div.my-class div 2
  //-   TestInput(title="asd")
  Button(v-on:click="click") Сохранить
</template>

<script lang="coffee">
import Button from '../components/Button'

export default
  components: { Button }

  data: ->
    msg: 'Welcome to short code'

  methods:
    click: ->
      console.log('click')
</script>

<style lang="stylus" scoped>

</style>