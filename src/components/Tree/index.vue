<template>
  <div
    class="tree"
    ref="tree"
    v-on:mousewheel="handleMouseWheel"
    v-on:mousedown="handleMouseDown"
    v-on:mouseup="handleMouseUp"
    v-on:mousemove="handleMouseMove"
  >
    <Container
      ref="container"
      class="root-container"
      :items="tree"
      :style="'transform: translate(' + xoff + 'px, ' + yoff + 'px) scale(' + scale + ')'"
    />
    <Menu
      :onRefreshClick="handleRefreshClick"
      :onPersonClick="handlePersonClick"/>
  </div>
</template>

<script>
import Container from './Container';
import Menu from './Menu';

export default {
  props: {
    tree: Array
  },
  components: {
    Container,
    Menu
  },
  data() {
    return {
      scale: 1,
      target: 1.1,
      panning: false,
      xoff: 0,
      yoff: 0,
      start: { x: 0, y: 0 }
    }
  },
  mounted() {
    const me = document.getElementById('tree-item-me');

    if(me) this.handlePersonClick();
    else this.handleRefreshClick();
  },
  methods: {
    refresh() {
      const me = document.getElementById('tree-item-me');

      if(me) this.handlePersonClick();
      else this.handleRefreshClick();
    },
    handleMouseWheel(e) {
      e.preventDefault();

      const rect = this.$refs.tree.getBoundingClientRect();

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const xs = (clientX - this.xoff) / this.scale,
          ys = (clientY - this.yoff) / this.scale,
          delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

      if(delta > 0 && this.scale > 1) return;
      if(delta < 0 && this.scale < 0.5) return;

      (delta > 0) ?
      (this.scale *= this.target) :
      (this.scale /= this.target);

      this.xoff = clientX - xs * this.scale;
      this.yoff = clientY - ys * this.scale;
    },
    handleMouseDown(e) {
      e.preventDefault();

      this.start = {x: e.clientX - this.xoff, y: e.clientY - this.yoff};    
      this.panning = true;
    },
    handleMouseUp() {
      this.panning = false;
    },
    handleMouseMove(e) {
      e.preventDefault();
      
      if (!this.panning) return;

      this.xoff = (e.clientX - this.start.x);
      this.yoff = (e.clientY - this.start.y);
    },
    handleRefreshClick() {
      this.reset();

      const tW = window.innerWidth;
      const tH = window.innerHeight;

      const cW = this.$refs.container.$el.clientWidth + 64;
      const cH = this.$refs.container.$el.clientHeight + 400;

      const dW = cW / tW;
      const dH = cH / tH;

      this.scale /= (dW > dH ? dW : dH);

      if(this.scale > 0.99) this.scale = 0.85;
    },
    handlePersonClick() {
      const me = document.getElementById('tree-item-me');

      if(!me) return;

      this.reset();

      this.$nextTick(() => {
        const rect = me.getBoundingClientRect();

        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;

        const containerX = this.$refs.tree.clientWidth / 2;
        const containerY = this.$refs.tree.clientHeight / 2;

        this.xoff = containerX - itemX;
        this.yoff = containerY - itemY;

        this.$nextTick(() => {
          me.animate([
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-20px)' },
            { transform: 'translateY(0px)' }
          ], {
            delay: 25,
            duration: 330,
          });
        });
      });
    },
    reset() {
      this.scale = 1;
      this.xoff = 0;
      this.yoff = 0;
      this.start = { x: 0, y: 0 };
    }
  }
}
</script>

<style>
.tree {
  position: relative;
  height: 100%;
  overflow: hidden;

  text-align: center;

  background: rgb(250, 250, 250);

  border-radius: 4px;
}

.tree .root-container {
  position: absolute;
  transform-origin: 0px 0px;
  transform: scale(1) translate(0px, 0px);
}

.tree ul {
	padding: 16px; 
  position: relative;

  white-space: nowrap;
}

.tree li {
	list-style-type: none;
	position: relative;
	padding: 20px 5px 0 5px;

  display: inline-block;
  vertical-align: top;
  white-space: normal;
}

.tree li::before, .tree li::after {
	content: '';
	position: absolute; top: 0; right: 50%;
	border-top: 1px solid #9ea7b4;
	width: 50%; height: 20px;
}
.tree li::after {
	right: auto; left: 50%;
	border-left: 1px solid #9ea7b4;
}

.tree li:only-child::after, .tree li:only-child::before {
	display: none;
}

/*Remove space from the top of single children*/
.tree li:only-child{ padding-top: 0;}

.tree li:first-child::before, .tree li:last-child::after {
	border: 0 none;
}

.tree li:last-child::before {
	border-right: 1px solid #9ea7b4;
	border-radius: 0 5px 0 0;
	-webkit-border-radius: 0 5px 0 0;
	-moz-border-radius: 0 5px 0 0;
}
.tree li:first-child::after {
	border-radius: 5px 0 0 0;
	-webkit-border-radius: 5px 0 0 0;
	-moz-border-radius: 5px 0 0 0;
}

.tree ul ul::before {
	content: '';
	position: absolute; top: 0px; left: 50%;
	border-left: 1px solid #9ea7b4;
  width: 0; height: 15px;
}
</style>