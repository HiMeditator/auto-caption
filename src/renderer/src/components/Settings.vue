<template>
    <div class="settings">
      <input type="color" v-model="captionFontColor">
      <input type="text" v-model="captionFontFamily">
      <input type="number" v-model="captionFontSize">
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCaptionStore } from '../stores/caption'
const {captionFontColor, captionFontFamily, captionFontSize} = storeToRefs(useCaptionStore())
</script>

<style scoped>
.settings {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: black;
  box-sizing: border-box;
}
input {
  height: 30px;
  margin: auto 20px;
}
</style>