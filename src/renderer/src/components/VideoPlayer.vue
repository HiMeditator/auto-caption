<template>
  <div class="video-player">
    <video src="../assets/video/example-ja.mp4" controls></video>
    <Settings />
  </div>
</template>

<script setup lang="ts">
import Settings from './Settings.vue'
</script>

<style scoped>
.video-player {
  display: flex;
  height: 100vh;
  align-items: center;
  flex-wrap: wrap;
}

video {
  width: 100%;
  height: calc(100vh - 50px);
}
</style>