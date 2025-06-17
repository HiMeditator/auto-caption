<template>
  <div
  class="caption-page"
  ref="caption"
  :style="{
    backgroundColor: captionStyle.backgroundRGBA
  }"
  >
    <div class="title-bar">
      <div class="drag-area">&nbsp;</div>
      <div class="option-item" @click="pinCaptionWindow">
        <PushpinFilled v-if="pinned" />
        <PushpinOutlined v-else />
      </div>
      <div class="option-item" @click="openControlWindow">
        <SettingOutlined />
      </div>
      <div class="option-item" @click="closeCaptionWindow">
        <CloseOutlined />
      </div>
    </div>
    <div class="caption-container">
      <p class="preview-caption" :style="{
        fontFamily: captionStyle.fontFamily,
        fontSize: captionStyle.fontSize + 'px',
        color: captionStyle.fontColor
      }">
        <span v-if="captionData.length">{{ captionData[captionData.length-1].text }}</span>
        <span v-else>{{ "This is a preview of subtitle styles." }}</span>
      </p>
      <p class="preview-translation" v-if="captionStyle.transDisplay" :style="{
        fontFamily: captionStyle.transFontFamily,
        fontSize: captionStyle.transFontSize + 'px',
        color: captionStyle.transFontColor
      }">
        <span v-if="captionData.length">{{ captionData[captionData.length-1].translation }}</span>
        <span v-else>{{ "这是字幕样式预览(翻译)" }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PushpinOutlined, PushpinFilled, CloseOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { ref, onMounted } from 'vue';
import { useCaptionStyleStore } from '@renderer/stores/captionStyle';
import { useCaptionLogStore } from '@renderer/stores/captionLog';
import { storeToRefs } from 'pinia';
const captionStyle = useCaptionStyleStore();
const captionLog = useCaptionLogStore();
const { captionData } = storeToRefs(captionLog);
const caption = ref();
const windowHeight = ref(100);
const pinned = ref(true);

onMounted(() => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      if(windowHeight.value !== Math.floor(entry.contentRect.height) + 2) {
        windowHeight.value = Math.floor(entry.contentRect.height) + 2;
        console.log('INFO window height change', windowHeight.value);
        window.electron.ipcRenderer.send('caption.windowHeight.change', windowHeight.value)
      }
    }
  });
  if (caption.value) {
    resizeObserver.observe(caption.value);
  }
});

function pinCaptionWindow() {
  pinned.value = !pinned.value;
  window.electron.ipcRenderer.send('caption.pin.set', pinned.value)
}

function openControlWindow() {
  window.electron.ipcRenderer.send('caption.controlWindow.activate')
}

function closeCaptionWindow() {
  window.electron.ipcRenderer.send('caption.window.close')
}
</script>

<style scoped>
.caption-page {
  width: 100%;
  user-select: none;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid #3333;
}

.title-bar {
  display: flex;
  align-items: center;
}

.drag-area {
  padding: 5px;
  flex-grow: 1;
  -webkit-app-region: drag;
}

.option-item {
  display: inline-block;
  padding: 5px 10px;
  cursor: pointer;
}

.option-item:hover {
  background-color: #2221;
}

.caption-container { 
  -webkit-app-region: drag;
}

.caption-container p {
  text-align: center;
  margin: 0;
  line-height: 1.5em;
  padding: 0 10px 10px 10px;
}
</style>