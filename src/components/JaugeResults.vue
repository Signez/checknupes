<script setup>
import JaugePart from "./JaugePart.vue";

const { circo } = defineProps({
  circo: {
    type: Object,
    required: true,
  },
});

const allResults = circo.resultats;
</script>

<template>
  <div class="jauge">
    <JaugePart
      v-for="cand in allResults"
      :candidat="cand"
      :circo="circo"
      :key="cand.panneau"
    />
  </div>
</template>

<style scoped>
.jauge {
  display: flex;
  height: 32px;
  border: 0 none;
  border-radius: 8px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}
</style>
