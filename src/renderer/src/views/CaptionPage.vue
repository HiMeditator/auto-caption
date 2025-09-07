<template>
  <div
    class="caption-page"
    ref="caption"
    :style="{
      backgroundColor: captionStyle.backgroundRGBA
    }"
  >
    <div
      class="caption-container"
      :style="{
        textShadow: captionStyle.textShadow ? `${captionStyle.offsetX}px ${captionStyle.offsetY}px ${captionStyle.blur}px ${captionStyle.textShadowColor}` : 'none'
      }"
    >
      <template v-if="captionData.length">
        <template
          v-for="val in revArr[Math.min(captionStyle.lineNumber, captionData.length)]"
          :key="captionData[captionData.length - val].time_s"
        >
          <p :class="[captionStyle.lineBreak?'':'left-ellipsis']" :style="{
            fontFamily: captionStyle.fontFamily,
            fontSize: captionStyle.fontSize + 'px',
            color: captionStyle.fontColor,
            fontWeight: captionStyle.fontWeight * 100
          }">
            <span>{{ captionData[captionData.length - val].text }}</span>
          </p>
          <p :class="[captionStyle.lineBreak?'':'left-ellipsis']"
            v-if="captionStyle.transDisplay && captionData[captionData.length - val].translation"
            :style="{
            fontFamily: captionStyle.transFontFamily,
            fontSize: captionStyle.transFontSize + 'px',
            color: captionStyle.transFontColor,
            fontWeight: captionStyle.transFontWeight * 100
          }">
            <span>{{ captionData[captionData.length - val].translation }}</span>
          </p>
        </template>
      </template>
      <template v-else>
        <template v-for="val in captionStyle.lineNumber" :key="val">
          <p :class="[captionStyle.lineBreak?'':'left-ellipsis']" :style="{
            fontFamily: captionStyle.fontFamily,
            fontSize: captionStyle.fontSize + 'px',
            color: captionStyle.fontColor,
            fontWeight: captionStyle.fontWeight * 100
          }">
            <span>{{ $t('example.original') }}</span>
          </p>
          <p :class="[captionStyle.lineBreak?'':'left-ellipsis']"
            v-if="captionStyle.transDisplay"
            :style="{
            fontFamily: captionStyle.transFontFamily,
            fontSize: captionStyle.transFontSize + 'px',
            color: captionStyle.transFontColor,
            fontWeight: captionStyle.transFontWeight * 100
          }">
            <span>{{ $t('example.translation') }}</span>
          </p>
        </template>
      </template>
    </div>

    <div class="title-bar" :style="{color: captionStyle.fontColor}">
      <div class="option-item" @click="closeCaptionWindow">
        <CloseOutlined />
      </div>
      <div class="option-item" @click="openControlWindow">
        <SettingOutlined />
      </div>
      <div class="option-item" @click="pinCaptionWindow">
        <PushpinFilled v-if="pinned" />
        <PushpinOutlined v-else />
      </div>
      <div class="drag-area"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PushpinOutlined, PushpinFilled, CloseOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { ref, onMounted } from 'vue';
import { useCaptionStyleStore } from '@renderer/stores/captionStyle';
import { useCaptionLogStore } from '@renderer/stores/captionLog';
import { storeToRefs } from 'pinia';

const revArr = {
  1: [1],
  2: [2, 1],
  3: [3, 2, 1],
  4: [4, 3, 2, 1],
}

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
  display: flex;
}

.caption-container {
  display: inline-block;
  width: calc(100% - 32px);
  -webkit-app-region: drag;
  padding-top: 10px;
  padding-bottom: 10px;
}

.caption-container p {
  text-align: center;
  margin: 0;
  line-height: 1.6em;
}

.left-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  direction: rtl;
  text-align: left;
}

.left-ellipsis > span {
  direction: ltr;
  display: inline-block;
}

.title-bar {
  width: 32px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
}

.option-item {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.option-item:hover {
  background-color: #2221;
}

.drag-area {
  display: inline-flex;
  flex-grow: 1;
  -webkit-app-region: drag;
}
</style>
