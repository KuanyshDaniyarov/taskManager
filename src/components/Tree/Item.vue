<template>
  <div class="edm-tree-item " :id="isMe ? 'tree-item-me' : null">
    <div class="status">
      {{status}}
    </div>

    <Card 
      :border="false" 
      style="textAlign: initial" 
      :class="result_status_color"
      :padding="8">
      <div slot="title">
        <Row
          type="flex"
          align="middle">
          <Col :span="3">
            <Avatar icon="ios-person"/>
          </Col>
          <Col :span="19" class="nowrap" style="line-height: 1.5;">
            <span><a>{{ name }}</a></span>
            <br/>
            <span>{{ position }}</span>
          </Col>
        </Row>
      </div>

        <div class="information">
          <div 
            class="task" 
            v-for="task in jobs"
            :key="task.id">
            <span class="text">
              {{ task.name }}
            </span>
            <span class="date">
              {{ task.deadline }}
            </span>
          </div>
        </div>
    </Card>
  </div>
</template>

<script>
export default {
  props: {
    id: Number,
    name: String,
    position: String,
    jobs: {
      type: Array,
      default: () => []
    },
    status: String,

    top: String,
    type: String,
    avatar: String,
    task: String,
    date: String,
    status: String,
    isAnswering: Boolean,
    isReducer: Boolean,
    isMe: Boolean,
    is_viewed: Boolean,
    viewed_at: String,
    task_status_name: String,
    isDeletable: Boolean,
    onReducingClick: Function,
    onAddClick: Function,
    onDeleteClick: Function,
    result_status: Number,
    result_status_color: String,
    is_addressee: Boolean,
    sended_by_referent_name: String
  }
}
</script>

<style scoped>
.white {
  background: #fff;
}
.green {
  background: #A5D6A7;
}
.red {
  background: #EF9A9A;
}
.yellow {
  background: #FFF59D;
}
</style>

<style>
.edm-tree-item {
  width: 420px;
  display: inline-block;
  user-select: none;
}

.edm-tree-item .ivu-card-head {
  height: 71px;
}
.edm-tree-item .ivu-card-body {
  height: 175px;
}

.edm-tree-item .nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edm-tree-item .parent-status {
  margin-top: 8px;
  margin-bottom: 8px;
  /* color: #3399ff; */
  color: #9ea7b4;
}


.edm-tree-item .action {
  min-height: 20px;
  
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.edm-tree-item .status {
  /* position: relative; */
  margin-bottom: 8px;
  height: 20px;
}

/* .edm-tree-item .information {
  background-color: red;
} */
.edm-tree-item .information > div {
  margin-bottom: 8px;
}
.edm-tree-item .information > div:last-child{
  margin-bottom: 0;
}

.information {
  overflow: hidden;
  height: 100%;

  /* overflow: hidden; */
  /* word-wrap: break-word; */
}

.task:first-child {
  margin-top: 8px;
}
.task:last-child {
  margin-bottom: 8px;
}
.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task .text {
  margin: 0 8px;
}
.task .date {
  margin: 0 8px;
}

.edm-tree-item .ivu-poptip-rel {
  width: 100%;
}
</style>