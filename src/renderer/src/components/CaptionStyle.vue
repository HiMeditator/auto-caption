<template>
  <a-card size="small" title="字幕样式设置">
    <template #extra>
      <a>应用样式</a> | <a>取消更改</a>
    </template>
    <div class="style-item">
      <span class="style-label">字体族</span>
      <a-input
        class="style-input"
        v-model:value="currentFontFamily"
      />   
    </div>
    <div class="style-item">
      <span class="style-label">字体大小</span>
      <a-input
        class="style-input"
        type="number"
        v-model:value="currentFontSize"
      />   
    </div>
    <div class="style-item">
      <span class="style-label">字体颜色</span>
      <a-input
        class="style-input"
        type="color"
        v-model:value="currentFontColor"
      />
      <div class="style-item-value">{{ currentFontColor }}</div>
    </div>
    <div class="style-item">
      <span class="style-label">背景颜色</span>
      <a-input
        class="style-input"
        type="color"
        v-model:value="currentBackground"
      />
      <div class="style-item-value">{{ currentBackground }}</div>
    </div>
    <div class="style-item">
      <span class="style-label">背景透明度</span>
      <a-input
        class="style-input range-input"
        type="range"
        min="0"
        max="100"
        v-model:value="currentOpacity"
      />
      <div class="style-item-value">{{ currentOpacity }}</div>
    </div>
    
    <div class="style-item">
      <span class="style-label">显示预览</span>
      <a-switch v-model:checked="displayPreview" />
      <span class="style-label">显示翻译</span>
      <a-switch v-model:checked="currentTranslation" />
    </div>

    <div v-show="currentTranslation">
      <a-card size="small" title="翻译样式设置">
        <template #extra>
          <a @click="useSameStyle">使用相同样式</a>
        </template>
        <div class="style-item">
          <span class="style-label">翻译字体</span>
          <a-input
            class="style-input"
            v-model:value="currentTransFontFamily"
          />   
        </div>
        <div class="style-item">
          <span class="style-label">翻译大小</span>
          <a-input
            class="style-input"
            type="number"
            v-model:value="currentTransFontSize"
          />   
        </div>
        <div class="style-item">
          <span class="style-label">翻译颜色</span>
          <a-input
            class="style-input"
            type="color"
            v-model:value="currentTransFontColor"
          />
          <div class="style-item-value">{{ currentTransFontColor }}</div>
        </div>
      </a-card>
    </div>

  </a-card>

  <Teleport to="body">
    <div
      v-if="displayPreview"
      class="preview-container"
      :style="{
        backgroundColor: addOpicityToColor(currentBackground, currentOpacity)
      }"
    >
      <div class="preview-caption"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: currentFontSize + 'px',
          color: currentFontColor
        }">
        {{ "This is a preview of subtitle styles." }}
      </div>
      <div class="preview-translation" v-if="currentTranslation"
        :style="{
          fontFamily: currentTransFontFamily,
          fontSize: currentTransFontSize + 'px',
          color: currentTransFontColor  
        }"
      >这是字幕样式预览(翻译)</div>
    </div>    
  </Teleport>

</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useCaptionStore } from '../stores/caption'
// const caption = useCaptionStore()
const currentFontFamily = ref<string>('sans-serif')
const currentFontSize = ref<number>(24)
const currentFontColor = ref<string>('#000000')
const currentBackground = ref<string>('#dbe2ef')
const currentOpacity = ref<number>(50)
const currentTranslation = ref<boolean>(true)
const currentTransFontFamily = ref<string>('sans-serif')
const currentTransFontSize = ref<number>(24)
const currentTransFontColor = ref<string>('#000000')
const displayPreview = ref<boolean>(true)

function addOpicityToColor(color: string, opicity: number) {
  if (color.length !== 7 || color[0] !== '#') {
    throw new Error('Invalid color format. Please use a valid hex color like #AABBCC.');
  }
  const opicityValue = Math.round(opicity * 255 / 100);
  const opicityHex = opicityValue.toString(16).padStart(2, '0');
  return `${color}${opicityHex}`;
}

function useSameStyle(){
  currentTransFontFamily.value = currentFontFamily.value;
  currentTransFontSize.value = currentFontSize.value;
  currentTransFontColor.value = currentFontColor.value;
}
</script>

<style scoped>
.caption-style {
  height: 100vh;
  border-right: 1px solid #7774;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.caption-button {
  display: flex;
  justify-content: center;
}

.style-item {
  margin: 10px 0;
}

.style-label {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 10px;
}

.style-input {
  width: calc(100% - 100px);
  min-width: 100px;
}

.style-item-value {
  width: 80px;
  text-align: right;
  font-size: 12px;
  color: #666
}

.range-input {
  width: calc(100% - 110px);
  min-width: 90px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 5px;
  margin-right: 5px;
}

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
</style>