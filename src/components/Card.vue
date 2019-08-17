<template>
  <div
    :id="elementId"
    class="card"
    v-on:mousedown="handleMouseDown">

    <div class="main-container" v-on:click="handleClick">
      <div class="container" v-if="!isPrivate">
        <UserAvatar
          :avatar="author.avatar"
          :name="author.full_name"
          :initials="author.initials"
          :disabled="true"/>
        <div>
          <span class="header-text">
            {{author.short_name}}
          </span>
          <span class="subhead">
            {{author.position}}
          </span>
        </div>
      </div>

      <div>
        <div class="labels">
          <div 
            v-for="type in types"
            :key="type.id"
            class="label-container">
              <Poptip
                transfer
                trigger="hover"
                :content="type.name"
                :disabled="true"
                style="width: 100%;">
                <div
                  class="label"
                  :style="{backgroundColor: type.color }"/>
              </Poptip>
          </div>
        </div>

        <div class="media-text">
          {{title}}
          <span class="date">
            {{$t('until')}}
          </span>
          {{date}}
        </div>
        <div class="secondary-media">
          <div class="media">
            <Icon
              class="icon"
              v-if="isUrgently"
              size="16"
              type="md-time"/>
            <Icon
              class="icon"
              v-if="isControl"
              size="16"
              type="ios-alert"/>
            <div
              class="icon icon-with-text"
              style="margin-left: 2px;"
              v-if="commentsCount > 0">
              <Icon
                size="16"
                type="ios-chatbubbles"/>
              <span class="text" style="margin-left: 2px">
                {{commentsCount}}
              </span>
            </div>
            <div
              class="icon icon-with-text"
              v-if="files.length > 0">
              <Icon
                size="16"
                type="md-attach"/>
              <span class="text">
                {{files.length}}
              </span>
            </div>
          </div>

          <div class="secondary-container" v-if="!isPrivate">
            <div class="secondary-thumbnails">
              <UserAvatar
                v-for="member in members"
                :key="member.id"
                :avatar="member.avatar"
                :name="member.name"
                :initials="member.initials"/>
            </div>
            <Icon
              v-if="membersLength > members.length"
              class="icon-more-users"
              style="cursor: pointer;"
              size="16"
              type="ios-more"/>
          </div>
        </div>
      </div>
    </div>

    <div :class="{ tasks: true, hidden: isTasksHidden }">
      <div
        class="task"
        v-for="task in tasks"
        :key="task.id">
        <div class="task-text">
          {{task.name}}
        </div>
        <div class="task-date">
          {{$t('until')}} {{task.deadline}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar';

export default {
  components: { UserAvatar },
  props: {
    id: Number,
    title: String,
    author: Object,
    isUrgently: Boolean,
    isControl: Boolean,
    commentsCount: Number,
    files: {
      type: Array,
      default: () => []
    },
    date: String,
    percentage: Number,
    members: {
      type: Array,
      default: () => []
    },
    membersLength: Number,
    types: {
      type: Array,
      default: () => []
    },
    tasks: {
      type: Array,
      default: () => []
    },
    onMouseDown: Function
  },
  computed: {
    isPrivate() {
      const isPrivate = this.$route.params.type === 'private';

      return isPrivate;
    }
  },
  data() {
    return {
      elementId: `card-${this.id}`,
      isTasksHidden: true
    }
  },
  methods: {
    handleMouseDown(event) {
      if(this.onMouseDown) this.onMouseDown(event, this.elementId);
    },
    handleClick(event) {
      if(event.target.className.includes('icon-more-users')) {
        this.$emit("icon-more-click", this.id);
        return;
      }

      this.$router.push(`/${this.$route.params.type}/${this.$route.params.board}/${this.id}`);
    },
    handleExpand() {
      this.isTasksHidden = !this.isTasksHidden;
    }
  }
}
</script>

<style>
.ivu-poptip-rel {
  width: 100%;
}
</style>

<style scoped>
.card {
  transition: transform 125ms ease-in, box-shadow 0.3s cubic-bezier(.25,.8,.25,1);

  z-index: 999;
  margin: 8px;
  user-select: none;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;

  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);

  color: rgb(38, 38, 38);
}
.main-container {
  cursor: pointer;
  position: relative;
}
.main-container::after {
  pointer-events: none;
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  opacity: 0;
}
.main-container:hover::after {
  opacity: 0.05;
}

.container {
  padding: 8px;
  padding-bottom: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.thumbnail {
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  background: rgb(161, 161, 161);
  border-radius: 50%;
  margin-right: 8px;
}
.header-text {
  font-size: 12px;

  font-family: Roboto,sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-decoration: inherit;
  text-transform: inherit;
}
.subhead {
  font-size: 12px;

  font-family: Roboto,sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-decoration: inherit;
  text-transform: inherit;

  color: rgb(102, 102, 102);
}

.divider {
  width: 100%;
  height: 1px;
  background: rgb(224, 224, 224);
}
.labels {
  min-height: 9px;
  display: flex;
}
.label-container  {
  flex: 1;
  margin: 0px 2px;
  margin-bottom: 0;
}
.label-container:first-child {
  margin-left: 0px;
}
.label-container:last-child {
  margin-right: 0px;
}
.label {
  width: 100%;
  height: 2px;
  margin-bottom: 3px;
}
.media-text {
  padding: 0 8px;
  
  font-size: 12px;

  font-family: Roboto,sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-decoration: inherit;
  text-transform: inherit;
}
.secondary-media {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 4px 7px 8px 7px;

  color: rgb(102, 102, 102);
}
.media {
  display: flex;
  align-items: center;
}

.icon-with-text {
  display: flex;
  align-items: center;
}
.icon > .text {
  line-height: 1;
}

.icon-more-users {
  height: 25px;
  display: flex;
  align-items: center;
  border-radius: 8px;
}
.icon-more-users:hover {
  background-color: rgb(240, 240, 240);
}

.date {
  color: rgb(102, 102, 102);
}

.secondary-container {
  display: flex;
  align-items: center;
}
.secondary-container .user-avatar {
  margin-right: 6px;
}
.icon {
  margin-right: 4px;
}
.icon:last-child {
  margin-right: 0;
}
.secondary-thumbnails {
  display: flex;
  overflow: hidden;
}
.threedots {
  margin: 6px;
}

.actions {
  padding: 4px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  font-family: Roboto, sans-serif;
  font-size: .775rem;
  line-height: 2.25rem;
}
.button {
  cursor: pointer;

  padding: 0 4px;

  color: #2d8cf0;

  border-radius: 4px;
  display: inline-block;
}
.button:hover {
  background-color: rgba(45,140,240,0.12)
}
.action-icons {
  padding: 0 4px;
}

.tasks {
  max-height: 500px;
  overflow: hidden;

  transition: max-height 250ms ease-in-out;
}
.tasks.hidden {
  max-height: 0px;
}
.task {
  padding: 0 4px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: .875rem;
  line-height: 1.375rem;
  font-weight: 400;
  letter-spacing: .0071428571em;

  font-family: Roboto,sans-serif;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-decoration: inherit;
  text-transform: inherit;

  color: rgb(102, 102, 102);
}
.task-text {
  margin: 4px;
}
.task-date {
  min-width: 94px;
  text-align: end;

  margin: 4px;
}
.arrow-expanded {
  transform: rotate(180deg);
}
</style>