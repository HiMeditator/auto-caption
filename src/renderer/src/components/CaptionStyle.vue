<template>
  <a-card size="small" :title="$t('style.title')">
    <template #extra>
      <a @click="applyStyle">{{ $t('style.applyStyle') }}</a> |
      <a @click="backStyle">{{ $t('style.cancelChange') }}</a> |
      <a @click="resetStyle">{{ $t('style.resetStyle') }}</a>
    </template>

    <div class="input-item">
      <span class="input-label">{{ $t('style.longCaption') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentLineBreak"
        :options="captionStyle.iBreakOptions"
      ></a-select>
    </div>

    <div class="input-item">
      <span class="input-label">{{ $t('style.fontFamily') }}</span>
      <a-input
        class="input-area"
        v-model:value="currentFontFamily"
      />
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('style.fontColor') }}</span>
      <a-input
        class="input-area"
        type="color"
        v-model:value="currentFontColor"
      />
      <div class="input-item-value">{{ currentFontColor }}</div>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('style.fontSize') }}</span>
      <a-input
        class="input-area"
        type="range"
        min="0" max="64"
        v-model:value="currentFontSize"
      />
      <div class="input-item-value">{{ currentFontSize }}px</div>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('style.background') }}</span>
      <a-input
        class="input-area"
        type="color"
        v-model:value="currentBackground"
      />
      <div class="input-item-value">{{ currentBackground }}</div>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('style.opacity') }}</span>
      <a-input
        class="input-area"
        type="range"
        min="0"
        max="100"
        v-model:value="currentOpacity"
      />
      <div class="input-item-value">{{ currentOpacity }}%</div>
    </div>

    <div class="input-item">
      <span class="input-label">{{ $t('style.preview') }}</span>
      <a-switch v-model:checked="currentPreview" />
      <span style="display:inline-block;width:20px;"></span>
      <div style="display: inline-block;">
        <span class="switch-label">{{ $t('style.translation') }}</span>
        <a-switch v-model:checked="currentTransDisplay" />
      </div>
    </div>

    <div v-show="currentTransDisplay">
      <a-card size="small" :title="$t('style.trans.title')">
        <template #extra>
          <a @click="useSameStyle">{{ $t('style.trans.useSame') }}</a>
        </template>
        <div class="input-item">
          <span class="input-label">{{ $t('style.fontFamily') }}</span>
          <a-input
            class="input-area"
            v-model:value="currentTransFontFamily"
          />
        </div>
        <div class="input-item">
          <span class="input-label">{{ $t('style.fontColor') }}</span>
          <a-input
            class="input-area"
            type="color"
            v-model:value="currentTransFontColor"
          />
          <div class="input-item-value">{{ currentTransFontColor }}</div>
        </div>
        <div class="input-item">
          <span class="input-label">{{ $t('style.fontSize') }}</span>
          <a-input
            class="input-area"
            type="range"
            min="0" max="64"
            v-model:value="currentTransFontSize"
          />
          <div class="input-item-value">{{ currentTransFontSize }}px</div>
        </div>
      </a-card>
    </div>
  </a-card>

  <Teleport to="body">
    <div
      v-if="currentPreview"
      class="preview-container"
      :style="{
        backgroundColor: addOpicityToColor(currentBackground, currentOpacity)
      }"
    >
      <p :class="[currentLineBreak?'':'left-ellipsis']"
        :style="{
          fontFamily: currentFontFamily,
          fontSize: currentFontSize + 'px',
          color: currentFontColor
      }">
        <span v-if="captionData.length">{{ captionData[captionData.length-1].text }}</span>
        <span v-else>{{ $t('example.original') }}</span>
      </p>
      <p :class="[currentLineBreak?'':'left-ellipsis']"
        v-if="currentTransDisplay"
        :style="{
          fontFamily: currentTransFontFamily,
          fontSize: currentTransFontSize + 'px',
          color: currentTransFontColor
        }"
      >
        <span v-if="captionData.length">{{ captionData[captionData.length-1].translation }}</span>
        <span v-else>{{ $t('example.translation') }}</span>
      </p>
    </div>
  </Teleport>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCaptionStyleStore } from '@renderer/stores/captionStyle'
import { storeToRefs } from 'pinia'
import { notification } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { useCaptionLogStore } from '@renderer/stores/captionLog';

const captionLog = useCaptionLogStore();
const { captionData } = storeToRefs(captionLog);

const { t } = useI18n()

const captionStyle = useCaptionStyleStore()
const { changeSignal } = storeToRefs(captionStyle)

const currentLineBreak = ref<number>(0)
const currentFontFamily = ref<string>('sans-serif')
const currentFontSize = ref<number>(24)
const currentFontColor = ref<string>('#000000')
const currentBackground = ref<string>('#dbe2ef')
const currentOpacity = ref<number>(50)
const currentPreview = ref<boolean>(true)
const currentTransDisplay = ref<boolean>(true)
const currentTransFontFamily = ref<string>('sans-serif')
const currentTransFontSize = ref<number>(24)
const currentTransFontColor = ref<string>('#000000')

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
  captionStyle.lineBreak = currentLineBreak.value;
  captionStyle.fontFamily = currentFontFamily.value;
  captionStyle.fontSize = currentFontSize.value;
  captionStyle.fontColor = currentFontColor.value;
  captionStyle.background = currentBackground.value;
  captionStyle.opacity = currentOpacity.value;
  captionStyle.showPreview = currentPreview.value;
  captionStyle.transDisplay = currentTransDisplay.value;
  captionStyle.transFontFamily = currentTransFontFamily.value;
  captionStyle.transFontSize = currentTransFontSize.value;
  captionStyle.transFontColor = currentTransFontColor.value;

  captionStyle.sendStylesChange();

    notification.open({
    message: t('noti.styleChange'),
    description: t('noti.styleInfo')
  });
}

function backStyle(){
  currentLineBreak.value = captionStyle.lineBreak;
  currentFontFamily.value = captionStyle.fontFamily;
  currentFontSize.value = captionStyle.fontSize;
  currentFontColor.value = captionStyle.fontColor;
  currentBackground.value = captionStyle.background;
  currentOpacity.value = captionStyle.opacity;
  currentPreview.value = captionStyle.showPreview;
  currentTransDisplay.value = captionStyle.transDisplay;
  currentTransFontFamily.value = captionStyle.transFontFamily;
  currentTransFontSize.value = captionStyle.transFontSize;
  currentTransFontColor.value = captionStyle.transFontColor;
}

function resetStyle() {
  captionStyle.sendStylesReset();
}

watch(changeSignal, (val) => {
  if(val == true) {
    backStyle();
    captionStyle.changeSignal = false;
  }
})
</script>

<style scoped>
@import url(../assets/input.css);

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
  text-align: center;
  margin: 0;
  line-height: 1.5em;
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
</style>
