import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'FR',
  title: 'La France, la plus belle du monde — Des paysages qui coupent le souffle',
  scenes: [
    {
      narration:
        "Il existe 196 pays sur Terre. " +
        "Mais il n'en existe qu'un seul qui réunit, sur un même sol, la montagne et la mer, " +
        "la plaine dorée et la forêt profonde, la garrigue et les alpages fleuris. " +
        "Un pays où chaque région est un monde à part entière. " +
        "Ce pays, c'est la France. Et sa beauté n'est pas un hasard — c'est un don du ciel.",
      imagePrompt:
        'Epic aerial cinematic panorama of France\'s diverse natural beauty — ' +
        'dramatic misty green valleys in one corner, sunlit lavender fields in another, ' +
        'snowy Alpine peaks on the horizon, golden Atlantic coastline below — ' +
        'warm golden hour light unifying the landscape, ultra-realistic aerial photography, 9:16 vertical format',
    },
    {
      narration:
        "La Vallée de la Loire. Classée au Patrimoine Mondial de l'UNESCO. " +
        "Ici, les rois de France ont voulu bâtir leurs rêves en pierre. " +
        "Chambord, Chenonceau, Azay-le-Rideau — plus de 300 châteaux reflétés dans les eaux calmes du fleuve royal. " +
        "Nulle part au monde la grandeur humaine ne s'est accordée aussi parfaitement avec la nature.",
      imagePrompt:
        'Golden hour aerial cinematic shot of Château de Chambord — ' +
        'its ornate double-helix towers and Renaissance turrets glowing warm amber, ' +
        'perfectly reflected in still moat water surrounded by ancient forest in autumn gold and copper, ' +
        'morning mist drifting over the Loire river in the distance, ' +
        'magical fairy-tale atmosphere, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La Provence en juillet. Les champs de lavande s'étendent à perte de vue, " +
        "striés de violet et de mauve sous le soleil du Midi. " +
        "L'air embaume la sauge, le thym, la garrigue. Les cigales chantent. " +
        "Dans les villages perchés, le temps s'arrête. " +
        "C'est ici que Van Gogh a compris que les couleurs étaient une façon de voir le divin.",
      imagePrompt:
        'Breathtaking wide-angle shot of purple lavender fields in full peak bloom in Valensole, Provence — ' +
        'perfectly straight lavender rows stretching to the horizon in deep violet and mauve, ' +
        'a lone ancient stone farmhouse with ochre walls and terracotta roof in the middle ground, ' +
        'deep blue Provençal sky with a few white clouds, warm afternoon summer light, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Le Mont-Saint-Michel. Une abbaye construite sur un rocher au milieu des flots, depuis plus de mille ans. " +
        "À marée haute, il flotte comme un mirage sur la mer argentée. " +
        "À marée basse, il émerge des sables dorés dans une lumière irréelle. " +
        "C'est l'une des merveilles absolues de l'humanité — et elle est française.",
      imagePrompt:
        'Epic cinematic shot of Mont Saint-Michel at golden sunrise — ' +
        'the ancient abbey and its village floating above vast misty tidal flats, ' +
        'perfect reflection shimmering in still water pools on the sand, ' +
        'dramatic warm amber and rose morning sky, lone silhouette figure on the causeway for scale, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Le Mont Blanc. 4 810 mètres — le toit de l'Europe occidentale. " +
        "Ses neiges éternelles dominent les Alpes françaises comme un géant bienveillant. " +
        "En hiver, les vallées brillent sous un ciel étoilé d'une pureté absolue. " +
        "En été, les alpages fleurissent de mille couleurs sous un bleu impossible. " +
        "Ces montagnes n'appartiennent pas qu'à la France — elles appartiennent à l'âme du monde.",
      imagePrompt:
        'Majestic cinematic shot of Mont Blanc massif at alpenglow dawn — ' +
        'snow-covered summit and glaciers glowing pale pink and gold in the first morning light, ' +
        'dramatic glacier flowing down into a deep green valley, ' +
        'crystal-clear alpine air, deep electric blue sky, ' +
        'a charming alpine chalet village visible far below in the valley, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La Côte d'Azur. Une mer bleue comme les rêves, des criques secrètes, des pins parasols penchés sur l'eau turquoise. " +
        "Nice, Antibes, Cassis — des noms qui font voyager le cœur. " +
        "La France n'est pas seulement le plus beau pays du monde. " +
        "C'est un état d'âme. C'est une façon d'être au monde. " +
        "Si vous aimez la France, c'est parce qu'elle vous aime aussi.",
      imagePrompt:
        'Dreamlike cinematic aerial shot of a hidden turquoise cove on the Côte d\'Azur near Cassis — ' +
        'impossibly clear azure Mediterranean water revealing the sandy seafloor, ' +
        'dramatic white limestone cliffs (Calanques) plunging into the sea, ' +
        'umbrella pine trees framing the secret beach, warm midday Mediterranean sun, ' +
        'ultra-realistic aerial photography, 9:16 vertical format',
    },
  ],
  cta: {
    line1: 'SI VOUS AIMEZ LA FRANCE',
    line2: "Suivez France Aujourd'hui",
  },
};

generateDocumentary(DOCUMENTARY)
  .then(out => console.log('\n✅ Done:', out))
  .catch(err => { console.error('\n✗ Failed:', err.message); process.exit(1); });
