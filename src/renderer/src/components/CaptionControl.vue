<template>
  <div style="height: 20px;"></div>
  <a-card size="small" title="字幕控制">
    <template #extra><a href="#">应用</a></template>
    <div class="control-item">
      <span class="control-label">源语言</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="sourceLang"
        :options="languages"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">翻译语言</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="targetLang"
        :options="languages"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">字幕引擎</span>
      <a-select
        class="control-input"
        ref="select"
        v-model:value="engine"
        :options="captionEngine"
      ></a-select>
    </div>
    <div class="control-item">
      <span class="control-label">启用翻译</span>
      <a-switch v-model:checked="translation" />
    </div>
  </a-card>
  <div style="height: 20px;"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const languages = ref([
  { value: 'en', label: '英语' },
  { value: 'zh', label: '简体中文' },
  { value: 'ja', label: '日语' },
])
const captionEngine = ref([
  {value: 'gummy', label: '云端-阿里云-Gummy'}
])


const sourceLang = ref('en')
const targetLang = ref('zh')
const engine = ref('gummy')
const translation = ref<boolean>(true)
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