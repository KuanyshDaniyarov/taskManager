<template>
  <ul v-if="items && items.length">
    <li v-for="item in items" :key="item.id">
      <Item
        :id="item.id"
        :name="item.user.full_name"
        :position="item.user.position"
        :jobs="item.jobs"
        :status="item.status.name"
        :isMe="item.me"/>
      <Container :items="item.children" :parent="item"/>
    </li>
  </ul>
</template>

<script>
import Item from './Item';

export default {
  name: 'Container',
  components: { Item },
  props: { parent: Object, items: Array }
}
</script>
