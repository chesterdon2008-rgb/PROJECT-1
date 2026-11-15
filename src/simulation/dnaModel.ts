export type Base = 'A' | 'T' | 'G' | 'C' | 'U';

export type SceneId =
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'
  | 'mmr';

export type MMRPhaseId =
  | 'replication_error'
  | 'mismatch_recognition'
  | 'strand_correction'
  | 'excision'
  | 'resynthesis'
  | 'ligation';

export interface SubStepInfo {
  id: string;
  label: string;
  summary: string;
  focusIds: string[];
}

export interface AnnotationItem {
  id: string;
  term: string;
  role: string;
  category: 'structure' | 'enzyme' | 'strand' | 'repair';
}

export interface SceneDefinition {
  id: SceneId;
  shortTitle: string;
  title: string;
  kicker: string;
  description: string;
  subSteps: SubStepInfo[];
  annotations: AnnotationItem[];
}

/**
 * Exact parental sequence specified for Scene 2 and carried through replication & MMR:
 * Top strand:    5'-A T G C C A T G A C T-3'
 * Bottom strand: 3'-T A C G G T A C T G A-5'
 */
export const PARENTAL_TOP_STRAND: readonly Base[] = [
  'A',
  'T',
  'G',
  'C',
  'C',
  'A',
  'T',
  'G',
  'A',
  'C',
  'T',
] as const;

export const PARENTAL_BOTTOM_STRAND: readonly Base[] = [
  'T',
  'A',
  'C',
  'G',
  'G',
  'T',
  'A',
  'C',
  'T',
  'G',
  'A',
] as const;

/** Index (0-based) of the G–T mismatch site in the MMR pathway (index 7: parental G, misincorporated T) */
export const MMR_MISMATCH_INDEX = 7;

export function getComplementaryBase(base: Base, isRna = false): Base {
  switch (base) {
    case 'A':
      return isRna ? 'U' : 'T';
    case 'T':
    case 'U':
      return 'A';
    case 'G':
      return 'C';
    case 'C':
      return 'G';
  }
}

export function isPurine(base: Base): boolean {
  return base === 'A' || base === 'G';
}

export function isComplementaryPair(b1: Base, b2: Base): boolean {
  return (
    (b1 === 'A' && (b2 === 'T' || b2 === 'U')) ||
    ((b1 === 'T' || b1 === 'U') && b2 === 'A') ||
    (b1 === 'G' && b2 === 'C') ||
    (b1 === 'C' && b2 === 'G')
  );
}

export function getHydrogenBondCount(b1: Base, b2: Base): 0 | 2 | 3 {
  if (!isComplementaryPair(b1, b2)) return 0;
  if (b1 === 'G' || b1 === 'C') return 3;
  return 2;
}

export function synthesizeComplement(
  template: readonly Base[],
  options: { rnaIndices?: number[]; mismatchIndex?: number; mismatchBase?: Base } = {}
): Base[] {
  const rnaSet = new Set(options.rnaIndices ?? []);
  return template.map((base, idx) => {
    if (options.mismatchIndex === idx && options.mismatchBase) {
      return options.mismatchBase;
    }
    return getComplementaryBase(base, rnaSet.has(idx));
  });
}

export interface MMRStrandState {
  phase: MMRPhaseId;
  phaseIndex: number;
  parentalStrand: readonly Base[];
  daughterStrand: (Base | null)[];
  mismatchIndex: number;
  excisedRange: [number, number] | null;
  nickIndex: number | null;
  isLigated: boolean;
  mutSBound: boolean;
  mutLRecruited: boolean;
  mutHActivated: boolean;
  exonucleaseActive: boolean;
  polymeraseActive: boolean;
  ligaseActive: boolean;
}

export const MMR_PHASE_ORDER: readonly MMRPhaseId[] = [
  'replication_error',
  'mismatch_recognition',
  'strand_correction',
  'excision',
  'resynthesis',
  'ligation',
] as const;

export function getMMRStateForPhase(phaseIndex: number): MMRStrandState {
  const clamped = Math.max(0, Math.min(MMR_PHASE_ORDER.length - 1, phaseIndex));
  const phase = MMR_PHASE_ORDER[clamped];
  const parentalStrand = PARENTAL_TOP_STRAND;
  const baseDaughter = synthesizeComplement(parentalStrand, {
    mismatchIndex: MMR_MISMATCH_INDEX,
    mismatchBase: 'T',
  });

  switch (phase) {
    case 'replication_error':
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: baseDaughter,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: null,
        nickIndex: null,
        isLigated: false,
        mutSBound: false,
        mutLRecruited: false,
        mutHActivated: false,
        exonucleaseActive: false,
        polymeraseActive: false,
        ligaseActive: false,
      };
    case 'mismatch_recognition':
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: baseDaughter,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: null,
        nickIndex: null,
        isLigated: false,
        mutSBound: true,
        mutLRecruited: false,
        mutHActivated: false,
        exonucleaseActive: false,
        polymeraseActive: false,
        ligaseActive: false,
      };
    case 'strand_correction':
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: baseDaughter,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: null,
        nickIndex: 4,
        isLigated: false,
        mutSBound: true,
        mutLRecruited: true,
        mutHActivated: true,
        exonucleaseActive: false,
        polymeraseActive: false,
        ligaseActive: false,
      };
    case 'excision': {
      const excisedDaughter: (Base | null)[] = baseDaughter.map((b, idx) =>
        idx >= 5 && idx <= 8 ? null : b
      );
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: excisedDaughter,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: [5, 8],
        nickIndex: 4,
        isLigated: false,
        mutSBound: false,
        mutLRecruited: false,
        mutHActivated: false,
        exonucleaseActive: true,
        polymeraseActive: false,
        ligaseActive: false,
      };
    }
    case 'resynthesis': {
      const resynthesized = synthesizeComplement(parentalStrand);
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: resynthesized,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: null,
        nickIndex: 8,
        isLigated: false,
        mutSBound: false,
        mutLRecruited: false,
        mutHActivated: false,
        exonucleaseActive: false,
        polymeraseActive: true,
        ligaseActive: false,
      };
    }
    case 'ligation': {
      const repaired = synthesizeComplement(parentalStrand);
      return {
        phase,
        phaseIndex: clamped,
        parentalStrand,
        daughterStrand: repaired,
        mismatchIndex: MMR_MISMATCH_INDEX,
        excisedRange: null,
        nickIndex: null,
        isLigated: true,
        mutSBound: false,
        mutLRecruited: false,
        mutHActivated: false,
        exonucleaseActive: false,
        polymeraseActive: false,
        ligaseActive: true,
      };
    }
  }
}

export interface MutationOutcome {
  cycle1DuplexA: [string, string];
  cycle1DuplexB: [string, string];
  cycle2MutantDuplex: [string, string];
  isPermanentMutation: boolean;
}

/**
 * Computes the fate of a G–T replication error if repaired by MMR vs left unrepaired across a 2nd replication cycle.
 */
export function evaluateErrorVsMutation(repairedByMMR: boolean): MutationOutcome {
  if (repairedByMMR) {
    return {
      cycle1DuplexA: ['G', 'C'],
      cycle1DuplexB: ['G', 'C'],
      cycle2MutantDuplex: ['G', 'C'],
      isPermanentMutation: false,
    };
  }
  return {
    cycle1DuplexA: ['G', 'C'],
    cycle1DuplexB: ['G', 'T'],
    cycle2MutantDuplex: ['A', 'T'],
    isPermanentMutation: true,
  };
}

export const SCENES: readonly SceneDefinition[] = [
  {
    id: 'scene1',
    shortTitle: '1. Intro',
    title: 'Scene 1 · Introduction: Error vs. Permanent Mutation',
    kicker: 'Cellular Context & Fidelity Stakes',
    description:
      'Inside the cell nucleus, double-stranded DNA stores genetic instructions. During copying, an occasional nucleotide mismatch can occur—whether it stays reversible or becomes inherited depends on Mismatch Repair (MMR).',
    subSteps: [
      {
        id: 'normal_cell',
        label: 'Normal Cellular DNA',
        summary: 'Intact double-stranded DNA resides inside the nucleus with faithful Watson–Crick G≡C pairing.',
        focusIds: ['nucleus', 'normal-dna'],
      },
      {
        id: 'replication_error',
        label: 'Replication Error (Repairable)',
        summary: 'A misincorporated T opposite G creates a structural wobble mismatch. No sequence change is permanent yet—MMR can still correct the new strand.',
        focusIds: ['replication-error'],
      },
      {
        id: 'permanent_mutation',
        label: 'Permanent Mutation (Next Cycle)',
        summary: 'If left unrepaired before the next S-phase, the incorrect T acts as a template and pairs with A, locking in a stable A–T mutation across future cell generations.',
        focusIds: ['permanent-mutation'],
      },
    ],
    annotations: [
      {
        id: 'replication-error',
        term: 'Replication Error',
        role: 'An incorrect nucleotide or mismatch (such as G–T) in the newly synthesized strand that can still be recognized and repaired before the next round of replication.',
        category: 'repair',
      },
      {
        id: 'permanent-mutation',
        term: 'Permanent Mutation',
        role: 'A stable, heritable base-pair change (G≡C → A=T) fixed after the uncorrected error is used as a template in a subsequent replication cycle.',
        category: 'repair',
      },
      {
        id: 'nucleus',
        term: 'Cell & Nuclear DNA',
        role: 'Eukaryotic genomic DNA is housed inside the nucleus, where proofreading and Mismatch Repair safeguard sequence integrity.',
        category: 'structure',
      },
    ],
  },
  {
    id: 'scene2',
    shortTitle: '2. Base Pairing',
    title: 'Scene 2 · Normal DNA & Complementary Base Pairing',
    kicker: 'Antiparallel Duplex Architecture',
    description:
      'Two antiparallel sugar-phosphate backbones carry nitrogenous bases inward. Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds, while Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.',
    subSteps: [
      {
        id: 'overview',
        label: 'Full Duplex Architecture',
        summary: "Parental duplex showing 5'-A T G C C A T G A C T-3' paired antiparallel with 3'-T A C G G T A C T G A-5'.",
        focusIds: ['backbone', 'bases', 'parental', 'antiparallel', 'ends'],
      },
      {
        id: 'at_bonds',
        label: 'Highlight A=T (2 H-bonds)',
        summary: 'Purine Adenine forms exactly 2 hydrogen bonds with pyrimidine Thymine.',
        focusIds: ['at-pair'],
      },
      {
        id: 'gc_bonds',
        label: 'Highlight G≡C (3 H-bonds)',
        summary: 'Purine Guanine forms 3 hydrogen bonds with pyrimidine Cytosine, giving G≡C pairs higher thermal stability.',
        focusIds: ['gc-pair'],
      },
    ],
    annotations: [
      {
        id: 'backbone',
        term: 'Sugar-Phosphate Backbone',
        role: 'Alternating deoxyribose sugars and phosphodiester-linked phosphate groups form the exterior rails of the double helix.',
        category: 'structure',
      },
      {
        id: 'bases',
        term: 'Nitrogenous Bases',
        role: 'Purines (A, G — double ring) and pyrimidines (T, C — single ring) project inward to store sequence information.',
        category: 'structure',
      },
      {
        id: 'parental',
        term: 'Parental Strands',
        role: 'The original two template strands that will separate during replication.',
        category: 'strand',
      },
      {
        id: 'antiparallel',
        term: 'Antiparallel Orientation',
        role: "One strand runs 5'→3' left-to-right while its partner runs 3'→5' in the opposite chemical direction.",
        category: 'structure',
      },
      {
        id: 'ends',
        term: "5' and 3' Ends",
        role: "5' marks the terminal phosphate on carbon 5; 3' marks the free hydroxyl (-OH) on carbon 3 where new nucleotides attach.",
        category: 'structure',
      },
    ],
  },
  {
    id: 'scene3',
    shortTitle: '3. Unwinding',
    title: 'Scene 3 · Initiation & DNA Unwinding',
    kicker: 'Origin Melting & Replication Fork Dynamics',
    description:
      'Replication begins at an origin as enzymes melt the duplex into a Y-shaped replication fork while relieving torsional stress ahead of unwinding.',
    subSteps: [
      {
        id: 'origin_fork',
        label: 'Replication Fork & Helicase',
        summary: 'Helicase translocates into the duplex, breaking hydrogen bonds between complementary bases to form the Y-shaped replication fork.',
        focusIds: ['helicase', 'fork'],
      },
      {
        id: 'topoisomerase',
        label: 'Topoisomerase Strain Relief',
        summary: 'Ahead of the fork, Topoisomerase (DNA gyrase in bacteria) transiently cuts and rejoins DNA to relieve positive supercoiling.',
        focusIds: ['topoisomerase'],
      },
      {
        id: 'ssb_coat',
        label: 'SSB Stabilization',
        summary: 'Single-stranded binding proteins (SSBs) coat the exposed template strands so they cannot snap back together or degrade.',
        focusIds: ['ssb'],
      },
    ],
    annotations: [
      {
        id: 'helicase',
        term: 'Helicase',
        role: 'Ring-shaped motor enzyme that uses ATP to break hydrogen bonds and unzip the two parental strands.',
        category: 'enzyme',
      },
      {
        id: 'topoisomerase',
        term: 'Topoisomerase (DNA Gyrase)',
        role: 'Acts ahead of the fork to relieve torsional strain and remove positive supercoils generated by unwinding.',
        category: 'enzyme',
      },
      {
        id: 'ssb',
        term: 'Single-Stranded Binding Proteins',
        role: 'Bind exposed single-stranded DNA to prevent premature reannealing and protect against nucleases.',
        category: 'enzyme',
      },
      {
        id: 'fork',
        term: 'Replication Fork',
        role: 'The Y-shaped junction where double-stranded parental DNA splits into two single-stranded templates.',
        category: 'structure',
      },
    ],
  },
  {
    id: 'scene4',
    shortTitle: '4. Primers & Pol',
    title: 'Scene 4 · Primer Formation & DNA Synthesis',
    kicker: 'Primase Initiation & 5′→3′ Polymerization',
    description:
      'DNA polymerase cannot start a new chain from scratch. Primase first lays down a short RNA primer, giving DNA polymerase a free 3′-OH to extend in the 5′→3′ direction.',
    subSteps: [
      {
        id: 'primase_step',
        label: 'Primase Lays RNA Primer',
        summary: 'Primase synthesizes a short complementary RNA primer (e.g., 5′-U A C G-3′) providing an exposed 3′-OH anchor.',
        focusIds: ['primase', 'rna-primer'],
      },
      {
        id: 'polymerase_extend',
        label: 'DNA Polymerase Extends 5′→3′',
        summary: 'DNA polymerase reads the parental template 3′→5′ and adds complementary deoxyribonucleotides strictly in the 5′→3′ direction.',
        focusIds: ['dna-pol', 'direction', 'template', 'new-strand'],
      },
    ],
    annotations: [
      {
        id: 'primase',
        term: 'Primase',
        role: 'Specialized RNA polymerase that synthesizes short RNA primers because DNA polymerase requires an existing 3′-OH.',
        category: 'enzyme',
      },
      {
        id: 'rna-primer',
        term: 'RNA Primer',
        role: 'Short starting stretch of ribonucleotides (pairing A with U) that provides the initial 3′ hydroxyl group.',
        category: 'strand',
      },
      {
        id: 'dna-pol',
        term: 'DNA Polymerase',
        role: 'Reads the template 3′→5′ and catalyzes phosphodiester bond formation, synthesizing new DNA only 5′→3′.',
        category: 'enzyme',
      },
      {
        id: 'template',
        term: 'Template Strand',
        role: 'Parental strand read in the 3′→5′ direction to dictate each incoming complementary base.',
        category: 'strand',
      },
      {
        id: 'new-strand',
        term: 'Newly Synthesized Strand',
        role: 'Growing daughter DNA strand elongated at its 3′ end according to A–T and G–C pairing rules.',
        category: 'strand',
      },
      {
        id: 'direction',
        term: "5' to 3' Direction",
        role: 'Universal chemical polarity of nucleic acid synthesis: incoming dNTPs attach to the free 3′-OH.',
        category: 'structure',
      },
    ],
  },
  {
    id: 'scene5',
    shortTitle: '5. Leading/Lagging',
    title: 'Scene 5 · Leading & Lagging Strands',
    kicker: 'Antiparallel Fork Coordination & Maturation',
    description:
      'Because both new strands must grow 5′→3′ at a single moving fork, one strand grows continuously toward the fork while the opposite strand grows discontinuously in Okazaki fragments.',
    subSteps: [
      {
        id: 'simultaneous_fork',
        label: 'Continuous vs. Okazaki Synthesis',
        summary: 'Leading strand extends continuously toward the fork from one primer; lagging strand builds Okazaki fragments away from the fork using multiple primers.',
        focusIds: ['leading', 'lagging', 'okazaki'],
      },
      {
        id: 'primer_removal',
        label: 'RNA Primer Removal & Replacement',
        summary: 'Ribonuclease H / DNA Polymerase I removes the amber RNA primers and replaces them with matching DNA nucleotides.',
        focusIds: ['primer-replace'],
      },
      {
        id: 'ligase_seal',
        label: 'DNA Ligase Seals Nicks',
        summary: 'DNA Ligase catalyzes the final phosphodiester bond to seal nicks between adjacent Okazaki fragments into a continuous backbone.',
        focusIds: ['ligase'],
      },
    ],
    annotations: [
      {
        id: 'leading',
        term: 'Leading Strand (Continuous Synthesis)',
        role: 'Synthesized smoothly toward the advancing replication fork using only a single RNA primer.',
        category: 'strand',
      },
      {
        id: 'lagging',
        term: 'Lagging Strand',
        role: 'Synthesized discontinuously away from the moving fork in short segments to obey 5′→3′ chemistry.',
        category: 'strand',
      },
      {
        id: 'okazaki',
        term: 'Okazaki Fragments',
        role: 'Short DNA segments (each started by its own RNA primer) that are later joined on the lagging strand.',
        category: 'strand',
      },
      {
        id: 'ligase',
        term: 'DNA Ligase',
        role: 'Seals single-stranded sugar-phosphate backbone nicks after RNA primers are replaced with DNA.',
        category: 'enzyme',
      },
    ],
  },
  {
    id: 'scene6',
    shortTitle: '6. Outcome',
    title: 'Scene 6 · Semiconservative Replication Outcome',
    kicker: 'Two Daughter Duplexes & Fidelity Handoff',
    description:
      'Replication yields two complete double-stranded DNA molecules. Each daughter duplex conserves one original parental strand paired with one newly synthesized strand—now entering post-replication Mismatch Repair surveillance.',
    subSteps: [
      {
        id: 'semiconservative',
        label: 'Two Semiconservative Duplexes',
        summary: 'Both daughter DNA molecules retain one cobalt parental template strand and one teal newly synthesized daughter strand.',
        focusIds: ['parental-daughter-1', 'parental-daughter-2'],
      },
      {
        id: 'fidelity_check',
        label: 'Fidelity Check: Rare G–T Mismatch',
        summary: 'Even with DNA polymerase proofreading, ~1 in 10⁷ bases slips past—like a G–T mismatch on Duplex B, triggering Mismatch Repair (MMR).',
        focusIds: ['mmr-handoff'],
      },
    ],
    annotations: [
      {
        id: 'parental-daughter-1',
        term: 'Duplex A (1 Parental + 1 New)',
        role: 'Faithfully copied daughter DNA molecule containing one conserved parental strand and one newly synthesized strand.',
        category: 'strand',
      },
      {
        id: 'parental-daughter-2',
        term: 'Duplex B (1 Parental + 1 New)',
        role: 'Second daughter molecule—shown during post-replication scan, where a single G–T replication mismatch awaits MMR correction.',
        category: 'strand',
      },
    ],
  },
  {
    id: 'mmr',
    shortTitle: '7. Mismatch Repair',
    title: 'Target Focus · Mismatch Repair (MMR) Pathway',
    kicker: 'Error → Recognition → New Strand Correction → Excision → Resynthesis → Ligation',
    description:
      'Follow the complete 6-step Mismatch Repair pathway on our 5′-A T G C C A T G A C T-3′ duplex as MMR detects a G–T replication error, identifies the newly synthesized strand, excises the bad segment, resynthesizes C opposite G, and ligates the backbone.',
    subSteps: [
      {
        id: 'replication_error',
        label: '1. Replication Error (G–T Mismatch)',
        summary: 'DNA polymerase misincorporates Thymine (T) opposite parental Guanine (G) at position 8, distorting the helix geometry.',
        focusIds: ['gt-mismatch'],
      },
      {
        id: 'mismatch_recognition',
        label: '2. Mismatch Recognition (MutS)',
        summary: 'MutS (MutSα in eukaryotes) scans the duplex, detects the G–T wobble bulge, and clamps onto the distorted base pair.',
        focusIds: ['muts', 'gt-mismatch'],
      },
      {
        id: 'strand_correction',
        label: '3. New Strand Discrimination (MutL / MutH)',
        summary: 'MutL bridges MutS to MutH endonuclease, which distinguishes the methylated/continuous parental strand from the unmethylated/nicked new strand and nicks only the new strand.',
        focusIds: ['mutl', 'muth', 'new-strand-mark'],
      },
      {
        id: 'excision',
        label: '4. Excision (Exonuclease & UvrD)',
        summary: 'Helicase unwinds and Exonuclease digests the newly synthesized segment spanning the nick past the mismatched T, leaving the parental G intact.',
        focusIds: ['exonuclease'],
      },
      {
        id: 'resynthesis',
        label: '5. Resynthesis (DNA Polymerase 5′→3′)',
        summary: 'DNA Polymerase fills the single-stranded gap 5′→3′, inserting the correct Cytosine (C) opposite parental Guanine (G).',
        focusIds: ['mmr-pol'],
      },
      {
        id: 'ligation',
        label: '6. Ligation (DNA Ligase)',
        summary: 'DNA Ligase seals the final nick in the sugar-phosphate backbone, restoring a canonical G≡C pair and preventing permanent mutation.',
        focusIds: ['mmr-ligase'],
      },
    ],
    annotations: [
      {
        id: 'gt-mismatch',
        term: 'G–T Wobble Mismatch',
        role: 'Non-Watson–Crick pairing between parental G and misincorporated T that kinks the sugar-phosphate backbone.',
        category: 'repair',
      },
      {
        id: 'muts',
        term: 'MutS (Recognition Complex)',
        role: 'Binds mismatched base pairs by sensing local helical distortion and recruits MutL.',
        category: 'enzyme',
      },
      {
        id: 'mutl',
        term: 'MutL / MutH (Strand Correction)',
        role: 'Identifies the newly synthesized strand (unmethylated / nascent) and creates a targeted nick so the parental template is never altered.',
        category: 'enzyme',
      },
      {
        id: 'exonuclease',
        term: 'Exonuclease (Excision)',
        role: 'Degrades the excised stretch of the new strand past the mismatch site, removing the erroneous T nucleotide.',
        category: 'enzyme',
      },
      {
        id: 'mmr-pol',
        term: 'DNA Polymerase (Resynthesis)',
        role: 'Synthesizes replacement DNA in the 5′→3′ direction using the undamaged parental strand as template.',
        category: 'enzyme',
      },
      {
        id: 'mmr-ligase',
        term: 'DNA Ligase (Ligation)',
        role: 'Closes the remaining phosphodiester nick to complete error-free Mismatch Repair.',
        category: 'enzyme',
      },
    ],
  },
];
