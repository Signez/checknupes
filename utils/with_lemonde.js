#!/usr/bin/env node

const fs = require("fs");

const data = fs.readFileSync(
  `${__dirname}/../data/resultats-fr-lsg22-tour-1.json`,
  "utf8"
);

// Source data is known to be a _very_ basic TSV. For anything more complex, we should
// use a proper tsv parsing module, but here, a simple strategy will work.

const lemondeFile = fs.readFileSync(
  `${__dirname}/../data/lemonde-fr-lsg22-nuances.tsv`,
  "utf8"
);

const rawLemondeLines = lemondeFile.split(/\r?\n/);
const lemondeColumnNames = rawLemondeLines[0].split("\t");
const rawLemondeData = rawLemondeLines
  .slice(1)
  .map((line) =>
    Object.fromEntries(
      line
        .split("\t")
        .map((value, column) => [lemondeColumnNames[column], value])
    )
  );

const circos = JSON.parse(data);

for (const id in circos) {
  const circo = circos[id];

  const winner = circo.resultats.find(
    (res) =>
      +res.voix > 0.5 * circo.exprimes && +res.voix > 0.25 * circo.inscrits
  );

  const twoFirsts = circo.resultats
    .sort((a, b) => +b.voix - a.voix)
    .slice(0, 2)
    .map((res) => res.panneau);

  circo.resultats = circo.resultats.map((res) => {
    const { nuance: nuance_ministere, ...oldRes } = res;

    const lemonde = rawLemondeData.find(
      (cand) =>
        cand.dep === circo.dep &&
        cand.circo === circo.circo &&
        +cand.panneau === +res.panneau
    );

    const hasWon = winner?.panneau === res.panneau;

    return {
      ...oldRes,
      nuance_ministere,
      parti_lemonde: lemonde?.parti_lemonde,
      nuance_lemonde: lemonde?.nuance_lemonde,
      bloc_lemonde: lemonde?.bloc_lemonde,
      qualifie:
        (hasWon || !winner) &&
        (+res.voix > 0.125 * circo.inscrits || twoFirsts.includes(res.panneau)),
      elu: hasWon,
    };
  });

  circos[id] = circo;
}

console.log(JSON.stringify(circos, undefined, 2));
