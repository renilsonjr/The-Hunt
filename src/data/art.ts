import type { ImageMetadata } from 'astro';
import type { Locale } from '~/i18n/config';

import zalianPortrait from '~/assets/art/zalian-portrait.jpg';
import balianSheet from '~/assets/art/balian-sheet.jpg';
import godsDiptych from '~/assets/art/gods-diptych.jpg';
import godsRift from '~/assets/art/gods-rift.jpg';
import fridanSheet from '~/assets/art/fridan-sheet.jpg';
import uxiesSheet from '~/assets/art/uxies-sheet.jpg';
import zalianAndFridan from '~/assets/art/zalian-and-fridan.jpg';
import redRail from '~/assets/art/red-rail.jpg';
import sphereTouch from '~/assets/art/sphere-touch.jpg';
import spherePedestal from '~/assets/art/sphere-pedestal.jpg';
import waking from '~/assets/art/waking.jpg';
import praying from '~/assets/art/praying.jpg';
import watchersNeon from '~/assets/art/watchers-neon.jpg';
import watchersMist from '~/assets/art/watchers-mist.jpg';
import uxiesDossier from '~/assets/art/uxies-dossier.jpg';
import uxiesTowers from '~/assets/art/uxies-towers.jpg';
import reverseDream from '~/assets/art/reverse-dream.jpg';
import rooftopDawn from '~/assets/art/rooftop-dawn.jpg';
import assembly from '~/assets/art/assembly.jpg';
import twoWorldsSpread from '~/assets/art/two-worlds-spread.jpg';
import loreDiagram from '~/assets/art/lore-diagram.jpg';
import keyArt from '~/assets/art/key-art.jpg';

export interface ArtEntry {
  id: string;
  src: ImageMetadata;
  title: Record<Locale, string>;
  alt: Record<Locale, string>;
}

export const ART = {
  'zalian-portrait': {
    id: 'zalian-portrait', src: zalianPortrait,
    title: { en: 'Zalian', pt: 'Zalian' },
    alt: {
      en: 'Zalian, white-haired and crowned in filaments of gold light, blue eyes lifted, a pale spired city behind her.',
      pt: 'Zalian, de cabelos brancos e coroada por filamentos de luz dourada, olhos azuis erguidos, uma cidade pálida de torres atrás dela.',
    },
  },
  'balian-sheet': {
    id: 'balian-sheet', src: balianSheet,
    title: { en: 'Balian, the Firstborn', pt: 'Balian, o Primogênito' },
    alt: {
      en: 'Character sheet for Balian: dark-haired, violet-eyed, robed in purple and gold thread, energy wings trailing behind him.',
      pt: 'Ficha de personagem de Balian: cabelos escuros, olhos violeta, vestes roxas e douradas, asas de energia atrás dele.',
    },
  },
  'gods-diptych': {
    id: 'gods-diptych', src: godsDiptych,
    title: { en: 'The two who split', pt: 'Os dois que se dividiram' },
    alt: {
      en: 'Zalian in gold light beside Balian in violet, standing together and looking away from one another.',
      pt: 'Zalian em luz dourada ao lado de Balian em violeta, juntos mas olhando em direções opostas.',
    },
  },
  'gods-rift': {
    id: 'gods-rift', src: godsRift,
    title: { en: 'Across the rift', pt: 'Através da fenda' },
    alt: {
      en: 'Zalian and Balian reaching toward one another, fingertips almost meeting across a vertical tear of light.',
      pt: 'Zalian e Balian estendendo as mãos, dedos quase se tocando através de uma fenda vertical de luz.',
    },
  },
  'fridan-sheet': {
    id: 'fridan-sheet', src: fridanSheet,
    title: { en: 'Fridan', pt: 'Fridan' },
    alt: {
      en: 'Character sheet for Fridan: a man in his mid-thirties in a dark field jacket, with a second portrait showing his eyes turned gold after the Sphere.',
      pt: 'Ficha de personagem de Fridan: um homem de trinta e poucos anos com jaqueta escura, e um segundo retrato com os olhos dourados após a Esfera.',
    },
  },
  'uxies-sheet': {
    id: 'uxies-sheet', src: uxiesSheet,
    title: { en: 'Uxies', pt: 'Uxies' },
    alt: {
      en: 'Character sheet for Uxies: a Virden woman with black and silver hair, golden freckles, layered scavenged armour threaded with neon.',
      pt: 'Ficha de personagem de Uxies: uma mulher Virden de cabelos pretos e prateados, sardas douradas, armadura de retalhos com fios de neon.',
    },
  },
  'zalian-and-fridan': {
    id: 'zalian-and-fridan', src: zalianAndFridan,
    title: { en: 'The guide and the key', pt: 'A guia e a chave' },
    alt: {
      en: 'Zalian in radiant gold standing beside Fridan, whose face is cracked with faint golden light.',
      pt: 'Zalian em dourado radiante ao lado de Fridan, cujo rosto tem rachaduras de luz dourada.',
    },
  },
  'red-rail': {
    id: 'red-rail', src: redRail,
    title: { en: 'The rail turned red', pt: 'O trilho ficou vermelho' },
    alt: {
      en: 'Fridan standing before a vast night city while a transit rail glows red through the interchanges, marking a path.',
      pt: 'Fridan diante de uma vasta cidade noturna enquanto um trilho brilha em vermelho entre os viadutos, marcando um caminho.',
    },
  },
  'sphere-touch': {
    id: 'sphere-touch', src: sphereTouch,
    title: { en: 'The moment of contact', pt: 'O momento do contato' },
    alt: {
      en: 'Fridan reaching into a detonation of blue and gold light, his eyes gone white, shards of crystal suspended around him.',
      pt: 'Fridan tocando uma detonação de luz azul e dourada, os olhos brancos, cacos de cristal suspensos ao redor.',
    },
  },
  'sphere-pedestal': {
    id: 'sphere-pedestal', src: spherePedestal,
    title: { en: 'The Sphere', pt: 'A Esfera' },
    alt: {
      en: 'A small blue felted sphere marked with two dots and one dot, resting on a stone pedestal ringed with gold light as Fridan reaches for it.',
      pt: 'Uma pequena esfera azul de feltro marcada com dois pontos e um ponto, sobre um pedestal de pedra cercado de luz dourada enquanto Fridan a alcança.',
    },
  },
  'waking': {
    id: 'waking', src: waking,
    title: { en: 'The morning after', pt: 'A manhã seguinte' },
    alt: {
      en: 'Fridan half upright in bed at dawn, eyes gold and afraid, a city skyline pale in the window behind him.',
      pt: 'Fridan semi-erguido na cama ao amanhecer, olhos dourados e assustados, o horizonte da cidade pálido na janela.',
    },
  },
  'praying': {
    id: 'praying', src: praying,
    title: { en: 'Into the silence', pt: 'Para o silêncio' },
    alt: {
      en: 'Fridan on one knee in a dim hall, one hand raised and open, faint light coiling around him and no answer coming.',
      pt: 'Fridan de joelhos num salão escuro, uma das mãos erguida e aberta, luz tênue ao redor e nenhuma resposta.',
    },
  },
  'watchers-neon': {
    id: 'watchers-neon', src: watchersNeon,
    title: { en: 'The Second Faction', pt: 'A Segunda Facção' },
    alt: {
      en: 'Fridan encircled by robed figures whose heads are glowing blue wireframe, hands outstretched toward him in a neon alley.',
      pt: 'Fridan cercado por figuras encapuzadas de cabeças em wireframe azul, mãos estendidas em direção a ele num beco de neon.',
    },
  },
  'watchers-mist': {
    id: 'watchers-mist', src: watchersMist,
    title: { en: 'The watchers', pt: 'Os observadores' },
    alt: {
      en: 'Fridan standing still while translucent figures crowd around him in fog, their faces lit from within.',
      pt: 'Fridan imóvel enquanto figuras translúcidas o cercam na névoa, os rostos iluminados por dentro.',
    },
  },
  'uxies-dossier': {
    id: 'uxies-dossier', src: uxiesDossier,
    title: { en: 'The record of Uxies', pt: 'O registro de Uxies' },
    alt: {
      en: 'Fridan reaching into a blue holographic dossier displaying Uxies, tagged Virden hybrid and Zalian DNA fragment.',
      pt: 'Fridan tocando um dossiê holográfico azul exibindo Uxies, marcado como híbrida Virden e fragmento de DNA de Zalian.',
    },
  },
  'uxies-towers': {
    id: 'uxies-towers', src: uxiesTowers,
    title: { en: 'Above the storm', pt: 'Acima da tempestade' },
    alt: {
      en: 'Uxies seated on a ledge above the neon towers of Earth 2 at dawn, one hand at her chest, looking up.',
      pt: 'Uxies sentada numa saliência acima das torres de neon da Terra 2 ao amanhecer, uma das mãos no peito, olhando para cima.',
    },
  },
  'reverse-dream': {
    id: 'reverse-dream', src: reverseDream,
    title: { en: 'The reverse dream', pt: 'O sonho invertido' },
    alt: {
      en: 'Fridan cradling a sleeping Uxies as golden light ignites at her chest, a ruined skyline behind them.',
      pt: 'Fridan amparando Uxies adormecida enquanto uma luz dourada se acende no peito dela, com um horizonte em ruínas ao fundo.',
    },
  },
  'rooftop-dawn': {
    id: 'rooftop-dawn', src: rooftopDawn,
    title: { en: 'Nor Yesey at dawn', pt: 'Nor Yesey ao amanhecer' },
    alt: {
      en: 'Fridan on a rooftop above a misted city at sunrise, a small spiral galaxy turning above each open hand.',
      pt: 'Fridan num telhado acima de uma cidade enevoada ao nascer do sol, uma pequena galáxia espiral girando sobre cada mão aberta.',
    },
  },
  'assembly': {
    id: 'assembly', src: assembly,
    title: { en: 'The assembly', pt: 'A assembleia' },
    alt: {
      en: 'Fridan standing on a dais among robed figures who look past him toward a radiant female form suspended above the spires.',
      pt: 'Fridan sobre um estrado entre figuras encapuzadas que olham além dele para uma forma feminina radiante suspensa acima das torres.',
    },
  },
  'two-worlds-spread': {
    id: 'two-worlds-spread', src: twoWorldsSpread,
    title: { en: 'Earth 1 and Earth 2', pt: 'Terra 1 e Terra 2' },
    alt: {
      en: 'An illuminated book spread: Earth 1 in gold spires on the left, Earth 2 in violet thorned towers on the right, split by lightning.',
      pt: 'Uma página dupla iluminada: a Terra 1 em torres douradas à esquerda, a Terra 2 em torres violeta e espinhosas à direita, separadas por relâmpagos.',
    },
  },
  'lore-diagram': {
    id: 'lore-diagram', src: loreDiagram,
    title: { en: 'Schematic of the Abstract Universe', pt: 'Esquema do Universo Abstrato' },
    alt: {
      en: 'A gold-on-navy schematic plate mapping Zalian and Balian to their galaxies, the Atmospheric Barrier between them, and the two hybrids below.',
      pt: 'Uma prancha esquemática dourada sobre azul-marinho ligando Zalian e Balian às suas galáxias, a Barreira Atmosférica entre elas e os dois híbridos abaixo.',
    },
  },
  'key-art': {
    id: 'key-art', src: keyArt,
    title: { en: 'The Hunt — key art', pt: 'The Hunt — arte principal' },
    alt: {
      en: 'Cover art: two planets flanking a small blue sphere marked with three dots, beneath the title The Hunt in gold.',
      pt: 'Arte de capa: dois planetas ladeando uma pequena esfera azul marcada com três pontos, sob o título The Hunt em dourado.',
    },
  },
} as const satisfies Record<string, ArtEntry>;

export type ArtId = keyof typeof ART;
export const ART_IDS = Object.keys(ART) as ArtId[];

/**
 * The intrinsic pixel width every plate was drawn at (1152x1728). Anything that
 * needs the full-size derivative — the lightbox — asks for exactly this width so
 * it reuses the srcset entry Plate.astro already emits instead of adding a file.
 */
export const PLATE_INTRINSIC_WIDTH = 1152;

/**
 * Encoder quality for every derivative of every plate.
 *
 * Astro 5.18's Picture.astro spreads a single props object — quality included —
 * into the getImage() call for each entry in `formats` and into the JPEG
 * fallback call, so one number governs AVIF, WebP and JPEG alike. There is no
 * per-format quality prop to reach for.
 *
 * 50 is sharp's own AVIF default, which is where AVIF wants to sit; the previous
 * value of 70 was picked for the JPEG fallback alone and inflated every AVIF and
 * WebP derivative with it (the 800w hero AVIF was 206KB, over half the landing
 * page's 400KB above-the-fold budget). Lowering it shrinks the JPEG fallback too,
 * which only moves it further under the cap tests/build/images.test.ts enforces.
 */
export const PLATE_QUALITY = 50;
