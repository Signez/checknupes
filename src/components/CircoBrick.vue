o
<script setup>
import { computed } from "vue";
import { KNOWN_ENSEMBLE_ADVERSARIES } from "../data-crunching.js";

const props = defineProps({
  circo: {
    type: Object,
    required: true,
  },
  isHovered: {
    type: Boolean,
  },
  isPinned: {
    type: Boolean,
  },
  isDimmed: {
    type: Boolean,
  },
  withAnnotations: {
    type: Array,
  },
});

const getBloc = (bloc, circo) =>
  circo.resultats.find((cand) => cand.bloc_lemonde === bloc);

const reallyQualified = (cand) => cand?.qualifie && !cand?.retired;

const winner = props.circo.resultats.find((cand) => cand.elu);
const triangulaire =
  props.circo.resultats.filter((cand) => cand.qualifie && !cand.retired)
    .length > 2;

const hasNupes = reallyQualified(getBloc("Nupes", props.circo));
const hasRN = reallyQualified(getBloc("Rassemblement national", props.circo));
const knownAdversary = KNOWN_ENSEMBLE_ADVERSARIES[props.circo.id];

const gaucheRatio = computed(() => {
  return props.circo.total_gauche / props.circo.exprimes;
});
const gauchePc = computed(() => Math.round(gaucheRatio.value * 1000) / 10);

const trankil = computed(() => hasNupes && gauchePc.value >= 45.0);
const possib = computed(
  () => hasNupes && gauchePc.value < 45.0 && gauchePc.value >= 38.5
);
const cho = computed(
  () => hasNupes && gauchePc.value < 38.5 && gauchePc.value >= 30
);
const trecho = computed(
  () => hasNupes && gauchePc.value < 30 && gauchePc.value >= 25
);
const cmor = computed(() => hasNupes && gauchePc.value < 25);

const hasAnnotations = computed(() => props.withAnnotations.length > 0);
const showRN = computed(() => props.withAnnotations.includes("rn") && hasRN);
const showTri = computed(
  () => props.withAnnotations.includes("tri") && triangulaire
);
const showLrem = computed(
  () => props.withAnnotations.includes("lrem") && knownAdversary
);
</script>

<template>
  <div
    :class="[
      'brick',
      {
        hasNupes,
        winner,
        triangulaire,
        trankil,
        possib,
        cho,
        trecho,
        cmor,
        isHovered,
        isPinned,
        isDimmed,
        showRN,
        hasAnnotations,
        showTri,
      },
    ]"
  >
    <span class="icon" v-if="winner">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        fill="none"
      >
        <path
          fill="currentColor"
          d="M10.53 4.06 9.47 3 4.59 7.88 2.47 5.76 1.41 6.82 4.59 10l5.94-5.94Z"
        />
      </svg>
    </span>
    <span v-else-if="hasNupes" class="name">{{
      Math.round(gaucheRatio * 1000) / 10
    }}</span>
    <span class="tri-tag" v-if="showTri">
      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="none">
        <path fill="currentColor" d="M0 1V0h6v1H4v5H2V1H0Z" />
      </svg>
    </span>
    <span class="rn-tag" v-else-if="showRN">
      <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="none">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M0 0v6h2V3v1l2 2h2L3.5 3c.6 0 2-.5 2-1.5S4.5 0 4 0H0Zm2 2V1h1.5c.4.2.4.8 0 1H2Z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
    <span class="lrem-tag" v-if="showLrem">
      <svg width="8" height="6" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0H0V6H2V2L4 4L6 2V6H8V0H6L4 2L2 0Z" fill="currentColor" />
      </svg>
    </span>
  </div>
</template>
<style scoped>
.brick {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  width: 16px;
  height: 34px;
  background-color: var(--not-qualified-color);
  font-variant-numeric: tabular-nums;
  cursor: default;
  transition: height 0.2s;
}

.brick.hasAnnotations {
  height: 35px;
}

.brick.hasAnnotations:not(.winner) {
  align-items: flex-end;
}

.isHovered {
  transform: scale(1.5);
  box-shadow: 0 0 0 2px white;
  z-index: 5;
}

.trankil {
  background-color: var(--trankil-color);
}
.possib {
  background-color: var(--possib-color);
}
.cho {
  background-color: var(--cho-color);
}
.trecho {
  background-color: var(--trecho-color);
}
.cmor {
  background-color: var(--cmor-color);
}
.hasNupes.winner {
  background-color: var(--trankil-color);
}
.winner .icon svg {
  display: block;
}
.name {
  transform: rotate(-90deg);
}

.hasAnnotations .name {
  text-align: left;
  margin-bottom: 6px;
}

.brick:not(.hasNupes) {
  color: rgb(168, 168, 168);
}
.isPinned {
  z-index: 11;
}

.isDimmed::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.9;
}

.isDimmed.isHovered::after {
  opacity: 0.5;
}

.rn-tag,
.tri-tag,
.lrem-tag {
  height: 50px;
  position: absolute;
  top: 0;
  left: 50%;
  background-color: hsla(232, 12%, 25%, 0.4);
  height: 8px;
  width: 16px;
  margin-left: -8px;
  font-size: 9px;
  line-height: 9px;
  color: hsl(232, 12%, 100%);
  text-align: center;
}

.rn-tag svg,
.tri-tag svg,
.lrem-tag svg {
  vertical-align: 1px;
}

.brick:not(.hasNupes) .rn-tag,
.brick:not(.hasNupes) .tri-tag,
.brick:not(.hasNupes) .lrem-tag {
  background-color: transparent;
  color: hsl(0, 0%, 72%);
  opacity: 1;
}

.tri-tag {
  background-color: hsl(0, 100%, 50%, 0.6);
  font-weight: 700;
}

.lrem-tag {
  background-color: hsl(240, 100%, 50%, 0.5);
}
</style>
