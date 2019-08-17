<template>
  <div id="card">
    <Tabs
      v-if="isLoaded"
      v-model="currentTab"
      :animated="false"
      style="height: 100%;"
      v-on:on-click="handleTabChange">
      <TabPane label="Карточка задачи" name="card">
        <div class="card-container">
          <div class="form-container">
            <Form
              class="form"
              ref="form"
              :model="form.model"
              :rules="form.rules"
              label-position="top">
              <div :class="{readonly: isReadOnly }">
                <FormItem :label="$t('name')" prop="name">
                  <RecordingInput v-model="form.model.name"/>
                </FormItem>
                <FormItem :label="$t('description')">
                  <RecordingInput v-model="form.model.description"/>
                </FormItem>
                <FormItem :label="$t('type')" prop="types">
                  <Select v-model="form.model.types" multiple>
                    <Option
                      class="type-option"
                      v-for="option in form.options.types"
                      :value="option.id" :key="option.id">
                      <div
                        class="type-indicator"
                        :style="`background: ${option.color};`"/>
                      {{ option.name }}
                    </Option>
                  </Select>
                </FormItem>
                <Checkbox class="checkbox" v-model="form.model.is_control">
                  {{$t("control")}}
                  <Icon size="18" type="md-alert"/>
                </Checkbox>
                <Checkbox class="checkbox" v-model="form.model.is_urgent">
                  {{$t("urgent")}}
                  <Icon size="18" type="md-time"/>
                </Checkbox>
              </div>

              <Upload
                v-if="!isReadOnly || (isReadOnly && form.model.attachments_info.length)"
                ref="uploadRef"
                multiple with-credentials
                :action="`${$store.state.driveURL}/upload/`"
                :format="formats"
                :default-file-list="form.model.attachments_info"
                :on-format-error="handleFormatError"
                :on-preview="handlePreview">
                <Button 
                  v-if="!isReadOnly"
                  icon="ios-cloud-upload-outline">
                  {{$t('add-attachments')}}
                </Button>
                <h3 v-if="isReadOnly">
                  Файлы
                </h3>
              </Upload>

              <h2 class="tasks-header">
                Чек-лист заданий
              </h2>

              <div
                class="task"
                v-for="(task, index) in form.model.jobs"
                :key="task.vueKey"
                :style="{
                  fontWeight: (selectedTask === task) ? 'bold' : 'initial'
                }">

                <div>
                  <Checkbox
                    :disabled="!task.can_check"
                    v-model="task.is_checked_by_me"
                    size="large"
                    style="margin-top: 28px"
                    v-on:on-change="(value) => handleCheckTask(task.id, value)"/>
                </div>
                <div style="flex: 1;">
                  <div class="form-line">
                    <FormItem
                      label="Задание"
                      :prop="'jobs.' + index + '.name'"
                      :rules="{required: true, message: ' ', pattern: /([^\s])/}"
                      :style="{
                        minWidth: '385px',
                        marginBottom: '12px'
                      }">
                      <RecordingInput 
                        v-model="task.name" 
                        :readonly="isReadOnly || task.is_checked || task.is_checked_by_me"
                        :onFocus="e => handleSelectTask(task)"/>
                    </FormItem>
                    <FormItem
                      :label="$t('execution-date')"
                      :prop="'jobs.' + index + '.deadline'"
                      :rules="{required: true, message: ' ', pattern: /([^\s])/}"
                      :style="{
                        width: '120px',
                        marginBottom: '12px'
                      }">
                      <DatePicker
                        transfer
                        :value="task.deadline"
                        v-on:on-change="v => $set(task, 'deadline', v)"
                        :class="{readonly: isReadOnly || task.is_checked || task.is_checked_by_me}"
                        v-on:on-open-change="value => value && handleSelectTask(task)"
                        format="dd.MM.yyyy"
                        :options="dateOptions"/>
                    </FormItem>

                    <Button
                      v-if="!isReadOnly"
                      shape="circle"
                      icon="md-trash"
                      v-on:click="() => handleTaskDelete(index)"/>
                    <Button
                      v-if="index === (form.model.jobs.length - 1) && !isReadOnly"
                      type="primary"
                      shape="circle"
                      icon="md-add"
                      v-on:click="e => handleTaskAdd(task)"/>
                    <Button
                      v-if="task.can_delegate"
                      shape="circle"
                      icon="md-arrow-down"
                      v-on:click="e => handleDelegate(task)"/>

                    <div
                      v-if="index !== (form.model.jobs.length - 1) || isReadOnly"
                      style="width: 32px;"/>
                  </div>

                  <div class="avatars-container">
                    <UserAvatar
                      v-for="user in task.participants_info"
                      :key="user.id"
                      :avatar="user.avatar"
                      :name="user.name"
                      :initials="user.initials"
                      :primary="!!user.head"/>
                  </div>
                </div>
              </div>
            </Form>

            <div v-if="!isReadOnly">
              <Button 
                v-if="!!id"
                type="dashed"
                v-on:click="handleDelete"
                :loading="form.isDeleting"
                style="margin-right: 8px;">
                {{ 'Удалить карточку' }}
              </Button>              
              <Button 
                type="primary"
                v-on:click="handleSave"
                :loading="form.isSaving">
                {{ !id ? 'Создать карточку' : 'Изменить карточку' }}
              </Button>
            </div>
          </div>

          <transition name="fade" v-if="!isPrivate">
            <Users
              v-if="selectedTask !== null"
              v-model="selectedTask.participants_info"
              :defaultUsers="form.options.participants"
              :marginBottom="usersMarginBottom"
              :isSearch="$route.params.type==='organization'"/>
          </transition>
        </div>

        <div v-if="comments.length > 0" class="comments-container">
          <h2 class="tasks-header">
            Комментарии
          </h2>

          <div style="margin-bottom: 16px;">
            <Input 
              placeholder="Комментарий"
              v-model="comment"
              type="textarea"
              :rows="2"
              style="margin-bottom: 8px;"/>
            <Upload
              ref="commentUploadRef"
              multiple with-credentials
              :action="`${$store.state.driveURL}/upload/`"
              :format="formats"
              :on-format-error="handleFormatError"
              :on-preview="handlePreview">
              <Button 
                icon="ios-cloud-upload-outline">
                Добавить вложения
              </Button>
            </Upload>
            <div style="text-align: end;">
              <Button type="primary" v-on:click="handleSendComment">
                Отправить
              </Button>
            </div>
          </div>

          <div 
            class="comment"
            v-for="comment in getCommentsWithTasks" 
            :key="comment.id">
            <UserAvatar
              :avatar="comment.creator.avatar"
              :name="comment.creator.name"
              :initials="comment.creator.initials"/>
            <div>
              <div>
                <b>{{comment.creator.full_name}}</b>
                {{"  " + comment.created_at}}
              </div>
              <div v-if="comment.job_info">
                {{comment.job_info.name}} - Выполнено
              </div>
              <div class="comment-text">
                {{comment.text}}
              </div>
              <div v-if="comment.attachments_info.length > 0">
                Файлы:
                <span
                  v-for="(file, index) in comment.attachments_info"
                  :key="file.id">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    :href="$store.state.driveURL + '/view/' + file.id">
                    {{file.original_name}}
                  </a>
                  <span v-if="index !== comment.attachments_info.length - 1">
                    |
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </TabPane>
      <TabPane label="Ход исполнения" name="tree" v-if="!isPrivate && !!id">
        <Tree :tree="tree"/>
      </TabPane>
    </Tabs>
    <Spin size="large" fix v-else/>

    <Modal
      :loading="checking.loading"
      v-model="checking.modal"
      title="Сообщить о выполнении"
      v-on:on-ok="requestChecking"
      v-on:on-visible-change="value => !value && handleCheckingClose()">
      <Form
        ref="checkingForm"
        :rules="checking.rules"
        :model="checking.form"
        label-position="top">
        <FormItem label="Комментарий" prop="text">
          <Input
            v-model="checking.form.text"
            type="textarea"
            :rows="4"
            placeholder="Введите текст" />
        </FormItem>
      </Form>
        <Upload
          style="margin-top: 16px;"
          ref="checkingUploadRef"
          multiple with-credentials
          :action="`${$store.state.driveURL}/upload/`"
          :format="formats"
          :on-format-error="handleFormatError"
          :on-preview="handlePreview">
          <Button
            icon="ios-cloud-upload-outline">
            {{$t('add-attachments')}}
          </Button>
        </Upload>
    </Modal>

    <Modal
      :loading="delegate.loading"
      v-model="delegate.modal"
      title="Делегировать"
      v-on:on-ok="requestDelegate"
      v-on:on-visible-change="value => !value && handleDelegateClose()">
      <Users
        v-if="!delegate.isLoadingData"
        isDisableContainer
        v-model="delegate.form.subordinates"
        :defaultUsers="delegate.options.subordinates"
        :isSearch="$route.params.type==='organization'"/>
      <div v-else style="height: 60px;">
        <Spin size="large" fix/>
      </div>
    </Modal>
  </div>
</template>

<script>
import Tree from '../components/Tree';
import Users from '../components/Users';
import UserAvatar from '../components/UserAvatar';
import RecordingInput from '../components/RecordingInput';

import axios from 'axios';

function getDelegateObject() {
  return {
    isLoadingData: true,
    loading: true,
    modal: false,
    form: {
      job: null,
      subordinates: []
    },
    options: {
      subordinates: []
    }
  }
}

export default {
  components: { Tree, Users, UserAvatar, RecordingInput },
  computed: {
    isPrivate() {
      const isPrivate = this.$route.params.type === 'private';

      return isPrivate;
    },
    usersMarginBottom() {
      const length = this.form.model.jobs.length;
      const index = this.form.model.jobs.indexOf(this.selectedTask);

      const count = length - (index + 1);

      return 48 + (count * 112);
    },
    dateOptions() {
      const today = this.$store.state.today;

      return {
        disabledDate(date) {
          const todayValues = today.split(".");

          const isLessToday = date < new Date(todayValues[2], todayValues[1] - 1, todayValues[0]);

          return isLessToday;
        }
      }
    },
    getCommentsWithTasks() {
      const commentsWithTasks = this.comments
      .map(comment => ({
        ...comment, 
        job_info: this.form.model.jobs.find(job => (job.id === comment.job))
      }));

      return commentsWithTasks;
    }
  },
  data() {
    return {
      id: null,
      currentTab: 'card',
      form: {
        model: {
          name: '',
          description: '',
          types: null,
          is_control: false,
          is_urgent: false,
          jobs: [
            {
              name: '',
              deadline: '',
              vueKey: '0',
              participants_info: []
            }
          ],
          column: null,
          attachments_info: []
        },
        rules: {
          name: [{ required: true, message: ' ', pattern: /([^\s])/ }]
        },
        options: {
          types: [],
          participants: []
        },
        isSaving: false,
        isDeleting: false
      },
      isBoardArchived: false,
      selectedTask: null,
      formats: ['pdf', 'rar', 'zip', 'docx', 'doc', 'xml', 'ppt', 'pptx', 'xlsx'],
      isLoaded: false,
      isReadOnly: false,
      checking: {
        modal: false,
        loading: true,
        form: {
          text: null
        },
        rules: {
          text: [{ required: true, message: ' ', pattern: /([^\s])/ }]
        },
      },
      delegate: getDelegateObject(),
      tree: null,
      comment: "",
      comments: []
    }
  },
  async mounted() {
    try {
      const typesResponse = await axios.get('/tm/task-types/');

      this.form.options.types = typesResponse.data;
    }
    catch(error) {
      this.$Message.error('Произошла ошибка');
      return;
    }

    if(this.$route.params.type !== 'private') {
      if(this.$route.params.type === 'command') {
        try {
          const particapantsResponse = await axios.get('/structures/structurepositionemployee/all_subs/');

          this.form.options.participants = particapantsResponse.data;
        }
        catch(error) {
          this.$Message.error('Произошла ошибка');
          return;
        }
      }
    }

    const boardResponse = await axios.get(`/tm/boards/${parseInt(this.$route.params.board)}`);
    const boardData = boardResponse.data;

    // const boardsByCurrentType = this.$store.state.types.find(e => (
    //   e.id === this.$route.params.type
    // ));

    // const currentBoard = boardsByCurrentType.children.find(e => (
    //   e.id === parseInt(this.$route.params.board)
    // ));

    this.form.model.column = boardData.new_tasks_id;

    const id = parseInt(this.$route.params.card);

    if(id) {
      this.id = id;

      try {
        const taskResponse = await axios.get(`/tm/tasks/${this.id}/`);

        const obj1 = this.form.model;
        const obj2 = taskResponse.data;

        console.log(obj2);

        this.isReadOnly = !obj2.permissions.can_all || boardData.is_archived;
        this.comments = obj2.comments;

        Object.keys(obj2)
        .filter(key => key in obj1)
        .forEach(key => obj1[key] = obj2[key]);
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
        return;
      }
    }

    this.isLoaded = true;
  },
  methods: {
    async fetchTree() {
      this.isLoaded = false;

      try {
        const response = await axios.get(`/tm/tasks/${this.id}/tree/`);
        const data = response.data;

        this.tree = [data];
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
        return;
      }

      this.isLoaded = true;
    },
    handleTabChange(value) {
      if(value === 'tree') {
        this.fetchTree();
      }
      // console.log(value);
    },
    handleFormatError(file) {
      this.$Message.error({
        content: "Недопустимый формат файла. Допустимые форматы: " +
        this.formats.join(", "),
        duration: 3
      });
    },
    handleTaskAdd(task) {
      if(!task.name) {
        this.$Message.error("Не выписано задание");
        return;
      }
      if(!task.deadline) {
        this.$Message.error("Не указан срок исполнения");
        return;
      }
      if(task.participants_info.length === 0 && !this.isPrivate) {
        this.$Message.error("Не выбраны участники задания");
        return;
      }

      this.form.model.jobs.push({ 
        vueKey: new Date().getTime(), participants_info: [] 
      });

      this.selectedTask = null;

      this.$set(task, 'created', true);
    },
    handleTaskDelete(index) {
      this.$Modal.confirm({
        title: this.$t('deleting'),
        content: "<p>" + this.$t('delete-agreement') + "</p>",
        onOk: () => {
          this.form.model.jobs.splice(index, 1);

          if(this.form.model.jobs.length === 0) {
            this.form.model.jobs.push({
              vueKey: new Date().getTime()
            });

            this.selectedTask = null;
          }
        }
      });
    },
    handleSelectTask(task) {
      if(task.is_checked || task.is_checked_by_me) return;
      if(this.isReadOnly) return;
      this.selectedTask = task;
    },
    async handleSave() {
      const isFormValid = await new Promise(resolve =>
        this.$refs.form.validate(v => resolve(v))
      );

      if(!isFormValid) {
        this.$Message.error("Необходимо заполнить поля");
        return;
      }

      if(!this.isPrivate) {
        for (let i = 0; i < this.form.model.jobs.length; i++) {
          const job = this.form.model.jobs[i];

          if(job.participants_info.length === 0) {
            this.$Message.error("У одного из задания отсутствуют участники");
            return;
          }
          else {
            job.participants = job.participants_info.map(e => e.id);
          }
        }
      }

      this.form.isSaving = true;

      const data = {
        name: this.form.model.name,
        description: this.form.model.description,
        types: this.form.model.types,
        is_control: this.form.model.is_control,
        is_urgent: this.form.model.is_urgent,
        attachments: this.$refs.uploadRef.fileList.map(e => (
          e.id || e.response.id
        )),
        jobs: this.form.model.jobs.map(e => ({
          id: e.id,
          name: e.name,
          deadline: e.deadline,
          participants: e.participants
        })),
        column: this.form.model.column,
        order: 0
      };

      try {
        if(!this.id) {
          const taskResponse = await axios.post('/tm/tasks/', data);
        }
        else {
          const taskResponse = await axios.patch(`/tm/tasks/${this.id}/`, data);
        }

        this.$router.go(-1);

        this.$Message.success("Успешно сохранено");
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
      }

      this.form.isSaving = false;
    },
    async handleDelete() {
      this.$Modal.confirm({
        loading: true,
        title: "Удалить карточку",
        content: "<p>" + "Вы уверены, что хотите удалить данную карточку?" + "</p>",
        onOk: async () => {
          try {
            const response = await axios.delete(`/tm/tasks/${this.$route.params.card}/`);
            this.$router.go(-1);
          }
          catch(error) {
            console.log(error);
            this.$Message.error("Произошла ошибка");
          }

          this.$Modal.remove();
        }
      })
    },
    handlePreview(file) {
      window.open(this.$store.state.driveURL + '/view/' + (file.id || file.response.id));
    },
    handleCheckTask(taskId, value) {
      if(!value) return;

      this.checking.form.job = taskId;
      this.checking.modal = true;
    },
    handleCheckingClose() {
      const job = this.form.model.jobs.find(e => (
        e.id === this.checking.form.job
      ));

      if(!job.can_check) return;

      this.$set(job, 'is_checked_by_me', false);
    },
    async requestChecking() {
      const isFormValid = await new Promise(resolve =>
        this.$refs.checkingForm.validate(v => resolve(v))
      );

      if(!isFormValid) {
        this.$Message.error("Необходимо заполнить поля");
        this.checking.loading = false;
        await this.$nextTick();
        this.checking.loading = true;
        return;
      }

      const form = {
        ...this.checking.form,
        attachments: this.$refs.checkingUploadRef.fileList.map(e => (
          e.id || e.response.id
        ))
      }

      try {
        const checkingResponse = await axios.post('/tm/comments/', form);
        const checkingData = checkingResponse.data;
  
        this.comments.unshift(checkingData.comment);

        const job = this.form.model.jobs.find(e => e.id === form.job);

        this.$set(job, 'can_check', false);
        this.$set(job, 'can_delegate', false);

        this.checking.form.text = null;
        this.$refs.checkingUploadRef.clearFiles();

        this.$Message.success("Успешно сохранено");
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
      }

      this.checking.modal = false;
    },
    async handleDelegate(task) {
      console.log(task);
      
      this.delegate.modal = true;
      this.delegate.form.job = task.id;

      try {
        const response = await axios.get(`/tm/jobs/${task.id}/not-delegated/`);
        const data = response.data;

        this.delegate.options.subordinates = data.participants;
        if(task.delegations.length > 0) {
          this.delegate.form.subordinates = task.delegations[task.delegations.length - 1].subordinates_info
        }
      }
      catch(error) {
        console.log(error);
        this.$Message.error('Произошла ошибка');
        return;
      }

      this.delegate.isLoadingData = false;
    },
    async requestDelegate() {
      const body = {
        job: this.delegate.form.job,
        subordinates: this.delegate.form.subordinates.map(e => e.id)
      }

      const job = this.form.model.jobs.find(e => e.id === body.job);

      try {
        const response = (job.delegations.length === 0)
        ? await axios.post('/tm/delegations/', body)
        : await axios.patch(`/tm/delegations/${job.delegations[job.delegations.length - 1].id}/`, body);

        const data = response.data;

        this.$set(job, 'participants_info', [data.delegate_info, ...data.subordinates_info]);

        if(job.delegations.length === 0) {
          job.delegations.push(data);
        }
        else {
          const index = job.delegations.findIndex(e => (e.id === data.id));

          job.delegations[index] = data;
        }

        this.delegate = getDelegateObject();

        this.$Message.success("Успешно сохранено");
      }
      catch(error) {
        this.$Message.error('Произошла ошибка');
      }
    },
    handleDelegateClose() {
      this.delegate = getDelegateObject();
    },
    async handleSendComment() {
      const data = {
        text: this.comment,
        attachments: this.$refs.commentUploadRef.fileList.map(e => (
          e.id || e.response.id
        )),
        task: this.id
      };

      const commentRes = await axios.post('/tm/comments/', data);
      const commentData = commentRes.data.comment;

      this.comments.unshift(commentData);

      this.comment = "";
      this.$refs.commentUploadRef.fileList = [];
    }
  }
}
</script>

<style>
.users-modal .ivu-modal-body {
  padding: 8px;
}
.ivu-tabs {
  overflow: auto;
}
.ivu-tabs, .ivu-tabs-content, .ivu-tabs-tabpane {
  height: 100%;
}
/* .checkbox .ivu-checkbox-inner {
  border-color: #58A1F3;
} */
</style>

<style scoped>
.comments-container {
  padding: 0 16px;
}
.comment-text {
  display: inline-block;
  margin: 4px 0;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dcdee2;
}
.comment {
  /* padding: 16px 0; */
  padding-bottom: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdee2;
}
.task {
  display: flex;
  align-items: flex-start;
}
.readonly {
  pointer-events: none;
}
#card {
  height: 100%;

  background-color: #FFFFFF;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  border-radius: 4px;
}
#card .form-container {
  flex: 1;
  max-width: 800px;
  padding-bottom: 16px;
}
.card-container {
  display: flex;
  padding: 0 16px;
  align-items: flex-end;
}
.header {
  display: flex;
  margin-top: 8px;
  margin-bottom: 24px;
  line-height: 1;
}
.header .return {
  cursor: pointer;
  margin-right: 12px;
}
.type-option {
  display: flex;
  align-items: center;
}
.type-indicator {
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 5px;
}
.checkbox:first-of-type {
  margin-left: 0;
}
.checkbox {
  margin-left: 8px;
  margin-bottom: 24px;
}
.tasks-header {
  margin-top: 24px;
  margin-bottom: 16px;
}
.progress {
  margin-bottom: 16px;
}

.form-line {
  display: flex;
}
.form-line > * {
  margin-right: 16px;
}
.form-line > *:last-child {
  margin-right: 0;
}
.form-line > button {
  margin-top: 22px;
}

.avatars-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.avatars-container .user-avatar {
  margin-bottom: 8px;
}
.avatar-task {
  /* margin-top: 26px; */
  min-width: 24px;
  min-height: 24px;
  margin-right: 8px;
}
.form-line > .avatar-task {
  margin-right: 12px;
}
.task-more {
  margin-top: 28px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s ease-in;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>