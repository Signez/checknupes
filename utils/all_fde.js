#!/usr/bin/env node

const fs = require("fs");

const data = fs.readFileSync(
  `${__dirname}/../data/resultats-fr-lsg22-tour-1.json`,
  "utf8"
);

const results = JSON.parse(data);
const fde = Object.values(results).filter((circo) => circo.dep === "ZZ");

const candidats = fde
  .flatMap((circo) =>
    circo.resultats.map((cand) =>
      [
        circo.dep,
        circo.circo,
        cand.panneau,
        cand.sexe,
        cand.nom,
        cand.prenom,
        cand.nuance,
        `${cand.prenom} ${cand.nom}`,
      ].join(";")
    )
  )
  .join("\n");

console.log(candidats);
