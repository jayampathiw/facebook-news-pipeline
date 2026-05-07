import 'dotenv/config';
import { generateCaption, generateImagePrompt, formatImagePrompt } from '../services/claude.js';

const testArticle = {
  title: "TotalEnergies menace de supprimer le plafond carburant à 1,99€",
  source: "Le Monde",
  summary: "Le PDG de TotalEnergies Patrick Pouyanné a averti le gouvernement que la compagnie ne pourrait maintenir son plafond de prix à la pompe si une taxe sur les superprofits était adoptée.",
};

console.log('Testing Claude caption generation...\n');

const caption = await generateCaption(testArticle, 'français', "France Aujourd'hui");
console.log('Caption:', JSON.stringify(caption, null, 2));

console.log('\nTesting image prompt generation...\n');
const imagePrompt = await generateImagePrompt(testArticle);
console.log('Image prompt:', imagePrompt);

console.log('\nTesting formatImagePrompt...\n');
const formatted = formatImagePrompt(imagePrompt, testArticle.title, 'FranceAujourdhui_Logo_v2.png');
console.log(formatted);
