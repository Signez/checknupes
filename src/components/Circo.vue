<script setup>
import CircoTooltip from "./CircoTooltip.vue";
import CircoBrick from "./CircoBrick.vue";
import { computed, reactive } from "vue";

const state = reactive({ isHovered: false, wasClicked: false });

const props = defineProps({
  circo: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  maxRight: {
    type: Number,
  },
  isFound: {
    type: Boolean,
    default: false,
  },
  withAnnotations: {
    type: Array,
  },
});

const isSplit = computed(() => props.index === 288);
const isDimmed = computed(() => props.query !== "" && !props.isFound);

const hasAnnotations = computed(() => props.withAnnotations.length > 0);
</script>

<template>
  <div
    :class="[
      'circo',
      { isSplit, isDimmed, isHovered: state.isHovered, hasAnnotations },
    ]"
    @mouseover="state.isHovered = true"
    @mouseleave="state.isHovered = false"
    v-click-outside="() => (state.wasClicked = false)"
  >
    <CircoBrick
      :circo="circo"
      :isHovered="state.isHovered || state.wasClicked"
      :isPinned="state.wasClicked"
      :isDimmed="isDimmed"
      :withAnnotations="withAnnotations"
      @click.prevent="state.wasClicked = !Boolean(state.wasClicked)"
    />
    <CircoTooltip
      v-if="state.isHovered || state.wasClicked"
      :circo="circo"
      :index="index"
      :isPinned="state.wasClicked"
      :maxRight="maxRight"
    />
  </div>
</template>

<style scoped>
.circo {
  width: 16px;
  height: 34px;
  transition: height 0.2s;
}

.circo.hasAnnotations {
  height: 35px;
}

.isSplit::before {
  content: "";
  display: block;
  position: absolute;
  left: -2px;
  top: -2px;
  width: 2px;
  height: calc(100% + 4px);
  background-color: black;
}

.isSplit::after {
  content: "288";
  display: block;
  position: absolute;
  left: 0;
  top: -8px;
  background-color: black;
  color: white;
  font-size: 9px;
  font-weight: bold;
  line-height: 12px;
  padding: 0 3px 1px 2px;
  border-radius: 3px;
  transform: translateX(-50%);
}
</style>
