<template>
  <a-card size="small" title="字幕样式设置">
    <template #extra>
      <a @click="applyStyle">应用样式</a> |
      <a @click="resetStyle">取消更改</a>
    </template>
    <div class="style-item">
      <span class="style-label">字体族</span>
      <a-input
        class="style-input"
        v-model:value="currentFontFamily"
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
      <span class="style-label">字体大小</span>
      <a-input
        class="style-input"
        type="range"
        min="0" max="64"
        v-model:value="currentFontSize"
      />  
      <div class="style-item-value">{{ currentFontSize }}px</div> 
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
        class="style-input"
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
      <a-switch v-model:checked="currentTransDisplay" />
    </div>

    <div v-show="currentTransDisplay">
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
          <span class="style-label">翻译颜色</span>
          <a-input
            class="style-input"
            type="color"
            v-model:value="currentTransFontColor"
          />
          <div class="style-item-value">{{ currentTransFontColor }}</div>
        </div>
        <div class="style-item">
          <span class="style-label">翻译大小</span>
          <a-input
            class="style-input"
            type="range"
            min="0" max="64"
            v-model:value="currentTransFontSize"
          />   
          <div class="style-item-value">{{ currentTransFontSize }}px</div>
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
      <p class="preview-caption"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: currentFontSize + 'px',
          color: currentFontColor
        }">
        {{ "This is a preview of subtitle styles." }}
      </p>
      <p class="preview-translation" v-if="currentTransDisplay"
        :style="{
          fontFamily: currentTransFontFamily,
          fontSize: currentTransFontSize + 'px',
          color: currentTransFontColor  
        }"
      >这是字幕样式预览(翻译)</p>
    </div>    
  </Teleport>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCaptionStyleStore } from '@renderer/stores/captionStyle'
const captionStyle = useCaptionStyleStore()

const currentFontFamily = ref<string>('sans-serif')
const currentFontSize = ref<number>(24)
const currentFontColor = ref<string>('#000000')
const currentBackground = ref<string>('#dbe2ef')
const currentOpacity = ref<number>(50)
const currentTransDisplay = ref<boolean>(true)
const currentTransFontFamily = ref<string>('sans-serif')
const currentTransFontSize = ref<number>(24)
const currentTransFontColor = ref<string>('#000000')
const displayPreview = ref<boolean>(true)

function addOpicityToColor(color: string, opicity: number) {
  const opicityValue = Math.round(opicity * 255 / 100);
  const opicityHex = opicityValue.toString(16).padStart(2, '0');
  return `${color}${opicityHex}`;
}

function useSameStyle(){
  currentTransFontFamily.value = currentFontFamily.value;
  currentTransFontSize.value = currentFontSize.value;
  currentTransFontColor.value = currentFontColor.value;
}

function applyStyle(){ 
  captionStyle.fontFamily = currentFontFamily.value;
  captionStyle.fontSize = currentFontSize.value;
  captionStyle.fontColor = currentFontColor.value;
  captionStyle.background = currentBackground.value;
  captionStyle.opacity = currentOpacity.value;

  captionStyle.transDisplay = currentTransDisplay.value;
  captionStyle.transFontFamily = currentTransFontFamily.value;
  captionStyle.transFontSize = currentTransFontSize.value;
  captionStyle.transFontColor = currentTransFontColor.value;
}

function resetStyle(){
  currentFontFamily.value = captionStyle.fontFamily;
  currentFontSize.value = captionStyle.fontSize;
  currentFontColor.value = captionStyle.fontColor;
  currentBackground.value = captionStyle.background;
  currentOpacity.value = captionStyle.opacity;

  currentTransDisplay.value = captionStyle.transDisplay;
  currentTransFontFamily.value = captionStyle.transFontFamily;
  currentTransFontSize.value = captionStyle.transFontSize;
  currentTransFontColor.value = captionStyle.transFontColor;
}
</script>

<style scoped>
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