#!/usr/bin/env node

const fs = require("fs");
const ProgressBar = require("./progress_bar");

function parseTsv(allFile) {
  return allFile.split(/\r?\n/).map((line) => line.split("\t"));
}

// ['code_postal', 'code_insee', 'nom_commune', 'lieu_dit', 'libelle_acheminement', 'coordonnees_gps']
const [, ...allCodePostals] = parseTsv(
  fs.readFileSync(`${__dirname}/../data/all_code_postals.tsv`, "utf8")
);

// [ 'code_insee', 'code_circo', 'nom_commune', 'is_full' ]
const [, ...allCommunesWithCircos] = parseTsv(
  fs.readFileSync(`${__dirname}/../data/all_communes_with_circos.tsv`, "utf8")
);

const registry = {};

//var bar = new ProgressBar("[:bar] :percent :current/:total", {
//  total: allCodePostals.length,
//});
for (let i = 0; i < allCodePostals.length; i++) {
  const code_postal = allCodePostals[i][0];
  const code_insee = allCodePostals[i][1];

  registry[code_postal] ??= [];

  allCommunesWithCircos
    .filter((commune) => code_insee === commune[0])
    .flatMap((commune) => {
      if (!registry[code_postal].includes(commune[1])) {
        registry[code_postal].push(commune[1]);
      }
    });

  //bar.tick();
}

//const emptyPostal = Object.entries(registry)
//  .filter(([, circos]) => circos.length === 0)
//  .map(([postal]) => postal);

console.log(JSON.stringify(registry, undefined, 2));
