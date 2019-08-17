<template>
  <Select
    filterable remote transfer clearable
    :remote-method="search"
    :loading="cancelToken !== null"
    :placeholder="placeholder"
    :multiple="multiple"
    :disabled="disabled"
    v-model="model">
    <Option
      v-for="option in options"
      :value="option.id" :key="option.id"
    >{{ option.name }}</Option>
  </Select>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    placeholder: String,
    multiple: Boolean,
    disabled: Boolean,
    value: {
      type: [ String, Number, Array ],
      default: ''
    },
    initialData: Array
  },
  computed: {
    model: {
      get() { return this.value; },
      set(value) { this.$emit("input", value); }
    },
    options() {
      return (this.data.length === 0) ? this.initialData : this.data;
    },
  },
  data() {
    return {
      data: [],
      cancelToken: null
    }
  },
  methods: {
    async search(query) {
      if(this.cancelToken !== null) {
        this.cancelToken.cancel('Operation canceled by the user.');
        this.cancelToken = null;
      }

      if (query === '') {
        this.data = [];
        return;
      }

      this.cancelToken = axios.CancelToken.source();

      try {
        const response = await axios.get(
          `/structures/structurepositionemployee/search_spe/?search=${query}`,
          { cancelToken: this.cancelToken.token }
        );

        this.data = response.data;

        this.cancelToken = null;
      }
      catch(error) {}
    },
  }
}
</script>

<style scoped>

</style>