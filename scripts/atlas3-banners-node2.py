#!/usr/bin/env python3
# Divine Atlas v3 hero banners — Qwen-Image-2.1 batch driver for node2 ComfyUI.
# Runs ON node2 (127.0.0.1:8188). Manifest: /home/mazen/atlas-v3-banners/manifest.json
# [{file, prompt, w?, h?}] -> renders 1792x768 (21:9, same pixel budget as the
# 1024x1432 cards so the 3090 never OOMs; browsers scale it into the 2016x864
# slot contract) or per-item w/h (og-image uses 1216x640 = 1.9:1).
# cfg 1.0, empty negative (distilled model). Resume-safe. One flushed log line per item.
import json, os, time, urllib.request

COMFY = "http://127.0.0.1:8188"
MAN = "/home/mazen/atlas-v3-banners/manifest.json"
OUT = "/home/mazen/atlas-v3-banners/out"
LOG = "/home/mazen/atlas-v3-banners/batch.log"

def graph(prompt, seed, prefix, w, h):
    return {"1": {"class_type": "UNETLoader", "inputs": {"unet_name": "qwen_image_2.1_int8_convrot.safetensors", "weight_dtype": "default"}},
            "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3vl_8b_int8_convrot.safetensors", "type": "qwen_image"}},
            "3": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_2.1_vae_bf16.safetensors"}},
            "4": {"class_type": "TextEncodeQwenImage21", "inputs": {"clip": ["2", 0], "prompt": prompt, "negative_prompt": "", "resolution": 1024}},
            "5": {"class_type": "QwenImage21Cache", "inputs": {"model": ["1", 0], "device": "auto", "dtype": "default"}},
            "6": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
            "7": {"class_type": "KSampler", "inputs": {"model": ["5", 0], "seed": seed, "steps": 25, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "positive": ["4", 0], "negative": ["4", 1], "latent_image": ["6", 0], "denoise": 1.0}},
            "8": {"class_type": "VAEDecode", "inputs": {"samples": ["7", 0], "vae": ["3", 0]}},
            "9": {"class_type": "SaveImage", "inputs": {"images": ["8", 0], "filename_prefix": prefix}}}

def post(path, payload):
    req = urllib.request.Request(COMFY + path, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())

def get(path):
    return json.loads(urllib.request.urlopen(COMFY + path, timeout=30).read())

def log(msg):
    with open(LOG, "a") as f:
        f.write(msg + "\n")

def main():
    items = json.load(open(MAN))
    os.makedirs(OUT, exist_ok=True)
    ok = skip = fail = 0
    for it in items:
        dest = os.path.join(OUT, it["file"])
        if os.path.exists(dest) and os.path.getsize(dest) > 100000:
            skip += 1
            continue
        w = it.get("w", 1792); h = it.get("h", 768)
        prefix = "atlas3b/" + it["file"].replace("/", "_").rsplit(".", 1)[0]
        seed = it.get("seed", 20261018)
        try:
            r = post("/prompt", {"prompt": graph(it["prompt"], seed, prefix, w, h)})
            pid = r["prompt_id"]
            while True:
                time.sleep(6)
                hst = get("/history/" + pid)
                if pid in hst:
                    st = hst[pid].get("status", {})
                    if st.get("status_str") == "error":
                        raise RuntimeError("execution error: " + json.dumps(st.get("messages", []))[:300])
                    if st.get("completed"):
                        rec = hst[pid]["outputs"]
                        node = next(k for k, v in rec.items() if "images" in v)
                        img = rec[node]["images"][0]
                        urllib.request.urlretrieve(f"{COMFY}/view?filename={img['filename']}&subfolder={img.get('subfolder','')}&type=output", dest)
                        break
            ok += 1
            log(f"OK {it['file']}")
        except Exception as e:
            fail += 1
            log(f"FAIL {it['file']}: {e}")
    log(f"SUMMARY ok={ok} skip={skip} fail={fail} total={len(items)}")

main()
