import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PARENTAL_TOP_STRAND,
  PARENTAL_BOTTOM_STRAND,
  MMR_MISMATCH_INDEX,
  MMR_PHASE_ORDER,
  SCENES,
  getComplementaryBase,
  isComplementaryPair,
  getHydrogenBondCount,
  synthesizeComplement,
  getMMRStateForPhase,
  evaluateErrorVsMutation,
} from './dnaModel';

test('Scene 2 exact parental strands are 11nt and strictly complementary', () => {
  assert.equal(PARENTAL_TOP_STRAND.join(''), 'ATGCCATGACT');
  assert.equal(PARENTAL_BOTTOM_STRAND.join(''), 'TACGGTACTGA');
  assert.equal(PARENTAL_TOP_STRAND.length, 11);
  assert.equal(PARENTAL_BOTTOM_STRAND.length, 11);

  for (let i = 0; i < PARENTAL_TOP_STRAND.length; i++) {
    const top = PARENTAL_TOP_STRAND[i];
    const bottom = PARENTAL_BOTTOM_STRAND[i];
    assert.equal(isComplementaryPair(top, bottom), true, `Mismatch at index ${i}`);
    assert.equal(getComplementaryBase(top), bottom);
  }
});

test('Hydrogen bond counts follow Watson-Crick rules (A-T: 2, G-C: 3, mismatch: 0)', () => {
  assert.equal(getHydrogenBondCount('A', 'T'), 2);
  assert.equal(getHydrogenBondCount('T', 'A'), 2);
  assert.equal(getHydrogenBondCount('A', 'U'), 2);
  assert.equal(getHydrogenBondCount('G', 'C'), 3);
  assert.equal(getHydrogenBondCount('C', 'G'), 3);
  assert.equal(getHydrogenBondCount('G', 'T'), 0);
  assert.equal(getHydrogenBondCount('A', 'C'), 0);
});

test('RNA primer synthesis substitutes U opposite template A', () => {
  const primerAndDna = synthesizeComplement(PARENTAL_BOTTOM_STRAND.slice(0, 5), {
    rnaIndices: [0, 1, 2, 3],
  });
  // PARENTAL_BOTTOM_STRAND[0..4] is T, A, C, G, G -> complement with RNA at 0..3 is A, U, G, C, C
  assert.deepEqual(primerAndDna, ['A', 'U', 'G', 'C', 'C']);
});

test('MMR state machine progresses through all 6 required phases and restores G-C', () => {
  assert.deepEqual(MMR_PHASE_ORDER, [
    'replication_error',
    'mismatch_recognition',
    'strand_correction',
    'excision',
    'resynthesis',
    'ligation',
  ]);

  // Step 0: Replication error has G-T mismatch at MMR_MISMATCH_INDEX (7)
  const step0 = getMMRStateForPhase(0);
  assert.equal(step0.parentalStrand[MMR_MISMATCH_INDEX], 'G');
  assert.equal(step0.daughterStrand[MMR_MISMATCH_INDEX], 'T');
  assert.equal(step0.mutSBound, false);

  // Step 1: Mismatch recognition binds MutS
  const step1 = getMMRStateForPhase(1);
  assert.equal(step1.mutSBound, true);
  assert.equal(step1.mutLRecruited, false);

  // Step 2: New strand discrimination activates MutL/MutH and nicks new strand
  const step2 = getMMRStateForPhase(2);
  assert.equal(step2.mutLRecruited, true);
  assert.equal(step2.mutHActivated, true);
  assert.notEqual(step2.nickIndex, null);

  // Step 3: Excision removes bases around mismatch on daughter strand only
  const step3 = getMMRStateForPhase(3);
  assert.equal(step3.exonucleaseActive, true);
  assert.equal(step3.daughterStrand[MMR_MISMATCH_INDEX], null);
  assert.equal(step3.parentalStrand[MMR_MISMATCH_INDEX], 'G');

  // Step 4: Resynthesis inserts C opposite G, with nick remaining before ligation
  const step4 = getMMRStateForPhase(4);
  assert.equal(step4.polymeraseActive, true);
  assert.equal(step4.daughterStrand[MMR_MISMATCH_INDEX], 'C');
  assert.equal(step4.isLigated, false);
  assert.notEqual(step4.nickIndex, null);

  // Step 5: Ligation seals nick completely
  const step5 = getMMRStateForPhase(5);
  assert.equal(step5.ligaseActive, true);
  assert.equal(step5.isLigated, true);
  assert.equal(step5.nickIndex, null);
  assert.equal(step5.daughterStrand[MMR_MISMATCH_INDEX], 'C');
});

test('Scene 1 error vs permanent mutation logic distinguishes repairable vs heritable outcomes', () => {
  const repaired = evaluateErrorVsMutation(true);
  assert.equal(repaired.isPermanentMutation, false);
  assert.deepEqual(repaired.cycle2MutantDuplex, ['G', 'C']);

  const mutated = evaluateErrorVsMutation(false);
  assert.equal(mutated.isPermanentMutation, true);
  assert.deepEqual(mutated.cycle1DuplexB, ['G', 'T']);
  assert.deepEqual(mutated.cycle2MutantDuplex, ['A', 'T']);
});

test('All 7 curriculum stages exist with non-empty subSteps and annotations', () => {
  assert.equal(SCENES.length, 7);
  for (const scene of SCENES) {
    assert.ok(scene.subSteps.length >= 2, `${scene.id} should have >=2 subSteps`);
    assert.ok(scene.annotations.length >= 2, `${scene.id} should have >=2 annotations`);
  }
});
