#!/usr/bin/env node

const fs = require("fs");

const data = fs.readFileSync(
  `${__dirname}/../data/resultats-fr-lsg22-tour-1.tsv`,
  "utf8"
);

const deps = Object.fromEntries(
  fs
    .readFileSync(`${__dirname}/../data/resultats-fr-lsg22-depskey.csv`, "utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
);

const MAX_PANNEAU = 22;

// Source data is known to be a _very_ basic TSV. For anything more complex, we should
// use a proper tsv parsing module, but here, a simple strategy will work.

const rawlines = data.split(/\r?\n/);
const columnNames = rawlines[0].split("\t");
const rawdata = rawlines
  .slice(1)
  .map((line) =>
    Object.fromEntries(
      line.split("\t").map((value, column) => [columnNames[column], value])
    )
  );

function cleanRow(raw) {
  const resultats = [];

  for (let i = 1; i <= MAX_PANNEAU; i++) {
    const p_ = `p${i}_`;

    if (raw[`${p_}panneau`] !== "") {
      resultats.push({
        panneau: +raw[`${p_}panneau`],
        sexe: raw[`${p_}sexe`],
        nom: raw[`${p_}nom`],
        prenom: raw[`${p_}prenom`],
        nuance: raw[`${p_}nuance`],
        voix: +raw[`${p_}voix`],
      });
    }
  }

  return {
    id: raw.id,
    dep: raw.dep,
    dep_label: deps[raw.dep],
    circo: raw.circo,
    inscrits: +raw.inscrits,
    abstentions: +raw.abstentions,
    votants: +raw.votants,
    blancs: +raw.blancs,
    nuls: +raw.nuls,
    exprimes: +raw.exprimes,
    resultats: resultats.sort((rA, rB) => rB.voix - rA.voix),
  };
}

const cleaned = Object.fromEntries(
  rawdata.map((raw) => [raw.id, cleanRow(raw)])
);

console.log(JSON.stringify(cleaned, undefined, 2));
