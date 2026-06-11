# Defense Demo — The Foolproof Guide

Assumes you know nothing. Follow it top to bottom. Every command is copy-paste —
**no editing required** (except pasting one pod name in Demo 3).

> ✅ Everything in this guide has been tested on your actual cluster and works.

---

## The big picture (what you're showing the panel)

Your voting website does **3 impressive things**. Your whole job is to *show* them live:

1. **It stops people from voting twice.**
2. **It automatically grows when it gets busy** — adds more copies of itself (2 → 10),
   then shrinks back when quiet. ← ⭐ *The star of the show.*
3. **It heals itself** — if part crashes, it instantly rebuilds.

That's it. Three demos.

---

## 🔴 PANIC RESET — if ANYTHING goes wrong, run this

If the demo gets weird — replicas stuck high, pods misbehaving, a leftover load
helper, anything — paste these 3 lines in **Window 3** to put everything back to
normal (2 servers, fresh and clean):

```powershell
kubectl delete pod loadgen --force --grace-period=0 2>$null
kubectl scale deployment backend-deployment --replicas=2
kubectl rollout restart deployment/backend-deployment
```

Wait ~30 seconds, then check it's healthy:
```powershell
kubectl get pods -l app=backend
```
You want to see pods saying `Running`. Once they do, you're back to a clean slate and
can re-run any demo. **This fixes 90% of "it's broken" situations.**

---

## The terminal windows (READ THIS FIRST)

You only need **3 black windows**. In VS Code, click the **`+`** in the terminal area
to open each one (they appear as tabs).

| Window | What it's for | Important |
|--------|--------------|-----------|
| **Window 1 – "Website door"** | opens your voting site | Looks **frozen forever** after you start it. That's CORRECT. Don't close it. |
| **Window 2 – "Scoreboard"** | shows the system scaling live | Keeps printing lines. The panel watches this. |
| **Window 3 – "Your hands"** | where you type commands | Normal terminal. |

> 💡 The "frozen" Window 1 is normal — it's holding your website open. Leave it alone.

---

## SETUP — do this 15 minutes before you present

Type each command in **Window 3**. Wait for each to finish.

**1. Is everything running?**
```powershell
kubectl get pods
```
Lines should say `Running`. (You might see a few extra "Terminating" ones — ignore those.)

**2. Turn on the busy-meter** (needed for Demo 2):
```powershell
minikube addons enable metrics-server
```

**3. Check the autoscaler can see it** — the most important check:
```powershell
kubectl get hpa backend-hpa
```
Look at the `TARGETS` column:
- ✅ Shows a number like `cpu: 5%/50%` → **good to go.**
- ❌ Shows `cpu: <unknown>/50%` → wait 1 minute, run it again. **Don't start Demo 2 until it shows a real number.**

**4. Make sure you start clean at 2 copies:**
```powershell
kubectl scale deployment backend-deployment --replicas=2
```

**5. Pre-load the helper image** (so it's instant during the demo):
```powershell
kubectl run loadgen --image=busybox --restart=Never -- sh -c "echo ready" 
kubectl delete pod loadgen --force --grace-period=0
```
(The first line downloads the tiny helper; the second removes it. Just run both.)

**6. Open your website.** In **Window 1**, type:
```powershell
minikube service frontend-service --url
```
It prints a web address like `http://127.0.0.1:53401`. **Copy it into your browser.**
Leave this window open (it'll look frozen — that's fine).

**7. Open the scoreboard.** In **Window 2**, type:
```powershell
kubectl get hpa backend-hpa -w
```
This keeps printing the system's status. The panel watches this during Demo 2.

**8. Make one poll** in your website so it's ready, and keep its voting link handy.

✅ **Setup done.** You now have: 1 frozen "website" window, 1 scoreboard window, and
Window 3 free for typing.

---

## DEMO 1 — "You can't vote twice"  (~2 min)

**Plain meaning:** each person votes once, and we never store who they are.

**Do this:**
1. In your browser, open the poll's voting link.
2. Pick an option, click vote → **success**.
3. Vote again → **"You have already voted on this poll."**

**Say this:**
> "Each vote is tied to a scrambled, anonymous fingerprint of the voter. The database
> physically refuses a second vote from the same person — so double-voting is
> impossible, and we never see who anyone is."

---

## DEMO 2 — "It grows when busy" ⭐ THE MAIN EVENT  (~4 min)

**Plain meaning:** when a crowd hits the site, it automatically makes more copies of
itself (2 up to 10), then shrinks back when quiet.

### Step 1 — point at the scoreboard (Window 2) and set the scene
> "Right now the system is running the minimum of 2 copies, and the CPU is low — well
> under our 50% limit."

### Step 2 — unleash the crowd. In **Window 3**, paste this ONE line:
```powershell
kubectl run loadgen --image=busybox --restart=Never -- sh -c 'n=0; while [ $n -lt 30 ]; do (while true; do wget -q -O /dev/null http://backend-service:9000/api/heavy; done) & n=$((n+1)); done; sleep 150'
```
That's it — no website address, no extra software. It creates a helper *inside* the
system that floods it with fake traffic for ~2.5 minutes.

### Step 3 — watch the scoreboard (Window 2) and talk
Within ~30–60 seconds, the numbers move. Point at Window 2 and say:
> "As the crowd hits, watch the CPU shoot past our 50% limit — it's now near 200%. So
> the system automatically adds copies: the last number, REPLICAS, is climbing from
> 2… to 4… to 8… up to its maximum of 10. It spreads the crowd across more servers
> instead of letting one collapse."

**What you're looking for:** the **last column (REPLICAS)** going **2 → … → 10**.
**That climbing number IS the demo.** 🎉 *(Tested: it reaches 10.)*

### Step 4 — stop the crowd and clean up. In **Window 3**:
```powershell
kubectl delete pod loadgen --force --grace-period=0
```

### Step 5 — it shrinks back (just mention this)
> "And when the crowd leaves, it automatically shrinks back to 2 copies to save
> resources — efficient, not just powerful."

It takes **~5 minutes** to shrink on its own (you don't wait on stage). If you want it
back to 2 instantly for the next run:
```powershell
kubectl scale deployment backend-deployment --replicas=2
```

---

## DEMO 3 — "It heals itself"  (~2 min)

**Plain meaning:** if a server crashes, the system instantly builds a new one.

**Step 1 — see the current servers.** In **Window 3**:
```powershell
kubectl get pods -l app=backend
```
You'll see names like `backend-deployment-xxxx-abcde`. **Copy one whole name.**

**Step 2 — "crash" it on purpose** while pointing at Window 2. Paste the name you copied:
```powershell
kubectl delete pod PASTE-THE-NAME-HERE
```

**What happens:** that server vanishes and a **brand-new one appears within ~1 second.**

**Say this:**
> "I'm destroying a live server — pretend the hardware just failed mid-election. Watch:
> the system instantly notices and builds a replacement, in about a second. Voting never
> goes down, no votes are lost. It heals itself with nobody touching it."

**Done — that's all 3 demos.**

---

## 🆘 IF SOMETHING LOOKS BROKEN (stay calm)

| What you see | What it means | What to do |
|--------------|--------------|------------|
| Window 1 sits "frozen" | Normal — it's holding your website open | Leave it |
| Scoreboard shows `cpu: <unknown>` | Busy-meter not ready | `minikube addons enable metrics-server`, wait 1 min |
| REPLICAS won't drop back to 2 | Takes ~5 min, or load still running | Wait, or run `kubectl scale deployment backend-deployment --replicas=2` |
| Demo 2 numbers don't move | The loadgen helper didn't start | Re-paste the Step 2 line; check `kubectl get pods` shows `loadgen` Running |
| Website address stopped working | You closed Window 1 | Re-run `minikube service frontend-service --url` (new address!) |
| Everything seems stuck | Fresh-start the servers | `kubectl rollout restart deployment/backend-deployment` |
| A `>>` appears, nothing runs | A line got cut off | Press **Ctrl+C**, paste the whole line again |

> **Golden rule:** if a command misbehaves, press **Ctrl+C** and paste it again, whole.

---

## ❓ If the panel asks tricky questions

- **"Is the database a weak point?"**
  > "Yes, by design for this prototype — it runs on one laptop. We made the *voting
  > servers* redundant and self-healing, and data is saved to permanent storage so it
  > survives restarts. A production version would also duplicate the database."

- **"How do we know it really scaled and didn't just restart?"**
  > "The REPLICAS count on the scoreboard went from 2 up to 10 — that's real new
  > servers being added, not one restarting."

- **"Why scale only the backend, not the website?"**
  > "The website is just static files — lightweight. The heavy work is in the backend,
  > so that's what we made scale."

- **"What's the /api/heavy thing?"**
  > "A deliberate stress endpoint that does heavy computation, so we can simulate a
  > crowd and prove the autoscaling works on demand."

---

## Reset everything (after a rehearsal, or when something's wrong)

This is the same **PANIC RESET** from the top of the guide — keep it handy:

```powershell
kubectl delete pod loadgen --force --grace-period=0 2>$null   # stop/remove the load helper
kubectl scale deployment backend-deployment --replicas=2      # back to 2 servers
kubectl rollout restart deployment/backend-deployment         # fresh, unstuck servers
```

Then confirm it's healthy:
```powershell
kubectl get pods -l app=backend     # wait until they say "Running"
```

---

## 🛑 How to turn everything OFF (when you're done)

There are two ways. **Read this carefully — they are very different.**

### ✅ Normal shutdown (use this 99% of the time)
This **pauses** the cluster but keeps ALL your work — your deployments, your polls,
your data. Next time you just turn it back on and everything is exactly as you left it.

1. In **Window 1** (the website door), press **Ctrl+C**, then close the window.
2. In **Window 2** (scoreboard), press **Ctrl+C**, then close the window.
3. In any terminal, run:
   ```powershell
   minikube stop
   ```
4. (Optional) Quit **Docker Desktop** from the system tray if you want to free up memory.

**To turn it back on later** (e.g., on defense day):
```powershell
minikube start
```
Wait a minute, then `kubectl get pods` until everything says `Running`. Re-open your
website with `minikube service frontend-service --url`. That's it — no rebuilding.

> ⚠️ **DO IT THIS WAY before your defense.** Don't use the nuclear option below the
> night before — you'd have to set everything up from scratch.

### ☢️ Nuclear option (ONLY if you want to wipe everything and start over)
This **deletes the entire cluster** — all deployments, polls, and data are gone, and
you'd have to redo the full setup from `RUNBOOK.md` (rebuild images, deploy, migrate).
Only use this if you intend to rebuild from zero.
```powershell
minikube delete
```

---

## Your 20-second summary (open or close with this)

> "We built a voting platform that does three things automatically: it blocks
> double-voting while keeping voters anonymous, it grows from 2 to 10 servers when a
> crowd arrives and shrinks back when they leave, and it instantly rebuilds itself if a
> server crashes — all running on a single laptop."
