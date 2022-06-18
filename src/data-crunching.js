import { default as retiredCandidates } from "../data/retired-candidates.json";

export const BLOC_TO_SHORT = {
  "Rassemblement national": "RN",
  Gauche: "Autre gauche",
};

function injectBlocs(cand) {
  return {
    bloc: BLOC_TO_SHORT[cand.bloc_lemonde] ?? cand.bloc_lemonde,
    ...cand,
  };
}

function applyNoMatchs(circo) {
  if (retiredCandidates[circo.id]) {
    const withoutRetired = circo.resultats.map((cand) => {
      const retiredData = retiredCandidates[circo.id][cand.panneau];

      if (retiredData) {
        return { ...cand, retired: true, ...retiredData };
      } else {
        return cand;
      }
    });

    const withNoMatchs = withoutRetired.map((cand) => {
      if (
        cand.qualifie &&
        withoutRetired.filter((cand) => cand.qualifie && !cand.retired)
          .length === 1
      ) {
        return { ...cand, elu: true, no_match: true };
      } else {
        return cand;
      }
    });

    return { ...circo, resultats: withNoMatchs };
  } else {
    return circo;
  }
}

function preprocessCirco(circo) {
  const withBlocs = { ...circo, resultats: circo.resultats.map(injectBlocs) };
  const withNoMatches = applyNoMatchs(withBlocs);

  return withNoMatches;
}

export function preprocess(results) {
  return Object.fromEntries(
    Object.entries(results).map(([id, circo]) => {
      return [id, preprocessCirco(circo)];
    })
  );
}

export const DEFAULT_REPORTS = {
  Gauche: 1.0,
  Divers: 0.0,
  Nupes: 1.0,
  "Extrême gauche": 1.0,
  Régionalistes: 0.0,
  Centre: 0.0,
  Ensemble: 0.0,
  "LR-UDI": 0.0,
  Droite: 0.0,
  "Extrême droite": 0.0,
  Reconquête: 0.0,
  "Rassemblement national": 0.0,
  Abstention: 0.0,
};

function predictCirco(circo, reportsCoefs) {
  const reports_gauche = circo.resultats.reduce(
    (contribs, cand) => {
      return {
        ...contribs,
        [cand.bloc_lemonde]:
          (contribs[cand.bloc_lemonde] ?? 0) +
          Math.round(cand.voix * +reportsCoefs[cand.bloc_lemonde]),
      };
    },
    { Abstention: Math.round(reportsCoefs.Abstention * circo.abstentions) }
  );
  const total_gauche = Object.keys(reports_gauche)
    .map((bloc) => reports_gauche[bloc])
    .reduce((a, b) => +a + (b || 0), 0);

  const exprimes =
    circo.exprimes + Math.round(reportsCoefs.Abstention * circo.abstentions);

  return { ...circo, reports_gauche, total_gauche, exprimes };
}

// s/o Brice Teintruier
export function predict(results, reportsCoefs) {
  return Object.fromEntries(
    Object.entries(results).map(([id, circo]) => {
      return [id, predictCirco(circo, reportsCoefs)];
    })
  );
}

export function matchesCirco(circo, query, postalCircos) {
  const lower = query?.toString().toLowerCase();
  return (
    circo &&
    (circo.dep === query ||
      circo.id === query ||
      postalCircos.includes(circo.id) ||
      circo.resultats?.find((cand) => cand.nom.toLowerCase().includes(lower)))
  );
}

export const KNOWN_ENSEMBLE_ADVERSARIES = {
  "01_05": {
    nom: "ABAD",
    why: "Ministre",
  },
  "04_02": {
    nom: "CASTANER",
    why: "Président de groupe",
  },
  "07_02": {
    nom: "DUSSOPT",
    why: "Ministre",
  },
  "14_06": {
    nom: "BORNE",
    why: "Première ministre",
  },
  "29_06": {
    nom: "FERRAND",
    why: "Président de l’Assemblée Nationale",
  },
  "38_01": {
    nom: "VÉRAN",
    why: "Ministre",
  },
  "41_01": {
    nom: "FESNEAU",
    why: "Ministre",
  },
  "59_10": {
    nom: "DARMANIN",
    why: "Ministre",
  },
  "62_06": {
    nom: "BOURGUIGNON",
    why: "Ministre",
  },
  "75_03": {
    nom: "GUERINI",
    why: "Ministre",
  },
  "75_07": {
    nom: "BEAUNE",
    why: "Ministre",
  },
  "75_02": {
    nom: "LE GENDRE",
    why: "Ancien président de groupe",
  },
  "75_12": {
    nom: "GREGOIRE",
    why: "Porte-parole du gouvernement",
  },
  "77_05": {
    nom: "RIESTER",
    why: "Ministre",
  },
  "78_05": {
    nom: "BRAUN-PIVET",
    why: "Ministre",
  },
  "80_02": {
    nom: "POMPILI",
    why: "Ministre",
  },
  "91_06": {
    nom: "DE MONTCHALIN",
    why: "Ministre",
  },
  "92_10": {
    nom: "ATTAL",
    why: "Ministre",
  },
  ZA_02: {
    nom: "BENIN",
    why: "Secrétaire d’État",
  },
};
