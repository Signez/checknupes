<script setup async>
import { onMounted, computed, reactive, watch } from "vue";
import Dashboard from "./components/Dashboard.vue";
import ReportSlider from "./components/ReportSlider.vue";
import { preprocess, predict, DEFAULT_REPORTS } from "./data-crunching";

const state = reactive({
  allResults: {},
  originalResults: {},
  reportsGauche: { ...DEFAULT_REPORTS },
  postalCodes: {},
  query: "",
  withAnnotations: [],
});

onMounted(() => {
  import("../data/results_with_lemonde_nuances.json").then((res) => {
    const processed = preprocess(res.default);
    state.originalResults = processed;
    state.allResults = predict(processed, state.reportsGauche);

    import("../data/circo_by_postal_code.json").then((res) => {
      state.postalCodes = res.default;
    });
  });
});

watch(
  () => state.reportsGauche,
  (rep) => {
    state.allResults = predict({ ...state.originalResults }, rep);
  },
  { deep: true }
);

const blocs = [
  "Extrême gauche",
  "Nupes",
  "Gauche",
  "Ensemble",
  "Centre",
  "LR-UDI",
  "Droite",
  "Rassemblement national",
  "Extrême droite",
  "Reconquête",
  "Régionalistes",
  "Divers",
  "Abstention",
];

const ready = computed(() => Object.values(state.allResults).length);
</script>

<template>
  <main>
    <header>
      <h1>Check Nupes</h1>
      <input
        placeholder="ex: 69, 75_08, 37000, Darmanin…"
        class="search"
        type="text"
        name="search"
        v-model="state.query"
      />
    </header>
    <Dashboard
      v-if="ready"
      :results="state.allResults"
      :reportsGauche="state.reportsGauche"
      :query="state.query"
      :postalCodes="state.postalCodes"
      :withAnnotations="state.withAnnotations"
    />
    <div v-else class="waiting">
      <p>Chargement des résultats…</p>
      <small
        >(ça fait 150 ko à télécharger et décompresser, ça devrait aller
        vite)</small
      >
    </div>
    <fieldset class="view-settings" v-if="ready">
      <legend>Personnalisez le tableau</legend>
      <div class="what-to-highlight"></div>
      <div class="toppings">
        <label>
          <input type="checkbox" value="rn" v-model="state.withAnnotations" />
          Afficher les duels avec le RN
        </label>
        <label>
          <input type="checkbox" value="tri" v-model="state.withAnnotations" />
          les triangulaires
        </label>
        <label>
          <input type="checkbox" value="lrem" v-model="state.withAnnotations" />
          les ministres et barons d’Ensemble
        </label>
      </div>
    </fieldset>
    <fieldset class="brice-section" v-if="ready">
      <legend>Devenez Brice Teinturier</legend>
      <p class="instructions">
        Personnalisez ci-dessous les co-efficients de report de voix vers la
        Nupes, pour mettre à jour avec vos propres projections. <br />
        N’oubliez pas de vous faire inviter ensuite dans la matinale de votre
        choix 😉
      </p>
      <div class="all-sliders">
        <ReportSlider
          v-for="bloc in blocs"
          v-model="state.reportsGauche[bloc]"
          :key="bloc"
          :bloc="bloc"
          :modelValue="state.reportsGauche[bloc]"
          @update:modelValue="(nVal) => (state.reportsGauche[bloc] = +nVal)"
        />
      </div>
    </fieldset>
    <p class="todo" v-if="ready">
      <strong>Limites à garder en tête :</strong><br />
      • Je ne suis pas statisticien, y’a sans doute des bugs ;<br />
      • Les coefficients ne permettent pas de pondérer le côté « barrage
      républicain », typiquement dans le cas de duels RN/Nupes ;<br />
      • …de manière générale, ça n’est qu’une version automatisée de calculs de
      coins de table. Gardez ça en tête et allez voter dimanche.
    </p>
    <p class="app-credits">
      Un projet fait par
      <a href="https://twitter.com/Signez" target="_blank">@Signez</a>,
      développeur indépendant (mais qui aime bien Nupes). Suivez-moi
      <a href="https://twitter.com/Signez">sur Twitter</a>, ou
      <a href="https://twitch.tv/Signez">en live sur Twitch</a> !
    </p>
  </main>
</template>

<style>
@import "./assets/base.css";
@import "./assets/bloc-colors.css";

#app {
  max-width: 930px;
  margin: 0 auto;
  padding: 1rem;

  font-weight: normal;

  --not-qualified-color: hsl(32, 2%, 83%);
  --winner-color: hsl(121, 85%, 20%);
  --trankil-color: hsl(121, 85%, 59%);
  --possib-color: hsl(84, 95%, 75%);
  --cho-color: hsl(58, 95%, 50%);
  --trecho-color: hsl(38, 95%, 50%);
  --cmor-color: hsl(20, 60%, 50%);
}

#app header {
  display: flex;
  justify-content: space-between;
}

@media screen and (max-width: 952px) {
  #app header {
    display: block;
    margin-bottom: 18px;
    text-align: center;
  }
}

h1 {
  margin-bottom: 0.5rem;
}

.search {
  font-family: inherit;
  font-size: 16px;
  padding: 10px;
  border: 2px solid rgb(161, 0, 75);
  border-radius: 8px;
  height: 40px;
  align-self: center;
  width: 350px;
  margin-bottom: 5px;
}

body {
  border-top: 8px solid rgb(161, 0, 75);
}

.todo,
.app-credits {
  margin-top: 16px;
  background-color: hsl(5, 8%, 91%);
  padding: 6px 15px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.3;
}

.todo {
  margin-top: 24px;
  margin-bottom: 0;
  background-color: hsl(52, 100%, 85%);
}

.view-settings {
  background-color: hsl(0, 0%, 93%);
  border: 0 none;
  margin-top: 20px;
  border-radius: 8px;
}

.view-settings legend {
  background-color: hsl(0, 0%, 93%);
  padding: 0 10px;
  font-size: 13px;
  font-weight: bold;
  border-radius: 8px;
}

.view-settings .toppings {
  display: flex;
  justify-content: space-between;
}

@media screen and (max-width: 952px) {
  .view-settings .toppings {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .view-settings .toppings label {
    margin-right: 50px;
  }
}

.brice-section {
  background-color: hsl(52, 100%, 90%);
  border: 0 none;
  margin-top: 20px;
  border-radius: 8px;
}

.brice-section legend {
  background-color: hsl(52, 100%, 90%);
  padding: 0 10px;
  font-size: 13px;
  font-weight: bold;
  border-radius: 8px;
}

.brice-section .report-slider {
  margin-right: 5px;
}

.brice-section .report-slider[data-bloc="Régionalistes"] {
  margin-left: 20px;
}

.brice-section .report-slider[data-bloc="Abstention"] {
  margin-left: 20px;
}

.instructions {
  font-size: 13px;
  line-height: 1.2;
  margin-bottom: 10px;
}

.all-sliders {
  display: flex;
  flex-wrap: wrap;
}

.app-credits a {
  color: inherit;
}
</style>
