<template>
  <div class="caption-stat">
    <a-row>
      <a-col :span="6">
        <a-statistic title="字幕引擎" :value="'gummy'" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="字幕引擎状态" :value="'未连接'" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已记录字幕" :value="captionData.length" />
      </a-col>
    </a-row>    
  </div>

  <div class="caption-control">
    <a-button type="primary" class="control-button">打开字幕窗口</a-button>
    <a-button class="control-button">启动字幕引擎</a-button>
    <a-button danger class="control-button">关闭字幕引擎</a-button>
  </div>

  <div class="caption-list">
    <div class="caption-title">字幕记录</div>
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

const captionData = ref([
  {index: 1, time_s: "00:00:00", time_t: "00:00:00", text: "Long time no see.", translation: "好久不见"},
  {index: 2, time_s: "00:00:00", time_t: "00:00:00", text: "How have you been?", translation: "你最近怎么样？"},
  {index: 3, time_s: "00:00:00", time_t: "00:00:00", text: "I've missed you a lot.", translation: "我非常想念你。"},
  {index: 4, time_s: "00:00:00", time_t: "00:00:00", text: "It's good to see you again.", translation: "很高兴再次见到你。"},
  {index: 5, time_s: "00:00:00", time_t: "00:00:00", text: "What have you been up to?", translation: "你最近在忙什么？"},
  {index: 6, time_s: "00:00:00", time_t: "00:00:00", text: "Let's catch up over coffee.", translation: "我们去喝杯咖啡聊聊天吧。"},
  {index: 7, time_s: "00:00:00", time_t: "00:00:00", text: "You look great!", translation: "你看起来很棒！"},
  {index: 8, time_s: "00:00:00", time_t: "00:00:00", text: "I can't believe it's been so long.", translation: "真不敢相信已经这么久了。"},
  {index: 9, time_s: "00:00:00", time_t: "00:00:00", text: "We should do this more often.", translation: "我们应该多聚聚。"},
  {index: 10, time_s: "00:00:00", time_t: "00:00:00", text: "Thanks for coming to see me.", translation: "谢谢你来看我。"},
  {index: 11, time_s: "00:00:00", time_t: "00:00:00", text: "We show case the utility of Macformer when combined with molecular docking simulations and wet lab based experimental validation, by applying it to the prospective design of macrocyclic JAK2 inhibitors.", translation: "我们通过将其应用于大环JAK2抑制剂的前瞻性设计，展示了Macformer与分子对接模拟和湿实验验证相结合的实用性。"},
  {index: 12, time_s: "00:00:00", time_t: "00:00:00", text: "Macrocycles, typically defined as cyclic small molecules or peptides with ring structures consisting of 12 or more atoms, has emerged as promising chemical scaffolds in the field of new drug discovery1,2. The distinct physicochemical properties, including high molecular weight and abundant hydrogen bond donors3, render this structural class occupy a chemical space beyond Lipinski's rule of five4.", translation: "大环分子通常定义为具有由 12 个或更多原子组成的环状结构的环状小分子或肽，已成为新药发现领域中具有前景的化学骨架 [1,2]。其独特的理化性质（包括高分子量和丰富的氢键供体）[3]，使这类结构占据了超越 Lipinski 五规则 [4] 的化学空间。"}
])

const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number) => `共 ${total} 条记录`,
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
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 160,
  },
  {
    title: '字幕内容',
    dataIndex: 'content',
    key: 'content',
  },
]
</script>

<style scoped>
.caption-control {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px;
}

.control-button {
  height: 40px;
  margin: 20px;
  font-size: 16px;
}

.caption-list {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.caption-title {
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
  color: #333;
  margin-bottom: 4px;
}

.caption-translation {
  font-size: 14px;
  color: #666;
  padding-left: 16px;
  border-left: 3px solid #1890ff;
}
</style>