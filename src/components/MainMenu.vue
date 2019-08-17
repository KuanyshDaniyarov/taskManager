<template>
  <div id="header-container">
    <div 
      id="header"
      v-on:mouseover="e => isContentHovered = true"
      v-on:mouseleave="e => {isContentHovered = false; hovered = null;}">

      <div class="items-container">
        <div
          class="item"
          v-for="item in data"
          :key="item.name"
          v-on:mouseover="e => handleMouseOver(item)"
          v-on:mouseleave="e => handleMouseLeave(item)"
        >
          <div
            :class="{
              'item-link': true,
              'selected': (
                (path.startsWith(`/${item.name}`) && !hovered)
                || (hovered === item && isContentHovered)
              )
            }"
          >
            <Icon
              :type="item.icon"
              size="18"
            />
          </div>
        </div>
      </div>
      <div
        :class="{content: true, hovered: isContentHovered}">
        <div class="actions-container" v-if="!!current">
          <router-link
            v-for="action in current.actions"
            :key="action.id"
            :class="{
              'child-link': true,
              'selected': path === (`/${current.name}/${action.id}`)
            }"
            :to="`/${current.name}/${action.id}`"
          >
            {{$t(action.name)}}
          </router-link>
        </div>
        <div class="children-container" v-if="!!current">
          <router-link
            v-for="child in current.children"
            :key="child.id"
            :class="{
              'child-link': true,
              'selected': path === (`/${current.name}/${child.id}`)
            }"
            :to="`/${current.name}/${child.id}`"
          >
            {{child.name}}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Array
  },
  watch: {
    $route(to) {
      this.path = to.path;
      this.hovered = null;
    }
  },
  data() {
    return {
      path: "",
      hovering: null,
      hovered: null,
      isContentHovered: false
    }
  },
  computed: {
    current() {
      return this.hovered || this.data.find(e => (
        (this.path.startsWith(`/${e.name}`))
      ));
    }
  },
  mounted() {
    this.path = this.$route.path;
  },
  methods: {
    async handleMouseOver(item) {
      this.hovering = item;

      await new Promise(resolve => setTimeout(resolve, 200));
      
      if(this.hovering === item) {
        this.hovered = item;
        this.hovering = null;
      }
    },
    handleMouseLeave(item) {
      this.hovering = null;
    }
  }
}
</script>

<style scoped>
#header-container {
  position: relative;

  width: 50px;
  min-width: 50px;
  height: 100%;
  /* padding: 8px 0; */
}

#header {
  top: 8px;
  position: absolute;

  height: calc(100% - 16px);

  user-select: none;
  display: flex;
  line-height: 1;
  z-index: 999;

  padding: 8px 0;
  /* margin: 8px 0; */

  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
}

#header .content {
  opacity: 0;
  width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.3s ease-in-out, opacity 0.2s ease-in-out;
}

#header .content.hovered {
  width: 230px;
  opacity: 1;
}

#header .items-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item {
  position: relative;
}
.item-link {
  padding: 16px;
  color: #2c3e50;
  font-size: 14px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: color .2s ease;
}
/* .item-link:hover {
  color: #2b85e4;
} */
.item-icon {
  margin-right: 8px;
}

.actions-container {
  width: 230px;
  padding: 5px 0;
  border-bottom: 1px solid #e8eaec;
}

.children-container {
  width: 230px;
  padding: 5px 0;
  /* overflow: auto; */
  /* max-height: 250px; */
}
.child-link {
  display: flex;
  align-items: center;
  color: #2c3e50;
  background: #fff;
  padding: 10px 12px;
  font-size: 14px;
  transition: all .2s ease-in-out;
}

.child-link:hover {
  background: #f3f3f3;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.selected {
  color: #2b85e4;
}
</style>
