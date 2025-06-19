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
        v-model:value="currentSourceLang"
        :options="langList"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">翻译语言</span>
      <a-select
        class="control-input"
        v-model:value="currentTargetLang"
        :options="langList.filter((item) => item.value !== 'auto')"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">字幕引擎</span>
      <a-select
        class="control-input"
        v-model:value="currentEngine"
        :options="captionEngine"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">启用翻译</span>
      <a-switch v-model:checked="currentTranslation" />
      <span class="control-label">自定义引擎</span>
      <a-switch v-model:checked="currentCustomized" />
    </div>
    <div v-show="currentCustomized">
      <a-card size="small" title="自定义字幕引擎">
        <p class="customize-note">说明：允许用户使用自定义字幕引擎提供字幕。提供的引擎要能通过 <code>child_process.spawn()</code> 进行启动，且需要通过 IPC 与项目 node.js 后端进行通信。具体通信接口见后端实现。</p>
        <div class="control-item">
          <span class="control-label">引擎路径</span>
          <a-input
            class="control-input"
            v-model:value="currentCustomizedApp"
          ></a-input>
        </div>
        <div class="control-item">
          <span class="control-label">引擎指令</span>
          <a-input
            class="control-input"
            v-model:value="currentCustomizedCommand"
          ></a-input>
        </div>
      </a-card>
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
const currentTranslation = ref<boolean>(false)

const currentCustomized = ref<boolean>(false)
const currentCustomizedApp = ref('')
const currentCustomizedCommand = ref('')

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
  captionControl.translation = currentTranslation.value

  captionControl.customized = currentCustomized.value
  captionControl.customizedApp = currentCustomizedApp.value
  captionControl.customizedCommand = currentCustomizedCommand.value

  captionControl.sendControlChange()
}

function cancelChange(){
  currentSourceLang.value = captionControl.sourceLang
  currentTargetLang.value = captionControl.targetLang
  currentEngine.value = captionControl.engine
  currentTranslation.value = captionControl.translation

  currentCustomized.value = captionControl.customized
  currentCustomizedApp.value = captionControl.customizedApp
  currentCustomizedCommand.value = captionControl.customizedCommand
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

.customize-note {
  padding: 0 20px;
  color: red;
  font-size: 12px;
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