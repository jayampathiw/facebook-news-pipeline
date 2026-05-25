import 'dotenv/config';
import { generateDocumentary } from '../renderers/documentary.js';

// ── Italy documentary script ──────────────────────────────────────────────────

const DOCUMENTARY_IT = {
  country: 'IT',
  title: "L'Italia che ha conquistato il mondo",
  scenes: [
    {
      narration:
        "Pochi paesi al mondo hanno lasciato un segno così profondo nell'umanità. " +
        "C'è un paese che — con la sua arte, la sua cultura, il suo genio — ha cambiato il corso della storia. " +
        "Un paese piccolo per territorio, ma immenso per eredità. " +
        "Questo paese si chiama Italia.",
      imagePrompt:
        'Aerial cinematic shot of Rome at golden hour, Colosseum and Roman Forum from above, ' +
        'warm amber light bathing ancient stone, sweeping wide angle, dramatic sky with soft clouds, ' +
        'ultra-realistic photography style, 9:16 vertical format',
    },
    {
      narration:
        "Quando il mondo viveva nell'oscurità del Medioevo, l'Italia ha acceso la luce del Rinascimento. " +
        "Leonardo da Vinci ha immaginato il futuro con secoli di anticipo. " +
        "Michelangelo ha trasformato il marmo freddo in emozione pura. " +
        "E Galileo Galilei ha mostrato all'umanità il suo posto nell'universo.",
      imagePrompt:
        'Sistine Chapel ceiling — Creation of Adam detail illuminated by divine golden light, ' +
        'dramatic chiaroscuro Renaissance lighting, rich amber and gold tones, ' +
        'Michelangelo brushstroke texture visible, ultra-detailed cinematic composition, 9:16 vertical format',
    },
    {
      narration:
        "L'eleganza italiana non è uno stile — è una filosofia di vita. " +
        "Giorgio Armani, Gianni Versace, Guccio Gucci: nomi che il mondo intero pronuncia con rispetto. " +
        "Ma in Italia non si disegna solo l'abito — si disegna anche il sogno. " +
        "E quel sogno ha un motore V12 e una cavallina rampante. Si chiama Ferrari.",
      imagePrompt:
        'Red Ferrari speeding on a winding mountain road in Tuscany at golden sunset, motion blur, ' +
        'luxury fashion elements — tailored suit jacket, iconic handbag — cinematic aesthetic, ' +
        'dramatic warm colors, ultra-realistic photography, 9:16 vertical format',
    },
    {
      narration:
        "L'Italia ha conquistato il mondo anche attraverso la tavola. " +
        "La pizza napoletana, nata tra i vicoli di Napoli, oggi sfama ogni angolo del pianeta. " +
        "La pasta, l'espresso, il gelato: inventati qui, amati ovunque. " +
        "Ogni giorno, miliardi di persone iniziano la giornata con un caffè italiano. " +
        "Questa è conquista silenziosa.",
      imagePrompt:
        'Cinematic food photography — Neapolitan pizza with char marks and fresh basil emerging from ' +
        'wood-fired oven, golden rustic light, espresso in white ceramic cup on marble counter, ' +
        'gelato in sun-drenched Italian piazza, warm orange tones, shallow depth of field, 9:16 vertical format',
    },
    {
      narration:
        "In campo come in pista, gli italiani sanno come vincere. " +
        "Gli Azzurri — quattro volte campioni del mondo — hanno fatto piangere di gioia una nazione intera. " +
        "La Scuderia Ferrari: il team più titolato della storia della Formula 1. " +
        "E Valentino Rossi — il Dottore — il campione che tutto il mondo ha amato.",
      imagePrompt:
        'Italian football stadium packed with fans in blue Azzurri jerseys celebrating World Cup victory, ' +
        'Italian tricolor confetti raining down, red Scuderia Ferrari F1 car racing on track, ' +
        'dynamic dramatic sports photography, cinematic lighting, ultra-detailed, 9:16 vertical format',
    },
    {
      narration:
        "Nessun paese come l'Italia ha saputo toccare così profondamente il cuore del mondo. " +
        "Attraverso l'arte, il cibo, la moda, la scienza e lo sport — con eleganza e passione — " +
        "l'Italia ha scritto pagine indimenticabili nella storia dell'umanità. " +
        "Non è solo un paese. È una civiltà.",
      imagePrompt:
        'Rolling Tuscan hills at sunset — cypress tree avenue leading to hilltop villa, ' +
        'warm golden light, Italian tricolor flag flowing in wind against deep blue sky, ' +
        'sweeping aerial panoramic view, deeply emotional cinematic color grading, ' +
        'ultra-realistic photography, 9:16 vertical format',
    },
  ],
  cta: {
    line1: "SE AMI L’ITALIA",  // U+2019 typographic apostrophe — safe in FFmpeg text parser
    line2: 'Segui Vivere in Italia',
  },
};

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('[generate-documentary] Italy — "L\'Italia che ha conquistato il mondo"');
console.log(`[generate-documentary] ${DOCUMENTARY_IT.scenes.length} scenes`);
console.log('[generate-documentary] IMAGE_PROVIDER:', process.env.IMAGE_PROVIDER || 'cloudflare');
console.log('');

const result = await generateDocumentary(DOCUMENTARY_IT);

console.log('');
console.log('✓ Documentary ready');
console.log(`  Path:     ${result.outputPath}`);
console.log(`  Duration: ${result.durationSeconds}s (~${Math.round(result.durationSeconds / 60)}min)`);
