<template>
  <div class="board-root">
    <BoardMenu 
      v-if="$route.params.type !== 'private'"
      v-on:change="handleFiltersChange"
      v-on:search="handleSearch"
      v-on:users-button-click="handleBoardMenuUsersButtonClick"/>

    <div class="title">
      {{name}}
    </div>

    <div id="lists" v-if="isLoaded">
      <div
        v-for="list in lists"
        :key="list.id"
        class="list">
        <div class="header">
          {{list.name}}
          <router-link :to="`/${$route.params.type}/${$route.params.board}/0`">
            <Button
              v-if="!!list.action && !isArchived"
              type="primary"
              shape="circle"
              :icon="list.action.icon"
              class="header-action"/>
          </router-link>
        </div>
        <div class="cards-container" :id="`container-${list.id}`">
          <Card
            v-for="card in list.tasks"
            :key="card.id"
            :id="card.id"
            :author="card.creator"
            :date="card.deadline"
            :title="card.name"
            :isUrgently="card.is_urgent"
            :isControl="card.is_control"
            :commentsCount="card.comments_length"
            :files="card.attachments_info"
            :percentage="card.percentage"
            :members="card.participants_info"
            :membersLength="card.participants_length"
            :types="card.types_info"
            :tasks="card.jobs"
            :onMouseDown="handleMouseDown"
            v-on:icon-more-click="handleCardIconMoreClick"/>
        </div>
      </div>
    </div>
    <Spin size="large" fix v-else/>

    <div id="empty-card-container">
      <div id="empty-card"/>
    </div>

    <Modal
      v-model="users.modal"
      :title="$t('members')"
      :width="1024"
      class="members-modal">
      <div v-if="!users.isLoading">
        <User
          v-for="user in users.data"
          :key="user.id"
          :user="user"/>

          <div
            v-if="users.paggination"
            style="text-align: center; padding: 8px 0;">
            <Page
              size="small"
              v-bind:page-size="20"
              v-bind:current="users.paggination.current"
              v-bind:total="users.paggination.total"
              v-on:on-change="handleBoardUsersPageChange"/>
          </div>
      </div>
      <div v-else style="height: 60px;">
        <Spin size="large" fix/>
      </div>
    </Modal>
  </div>
</template>

<script>
import Card from '../components/Card';
import BoardMenu from '../components/BoardMenu';
import User from '../components/User';

import axios from 'axios';

function getUsers() {
  return {
    modal: false,
    data: [],
    isLoading: true,
    paggination: null
  }
}

export default {
  components: { Card, BoardMenu, User },
  // computed: {
  //   selectedBoard() {
  //     console.log(this.$store.state.types);

  //     const boardsByCurrentType = this.$store.state.types.find(e => (
  //       e.id === this.$route.params.type
  //     ));

  //     if(!boardsByCurrentType) return {};

  //     const currentBoard = boardsByCurrentType.children.find(e => (
  //       e.id === parseInt(this.$route.params.board)
  //     ));

  //     return currentBoard;
  //   }
  // },
  watch: {
    $route(to) {
      this.fetchData();
    }
  },
  data() {
    return {
      target: null,
      card: null,
      shiftX: null,
      shiftY: null,
      startX: null,
      startY: null,
      scrolling: false,
      moving: false,

      id: null,
      name: null,
      isArchived: false,
      isLoaded: false,
      lists: [],

      moveForm: {
        start: {
          col: null,
          task: null,
          order: null
        },
        end: {
          col: null,
          task: null,
          order: null
        },
      },

      users: getUsers()
    }
  },
  mounted() {
    this.fetchData();
  },
  beforeMount() {
    document.onmousemove = this.handleMouseMove;
    document.onmouseup = this.handleMouseUp;
  },
  beforeDestroy() {
    document.onmousemove = null;
    document.onmouseup = null;
  },
  methods: {
    async fetchData() {
      this.isLoaded = false;

      localStorage.setItem('lastBoardType', this.$route.params.type);
      localStorage.setItem('lastBoardId', this.$route.params.board);

      const id = parseInt(this.$route.params.board);

      if(id) {
        this.id = id;

        try {
          const boardResponse = await axios.get(`/tm/boards/${this.id}`);
          const boardData = boardResponse.data;

          console.log(boardData);

          this.name = boardData.name;
          this.isArchived = boardData.is_archived;

          if(boardData.bg_img) {
            document.body.style.backgroundImage = `url(${boardData.bg_img})`;
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundSize = 'cover';
          }
          else {
            document.body.style.background = boardData.bg_color;
          }

          if(this.$route.params.type === 'private') {
            const list1 = boardData.new_tasks;
                  list1.action = { id: 'create', icon: 'md-add' };
            const list2 = boardData.on_exe;
            const list3 = boardData.on_check;
            const list4 = boardData.finished;
  
            this.lists = [ list1, list2, list3, list4 ];
          }
        }
        catch(error) {
          this.$Message.error('Произошла ошибка');
          console.log(error);
          return;
        }
      }

      this.isLoaded = true;
    },
    async handleFiltersChange(model) {
      this.isLoaded = false;

      const filters = {
        by_me: model.assigned === 'by-me',
        to_me: model.assigned === 'to-me',
        d_by_me: model.assigned === 'delegated',
        is_control: model.isControl,
        is_urgent: model.isUrgent,
        for_today: model.forToday,
        interval: !model.forToday
        && !!model.interval
        && !!model.interval.from 
        && !!model.interval.to
        ? {
          from: model.interval.from,
          to: model.interval.to,
        }
        : undefined
      }
      
      try {
        const response = await axios.post(
          `/tm/boards/${this.$route.params.board}/filter/`,
          filters
        );
        const data = response.data;

        const list1 = data[0].new_tasks;
              list1.action = { id: 'create', icon: 'md-add' };
        const list2 = data[1].on_exe;
        const list3 = data[2].on_check;
        const list4 = data[3].finished;

        this.lists = [ list1, list2, list3, list4 ];
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
        console.log(error);
        return;
      }

      this.isLoaded = true;
    },
    async handleSearch(query) {
      this.isLoaded = false;

      try {
        const response = await axios.get(
          `/tm/boards/${this.$route.params.board}/search/?search=${query}`
        );
        const data = response.data;

        const list1 = data[0].new_tasks;
              list1.action = { id: 'create', icon: 'md-add' };
        const list2 = data[1].on_exe;
        const list3 = data[2].on_check;
        const list4 = data[3].finished;

        this.lists = [ list1, list2, list3, list4 ];
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
      }

      this.isLoaded = true;
    },
    handleMouseDown(event, id, listId, cardId, order) {
      event.preventDefault();

      const card = document.getElementById(id);
      
      this.moveForm.start.task = card.id.split('-')[1];
      this.moveForm.start.order = Array.from(card.parentNode.children)
      .indexOf(card);
      this.moveForm.start.col = card.parentNode.id.split('-')[1];

      this.moveForm.end.task = this.moveForm.start.task;

      const rect = card.getBoundingClientRect();

      const top = rect.top + window.pageYOffset;
      const left = rect.left + window.pageXOffset;

      this.shiftX = event.pageX - left;
      this.shiftY = event.pageY - top;

      this.startX = event.pageX;
      this.startY = event.pageY;

      this.target = card;
    },
    handleMouseMove(event) {
      if(this.target !== null) {
        const moveX = Math.abs(event.pageX - this.startX);
        const moveY = Math.abs(event.pageY - this.startY);
        const moveD = moveX > moveY ? moveX : moveY;

        if(moveD > 7.5 && !this.moving) {
          this.moving = true;
        }

        if(!this.moving) return;
      }

      if(this.target !== null) {
        this.card = this.target;

        this.card.style.width = this.card.getBoundingClientRect().width + 'px';
        this.card.style.position = 'absolute';
        this.card.style.transform = 'rotate(4deg)';
        // this.card.style.boxShadow = '0 12px 24px -6px rgba(9,30,66,.25)';
        this.card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'

        const emptyCard = document.getElementById("empty-card");

        const rect = this.card.getBoundingClientRect();

        emptyCard.style.height = rect.height + 'px';

        this.target = null;
      }

      if(!this.moving) return;

      if(this.card === null) return;

      this.card.style.left = event.pageX - this.shiftX - 16 + 'px';
      this.card.style.top = event.pageY - this.shiftY - 16 + 'px';

      const cardY = event.pageY - this.shiftY - 16 + this.card.getBoundingClientRect().height/2;

      let container = null;

      const containers = this.lists.map(list => (
        document.getElementById(`container-${list.id}`)
      ));

      for (let i = 0; i < containers.length; i++) {
        const rect = containers[i].getBoundingClientRect();

        if(event.pageX > rect.x) container = containers[i];
      }

      if(container !== null) {
        const isHasScroll = container.scrollHeight > container.clientHeight;

        if(isHasScroll) {
          const rect = container.getBoundingClientRect();

          const elementHalf = rect.height / 2;

          const elementY = (rect.y + elementHalf);

          const diff = (cardY < elementY) ? 
                       (elementY - cardY) : 
                       (cardY - elementY);

          const percentage = diff * 100 / elementHalf;

          if(percentage > 60) {
            if(!this.scrolling) {
              const speed = 10;

              this.scrolling = true;
              this.scroll(container, (cardY < elementY) ? -speed : speed);
            }
          }
          else {
            this.scrolling = false;
          }
        }
        else {
          this.scrolling = false;
        }

        let beforeCard = null;

        for (let i = container.childNodes.length - 1; i > -1; i--) {
          const childNode = container.childNodes[i];

          if(childNode.id === 'empty-card' || childNode.id === this.card.id) {
            continue;
          }

          const rect = childNode.getBoundingClientRect();

          if(cardY < (rect.y + rect.height / 2)) {
            beforeCard = childNode;
          }
        }

        const emptyCard = document.getElementById("empty-card");

        container.insertBefore(emptyCard, beforeCard);
      }
    },
    handleMouseUp() {
      this.target = null;
      this.moving = false;

      if(this.card === null) return;

      this.scrolling = false;

      const emptyCardConainer = document.getElementById("empty-card-container");
      const emptyCard = document.getElementById("empty-card");
      const container = emptyCard.parentElement;

      container.insertBefore(this.card, emptyCard);
      emptyCardConainer.appendChild(emptyCard);

      this.card.style.position = 'initial';
      this.card.style.transform = 'initial';
      // this.card.style.boxShadow = 'initial';
      this.card.style.width = 'initial';
      this.card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'

      this.moveForm.end.order = Array.from(this.card.parentNode.children)
      .indexOf(this.card);
      this.moveForm.end.col = this.card.parentNode.id.split('-')[1];

      this.requestMove();

      this.card = null;
    },
    scroll(container, number) {
      requestAnimationFrame(() => {
        if(this.scrolling) {
          if(number < 0 && container.scrollTop === 0) {
            this.scrolling = false;
            return;
          }
          else if(number > 0 && (container.offsetHeight + container.scrollTop) === container.scrollHeight) {
            this.scrolling = false;
            return;
          }

          container.scrollTop = container.scrollTop + number;
          this.scroll(container, number);
        }
      });
    },
    async requestMove() {
      try {
        const { board } = this.$route.params;

        const moveResponse = await axios.post(
          `/tm/boards/${board}/move/`,
          this.moveForm.end
        );
      }
      catch(error) {
        const card = document.getElementById(`card-${this.moveForm.start.task}`);
        const container = document.getElementById(`container-${this.moveForm.start.col}`);

        container.insertBefore(
          card,
          container.children[this.moveForm.start.order]
        );

        const errorMessage = error.response.data.error;

        if(errorMessage === 'complete all jobs') {
          this.$Message.error({
            content: 'В карточке имеются не выполненные задания',
            duration: 4
          });
        }
        else {
          this.$Message.error('Произошла ошибка');
        }
      }
    },
    async handleCardIconMoreClick(card) {
      this.users = getUsers();

      this.users.modal = true;

      try {
        const response = await axios.get(`/tm/tasks/${card}/participants/`);
        
        this.users.data = response.data
      }
      catch(error) {
        console.log(error);
        this.$Message.error('Произошла ошибка');
        return;
      }

      this.users.isLoading = false;
    },
    async handleBoardMenuUsersButtonClick() {
      this.users = getUsers();

      this.users.modal = true;

      await this.fetchBoardUsers(1);

      this.users.isLoading = false;
    },
    async handleBoardUsersPageChange(value) {
      this.users.isLoading = true;

      await this.fetchBoardUsers(value);

      this.users.isLoading = false;
    },
    async fetchBoardUsers(page) {
      try {
        const board = this.$route.params.board;
        const url = `/tm/boards/${board}/participants/?page=${page}`;
        const response = await axios.get(url);
        const data = response.data;

        this.users.paggination = {
          current: page,
          total: data.count
        }

        this.users.data = data.results;
      }
      catch(error) {
        console.log(error);

        this.$Message.error('Произошла ошибка');
      }
    }
  }
}
</script>

<style>
.members-modal .ivu-modal-body {
  padding: 4px;
}
</style>

<style scoped>
.board-root {
  height: 100%;

  display: flex;
  flex-direction: column;
  flex-basis: fit-content;
}

.title {
  padding-left: 4px;
  line-height: 2;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0px 2px 3px rgba(0,0,0,0.4),
               0px 4px 7px rgba(0,0,0,0.1),
               0px 9px 12px rgba(0,0,0,0.1);
}
#lists {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.list {
  display: flex;
  flex-direction: column;

  max-height: 100%;
  width: calc(25% - 4px);
  margin-right: 5px;
  min-height: 50px;
  background-color: #FFFFFF;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  border-radius: 4px;
}

.list:last-of-type {
  margin-right: 0;
}
.list .header {
  user-select: none;
  padding: 8px;
  padding-bottom: 0;
  font-size: 14px;
  font-weight: bold;
  line-height: 36px;
  margin-left: 8px;
  color: #464c5b;
}
.list .header .header-action {
  float: right;
}
.list .cards-container {
  flex: 1;
  /* max-height: calc(100% - 50px); */
  overflow: auto;
}
#empty-card-container {
  display: none;
}
#empty-card {
  border-radius: 4px;
  margin: 8px;
  background: rgba(9,30,66,.04);
}
</style>