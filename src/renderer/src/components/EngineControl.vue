<template>
  <div style="height: 20px;"></div>
  <a-card size="small" :title="$t('engine.title')">
    <template #extra>
      <a @click="applyChange">{{ $t('engine.applyChange') }}</a> |
      <a @click="cancelChange">{{ $t('engine.cancelChange') }}</a>
    </template>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.sourceLang') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentSourceLang"
        :options="langList"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.transLang') }}</span>
      <a-select
        :disabled="currentEngine === 'vosk'"
        class="input-area"
        v-model:value="currentTargetLang"
        :options="langList.filter((item) => item.value !== 'auto')"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.captionEngine') }}</span>
      <a-select
        class="input-area"
        v-model:value="currentEngine"
        :options="captionEngine"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.audioType') }}</span>
      <a-select
        :disabled="platform !== 'win32' && platform !== 'darwin'"
        class="input-area"
        v-model:value="currentAudio"
        :options="audioType"
      ></a-select>
    </div>
    <div class="input-item">
      <span class="input-label">{{ $t('engine.enableTranslation') }}</span>
      <a-switch v-model:checked="currentTranslation" />
      <span style="display:inline-block;width:20px;"></span>
      <div style="display: inline-block;">
        <span class="switch-label">{{ $t('engine.showMore') }}</span>
        <a-switch v-model:checked="showMore" />
      </div>
    </div>

    <a-card size="small" :title="$t('engine.showMore')" v-show="showMore">
      <div class="input-item">
        <a-popover>
          <template #content>
            <p class="label-hover-info">{{ $t('engine.apikeyInfo') }}</p>
          </template>
          <span class="input-label info-label">{{ $t('engine.apikey') }}</span>
        </a-popover>
        <a-input
          class="input-area"
          type="password"
          v-model:value="currentAPI_KEY"
        />
      </div>
      <div class="input-item">
        <a-popover>
          <template #content>
            <p class="label-hover-info">{{ $t('engine.modelPathInfo') }}</p>
          </template>
          <span class="input-label info-label">{{ $t('engine.modelPath') }}</span>
        </a-popover>
        <span
          class="input-folder"
          @click="selectFolderPath"
        ><span><FolderOpenOutlined /></span></span>
        <a-input
          class="input-area"
          style="width:calc(100% - 140px);"
          v-model:value="currentModelPath"
        />
      </div>
      <div class="input-item">
        <span style="margin-right:5px;">{{ $t('engine.customEngine') }}</span>
        <a-switch v-model:checked="currentCustomized" />
      </div>
      <div v-show="currentCustomized">
        <a-card size="small" :title="$t('engine.custom.title')">
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
      </div>
    </a-card>
  </a-card>
  <div style="height: 20px;"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'
import { useEngineControlStore } from '@renderer/stores/engineControl'
import { notification } from 'ant-design-vue'
import { FolderOpenOutlined ,InfoCircleOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showMore = ref(false)

const engineControl = useEngineControlStore()
const { platform, captionEngine, audioType, changeSignal } = storeToRefs(engineControl)

const currentSourceLang = ref('auto')
const currentTargetLang = ref('zh')
const currentEngine = ref<string>('gummy')
const currentAudio = ref<0 | 1>(0)
const currentTranslation = ref<boolean>(false)
const currentAPI_KEY = ref<string>('')
const currentModelPath = ref<string>('')
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
  engineControl.sourceLang = currentSourceLang.value
  engineControl.targetLang = currentTargetLang.value
  engineControl.engine = currentEngine.value
  engineControl.audio = currentAudio.value
  engineControl.translation = currentTranslation.value
  engineControl.API_KEY = currentAPI_KEY.value
  engineControl.modelPath = currentModelPath.value
  engineControl.customized = currentCustomized.value
  engineControl.customizedApp = currentCustomizedApp.value
  engineControl.customizedCommand = currentCustomizedCommand.value

  engineControl.sendControlsChange()

  notification.open({
    message: t('noti.engineChange'),
    description: t('noti.changeInfo')
  });
}

function cancelChange(){
  currentSourceLang.value = engineControl.sourceLang
  currentTargetLang.value = engineControl.targetLang
  currentEngine.value = engineControl.engine
  currentAudio.value = engineControl.audio
  currentTranslation.value = engineControl.translation
  currentAPI_KEY.value = engineControl.API_KEY
  currentModelPath.value = engineControl.modelPath
  currentCustomized.value = engineControl.customized
  currentCustomizedApp.value = engineControl.customizedApp
  currentCustomizedCommand.value = engineControl.customizedCommand
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
    currentTargetLang.value = ''
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
  color: #1677ff;
  cursor: pointer;
}

.input-folder {
  display:inline-block;
  width: 40px;
  font-size:1.38em;
  cursor: pointer;
  transition: all 0.25s;
}

.input-folder>span {
  padding: 0 4px;
  border: 2px solid #1677ff;
  color: #1677ff;
  border-radius: 30%;
}

.input-folder:hover {
  transform: scale(1.1);
}

.customize-note {
  padding: 10px 10px 0;
  color: red;
  max-width: min(40vw, 480px);
}
</style>
