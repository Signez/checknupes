<script setup>
const { circo, candidat, index } = defineProps({
  circo: {
    type: Object,
    required: true,
  },
  candidat: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
const qualifie = candidat.qualifie;
const elimine = !qualifie && !candidat.winner;
const retired = candidat.retired;
const vote = (+candidat.voix / +circo.exprimes) * 100;
const formattedVote = Math.round(vote * 100) / 100;

const quasiWinner = candidat.qualifie && !candidat.elu && vote > 50.0;
</script>

<template>
  <div
    :class="['candidat', { qualifie, elimine, retired }]"
    :data-bloc="candidat.bloc_lemonde"
  >
    <div class="nuance">
      {{ candidat.bloc }}
      <span class="vote">{{ formattedVote }} %</span>
    </div>
    <div class="nom">
      {{ candidat.sexe === "F" ? "Mme" : "M." }} {{ candidat.prenom }}
      {{ candidat.nom }}
    </div>
    <div class="parti">{{ candidat.parti_lemonde }}</div>
    <div v-if="quasiWinner" class="raison-2nd-tour">
      • Pas élu·e dès le 1<sup>er</sup> tour car moins de 25% des inscrits
    </div>
    <div v-if="candidat.retired" class="raison-retired">
      • <strong>S’est retiré{{ candidat.sexe === "F" ? "e" : "" }}</strong> ({{
        candidat.retired_reason
      }}
      selon
      <a :href="candidat.retired_link_href" target="_blank">{{
        candidat.retired_link_title
      }}</a
      >)
    </div>
  </div>
</template>

<style scoped>
.candidat {
  display: grid;
  grid-template-areas:
    "nuance nom"
    "parti parti"
    "info info";
  align-items: center;
  margin-bottom: 6px;
}

.nuance {
  font-weight: bold;
  grid-area: nuance;
  text-decoration: underline;
  text-decoration-color: var(--bloc-color);
  text-decoration-thickness: 2px;
}

.parti {
  font-size: 10px;
  line-height: 1;
  grid-area: parti;
}

.nom {
  grid-area: nom;
  text-align: right;
  justify-self: end;
  font-size: 12px;
}

.vote {
  font-weight: normal;
  font-size: 11px;
}

.elimine {
  font-size: 11px;
  row-gap: 2px;
}

.elimine .nom {
  font-size: 10px;
}

.elimine .parti {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 10px;
  letter-spacing: -0.2px;
}

.elimine .vote {
  font-size: 8px;
}

.raison-2nd-tour {
  grid-area: info;
  font-size: 10px;
  color: rgb(164, 82, 0);
}

.retired .parti,
.retired .nom,
.retired .nuance {
  opacity: 0.5;
  text-decoration: line-through;
  text-decoration-color: rgba(0, 0, 0, 0.6);
}

.raison-retired {
  grid-area: info;
  font-size: 11px;
  color: rgb(20, 27, 39);
  margin-top: 2px;
}

.raison-retired a {
  color: inherit;
}
</style>
