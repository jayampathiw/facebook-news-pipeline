import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'IT',
  title: "La bellezza infinita dell'Italia — Paesaggi che tolgono il respiro",
  scenes: [
    {
      narration:
        "Ci sono luoghi nel mondo in cui la bellezza non è un accidente — è una scelta. " +
        "L'Italia è uno di questi luoghi. " +
        "Dalle vette innevate delle Dolomiti alle dolci colline della Toscana, " +
        "dai laghi di cristallo del Nord alle scogliere assolate del Sud — " +
        "ogni angolo di questo Paese racconta una storia di bellezza senza paragoni. " +
        "L'Italia non si visita. L'Italia si sente.",
      imagePrompt:
        'Breathtaking cinematic aerial collage of Italy\'s most beautiful landscapes — ' +
        'snow-capped Dolomite spires in one corner, rolling amber Tuscan hills in another, ' +
        'crystal-clear Alpine lakes reflecting sky, sun-drenched Mediterranean cliffs below — ' +
        'golden hour light unifying all, ultra-realistic aerial photography, 9:16 vertical format',
    },
    {
      narration:
        "La Val d'Orcia. Un paesaggio toscano che sembra dipinto a mano. " +
        "Cipressi solitari sulle creste delle colline, filari di viti dorati in autunno, " +
        "casolari di pietra silenziosi nell'alba. " +
        "La luce del mattino toscano è unica al mondo — morbida, dorata, quasi irreale. " +
        "Leonardo da Vinci dipingeva questo sfondo nelle sue opere. Aveva capito tutto.",
      imagePrompt:
        'Golden hour cinematic shot of the iconic Val d\'Orcia Tuscany — ' +
        'gently rolling hills bathed in warm amber morning light, ' +
        'a perfect row of dark cypress trees leading to an isolated stone farmhouse on a hilltop, ' +
        'light morning mist lingering in the valleys, ' +
        'patchwork of golden wheat fields and silver-green olive groves, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Le Dolomiti. Riconosciute dall'UNESCO come le più belle montagne del mondo. " +
        "Guglie di roccia rosa che si alzano dritte verso il cielo come cattedrali di pietra. " +
        "All'alba, i picchi si tingono di rosso fuoco in quello che gli alpinisti chiamano l'enrosadira. " +
        "Nessuno che le veda per la prima volta rimane uguale a prima.",
      imagePrompt:
        'Dramatic cinematic shot of the Tre Cime di Lavaredo Dolomites at alpenglow — ' +
        'three iconic sheer rocky spires blazing deep orange and crimson in the dawn light ' +
        'against a deep cobalt blue alpine sky, ' +
        'snow patches catching the fire-colored light, ' +
        'perfect mirror reflection in a still alpine lake in the foreground with wildflowers on the shore, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Il Lago di Como. Da duemila anni, imperatori, poeti e innamorati vengono qui per trovare la pace. " +
        "Ville eleganti specchiate nell'acqua scura, giardini lussureggianti, " +
        "montagne che scendono dolcemente fino alle rive. " +
        "Plinio il Giovane ci viveva. E chi ci viene oggi capisce perché non se ne andava mai.",
      imagePrompt:
        'Cinematic aerial shot of Lake Como at blue hour — ' +
        'mirror-still deep blue water perfectly reflecting the last rose and violet glow of sunset, ' +
        'elegant Belle Époque villas with terracotta roofs and lush gardens lining the curved shoreline, ' +
        'snow-capped Alpine peaks rising dramatically above the far end of the lake, ' +
        'a small wooden boat leaving a gentle wake on the still surface, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "L'Umbria. Il cuore verde d'Italia. " +
        "Assisi arroccata sul Monte Subasio, Orvieto che domina la sua rupe di tufo, " +
        "borghi medievali sospesi tra il cielo e la terra. " +
        "Qui il tempo scorre più lentamente. " +
        "Qui capisci che la bellezza vera non ha bisogno di rumore, né di fama. " +
        "Le basta esistere.",
      imagePrompt:
        'Soft magical dawn light over Assisi hilltop town in Umbria — ' +
        'medieval stone houses and the Basilica of San Francesco glowing warm gold in the first light, ' +
        'rolling green Umbrian hills stretching far below in soft morning mist, ' +
        'ancient gnarled olive trees in the foreground, ' +
        'peaceful and timeless spiritual atmosphere, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "L'Italia è questo. " +
        "Un Paese in cui ogni strada è un capolavoro, ogni paesaggio è una poesia, ogni alba è un inizio. " +
        "Non importa quante volte torni — ogni volta è come se fosse la prima. " +
        "Perché l'Italia non smette mai di sorprendere. " +
        "Non smette mai di emozionare. " +
        "Non smette mai di essere la più bella del mondo.",
      imagePrompt:
        'Magical cinematic Italian countryside sunset — ' +
        'sun sinking behind the silhouette of a medieval hilltop village with an ancient bell tower, ' +
        'deep crimson and burning amber sky fading to violet at the zenith, ' +
        'perfect reflection of the sunset in a still pond below the hill, ' +
        'ancient olive trees and dark cypress silhouettes framing the scene, ' +
        'a lone winding road through the golden landscape, deeply emotional atmosphere, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
  ],
  cta: {
    line1: "SE AMI L'ITALIA",
    line2: 'Segui Vivere in Italia',
  },
};

generateDocumentary(DOCUMENTARY)
  .then(out => console.log('\n✅ Done:', out))
  .catch(err => { console.error('\n✗ Failed:', err.message); process.exit(1); });
