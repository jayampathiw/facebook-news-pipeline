import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

const DOCUMENTARY = {
  country: 'FR',
  slug: 'le-cinema-francais',
  title: 'Le Cinéma Français — La France a Inventé le Rêve',
  scenes: [
    {
      narration:
        "Le 28 décembre 1895, dans le sous-sol du Grand Café à Paris, " +
        "deux frères ont changé l'histoire de l'humanité pour toujours. " +
        "Louis et Auguste Lumière ont projeté les premières images animées du monde. " +
        "Ce soir-là, la France n'a pas seulement inventé le cinéma — " +
        "elle a inventé le rêve collectif de toute l'humanité.",
      imagePrompt:
        'Atmospheric cinematic recreation of an early 1895 Parisian cinema projection room — ' +
        'warm flickering gaslight, silhouettes of amazed first audience members in period clothing, ' +
        'beam of light cutting through dust from an antique projector, ' +
        'dramatic chiaroscuro lighting, sepia-toned cinematic atmosphere, 9:16 vertical format',
    },
    {
      narration:
        "La Nouvelle Vague. Dans les années 60, de jeunes cinéastes français ont cassé toutes les règles. " +
        "Jean-Luc Godard, François Truffaut, Agnès Varda — " +
        "ils ont sorti la caméra dans les rues de Paris et ont tout réinventé. " +
        "Le cinéma moderne du monde entier est né de cette révolution française.",
      imagePrompt:
        'Moody black and white cinematic shot of Parisian streets in the style of 1960s French New Wave — ' +
        'rain-wet cobblestones reflecting neon signs, a lone figure walking along the Seine quais at night, ' +
        'Notre-Dame silhouette in the misty background, handheld camera aesthetic, ' +
        'deep contrast noir atmosphere, 9:16 vertical format',
    },
    {
      narration:
        "Cannes. Chaque mois de mai, la Croisette devient le centre du monde du cinéma. " +
        "La Palme d'Or — la plus prestigieuse récompense du septième art. " +
        "Des centaines de films, des milliers d'artistes, des millions de regards. " +
        "Cannes n'est pas un festival — c'est la cathédrale du cinéma mondial.",
      imagePrompt:
        'Glamorous cinematic wide shot of the Cannes film festival red carpet on La Croisette — ' +
        'grand Palais des Festivals illuminated at twilight, elegant crowd on red carpet, ' +
        'photographers\' flashes creating a sea of light, Mediterranean sea glittering in the background, ' +
        'golden hour warm light, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Alain Delon. Catherine Deneuve. Gérard Depardieu. Juliette Binoche. Marion Cotillard. " +
        "Des visages devenus des icônes planétaires. " +
        "Ces acteurs français ont traversé les frontières, les langues, les cultures. " +
        "Ils ont porté l'âme de la France sur tous les écrans du monde.",
      imagePrompt:
        'Dramatic cinematic portrait-style shot of an empty old Parisian movie theatre interior — ' +
        'ornate art deco ceiling, rows of red velvet seats, single silver screen glowing softly in the dark, ' +
        'warm golden light from art deco wall sconces, atmosphere of magic and nostalgia, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "Aujourd'hui, le cinéma français continue de rayonner. " +
        "Intouchables a ému 50 millions de spectateurs dans le monde entier. " +
        "Amélie Poulain a fait aimer Paris à ceux qui n'y avaient jamais mis les pieds. " +
        "Car le cinéma français ne raconte pas seulement des histoires — " +
        "il raconte l'humanité.",
      imagePrompt:
        'Magical cinematic night shot of Montmartre and the Sacré-Cœur basilica in Paris, ' +
        'seen from an artistic rooftop viewpoint, streets of Montmartre glowing with warm café lights below, ' +
        'deep blue Parisian night sky with scattered stars, romantic and dreamlike atmosphere, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "La France a donné le cinéma au monde. " +
        "Mais surtout, elle lui a donné quelque chose d'encore plus précieux : " +
        "la conviction que l'art peut changer les cœurs. " +
        "Que chaque histoire mérite d'être racontée. " +
        "Que le rêve, lui, n'a pas de frontières.",
      imagePrompt:
        'Breathtaking cinematic shot of a Parisian rooftop at blue hour — ' +
        'zinc rooftops and iconic Haussmann chimneys stretching to the horizon, ' +
        'warm lights beginning to glow in apartment windows, deep twilight sky, ' +
        'a crescent moon visible, timeless and poetic Parisian atmosphere, ' +
        'ultra-realistic photography, 9:16 vertical format',
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
