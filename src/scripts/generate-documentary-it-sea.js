import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'IT',
  slug: 'il-mare-italiano',
  title: "Il Mare Italiano — L'Anima Blu dell'Italia",
  scenes: [
    {
      narration:
        "L'Italia è una penisola — una terra abbracciata dal mare da tre lati. " +
        "Per tremila anni, il Mediterraneo è stato la sua casa, la sua strada, la sua identità. " +
        "Non esiste popolo al mondo che abbia amato il mare come gli italiani. " +
        "E nessun mare al mondo è bello come il Mare Nostrum.",
      imagePrompt:
        'Breathtaking aerial drone shot of the Italian Mediterranean coastline at golden hour, ' +
        'turquoise and deep sapphire water meeting dramatic rocky cliffs, ' +
        'small whitewashed villages clinging to the hillside above the sea, ' +
        'warm amber sunset light painting the water, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La Costiera Amalfitana. Patrimonio dell'Umanità dell'UNESCO. " +
        "Strapiombi vertiginosi, limoneti profumati, borghi dai mille colori. " +
        "Positano, Ravello, Amalfi: nomi che evocano bellezza assoluta. " +
        "Qui, ogni curva della strada è un quadro che nessun pittore ha osato dipingere.",
      imagePrompt:
        'Cinematic shot of Positano village on the Amalfi Coast — ' +
        'colorful stacked houses in terracotta, yellow, and pastel pink cascading down the cliffside, ' +
        'crystal-clear turquoise Mediterranean water below, lemon trees in the foreground, ' +
        'bright midday Mediterranean sun, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Le Cinque Terre. Cinque piccoli borghi aggrappati alla roccia ligure, " +
        "come se il tempo si fosse fermato secoli fa. " +
        "Manarola, Vernazza, Riomaggiore: case colorate specchiandosi nel mare, " +
        "vigneti a picco sull'acqua, sentieri che raccontano storie antiche.",
      imagePrompt:
        'Stunning wide shot of Manarola in Cinque Terre at sunset — ' +
        'vibrant multi-colored houses stacked on volcanic rock above the Ligurian sea, ' +
        'warm golden and pink sunset sky reflected in the deep blue water, ' +
        'fishing boats bobbing in the small natural harbour, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La Sicilia. L'isola al centro del Mediterraneo, dove tutti i popoli del mondo si sono incontrati. " +
        "I Greci, i Romani, gli Arabi, i Normanni: ognuno ha lasciato la sua impronta. " +
        "L'Etna che fuma, i templi di Agrigento dorati nel sole, le acque cristalline di Cefalù. " +
        "La Sicilia non è solo un'isola — è un continente d'anima.",
      imagePrompt:
        'Majestic golden hour shot of the Valley of the Temples in Agrigento Sicily, ' +
        'ancient Greek Doric columns glowing amber in the setting sun, ' +
        'wild almond trees with white blossoms in the foreground, ' +
        'vast blue Mediterranean sea visible in the background, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La Sardegna. Un'isola fuori dal tempo, dove la natura è ancora regina. " +
        "Acque che cambiano colore dal verde smeraldo al blu cobalto. " +
        "Spiagge di sabbia bianca, nuraghi millenari, profumo di macchia mediterranea. " +
        "Chi viene in Sardegna dimentica il resto del mondo — e non se ne pente mai.",
      imagePrompt:
        'Breathtaking aerial shot of a pristine Sardinian beach with impossibly clear turquoise water, ' +
        'white powdery sand, dramatic granite rock formations emerging from the sea, ' +
        'deep azure water gradients from emerald near shore to deep blue offshore, ' +
        'no people, pristine nature, ultra-realistic aerial photography, 9:16 vertical format',
    },
    {
      narration:
        "Il mare italiano non è solo acqua. " +
        "È identità, è cultura, è libertà. " +
        "È lo sfondo di ogni canzone d'amore, di ogni storia di pescatori, di ogni tramonto mai dimenticato. " +
        "Se ami l'Italia, ami il suo mare. " +
        "E il suo mare ti amerà per sempre.",
      imagePrompt:
        'Magical cinematic long exposure shot of a Mediterranean sunset from an Italian coastal village, ' +
        'sun dipping below the horizon casting deep crimson and gold across the still water, ' +
        'silhouette of a lone fisherman on ancient stone pier, ' +
        'perfect mirror reflection in the calm sea, timeless and emotional atmosphere, 9:16 vertical format',
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
