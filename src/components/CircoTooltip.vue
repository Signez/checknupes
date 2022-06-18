<script setup>
import { computed } from "@vue/reactivity";
import { nextTick, onMounted, onUpdated, reactive, ref } from "vue";
import CandidatResult from "./CandidatResult.vue";
import JaugeResults from "./JaugeResults.vue";
const { circo, index, isPinned, maxRight } = defineProps({
  circo: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isPinned: {
    type: Boolean,
  },
  maxRight: {
    type: Number,
  },
});

const qualifies = circo.resultats.filter((cand) => cand.qualifie);
const recales = circo.resultats.filter((cand) => !cand.qualifie).slice(0, 2);

const winner = circo.resultats.find((cand) => cand.elu);

const initialMarginLeft = -30;
const state = reactive({ currentRightEdge: 0 });
const tooltipDom = ref(null);

const computeCurrentRightEdge = async () => {
  if (tooltipDom.value) {
    state.currentRightEdge = tooltipDom.value.getBoundingClientRect().right;
  }
};

onMounted(() => computeCurrentRightEdge());

const actualMaxRight = maxRight - initialMarginLeft * 2;

const correctiveMargin = computed(
  () =>
    initialMarginLeft -
    (actualMaxRight < state.currentRightEdge
      ? state.currentRightEdge - actualMaxRight
      : 0)
);

const depLabel =
  circo.dep_label === "Français établis hors de France"
    ? "Français de l’étranger"
    : circo.dep_label;
const numDep = circo.dep[0] !== "Z" ? ` (${circo.dep})` : "";
</script>

<template>
  <div
    :class="['circo-tooltip', { isPinned }]"
    ref="tooltipDom"
    :style="{ marginLeft: `${correctiveMargin}px` }"
  >
    <h2>{{ depLabel }}{{ numDep }} - Circo. n°{{ circo.circo }}</h2>
    <JaugeResults :circo="circo" />
    <div class="qualifies">
      <h3 class="elu-title" v-if="winner" :data-bloc="winner.bloc_lemonde">
        Élu{{ winner.sexe === "F" ? "e" : "" }} dès le 1er tour
        <svg style="width: 16px; height: 16px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M10.6 9.6L9 15L7.4 9.6L2 8L7.4 6.4L9 1L10.6 6.4L16 8L10.6 9.6M17 14.2L21 12L18.8 16L21 20L17 17.8L13 20L15.2 16L13 12L17 14.2M10 16L8.3 19L10 22L7 20.3L4 22L5.7 19L4 16L7 17.7L10 16"
          />
        </svg>
      </h3>
      <h3 v-else-if="qualifies.length === 2">Duel du 2nd tour</h3>
      <h3 v-else-if="qualifies.length === 3">Triangulaire du 2nd tour</h3>
      <h3 v-else>Second tour à {{ qualifies.length }} candidats</h3>
      <CandidatResult
        v-for="(cand, index) in qualifies"
        :candidat="cand"
        :circo="circo"
        :index="index"
        :key="cand.panneau"
      />
    </div>
    <div class="recales" v-if="!winner">
      <CandidatResult
        v-for="(cand, index) in recales"
        :candidat="cand"
        :circo="circo"
        :index="index"
        :key="cand.panneau"
      />
    </div>
  </div>
</template>

<style scoped>
.circo-tooltip {
  position: absolute;
  z-index: 3;
  background-color: white;
  width: 400px;
  margin-top: -5px;
  padding: 20px;
  border: 1px solid rgb(220, 209, 209);
  box-shadow: 4px 4px rgba(0, 0, 0, 0.2);
}

.circo-tooltip h2 {
  font-size: 16px;
}

.circo-tooltip h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: hsl(325, 2%, 16%);
  margin-top: 16px;
  margin-bottom: 4px;
}

.circo-tooltip h3.elu-title {
  color: var(--bloc-color);
}

.circo-tooltip h3.elu-title svg {
  vertical-align: -3px;
}

.recales {
  margin: 20px -20px -20px -20px;
  padding: 15px 20px 15px 20px;
  background-color: hsl(0, 0%, 95%);
}

.circo-tooltip:not(.isPinned) {
  pointer-events: none;
}

.isPinned {
  z-index: 10;
}
</style>
