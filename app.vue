<template>
  <div class="app">
    <div>app组件</div>
    <div>{{ title }}</div>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const title = ref("hello, kvite!");
    setInterval(() => {
      title.value = title.value.split("").reverse().join("");
    }, 1000);
    return { title };
  },
};
</script>
