import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'FR',
  slug: 'la-gastronomie-francaise',
  title: 'La Gastronomie Française — Le Génie qui Nourrit le Monde',
  scenes: [
    {
      narration:
        "En 2010, l'UNESCO a fait quelque chose d'extraordinaire. " +
        "Elle a inscrit au patrimoine mondial de l'humanité non pas un monument, non pas un paysage — " +
        "mais un repas. Le repas gastronomique des Français. " +
        "Car en France, manger n'est pas un besoin. C'est un art.",
      imagePrompt:
        'Elegant cinematic wide shot of a classic French fine dining table setting — ' +
        'white linen tablecloth, crystal wine glasses catching candlelight, silver cutlery, ' +
        'single red rose in a slim vase, warm golden ambient lighting in a Parisian brasserie interior, ' +
        'bokeh background of other diners, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La baguette. Un simple bâton de farine, d'eau, de levure et de sel. " +
        "Et pourtant — reconnue patrimoine mondial de l'UNESCO en 2022. " +
        "Chaque matin, onze millions de baguettes sortent des fours français. " +
        "Et la France compte plus de 330 fromages différents — un pour chaque jour de l'année et plus encore. " +
        "Charles de Gaulle disait : comment gouverner un pays qui a 246 variétés de fromage ?",
      imagePrompt:
        'Warm cinematic still life of French artisan bread and cheese — ' +
        'golden baguettes with cracked crusts, a rustic wooden board with wedges of aged camembert, ' +
        'comté and roquefort, fresh figs and walnuts scattered around, ' +
        'soft warm natural window light, shallow depth of field, food photography masterpiece, 9:16 vertical format',
    },
    {
      narration:
        "Auguste Escoffier. Le cuisinier des rois et le roi des cuisiniers. " +
        "C'est lui qui a codifié la cuisine française moderne, inventé les brigades de cuisine " +
        "et fait des restaurants des temples. " +
        "Aujourd'hui, la France compte plus d'étoiles Michelin que tout autre pays au monde. " +
        "Paul Bocuse, Joël Robuchon, Alain Ducasse — des noms que le monde entier vénère.",
      imagePrompt:
        'Dramatic close-up of a Michelin-starred French dish being plated — ' +
        'chef\'s hands in white gloves adding a final artistic touch to a refined plate, ' +
        'glossy sauce artfully swirled, microgreens and edible flowers as garnish, ' +
        'polished marble kitchen counter, cinematic depth of field, ultra-realistic food photography, 9:16 vertical format',
    },
    {
      narration:
        "Le vin français. Bordeaux, Bourgogne, Champagne — des noms qui résonnent comme de la musique. " +
        "La France est la patrie du vin, le pays où la vigne a été élevée au rang de civilisation. " +
        "Un grand Bordeaux ne se boit pas — il se contemple, il se respire, il se médite. " +
        "Chaque bouteille raconte l'histoire d'une terre, d'un ciel, d'une main qui a travaillé avec amour.",
      imagePrompt:
        'Golden hour cinematic shot of a French vineyard in Bordeaux at harvest time — ' +
        'rows of heavy grapevines stretching to the horizon, leaves turning golden and crimson, ' +
        'a classic French château in the background surrounded by vines, ' +
        'warm amber harvest light, rich earthy colors, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La pâtisserie française. Un monde de précision, de beauté et de plaisir. " +
        "Le croissant doré du matin, le macaron coloré de Ladurée, la tarte Tatin caramélisée, " +
        "la crème brûlée dont le caramel craque sous la cuillère. " +
        "Chaque gâteau français est une œuvre d'art que l'on a le bonheur de dévorer.",
      imagePrompt:
        'Exquisite cinematic display of French pastries in a Parisian patisserie window — ' +
        'rows of perfect macarons in pastel colors, golden croissants, chocolate éclairs, ' +
        'mille-feuilles and fruit tarts under warm display lighting, ' +
        'elegant shop interior visible in background, ultra-realistic food photography, 9:16 vertical format',
    },
    {
      narration:
        "La gastronomie française n'est pas un luxe réservé aux grands restaurants. " +
        "C'est une philosophie de vie que chaque Français porte en lui. " +
        "S'asseoir à table, prendre le temps, partager — " +
        "c'est ce que la France a appris au monde entier. " +
        "Et le monde ne l'a jamais oublié.",
      imagePrompt:
        'Warm cinematic shot of a classic French family lunch scene on a sunlit Provençal terrace — ' +
        'stone farmhouse, lavender fields visible in the distance, rustic wooden table with ' +
        'wine bottles, bread, salads and laughter implied by the lived-in setting, ' +
        'golden afternoon light filtering through vine-covered pergola, ultra-realistic photography, 9:16 vertical format',
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
