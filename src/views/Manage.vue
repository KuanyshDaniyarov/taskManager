<template>
  <div>
    <Modal
      v-model="modal.model"
      :title="(id === null) ? $t(`create-${$route.params.type}`) : $t('edit')"
      v-on:on-cancel="handleCancel"
      v-on:on-ok="handleOk"
      :loading="modal.loading"
      :width="isOrganization ? 1024 : 520">

      <div style="display: flex;">
        <div style="width: 488px;">
          <Form
            ref="form"
            :model="form.model"
            :rules="form.rules"
            label-position="top">
            <FormItem :label="$t('name')" prop="name">
              <Input v-model="form.model.name"/>
            </FormItem>
            <FormItem :label="$t('description')">
              <Input v-model="form.model.description"/>
            </FormItem>
            <FormItem :label="$t('background-color')">
              <ColorPicker v-model="form.model.bg_color" recommend/>
            </FormItem>
            <FormItem :label="$t('background-image')">
              <ImagePicker
                v-model="form.model.bg_img"
                :images="options.images"/>
            </FormItem>
          </Form>
        </div>

        <div class="members-form" v-if="isOrganization">
          <Row style="margin-bottom: 8px;">
            <b>Участники</b>
          </Row>
          <Row class="row">
            <Checkbox 
              v-model="form.model.add_all"
              v-on:on-change="handleAllCheck">
              <span>Все</span>
            </Checkbox>
          </Row>
          <Row class="row">
            <Checkbox
              v-model="form.model.add_chiefs" 
              :disabled="form.model.add_all">
              <span>Все руководители</span>
            </Checkbox>
          </Row>
          <Row class="row">
            <Checkbox
              v-model="form.model.add_management_team" 
              :disabled="form.model.add_all">
              <span>Руководящий состав</span>
            </Checkbox>
          </Row>

          <Row style="margin-bottom: 8px;">
            <b>Добавьте дополнительных сотрудников, если необходимо</b>
          </Row>
          <Row class="row">
            <SelectUser
              placeholder="Поиск"
              multiple
              v-model="form.model.extra_participants"
              :initialData="form.options.extra_participants_info"
              :disabled="form.model.add_all"/>
          </Row>

          <Row>
            <b>Выбрать из структуры организации</b>
          </Row>
          <Row>
            <Tree
              ref="departmentsTreeRef"
              :data="departmentsTree"
              show-checkbox check-directly
              v-on:on-check-change="handleDepartmentsTreeCheck"/>
          </Row>
        </div>
      </div>
      
    </Modal>
  </div>
</template>

<script>
import ImagePicker from '../components/ImagePicker';
import Users from '../components/Users';
import SelectUser from '../components/SelectUser';

export default {
  components: { ImagePicker, Users, SelectUser },
  computed: {
    isOrganization() {
      const isOrganization = this.$route.params.type === 'organization';

      return isOrganization;
    },
    departmentsTree() {
      return this.$store.state.departmentsTree;

      // const departmentsTree = [...this.$store.state.departmentsTree];

      // this.$set(departmentsTree[0], 'disabled', this.form.model.add_all);

      // return departmentsTree;
    }
  },
  data() {
    return {
      id: null,
      modal: {
        model: false,
        loading: true
      },
      form: {
        model: {
          name: '',
          description: '',
          bg_color: '#FFFFFF',
          bg_img: '',

          add_all: false,
          add_chiefs: false,
          add_management_team: false,
          extra_participants: [],
          departments: [],
        },
        rules: {
          name: [{ required: true, message: ' ', pattern: /([^\s])/ }]
        },
        options: {
          extra_participants_info: []
        }
      },
      options: {
        images: [
          this.$store.state.driveURL + '/static/' + 'gory-skaly-zelen-trava-solnechno.jpg',
          this.$store.state.driveURL + '/static/' + 'ozero-most-korabl.jpg',
          this.$store.state.driveURL + '/static/' + 'lep-pole-tuman-1.jpg',
          this.$store.state.driveURL + '/static/' + 'norvegiia-haugesund-norway.jpg',
          this.$store.state.driveURL + '/static/' + 'lake-jasna-julian-alps-kranjska-gora-slovenia-ozero-iasna-iu.jpg',
          this.$store.state.driveURL + '/static/' + 'aleksandar-pasaric-by-aleksandar-pasaric-gray-concrete-road.jpg',
          this.$store.state.driveURL + '/static/' + 'islandiia-pesok-gory-bereg-vershiny-diuny.jpg',
          this.$store.state.driveURL + '/static/' + 'ozero-gory-domik.jpg',
          this.$store.state.driveURL + '/static/' + 'scotland-ozero-zamok.jpg'
        ]
      }
    }
  },
  mounted() {
    if(this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);

      const boardsByCurrentType = this.$store.state.types.find(e => (
        e.id === this.$route.params.type
      ));

      const currentBoard = boardsByCurrentType.children.find(e => (
        e.id === this.id
      ));

      if(!currentBoard || !currentBoard.permissions.can_all) {
        this.$Message.error('У вас нет прав на редактирование');
        this.modal.model = false;
        this.$router.push(`/${this.$route.params.type}`);
        return;
      }

      const obj1 = this.form.model;
      const obj2 = currentBoard;

      Object.keys(obj2)
      .filter(key => key in obj1)
      .forEach(key => obj1[key] = obj2[key]);

      if(this.isOrganization) {
        this.form.options.extra_participants_info = currentBoard.extra_participants_info;
        this.refreshDepertmentsTree();
      }
    }

    this.modal.model = true;
  },
  methods: {
    refreshDepertmentsTree() {
      this.setSelectedDepartments(this.departmentsTree);

      const indeterminatedNodes = this.$refs.departmentsTreeRef
      .getCheckedAndIndeterminateNodes()
      .filter(e => e.indeterminate);

      for (let i = indeterminatedNodes.length - 1; i >= 0; i--) {
        const indeterminatedNode = indeterminatedNodes[i];
        
        for (let ii = 0; ii < indeterminatedNode.children.length; ii++) {
          const indeterminatedNodeChild = indeterminatedNode.children[ii];
          
          if(!indeterminatedNodeChild.checked && !indeterminatedNodeChild.indeterminate) {
            this.$set(indeterminatedNode, 'indeterminate', false);
          }
        }
      }
    },
    setSelectedDepartments(data) {
      for (let i = 0; i < data.length; i++) {
        const element = data[i];

        const value = this.form.model.departments.includes(element.id);
        
        this.$set(element, 'checked', value);
        this.$set(element, 'expand', false);

        if(element.children && element.children.length) {
          this.setSelectedDepartments(element.children);
        }
      }
    },
    async handleCancel() {
      await new Promise(resolve => setTimeout(resolve, 300));

      this.$router.push(`/${this.$route.params.type}/all`);
    },
    async handleOk() {
      const isFormValid = await new Promise(resolve =>
        this.$refs.form.validate(v => resolve(v))
      );

      if(!isFormValid) {
        this.$Message.error("Необходимо заполнить поля");

        this.modal.loading = false;
        await this.$nextTick();
        this.modal.loading = true;

        return;
      }

      if(
        this.isOrganization &&
        !this.form.model.add_all &&
        !this.form.model.add_chiefs &&
        !this.form.model.add_management_team &&
        this.form.model.extra_participants.length === 0 &&
        this.form.model.departments.length === 0
      ) {
        this.$Message.error("Необходимо добавить участников");

        this.modal.loading = false;
        await this.$nextTick();
        this.modal.loading = true;
        
        return;
      }

      if(!this.isOrganization) {
        delete this.form.model.add_all;
        delete this.form.model.add_chiefs;
        delete this.form.model.add_management_team;
        delete this.form.model.extra_participants;
        delete this.form.model.departments;
      }

      let error;

      if(this.id === null) {
        error = await this.$store.dispatch('createBoard', {
          model: this.form.model,
          type: this.$route.params.type
        });
      }
      else {
        error = await this.$store.dispatch('updateBoard', {
          id: this.id,
          model: this.form.model,
          type: this.$route.params.type
        });
      }

      if(!error) {
        this.modal.model = false;

        this.handleCancel();
      }
      else {
        this.$Message.error("Произошла ошибка");
      }
    },
    handleDepartmentsTreeCheck(array) {
      this.form.model.departments = array.map(e => e.id);
    },
    handleAllCheck(value) {
      if(value) {
        this.form.model.add_chiefs = false;
        this.form.model.add_management_team = false;
        this.form.model.extra_participants = [];
        this.form.model.departments = [];

        this.refreshDepertmentsTree();
      }

      this.$set(this.departmentsTree[0], 'disabled', value);
    }
  }
}
</script>

<style>
.ivu-color-picker-picker {
  width: 286px;
}

.members-form {
  flex: 1;
  max-width: 516px;
  padding: 0 16px;
  overflow-x: auto;
}
.row {
  margin-bottom: 10px;
}
</style>
