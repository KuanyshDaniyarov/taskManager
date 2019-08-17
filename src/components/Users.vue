<template>
  <div 
    :class="{ 'users-container': !isReadOnly && !isDisableContainer }"
    :style="{marginBottom: `${marginBottom}px`}">

    <Input
      class="search"
      search
      placeholder="Поиск по участникам"
      v-on:on-change="handleSearch"/>

    <Button
      style="margin: 4px;"
      v-on:click="handleCheckAllClick"
      :icon="isCanCheckAll ? 'md-checkmark' : 'md-close'">
      {{isCanCheckAll ? 'Выбрать всех' : 'Убрать всех'}}
    </Button>

    <div class="users">
      <div
        class="user"
        v-for="user in users"
        :key="user.id"
        v-on:click="() => !isReadOnly ? handleUserClick(user) : null"
        :style="{ cursor: !isReadOnly ? 'pointer' : 'initial' }">
        <Checkbox :value="isModelIncludes(user)" v-if="!isReadOnly"/>
        <UserAvatar
          :avatar="user.avatar"
          :name="user.full_name"
          :initials="user.initials"
          :disabled="true"
        />
        <div>
          <div class="text position">
            {{user.full_name}}
          </div>
          <div class="text name">
            {{user.position}}, {{user.department}}
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <Page v-if="isReadOnly" :total="40" size="small"/>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar';
import axios from 'axios';

export default {
  components: { UserAvatar },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    onSelect: Function,
    isReadOnly: Boolean,
    isDisableContainer: Boolean,
    isSearch: Boolean,
    defaultUsers: Array,
    marginBottom: Number
  },
  computed: {
    model: {
      get() { return this.value; },
      set(value) { this.$emit("input", value) }
    },
    users() {
      return this.searched.length ? this.searched : this.defaultUsers;
    },
    isCanCheckAll() {
      const array = this.users.filter(e => (
        !this.model.some(ee => ee.id === e.id)
      ));

      return array.length;
    }
  },
  data() {
    return {
      searched: [],
      cancelToken: null,
      isCheckAll: true
    }
  },
  methods: {
    handleUserClick(user) {
      const isModelIncludes = this.isModelIncludes(user);

      if(!isModelIncludes) {
        this.model.push(user);
      }
      else {
        const index = this.model.findIndex(e => e.id === user.id);

        this.model.splice(index, 1);
      }
    },
    isModelIncludes(user) {
      const element = this.model.find(e => e.id === user.id);

      return !!element;
    },
    async handleSearch(event) {
      const query = event.target.value;

      if(!this.isSearch) {
        this.searched = this.defaultUsers.filter(e => (
          e.full_name.toLowerCase().startsWith(query)
        ));
        return;
      }

      if(this.cancelToken !== null) {
        this.cancelToken.cancel('Operation canceled by the user.');
        this.cancelToken = null;
      }

      if (query === '') {
        this.searched = [];
        return;
      }

      this.cancelToken = axios.CancelToken.source();

      try {
        const { board } = this.$route.params;
        const response = await axios.get(
          `/structures/structurepositionemployee/search_spe/?search=${query}`,
          { cancelToken: this.cancelToken.token }
        );

        this.searched = response.data;

        this.cancelToken = null;
      }
      catch(error) {}
    },
    handleCheckAllClick() {
      const users = this.searched.length ? this.searched : this.defaultUsers;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        const isModelIncludes = this.isModelIncludes(user);

        if(this.isCheckAll) {
          if(isModelIncludes) continue;

          this.model.push(user);
        }
        else {
          const index = this.model.findIndex(e => e.id === user.id);

          this.model.splice(index, 1);
        }
      }

      this.isCheckAll = !this.isCheckAll;
    }
  }
}
</script>

<style scoped>
.users-container {
  min-width: 461px;
  height: 438px;
  background-color: #FFFFFF;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  border-radius: 4px;
  margin: 4px;
  /* margin-bottom: 48px; */
  padding: 8px;

  margin-left: 24px; 
  overflow: auto;
}
.user {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
}
.avatar {
  min-width: 32px;
  max-height: 32px;
  margin-right: 12px;
}
.text {
  min-width: 250px;
  max-width: 350px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.position {
  font-weight: bold;
  font-size: 12px;
}
.search {
  padding: 8px 4px;
}
.pagination {
  margin-top: 8px;
  text-align: center;
}
</style>