import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'IT',
  slug: 'la-musica-italiana',
  title: 'La Musica Italiana — La Voce che ha Conquistato il Mondo',
  scenes: [
    {
      narration:
        "C'è un dono che l'Italia ha fatto all'umanità intera — un dono invisibile, ma immortale. " +
        "Non è marmo, non è tela, non è acciaio. " +
        "È la voce. È la musica. " +
        "Da secoli, la musica italiana è la lingua universale dell'anima.",
      imagePrompt:
        'Dramatic cinematic wide shot of an empty baroque Italian opera house interior — ' +
        'gilded balconies, red velvet seats, crystal chandeliers glowing warm amber, ' +
        'stage lit from above with a single golden spotlight, deep shadows in the stalls, ' +
        'ultra-detailed architectural grandeur, 9:16 vertical format',
    },
    {
      narration:
        "Giuseppe Verdi e Giacomo Puccini non erano soltanto compositori — erano architetti dell'emozione. " +
        "La Traviata, Nabucco, La Bohème, Tosca: opere nate in Italia, amate in tutto il mondo. " +
        "Ogni nota scritta da queste mani ha fatto piangere, sperare e sognare generazioni intere.",
      imagePrompt:
        'Cinematic close-up of an open antique music score manuscript illuminated by candlelight, ' +
        'handwritten musical notation in sepia ink, ornate feather quill resting on the page, ' +
        'soft golden candlelight reflecting on aged parchment, baroque atmosphere, ' +
        'shallow depth of field, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Il Teatro alla Scala di Milano. Un nome che ogni musicista del mondo pronuncia con reverenza. " +
        "Dal 1778, questo tempio della musica ha ospitato i più grandi artisti della storia. " +
        "Salire sul palco della Scala non è un'esibizione — è un'ascensione.",
      imagePrompt:
        'Majestic exterior facade of a historic Italian opera house at night, ' +
        'neoclassical columns lit by warm golden spotlights against deep midnight blue sky, ' +
        'elegant city street in foreground with soft bokeh light reflections on wet cobblestones, ' +
        'dignified and timeless atmosphere, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Luciano Pavarotti. Una voce che il mondo non dimenticherà mai. " +
        "Quando cantava Nessun Dorma, i cuori si fermavano. " +
        "Ha portato l'opera lirica agli stadi, alle piazze, alle case di ogni persona sulla Terra. " +
        "Ha dimostrato che la bellezza non ha confini né barriere.",
      imagePrompt:
        'Dramatic cinematic shot of a solo spotlight hitting a vast empty concert stage from above, ' +
        'deep red velvet curtains framing the scene, golden dust particles floating in the beam of light, ' +
        'microphone stand at centre stage, audience silhouettes in the dark background, ' +
        'emotional and theatrical atmosphere, 9:16 vertical format',
    },
    {
      narration:
        "Ennio Morricone ha dato un suono all'immaginazione del mondo intero. " +
        "Le sue colonne sonore hanno accompagnato i film più amati della storia del cinema. " +
        "Il trillo del fischietto, il coyote del West, la trombetta solitaria — " +
        "sono musiche italiane, entrate nell'immaginario collettivo di ogni continente.",
      imagePrompt:
        'Atmospheric cinematic shot of a lone silhouetted figure standing on a vast Tuscan hillside at sunset, ' +
        'rolling golden hills stretching to the horizon, dramatic warm sunset sky in fiery orange and crimson, ' +
        'cinematic wide angle, lone cypress trees in the distance, ' +
        'evocative and melancholic mood, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Oggi, Andrea Bocelli porta avanti questa eredità immortale. " +
        "La sua voce attraversa i confini, le lingue, le culture. " +
        "Perché la musica italiana non è soltanto un genere — è un modo di sentire il mondo. " +
        "Se ami l'Italia, sai già: la sua musica vive in te. Per sempre.",
      imagePrompt:
        'Breathtaking aerial shot of an outdoor amphitheatre perched on an Italian hillside at dusk, ' +
        'thousands of tiny candle lights held by the audience glowing warm gold against the deep blue twilight, ' +
        'ancient stone stage illuminated, cypress trees silhouetted against the glowing horizon, ' +
        'magical and deeply emotional atmosphere, 9:16 vertical format',
    },
  ],
  cta: {
    line1: 'SE AMI L\'ITALIA',
    line2: 'Segui Vivere in Italia',
  },
};

generateDocumentary(DOCUMENTARY)
  .then(out => console.log('\n✅ Done:', out))
  .catch(err => { console.error('\n✗ Failed:', err.message); process.exit(1); });
