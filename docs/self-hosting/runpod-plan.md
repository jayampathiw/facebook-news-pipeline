# RunPod Serverless — Self-Hosted Image Generation Plan

**Status:** ⏸ Deferred  
**Created:** 2026-06-18  
**Trigger conditions:** Volume ≥ 2,000 images/month OR fine-tuning on house editorial style needed  
**Prerequisite:** fal.ai integration (Phase 1) must be stable and generating real data first

---

## Why Self-Host

At low volume, fal.ai's managed service is the right choice — zero ops, warm models, immediate access to Recraft V3. But beyond ~2,000 images/month, the cost difference becomes significant:

| Monthly volume | fal.ai Recraft V3 | RunPod Serverless |
|---|---|---|
| 900 images (2 pages) | $36 | $1.80 |
| 2,700 images (6 pages) | $108 | $5.40 |
| 9,000 images (10 pages, 30/day) | $360 | $18 |
| 15,000 images (10 pages, 50/day) | $600 | $30 |

The other reason to self-host is **fine-tuning**. fal.ai can train a LoRA, but the resulting model runs best on your own worker where you control the checkpoint. A fine-tuned model on your best-performing editorial images creates a consistent visual house style that improves CTR and brand recognition.

---

## Architecture

### RunPod Serverless (not persistent pod)

RunPod Serverless scales to zero when idle. Workers spin up on request and scale out on burst. For this use case:
- **No idle cost** — you pay only when images are being generated
- **Cold start ~10–15s** for Flux-family models (model weights loaded into VRAM from network storage)
- **Cold start mitigation** — keep one "warm" worker running during working hours via RunPod's min_workers config ($0.44/hr for a 4090 during active hours = ~$3/day if you keep 1 worker warm 9am–9pm)

### Worker design

The worker is a Docker container that:
1. Receives a JSON payload: `{ prompt, width, height, model, lora_url? }`
2. Runs inference via `diffusers` library (Flux pipeline)
3. Returns base64 PNG in the response JSON

This is identical in interface to the fal.ai REST call — swapping RunPod for fal.ai is a URL and auth header change in `packages/ai/image-gen/index.js`.

### GPU selection

| GPU | VRAM | Cost/hr | Best for |
|---|---|---|---|
| RTX 3090 | 24GB | ~$0.22/hr | Flux Dev (24GB fp16), good quality |
| RTX 4090 | 24GB | ~$0.44/hr | Faster Flux Dev, better for bulk |
| A40 | 48GB | ~$0.40/hr | Multiple models loaded simultaneously |

**Recommendation:** RTX 4090 Serverless for image generation. A40 if you want to load both the base model and a LoRA simultaneously without memory pressure.

---

## Model Options for Self-Hosting

| Model | License | VRAM | Quality | Suitable for commercial? |
|---|---|---|---|---|
| FLUX.1 Schnell | Apache 2.0 | 12GB (fp8) | Good | ✅ Yes |
| FLUX.1 Dev | Non-commercial | 24GB (fp16) | Very good | ⚠️ Needs BFL commercial license |
| HiDream-I1-Fast | Apache 2.0 | 20GB | Excellent | ✅ Yes |
| SDXL + LoRA | CreativeML | 8GB | Good | ✅ Yes |
| Kolors (Kuaishou) | Apache 2.0 | 12GB | Very good | ✅ Yes |

**Recommendation:** Start with FLUX.1 Schnell (Apache 2.0, commercial-safe, 12GB VRAM — leaves room for LoRA). HiDream-I1-Fast is worth testing as a quality alternative.

Recraft V3 is **not open-source** — it is only available via fal.ai's hosted API. Self-hosting means switching to a different model. Run quality comparisons before migrating.

---

## LoRA Fine-Tuning Path

The unique value of self-hosting is the ability to run a fine-tuned model at zero extra cost per inference.

### Training workflow

1. **Curate training images** — export 50–150 of your best-performing article images from Supabase Storage. Filter for: good composition, consistent editorial style, high-engagement posts.

2. **Train via fal.ai's LoRA training API** (before moving to self-hosting):
   - Upload images to fal.ai
   - Trigger `fal-ai/flux-lora-fast-training` with a trigger word (e.g. `EDITORIAL_NEWS`)
   - Training takes ~15–30 minutes, returns a `.safetensors` file URL
   - Cost: check fal.ai pricing at time of training

3. **Download the weights** — save the `.safetensors` file to your RunPod network storage volume.

4. **Update the worker** to load the LoRA at startup using the `PeftModel` or diffusers `load_lora_weights()` method.

5. **Update prompts** — append the trigger word to every image prompt: `EDITORIAL_NEWS, cinematic editorial illustration...`

### What fine-tuning achieves

- Consistent visual style across all pages and countries
- Faster prompt engineering — less need to specify style anchors in every prompt
- Potentially higher CTR from recognisable visual identity
- Better prompt compliance for edge cases (protests, politicians) that needed workarounds

---

## Implementation Steps

### Step 1 — Build and test the worker locally (~4h)

```dockerfile
# Dockerfile
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel

RUN pip install diffusers transformers accelerate sentencepiece safetensors

COPY handler.py .
CMD ["python", "-u", "handler.py"]
```

```python
# handler.py
import runpod
from diffusers import FluxPipeline
import torch, base64
from io import BytesIO

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16
).to("cuda")

def handler(job):
    input = job["input"]
    image = pipe(
        prompt=input["prompt"],
        width=input.get("width", 1080),
        height=input.get("height", 1920),
        num_inference_steps=4,
    ).images[0]
    buf = BytesIO()
    image.save(buf, format="PNG")
    return {"image": base64.b64encode(buf.getvalue()).decode()}

runpod.serverless.start({"handler": handler})
```

### Step 2 — Deploy to RunPod Serverless (~2h)

1. Build and push Docker image to Docker Hub or RunPod's container registry
2. Create a Serverless endpoint in RunPod dashboard
3. Select GPU (RTX 4090 recommended)
4. Set `min_workers: 0` (scale to zero), `max_workers: 5`
5. Note the endpoint URL and API key

### Step 3 — Update image-gen module (~1h)

In `packages/ai/image-gen/index.js`, add RunPod as an option above fal.ai:

```javascript
// Provider priority: runpod (if configured) → fal.ai → cloudflare → google
if (process.env.RUNPOD_ENDPOINT_URL) {
  return await generateViaRunPod(prompt, width, height);
}
return await generateViaFal(prompt, width, height);
```

```javascript
// packages/ai/image-gen/runpod.js
export async function generateViaRunPod(prompt, width, height) {
  const res = await fetch(`${process.env.RUNPOD_ENDPOINT_URL}/runsync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: { prompt, width, height } }),
  });
  const data = await res.json();
  return Buffer.from(data.output.image, 'base64');
}
```

### Step 4 — Update Supabase edge function (~30min)

Same pattern — add `RUNPOD_ENDPOINT_URL` and `RUNPOD_API_KEY` to Supabase secrets. The edge function already handles base64 → upload → URL save.

### Step 5 — Quality validation (~2h)

Generate 20–30 test images on RunPod vs fal.ai Recraft V3. Compare:
- Editorial style match
- Composition quality (upper 40% clear for overlay)
- Prompt compliance (politicians, protest scenes)

If quality gap is acceptable → migrate fully. If not → keep fal.ai for quality-sensitive prompts, use RunPod for high-volume batch.

---

## Environment Variables (when ready)

```bash
RUNPOD_ENDPOINT_URL=   # from RunPod dashboard, e.g. https://api.runpod.ai/v2/<endpoint-id>
RUNPOD_API_KEY=        # RunPod API key
```

Must be added to:
1. Local `.env`
2. Supabase secrets
3. GitHub Actions secrets

---

## Cold Start Mitigation Strategy

RunPod Serverless cold starts (10–15s for Flux) are acceptable for batch generation but poor for interactive dashboard use.

**Strategy:**
- Keep `min_workers: 1` during your active working hours (e.g. 8am–8pm your timezone)
- At $0.44/hr × 12h = $5.28/day — still far below fal.ai costs at volume
- Scale to zero overnight — cold start on first morning request is acceptable

**Alternative:** Use fal.ai for interactive dashboard image generation (single-click, low latency) and RunPod for batch/documentary generation. Route by context:
- Dashboard "Generate Image" button → fal.ai (always warm)
- `generate-documentary.js` batch → RunPod (cost optimised)

---

## Go / No-Go Checklist

Before starting this work, verify all of these:

- [ ] Monthly image volume confirmed ≥ 2,000 images (check Supabase count)
- [ ] fal.ai has been running stably for at least 4 weeks
- [ ] Actual monthly fal.ai spend is confirmed (not just projected)
- [ ] Decision made: fine-tune or use base model only?
- [ ] Quality comparison: RunPod base model vs fal.ai Recraft V3 is acceptable
- [ ] Monorepo (Phase 2) is complete — `packages/ai/image-gen/` exists as shared module

---

## Next Step

When the trigger conditions are met, answer the go/no-go checklist, then this becomes a 🔲 Ready to Start task. Estimated total effort: 8–12 hours including quality validation.
