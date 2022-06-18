<script setup>
const { candidat, circo } = defineProps({
  circo: {
    type: Object,
    required: true,
  },
  candidat: {
    type: Object,
    required: true,
  },
});

const vote = (+candidat.voix / +circo.exprimes) * 100;
const formattedVote = Math.round(vote * 100) / 100;

const completeName = `${candidat.sexe === "F" ? "Mme" : "M."} ${
  candidat.prenom
} ${candidat.nom}`;
</script>

<template>
  <div
    class="jauge-part with-bloc-color"
    :style="{ width: `${vote}%` }"
    :data-bloc="candidat.bloc_lemonde"
    :title="`${formattedVote}% pour ${
      candidat.nuance_lemonde ?? candidat.nuance_ministere
    } (${completeName})`"
  ></div>
</template>

<style scoped>
.jauge-part {
  height: 100%;
  background-color: yellow;
  box-shadow: inset -2px 0 0 rgba(0, 0, 0, 0.2);
}

.jauge-part:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.jauge-part:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
