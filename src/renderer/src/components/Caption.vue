<template>
  <div
    class="video-caption"
    v-if="captionContent"
    ref="captionTarget"
    :style="{
      color: captionFontColor,
      fontSize: captionFontSize + 'px',
      fontFamily: captionFontFamily
    }"
  >
    <div>{{ captionContent }}</div>
    <div>{{ translation }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCaptionStore } from '../stores/caption'
const captionContent = ref<String>("これは確か、ずっと前に人からもらって。")
const translation = ref<string>('这是很久以前从别人那里得到的。')
const {captionFontColor, captionFontFamily, captionFontSize} = storeToRefs(useCaptionStore())
const captionTarget = ref()

window.electron.ipcRenderer.on('new-caption', (_, data) => {
  captionContent.value = data
})
</script>

<style scoped>
.video-caption {
  color: white;
  background-color: rgba(99, 99, 99, 0.4);
  display: inline-block;
  max-width: 80%;
  padding: 10px;
  font-size: 32px;
  font-weight: bold;
  border-radius: 10px;
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}
</style>