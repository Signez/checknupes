<script setup>
import Circo from "./Circo.vue";
import { onMounted, reactive, computed, ref } from "vue";
import { DEFAULT_REPORTS, matchesCirco } from "../data-crunching.js";

const props = defineProps({
  results: {
    type: Object,
    required: true,
  },
  reportsGauche: {
    type: Object,
    required: true,
  },
  query: {
    type: String,
  },
  postalCodes: {
    type: Object,
  },
  withAnnotations: {
    type: Array,
  },
});

const state = reactive({ maxRight: 0, withAnnotations: false });

const getQualifiedBloc = (bloc, circo) =>
  circo.resultats.find(
    (cand) => cand.bloc_lemonde === bloc && cand.qualifie && !cand.retired
  );

function sortAccordingToGauche(circA, circB) {
  const nupesA = circA.total_gauche / circA.exprimes;
  const nupesB = circB.total_gauche / circB.exprimes;

  return nupesB - nupesA;
}

const withNupes = computed(() => {
  const circos = Object.values(props.results).filter((circo) =>
    getQualifiedBloc("Nupes", circo)
  );

  circos.sort(sortAccordingToGauche);

  return circos;
});

const withoutNupes = computed(() => {
  const circos = Object.values(props.results).filter(
    (circo) => !getQualifiedBloc("Nupes", circo)
  );

  circos.sort(sortAccordingToGauche);

  return circos;
});

const circoTableDom = ref(null);

function computeMaxRight() {
  if (circoTableDom.value) {
    const maxRight = circoTableDom.value.getBoundingClientRect().right;
    const totalWidth = document.documentElement.clientWidth;

    if (totalWidth - maxRight < 50) {
      state.maxRight = totalWidth - 50;
    } else {
      state.maxRight = maxRight;
    }
  }
}

onMounted(() => {
  computeMaxRight();
  window.addEventListener("resize", () => {
    computeMaxRight();
  });
});

const normalizeReports = (reports) =>
  Object.entries(reports)
    .map(([bloc, coef]) => `${bloc},${+coef}`)
    .join(";");

const isOnlyNatural = computed(
  () =>
    normalizeReports(props.reportsGauche) === normalizeReports(DEFAULT_REPORTS)
);

const foundIds = computed(() =>
  Object.values(props.results)
    .filter((circo) =>
      matchesCirco(circo, props.query, props.postalCodes[props.query] ?? [])
    )
    .map((circo) => circo.id)
);

const stats = computed(() => {
  const scores = { trankil: 0, possib: 0, cho: 0, trecho: 0, cmor: 0 };

  const getBloc = (bloc, circo) =>
    circo.resultats.find((cand) => cand.bloc_lemonde === bloc);

  Object.values(props.results).forEach((circo) => {
    const pc = Math.round((circo.total_gauche / circo.exprimes) * 1000) / 10;
    const hasNupes = getBloc("Nupes", circo)?.qualifie;

    if (!hasNupes) {
      return;
    } else if (pc >= 45.0) {
      scores.trankil += 1;
    } else if (pc < 45.0 && pc >= 38.5) {
      scores.possib += 1;
    } else if (pc < 38.5 && pc >= 30) {
      scores.cho += 1;
    } else if (pc < 30 && pc >= 25) {
      scores.trecho += 1;
    } else {
      scores.cmor += 1;
    }
  });

  return scores;
});
</script>

<template>
  <p>
    À quel point c’est possible ou complètement chaud pour Nupes durant ce
    second tour ?
  </p>
  <p class="explanation">
    <strong
      >Pour chacune des {{ withNupes.length }} circonscriptions où la Nupes est
      qualifiée</strong
    >, voici le total des voix Nupes
    <template v-if="isOnlyNatural">
      avec ses reports « naturels » (autres gauches et extrême gauche).
    </template>
    <template v-else> selon votre propre projection. </template>
    <small
      >Source : Ministère de l’Intérieur, nuances et regroupements par Le
      Monde.</small
    >
  </p>
  <div class="circo-table" ref="circoTableDom">
    <Circo
      v-for="(circo, i) in [...withNupes, ...withoutNupes]"
      :circo="circo"
      :key="circo.id"
      :index="i"
      :maxRight="state.maxRight"
      :query="query"
      :isFound="foundIds.includes(circo.id)"
      :withAnnotations="withAnnotations"
    />
  </div>
  <div class="legende">
    <div class="one-legend">
      <span style="background-color: var(--trankil-color)">{{
        stats.trankil
      }}</span>
      <strong>Trankil (&gt; 45%)</strong>
    </div>
    <div class="one-legend">
      <span style="background-color: var(--possib-color)">{{
        stats.possib
      }}</span>
      <strong>Possib' (&lt; 45%)</strong>
    </div>
    <div class="one-legend">
      <span style="background-color: var(--cho-color)">{{ stats.cho }}</span>
      <strong>Cho (&lt; 38.5%)</strong>
    </div>
    <div class="one-legend">
      <span style="background-color: var(--trecho-color)">{{
        stats.trecho
      }}</span>
      <strong>Trécho (&lt; 30%)</strong>
    </div>
    <div class="one-legend">
      <span style="background-color: var(--cmor-color)">{{ stats.cmor }}</span>
      <strong>C mor (&lt; 25%)</strong>
    </div>
    <div class="one-legend">
      <span style="background-color: var(--not-qualified-color)"></span>
      <strong>Pas qualifié</strong>
    </div>
  </div>
</template>

<style scoped>
.explanation {
  line-height: 1.25;
  padding: 0.5rem 0;
}

.explanation small {
  color: #3f3f3f;
}

.circo-table {
  display: grid;
  grid-template-columns: repeat(50, 16px);
  grid-auto-flow: row dense;
  row-gap: 2px;
  column-gap: 2px;
  margin-top: 8px;
}

.circo-table > *:nth-child(289n) {
  position: relative;
}

.legende {
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}

.one-legend {
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 13px;
}

.one-legend span {
  display: block;
  width: 36px;
  height: 20px;
  margin-right: 8px;
  text-align: center;
  line-height: 20px;
  font-size: 10px;
}

.one-legend strong {
  font-weight: 400;
  letter-spacing: -0.25px;
}

@media screen and (max-width: 952px) {
  .circo-table {
    max-width: 900px;
    grid-template-columns: repeat(auto-fill, 16px);
  }

  .legende {
    display: grid;
    grid-template-columns: repeat(auto-fill, 150px);
    justify-content: center;
  }
}
</style>
