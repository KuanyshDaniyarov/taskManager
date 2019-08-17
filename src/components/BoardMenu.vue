<template>
  <div id="board-menu">
    <div id="board-menu-filters">
      <div v-if="isSearching" class="filters-container">
        <div class="filter">
          <Button
            shape="circle"
            icon="md-arrow-back"
            v-on:click="() => isSearching = false"/>
        </div>
        <Input
          class="filter"
          search
          enter-button
          style="flex: 1;"
          :placeholder="$t('search')"
          v-on:on-search="handleSearch"/>
      </div>

      <div v-else class="filters-container">
        <RadioGroup 
          v-model="model.assigned"
          v-on:on-change="handleChange">
          <Radio label="by-me" class="filter">
            <span>{{$t("i-assigned-tasks")}}</span>
          </Radio>
          <Radio label="to-me" class="filter">
            <span>{{$t("i-have-assigned-tasks")}}</span>
          </Radio>
          <Radio label="delegated" class="filter">
            <span>Делегированные</span>
          </Radio>
        </RadioGroup>
        <Checkbox 
          class="filter" 
          v-model="model.forToday"
          v-on:on-change="handleToday">
          {{$t("run-today")}}
        </Checkbox>
        <Checkbox 
          class="filter" 
          v-model="model.isUrgent"
          v-on:on-change="handleChange">
          {{$t("urgent")}}
        </Checkbox>
        <Checkbox 
          class="filter" 
          v-model="model.isControl"
          v-on:on-change="handleChange">
          {{$t("control")}}
        </Checkbox>
        <div class="filter">
          <DatePicker 
            type="date"
            style="width: 105px;"
            placeholder="От срока"
            format="dd.MM.yyyy"
            :value="model.interval.from"
            v-on:on-change="handleFromDate"/>
        </div>
        <div class="filter">
          <DatePicker
            type="date"
            style="width: 105px;"
            placeholder="До срока"
            format="dd.MM.yyyy"
            :options="toDateOptions"
            :value="model.interval.to"
            v-on:on-change="v => {model.interval.to = v; handleChange();}"/>
        </div>

        <div class="filter">
          <Button
            shape="circle" 
            icon="ios-search"
            v-on:click="() => isSearching = true"/>
        </div>
        <div class="filter">
          <Button
            shape="circle" 
            icon="md-people"
            v-on:click="handleUsersButtonClick"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar';

export default {
  components: { UserAvatar },
  computed: {
    isUsersHidden() {
      return this.$route.params.type === 'private';
    },
    toDateOptions() {
      const today = this.$store.state.today;
      const anotherData = this.model.interval.from;

      return {
        disabledDate(date) {
          if(anotherData) {
            const anotherDateValue = anotherData.split(".");

            const isLess = date < new Date(anotherDateValue[2], anotherDateValue[1] - 1, anotherDateValue[0]);


            return isLess;
          }
          
          return false;
        }
      }
    }
  },
  props: {
    onSearch: Function
  },
  data() {
    return {
      model: {
        assigned: "by-me",
        isControl: false,
        isUrgent: false,
        forToday: false,
        interval: {
          from: null,
          to: null
        }
      },
      users: {
        modal: false
      },
      isSearching: false
    }
  },
  mounted() {
    const board = this.$route.params.board;
    const stringWithJSON = localStorage.getItem(`filters-${board}`);
    const filters = JSON.parse(stringWithJSON);

    if(!!filters) {
      this.model = filters;
    }

    this.$emit('change', this.model);
  },
  methods: {
    handleSearchButtonClick() {
      this.isSearching = true;
    },
    handleEllipsisClick() {
      this.users.modal = true;
    },
    handleToday(value) {
      if(value) {
        this.model.interval.from = null;
        this.model.interval.to = null;
      }

      this.handleChange();
    },
    handleFromDate(value) {
      this.model.interval.from = value;

      // if(!!value && !this.model.interval.to) {
      //   this.model.interval.to = this.$store.state.today;
      // }

      if(!!this.model.interval.to) {
        const fromDateValue = this.model.interval.from.split(".");
        const toDateValue = this.model.interval.to.split(".");

        const fromDate = new Date(fromDateValue[2], fromDateValue[1] - 1, fromDateValue[0]);
        const toDate = new Date(toDateValue[2], toDateValue[1] - 1, toDateValue[0]);

        if(fromDate > toDate) {
          this.model.interval.to = null;
        }
      }

      this.model.forToday = false;

      this.handleChange();
    },
    handleToDate(value) {
      this.model.interval.to = value;

      this.model.forToday = false;

      this.handleChange();
    },
    handleChange() {
      const board = this.$route.params.board;
      const filters = this.model;
      const stringWithJSON = JSON.stringify(filters);

      localStorage.setItem(`filters-${board}`, stringWithJSON);

      this.$emit('change', this.model);
    },
    handleSearch(query) {
      this.$emit('search', query);
    },
    handleUsersButtonClick() {
      this.$emit('users-button-click');
    }
  }
}
</script>

<style scoped>
#board-menu {
  width: 100%;
  display: inline-block;
}
#board-menu-filters {
  padding: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  border-radius: 4px;
}
#board-menu-create {
  margin: 8px;
}
.filters-container {
  width: 100%;
  display: flex;
  align-items: center;
}
.filter {
  margin: 4px 6px;
}
.column {
  height: 42px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
#board-menu .users {
  display: flex;
  margin-top: 16px;
  padding: 16px;

  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  border-radius: 4px;
}
#board-menu .container {
  overflow: hidden;
  display: flex;
}
.avatar {
  margin-right: 8px;
}
.icon {
  cursor: pointer;
  margin-left: 4px;
}
</style>