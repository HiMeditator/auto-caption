<template>
  <a-button @click="test">打开控制窗口</a-button>
  <div class="preview-container" :style="{
    backgroundColor: captionStyle.backgroundRGBA
  }">
    <p class="preview-caption" :style="{
      fontFamily: captionStyle.fontFamily,
      fontSize: captionStyle.fontSize + 'px',
      color: captionStyle.fontColor
    }">
      {{ "This is a preview of subtitle styles." }}
    </p>
    <p class="preview-translation" v-if="captionStyle.transDisplay" :style="{
      fontFamily: captionStyle.transFontFamily,
      fontSize: captionStyle.transFontSize + 'px',
      color: captionStyle.transFontColor
    }">这是字幕样式预览(翻译)</p>
  </div>
</template>

<script setup lang="ts">
import { useCaptionStyleStore } from '@renderer/stores/captionStyle';
const captionStyle = useCaptionStyleStore();

function test() {
  window.electron.ipcRenderer.send('caption.controlWindow.create')
}
</script>

<style scoped>
.preview-container {
  line-height: 2em;
  width: 60%;
  text-align: center;
  position: absolute;
  padding: 20px;
  border-radius: 10px;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
}

.preview-container p {
  margin: 0;
  line-height: 1.5em;
}
</style>