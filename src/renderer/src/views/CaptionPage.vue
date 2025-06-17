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
      <div class="option-item">
        <PushpinOutlined class="option-icon" />
      </div>
      <div class="option-item">
        <SettingOutlined />
      </div>
      <div class="option-item">
        <CloseOutlined />
      </div>
    </div>
    <div class="caption-container">
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
      }">{{ "这是字幕样式预览(翻译)" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PushpinOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { ref, onMounted } from 'vue';
import { useCaptionStyleStore } from '@renderer/stores/captionStyle';
const captionStyle = useCaptionStyleStore();
const caption = ref();
const windowHeight = ref(100);

onMounted(() => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      if(windowHeight.value !== Math.floor(entry.contentRect.height)) {
        windowHeight.value = Math.floor(entry.contentRect.height);
        console.log('INFO window height change', windowHeight.value);
        window.electron.ipcRenderer.send('caption.windowHeight.change', windowHeight.value)
      }
    }
  });
  if (caption.value) {
    resizeObserver.observe(caption.value);
  }
});

function openControlWindow() {
  window.electron.ipcRenderer.send('caption.controlWindow.create')
}
</script>

<style scoped>
.caption-page {
  width: 100%;
  user-select: none;
  border-radius: 8px;
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
  line-height: 2em;
  padding: 0 10px 10px 10px;
}
</style>