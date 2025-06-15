<template>
<div>
  <a-row>
    <a-col :span="controlSpan">
      <div class="caption-control">
        <a-card size="small" title="页面宽度">
        <div>
          <a-input
            type="range" class="span-input"
            min="6" max="18"
            v-model:value="controlSpan"
          />
        </div>
        </a-card>
        <CaptionControl />
        <CaptionStyle />
      </div>
    </a-col>
    <a-col :span="24 - controlSpan">
      <div class="caption-data">
        <CaptionData />
      </div>
    </a-col>
  </a-row>
</div>

</template>

<script setup lang="ts">
import CaptionStyle from './components/CaptionStyle.vue'
import CaptionControl from './components/CaptionControl.vue';
import CaptionData from './components/CaptionData.vue'
import { ref } from 'vue'
const controlSpan = ref(8)
</script>

<style scoped>
.caption-control {
  height: 100vh;
  border-right: 1px solid #7774;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.caption-data {
  height: 100vh;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.span-input {
  width: 100px;
}
</style>