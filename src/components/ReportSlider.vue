<script setup>
const { bloc } = defineProps({
  bloc: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Number,
    required: true,
  },
});
defineEmits(["update:modelValue"]);

const VERY_SHORT_LABEL = {
  "Rassemblement national": "RN",
  "Extrême gauche": "Ext. gauche",
  "Extrême droite": "Ext. droite",
  Reconquête: "Reconq.",
  Régionalistes: "Régio.",
  Gauche: "Autre gauche",
};

const label = VERY_SHORT_LABEL[bloc] ?? bloc;
</script>

<template>
  <div class="report-slider" :data-bloc="bloc">
    <div class="range-wrapper">
      <input
        class="range"
        type="range"
        step="0.1"
        min="0"
        max="1"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <input
      class="number"
      type="number"
      step="0.1"
      min="0"
      max="1"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped>
.report-slider {
  display: flex;
  flex-direction: column;
  width: 42px;
}

.report-slider input {
  accent-color: var(--bloc-color);
}

.label {
  display: flex;
  height: 42px;
  align-items: center;
  justify-content: flex-end;
  font-size: 10px;
  letter-spacing: -0.25px;
  line-height: 1.1;
  text-align: right;
  transform-origin: bottom right;
  transform: rotate(-90deg) translateX(100%) translateX(-10px);
  margin-bottom: 16px;
}

.range {
  width: 100px;
  transform-origin: center center;
  transform: translateX(-28px) translateY(45px) rotate(-90deg);
}

.range-wrapper {
  height: 120px;
}

.number {
  width: 100%;
  font-family: inherit;
  font-size: 10px;
  padding: 0 0 0 2px;
}

.number::-webkit-outer-spin-button,
.number::-webkit-inner-spin-button {
  -webkit-appearance: inner-spin-button !important;
  opacity: 1;
  margin-left: 5px;
}
</style>
