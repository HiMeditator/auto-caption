<template>
  <div style="height: 20px;"></div>
  <a-card size="small" title="字幕控制">
    <template #extra>
      <a @click="applyChange">更改设置</a> |
      <a @click="cancelChange">取消更改</a>
    </template>
    <div class="control-item">
      <span class="control-label">源语言</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="currentSourceLang"
        :options="langList"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">翻译语言</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="currentTargetLang"
        :options="langList.filter((item) => item.value !== 'auto')"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">字幕引擎</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="currentEngine"
        :options="captionEngine"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">端口号</span>
      <a-input
        class="control-input"
        ref="select"
        type="number"
        v-model:value="currentPort"
      ></a-input>
    </div>
    <div class="control-item">
      <span class="control-label">启用翻译</span>
      <a-switch v-model:checked="currentTranslation" />
    </div>
  </a-card>
  <div style="height: 20px;"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCaptionControlStore } from '@renderer/stores/captionControl'

const captionControl = useCaptionControlStore()
const { captionEngine } = storeToRefs(captionControl)

const currentSourceLang = ref('auto')
const currentTargetLang = ref('zh')
const currentEngine = ref('gummy')
const currentPort = ref(8765)
const currentTranslation = ref<boolean>(false)

const langList = computed(() => {
  for(let item of captionEngine.value){
    if(item.value === currentEngine.value) {
      return item.languages
    }
  }
  return []
})

function applyChange(){
  captionControl.sourceLang = currentSourceLang.value
  captionControl.targetLang = currentTargetLang.value
  captionControl.engine = currentEngine.value
  captionControl.port = currentPort.value
  captionControl.translation = currentTranslation.value
}

function cancelChange(){
  currentSourceLang.value = captionControl.sourceLang
  currentTargetLang.value = captionControl.targetLang
  currentEngine.value = captionControl.engine
  currentPort.value = captionControl.port
  currentTranslation.value = captionControl.translation
}
</script>

<style scoped>
.control-item {
  margin: 10px 0;
}

.control-label {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 10px;
}

.control-input {
  width: calc(100% - 100px);
  min-width: 100px;
}

.control-item-value {
  width: 80px;
  text-align: right;
  font-size: 12px;
  color: #666
}
</style>