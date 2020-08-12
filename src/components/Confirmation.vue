<template>
  <div>
    <b-alert variant="success" show>
      {{ message }}
    </b-alert>
  </div>
</template>

<script>
export default {
  name: 'Confirmation',
  // props: ['message'],
  props: {
    message: String,
    // showConf: Boolean,
  },
};
</script>

<style scoped>

</style>
