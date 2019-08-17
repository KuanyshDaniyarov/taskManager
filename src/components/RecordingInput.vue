<template>
  <Input 
    ref="input"
    v-model="model"
    :maxlength="128"
    :readonly="readonly"
    v-on:on-focus="handleFocus">
    <Button
      v-if="isChrome"
      icon="md-microphone"
      slot="append"
      :icon="isRecording ? 'md-checkmark' : 'md-microphone'"
      v-on:click="handleRecordButton"/>
  </Input>
</template>

<script>
export default {
  props: {
    item: Object,
    value: {
      type: [ String, Number ],
      default: ''
    },
    onFocus: Function,
    readonly: Boolean
  },
  computed: {
    model: {
      get() { return this.value; },
      set(value) { this.$emit("input", value); }
    }
  },
  data() {
    return {
      isChrome: true,
      isRecording: false
    }
  },
  mounted() {
    var chrome   = navigator.userAgent.indexOf('Chrome') > -1;
    var explorer = navigator.userAgent.indexOf('MSIE') > -1;
    var firefox  = navigator.userAgent.indexOf('Firefox') > -1;
    var safari   = navigator.userAgent.indexOf("Safari") > -1;
    var camino   = navigator.userAgent.indexOf("Camino") > -1;
    var opera    = navigator.userAgent.toLowerCase().indexOf("op") > -1;
    if ((chrome) && (safari)) safari = false;
    if ((chrome) && (opera)) chrome = false;

    this.isChrome = chrome;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ru-RU';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = event => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;

      if(!this.value) {
        this.$emit("input", transcript);
      }
      else {
        this.$emit("input", this.value + ' ' + transcript);
      }
    };

    this.recognition.onspeechend = () => {
      this.recognition.stop();
      this.isRecording = false;
    };
  },
  methods: {
    handleRecordButton() {
      this.$refs.input.focus();

      if(!this.isRecording) {
        this.recognition.start();
        this.isRecording = true;
      }
      else {
        this.recognition.stop();
        this.isRecording = false;
      }
    },
    handleFocus() {
      if(this.onFocus) this.onFocus();
    }
  }
}
</script>

<style scoped>

</style>