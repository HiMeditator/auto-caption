<template>
  <div class="caption-list">
    <div>
      <a-app class="caption-title">
        <span style="margin-right: 30px;">{{ $t('log.title') }}</span>
      </a-app>
      <a-popover :title="$t('log.baseTime')">
        <template #content>
          <div class="base-time">
            <div class="base-time-container">
              <a-input
                type="number" min="0"
                v-model:value="baseHH"
              ></a-input>
              <span class="base-time-label">{{ $t('log.hour') }}</span>
            </div>
          </div><span style="margin: 0 4px;">:</span>
          <div class="base-time">
            <div class="base-time-container">
              <a-input
                type="number" min="0" max="59"
                v-model:value="baseMM"
              ></a-input>
              <span class="base-time-label">{{ $t('log.min') }}</span>
            </div>
          </div><span style="margin: 0 4px;">:</span>
          <div class="base-time">
            <div class="base-time-container">
              <a-input
                type="number" min="0" max="59"
                v-model:value="baseSS"
              ></a-input>
              <span class="base-time-label">{{ $t('log.sec') }}</span>
            </div>
          </div><span style="margin: 0 4px;">.</span>
          <div class="base-time">
            <div class="base-time-container">
              <a-input
                type="number" min="0" max="999"
                v-model:value="baseMS"
              ></a-input>
              <span class="base-time-label">{{ $t('log.ms') }}</span>
            </div>
          </div>
        </template>
        <a-button
          type="primary"
          style="margin-right: 20px;"
          @click="changeBaseTime"
          :disabled="captionData.length === 0"
        >{{ $t('log.changeTime') }}</a-button>
      </a-popover>
      <a-popover :title="$t('log.exportOptions')">
        <template #content>
          <div class="input-item">
            <span class="input-label">{{ $t('log.exportFormat') }}</span>
            <a-radio-group v-model:value="exportFormat">
              <a-radio-button value="srt"><code>.srt</code></a-radio-button>
              <a-radio-button value="json"><code>.json</code></a-radio-button>
            </a-radio-group>
          </div>
          <div class="input-item">
            <span class="input-label">{{ $t('log.exportContent') }}</span>
            <a-radio-group v-model:value="contentOption">
              <a-radio-button value="both">{{ $t('log.both') }}</a-radio-button>
              <a-radio-button value="source">{{ $t('log.source') }}</a-radio-button>
              <a-radio-button value="target">{{ $t('log.translation') }}</a-radio-button>
            </a-radio-group>
          </div>
        </template>
        <a-button
          style="margin-right: 20px;"
          @click="exportCaptions"
          :disabled="captionData.length === 0"
        >{{ $t('log.export') }}</a-button>
      </a-popover>
      <a-popover :title="$t('log.copyOptions')">
        <template #content>
          <div class="input-item">
            <span class="input-label">{{ $t('log.addIndex') }}</span>
            <a-switch v-model:checked="showIndex" />
            <span class="input-label">{{ $t('log.copyTime') }}</span>
            <a-switch v-model:checked="copyTime" />
          </div>
          <div class="input-item">
            <span class="input-label">{{ $t('log.copyContent') }}</span>
            <a-radio-group v-model:value="contentOption">
              <a-radio-button value="both">{{ $t('log.both') }}</a-radio-button>
              <a-radio-button value="source">{{ $t('log.source') }}</a-radio-button>
              <a-radio-button value="target">{{ $t('log.translation') }}</a-radio-button>
            </a-radio-group>
          </div>
          <div class="input-item">
            <span class="input-label">{{ $t('log.copyNum') }}</span>
            <a-radio-group v-model:value="copyNum">
              <a-radio-button :value="0"><code>[:]</code></a-radio-button>
              <a-radio-button :value="1"><code>[-1:]</code></a-radio-button>
              <a-radio-button :value="2"><code>[-2:]</code></a-radio-button>
              <a-radio-button :value="3"><code>[-3:]</code></a-radio-button>
            </a-radio-group>
          </div>
        </template>
        <a-button
          style="margin-right: 20px;"
          @click="copyCaptions"
        >{{ $t('log.copy') }}</a-button>
      </a-popover>
      <a-button
        danger
        @click="clearCaptions"
      >{{ $t('log.clear') }}</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="captionData"
      v-model:pagination="pagination"
      style="margin-top: 10px;"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'index'">
          {{ record.index }}
        </template>
        <template v-if="column.key === 'time'">
          <div class="time-cell">
            <div class="time-start">{{ record.time_s }}</div>
            <div class="time-end">{{ record.time_t }}</div>
          </div>
        </template>
        <template v-if="column.key === 'content'">
          <div class="caption-content">
            <div class="caption-text">{{ record.text }}</div>
            <div class="caption-translation">{{ record.translation }}</div>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCaptionLogStore } from '@renderer/stores/captionLog'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import * as tc from '../utils/timeCalc'
import { CaptionItem } from '../types'

const { t } = useI18n()

const captionLog = useCaptionLogStore()
const { captionData } = storeToRefs(captionLog)

const exportFormat = ref('srt')
const showIndex = ref(true)
const copyTime = ref(true)
const contentOption = ref('both')
const copyNum = ref(0)

const baseHH = ref<number>(0)
const baseMM = ref<number>(0)
const baseSS = ref<number>(0)
const baseMS = ref<number>(0)

const pagination = ref({
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page
    pagination.value.pageSize = pageSize
  },
  onShowSizeChange: (current: number, size: number) => {
    pagination.value.current = current
    pagination.value.pageSize = size
  }
})

const columns = [
  {
    title: 'index',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    sorter: (a: CaptionItem, b: CaptionItem) => {
      if(a.index <= b.index) return -1
      return 1
    },
    sortDirections: ['descend'],
    defaultSortOrder: 'descend',
  },
  {
    title: 'time',
    dataIndex: 'time',
    key: 'time',
    width: 160,
    sorter: (a: CaptionItem, b: CaptionItem) => {
      if(a.time_s <= b.time_s) return -1
      return 1
    },
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'content',
    dataIndex: 'content',
    key: 'content',
  },
]

function changeBaseTime() {
  if(baseHH.value < 0) baseHH.value = 0
  if(baseMM.value < 0) baseMM.value = 0
  if(baseMM.value > 59) baseMM.value = 59
  if(baseSS.value < 0) baseSS.value = 0
  if(baseSS.value > 59) baseSS.value = 59
  if(baseMS.value < 0) baseMS.value = 0
  if(baseMS.value > 999) baseMS.value = 999
  const newBase: tc.Time = {
    hh: Number(baseHH.value),
    mm: Number(baseMM.value),
    ss: Number(baseSS.value),
    ms: Number(baseMS.value)
  }
  const oldBase =  tc.getTimeFromStr(captionData.value[0].time_s)
  const deltaMs = tc.getMsFromTime(newBase) - tc.getMsFromTime(oldBase)
  for(let i = 0; i < captionData.value.length; i++){
    captionData.value[i].time_s =
      tc.getNewTimeStr(captionData.value[i].time_s, deltaMs)
    captionData.value[i].time_t =
      tc.getNewTimeStr(captionData.value[i].time_t, deltaMs)
  }
}

function exportCaptions() {
  const exportData = getExportData()
  const blob = new Blob([exportData], {
    type: exportFormat.value === 'json' ? 'application/json' : 'text/plain'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  a.download = `captions-${timestamp}.${exportFormat.value}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getExportData() {
  if(exportFormat.value === 'json') return JSON.stringify(captionData.value, null, 2)
  let content = ''
  for(let i = 0; i < captionData.value.length; i++){
    const item = captionData.value[i]
    content += `${i+1}\n`
    content += `${item.time_s} --> ${item.time_t}\n`.replace(/\./g, ',')
    if(contentOption.value === 'both') content += `${item.text}\n${item.translation}\n\n`
    else if(contentOption.value === 'source') content += `${item.text}\n\n`
    else content += `${item.translation}\n\n`
  }
  return content
}

function copyCaptions() {
  let content = ''
  let start = 0
  if(copyNum.value > 0) {
    start = captionData.value.length - copyNum.value
    if(start < 0) start = 0
  }
  for(let i = start; i < captionData.value.length; i++){
    const item = captionData.value[i]
    if(showIndex.value) content += `${i+1}\n`
    if(copyTime.value) content += `${item.time_s} --> ${item.time_t}\n`.replace(/\./g, ',')
    if(contentOption.value === 'both') content += `${item.text}\n${item.translation}\n\n`
    else if(contentOption.value === 'source') content += `${item.text}\n\n`
    else content += `${item.translation}\n\n`
  }
  navigator.clipboard.writeText(content)
  message.success(t('log.copySuccess'))
}

function clearCaptions() {
  captionLog.clear()
}
</script>

<style scoped>
@import url(../assets/input.css);

.caption-list {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.caption-title {
  display: inline-block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.base-time {
  width: 64px;
  display: inline-block;
}

.base-time-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.base-time-label {
  font-size: 12px;
  color: var(--tag-color);
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.time-start {
  color: #1677ff;
}

.time-end {
  color: #ff4d4f;
}

.caption-content {
  padding: 8px 0;
}

.caption-text {
  font-size: 16px;
  margin-bottom: 4px;
}

.caption-translation {
  font-size: 14px;
  padding-left: 16px;
  border-left: 3px solid #1890ff;
}
</style>
