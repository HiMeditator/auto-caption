<template>
  <div>
    <div class="log-title">
      <span style="margin-right: 30px;">{{ $t('log.title2') }}</span>
    </div>
    <a-button
      danger
      @click="softwareLog.clear()"
    >{{ $t('log.clear') }}</a-button>
  </div>
  <a-table
    :columns="columns"
    :data-source="softwareLogs"
    v-model:pagination="pagination"
    style="margin-top: 10px;"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'type'">
        <span :class="record.type">{{ record.type }}</span>
      </template>
      <template v-if="column.key === 'index'">
        {{ record.index }}
      </template>
      <template v-if="column.key === 'content'">
        <code>{{ record.text }}</code>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSoftwareLogStore } from '@renderer/stores/softwareLog'
import { type SoftwareLogItem } from '../types'

const softwareLog = useSoftwareLogStore()
const { softwareLogs } = storeToRefs(softwareLog)

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
    sorter: (a: SoftwareLogItem, b: SoftwareLogItem) => {
      if(a.index <= b.index) return -1
      return 1
    },
    sortDirections: ['descend'],
    defaultSortOrder: 'descend',
  },
  {
    title: 'type',
    dataIndex: 'type',
    key: 'type',
    width: 80,
    sorter: (a: SoftwareLogItem, b: SoftwareLogItem) => {
      if(a.type <= b.type) return -1
      return 1
    },
  },
  {
    title: 'time',
    dataIndex: 'time',
    key: 'time',
    width: 120,
    sortDirections: ['descend'],
  },
  {
    title: 'content',
    dataIndex: 'content',
    key: 'content',
  },
]

</script>

<style scoped>
.log-title {
  display: inline-block;
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.WARN {
  color: #ff7c05;
  font-weight: bold;
}

.ERROR {
  color: #ff0000;
  font-weight: bold;
}
</style>