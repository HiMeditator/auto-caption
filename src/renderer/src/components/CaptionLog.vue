<template>
  <div class="caption-list">
    <div>
      <a-app class="caption-title">
        <span style="margin-right: 30px;">{{ $t('log.title') }}</span>
      </a-app>
      <a-button
        type="primary"
        style="margin-right: 20px;"
        @click="exportCaptions"
        :disabled="captionData.length === 0"
      >{{ $t('log.export') }}</a-button>

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
          <a-radio-group v-model:value="copyOption">
            <a-radio-button value="both">{{ $t('log.both') }}</a-radio-button>
            <a-radio-button value="source">{{ $t('log.source') }}</a-radio-button>
            <a-radio-button value="target">{{ $t('log.translation') }}</a-radio-button>
          </a-radio-group>
        </div>
      </template>
      <a-button
        style="margin-right: 20px;"
        @click="copyCaptions"
        :disabled="captionData.length === 0"
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
const { t } = useI18n()

const captionLog = useCaptionLogStore()
const { captionData } = storeToRefs(captionLog)

const showIndex = ref(true)
const copyTime = ref(true)
const copyOption = ref('both')

const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number) => `Total: ${total}`,
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
  },
  {
    title: 'time',
    dataIndex: 'time',
    key: 'time',
    width: 160,
  },
  {
    title: 'content',
    dataIndex: 'content',
    key: 'content',
  },
]

function exportCaptions() {
  const jsonData = JSON.stringify(captionData.value, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  a.download = `captions-${timestamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function copyCaptions() {
  let content = ''
  for(let i = 0; i < captionData.value.length; i++){
    const item = captionData.value[i]
    if(showIndex.value) content += `${i+1}\n`
    if(copyTime.value) content += `${item.time_s} --> ${item.time_t}\n`.replace(/\./g, ',')
    if(copyOption.value === 'both') content += `${item.text}\n${item.translation}\n\n`
    else if(copyOption.value === 'source') content += `${item.text}\n\n`
    else if(copyOption.value === 'translation') content += `${item.translation}\n\n`
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
