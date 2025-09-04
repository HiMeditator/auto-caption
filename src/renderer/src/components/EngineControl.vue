<template>
  <div style="height: 20px;"></div>
  <a-card size="small" :title="$t('engine.title')">
    <template #extra>
      <a @click="applyChange">{{ $t('engine.applyChange') }}</a> |
      <a @click="cancelChange">{{ $t('engine.cancelChange') }}</a>
    </template>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.captionEngine') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentEngine"
        :options="captionEngine"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.sourceLang') }}</span>
      <a-select
        :disabled="currentEngine === 'vosk'"
        class="input-area"
        v-model:value="currentSourceLang"
        :options="langList"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.transLang') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentTargetLang"
        :options="langList.filter((item) => item.value !== 'auto')"
      ></a-select>
    </div>
    <div class="input-item" v-if="transModel">
      <span class="input-label">{{ $t('engine.transModel') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentTransModel"
        :options="transModel"
      ></a-select>
    </div>
    <div class="input-item" v-if="transModel && currentTransModel === 'ollama'">
      <a-popover placement="right">
        <template #content>
          <p class="label-hover-info">{{ $t('engine.ollamaNote') }}</p>
        </template>
        <span class="input-label info-label"
          :style="{color: uiColor}"
        >{{ $t('engine.ollama') }}</span>
      </a-popover>
      <a-input
        class="input-area"
        v-model:value="currentOllamaName"
      ></a-input>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.audioType') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentAudio"
        :options="audioType"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.enableTranslation') }}</span>
      <a-switch v-model:checked="currentTranslation" />
      <span style="display:inline-block;width:10px;"></span>
      <div style="display: inline-block;">
        <span class="switch-label">{{ $t('engine.customEngine') }}</span>
        <a-switch v-model:checked="currentCustomized" />
      </div>
      <span style="display:inline-block;width:10px;"></span>
      <div style="display: inline-block;">
        <span class="switch-label">{{ $t('engine.showMore') }}</span>
        <a-switch v-model:checked="showMore" />
      </div>
    </div>

    <a-card size="small" :title="$t('engine.custom.title')" v-show="currentCustomized">
      <template #extra>
        <a-popover>
          <template #content>
            <p class="customize-note">{{ $t('engine.custom.note') }}</p>
          </template>
          <a><InfoCircleOutlined />{{ $t('engine.custom.attention') }}</a>
        </a-popover>
      </template>
      <div class="input-item">
        <span class="input-label">{{ $t('engine.custom.app') }}</span>
        <a-input
          class="input-area"
          v-model:value="currentCustomizedApp"
        ></a-input>
      </div>
      <div class="input-item">
        <span class="input-label">{{ $t('engine.custom.command') }}</span>
        <a-input
          class="input-area"
          v-model:value="currentCustomizedCommand"
        ></a-input>
      </div>
    </a-card>

    <a-card size="small" :title="$t('engine.showMore')" v-show="showMore" style="margin-top:10px;">
      <div class="input-item">
        <a-popover placement="right">
          <template #content>
            <p class="label-hover-info">{{ $t('engine.apikeyInfo') }}</p>
          </template>
          <span class="input-label info-label"
            :style="{color: uiColor}"
          >{{ $t('engine.apikey') }}</span>
        </a-popover>
        <a-input
          class="input-area"
          type="password"
          v-model:value="currentAPI_KEY"
        />
      </div>
      <div class="input-item">
        <a-popover placement="right">
          <template #content>
            <p class="label-hover-info">{{ $t('engine.modelPathInfo') }}</p>
          </template>
          <span class="input-label info-label"
            :style="{color: uiColor}"
          >{{ $t('engine.modelPath') }}</span>
        </a-popover>
        <span
          class="input-folder"
          :style="{color: uiColor}"
          @click="selectFolderPath"
        ><span><FolderOpenOutlined /></span></span>
        <a-input
          class="input-area"
          style="width:calc(100% - 140px);"
          v-model:value="currentModelPath"
        />
      </div>
      <div class="input-item">
        <a-popover placement="right">
          <template #content>
            <p class="label-hover-info">{{ $t('engine.startTimeoutInfo') }}</p>
          </template>
          <span
            class="input-label info-label"
            :style="{color: uiColor, verticalAlign: 'middle'}"
          >{{ $t('engine.startTimeout') }}</span>
        </a-popover>
        <a-input-number
          class="input-area"
          v-model:value="currentStartTimeoutSeconds"
          :min="10"
          :max="120"
          :step="5"
          :addon-after="$t('engine.seconds')"
        />
      </div>
    </a-card>
  </a-card>
  <div style="height: 20px;"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'
import { useEngineControlStore } from '@renderer/stores/engineControl'
import { notification } from 'ant-design-vue'
import { ExclamationCircleOutlined, FolderOpenOutlined ,InfoCircleOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showMore = ref(false)

const engineControl = useEngineControlStore()
const { captionEngine, audioType, changeSignal } = storeToRefs(engineControl)

const generalSetting = useGeneralSettingStore()
const { uiColor } = storeToRefs(generalSetting)

const currentSourceLang = ref('auto')
const currentTargetLang = ref('zh')
const currentEngine = ref<string>('gummy')
const currentAudio = ref<0 | 1>(0)
const currentTranslation = ref<boolean>(true)
const currentTransModel = ref('ollama')
const currentOllamaName = ref('')
const currentAPI_KEY = ref<string>('')
const currentModelPath = ref<string>('')
const currentCustomized = ref<boolean>(false)
const currentCustomizedApp = ref('')
const currentCustomizedCommand = ref('')
const currentStartTimeoutSeconds = ref<number>(30)

const langList = computed(() => {
  for(let item of captionEngine.value){
    if(item.value === currentEngine.value) {
      return item.languages
    }
  }
  return []
})

const transModel = computed(() => {
  for(let item of captionEngine.value){
    if(item.value === currentEngine.value) {
      return item.transModel
    }
  }
  return []
})

function applyChange(){
  if(
    currentTranslation.value && transModel.value &&
    currentTransModel.value === 'ollama' && !currentOllamaName.value.trim()
  ) {
    notification.open({
      message: t('noti.ollamaNameNull'),
      description: t('noti.ollamaNameNullNote'),
      duration: null,
      icon: () => h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' })
    })
    return
  }

  engineControl.sourceLang = currentSourceLang.value
  engineControl.targetLang = currentTargetLang.value
  engineControl.transModel = currentTransModel.value
  engineControl.ollamaName = currentOllamaName.value
  engineControl.engine = currentEngine.value
  engineControl.audio = currentAudio.value
  engineControl.translation = currentTranslation.value
  engineControl.API_KEY = currentAPI_KEY.value
  engineControl.modelPath = currentModelPath.value
  engineControl.customized = currentCustomized.value
  engineControl.customizedApp = currentCustomizedApp.value
  engineControl.customizedCommand = currentCustomizedCommand.value
  engineControl.startTimeoutSeconds = currentStartTimeoutSeconds.value

  engineControl.sendControlsChange()

  notification.open({
    placement: 'topLeft',
    message: t('noti.engineChange'),
    description: t('noti.changeInfo')
  });
}

function cancelChange(){
  currentSourceLang.value = engineControl.sourceLang
  currentTargetLang.value = engineControl.targetLang
  currentTransModel.value = engineControl.transModel
  currentOllamaName.value = engineControl.ollamaName
  currentEngine.value = engineControl.engine
  currentAudio.value = engineControl.audio
  currentTranslation.value = engineControl.translation
  currentAPI_KEY.value = engineControl.API_KEY
  currentModelPath.value = engineControl.modelPath
  currentCustomized.value = engineControl.customized
  currentCustomizedApp.value = engineControl.customizedApp
  currentCustomizedCommand.value = engineControl.customizedCommand
  currentStartTimeoutSeconds.value = engineControl.startTimeoutSeconds
}

function selectFolderPath() {
  window.electron.ipcRenderer.invoke('control.folder.select').then((folderPath) => {
    if(!folderPath) return
    currentModelPath.value = folderPath
  })
}

watch(changeSignal, (val) => {
  if(val == true) {
    cancelChange();
    engineControl.changeSignal = false;
  }
})

watch(currentEngine, (val) => {
  if(val == 'vosk'){
    currentSourceLang.value = 'auto'
    currentTargetLang.value = useGeneralSettingStore().uiLanguage
    if(currentTargetLang.value === 'zh') {
      currentTargetLang.value = 'zh-cn'
    }
  }
  else if(val == 'gummy'){
    currentSourceLang.value = 'auto'
    currentTargetLang.value = useGeneralSettingStore().uiLanguage
  }
})
</script>

<style scoped>
@import url(../assets/input.css);

.label-hover-info {
  margin-top: 10px;
  max-width: min(36vw, 380px);
}

.info-label {
  cursor: pointer;
  font-style: italic;
}

.input-folder {
  display:inline-block;
  width: 40px;
  font-size:1.38em;
  cursor: pointer;
  transition: all 0.25s;
}

.input-folder:hover {
  transform: scale(1.1);
}

.customize-note {
  padding: 10px 10px 0;
  max-width: min(40vw, 480px);
}
</style>
