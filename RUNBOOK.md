# Voting System — Run, Stress Test & Chaos Engineering Runbook

End-to-end instructions for running the containerized voting platform on Minikube,
then exercising the autoscaling (stress test) and self-healing (chaos) behavior.

> **Environment:** Windows + PowerShell. Commands assume Docker Desktop is running.

---

## ⚠️ Known gotcha: admin auth base URL

Admin login/register/logout in `frontend/src/contexts/AuthContext.tsx` calls
`VITE_API_URL || 'http://localhost:8000/api'`, and the frontend Dockerfile never
sets `VITE_API_URL`. So the built image points admin auth at `localhost:8000`,
which does not exist inside the cluster.

- The **public voting flow** works fine (it uses the `/api` axios instance in
  `frontend/src/api/axios.ts`, which goes through the nginx proxy).
- **Admin auth** will not work in-cluster until you build the frontend with
  `VITE_API_URL=/api` — see **Step 3**.

---

## 0. Prerequisites

You need: Docker Desktop running, `minikube`, `kubectl`, and a load tool (`hey`).

```powershell
docker version ; minikube version ; kubectl version --client
```

Install `hey` if needed. It is **not** on the Chocolatey community repo
(`choco install hey` fails); use one of these instead:

```powershell
# Option A — download the official prebuilt binary (no toolchain needed)
Invoke-WebRequest -Uri "https://hey-release.s3.us-east-2.amazonaws.com/hey_windows_amd64" -OutFile "$env:USERPROFILE\hey.exe"
# then call it as:  & "$env:USERPROFILE\hey.exe" ...

# Option B — if you have Go installed
go install github.com/rakyll/hey@latest    # binary: $env:USERPROFILE\go\bin\hey.exe
```

**Option C — no install at all.** A pure-PowerShell load generator (less precise
than `hey`, but enough to trigger the HPA) is provided inline in **Step 7**.

---

## 1. Start the cluster + enable metrics-server

The HPA **cannot read CPU without metrics-server** — this is the #1 reason an HPA
shows `<unknown>` targets.

```powershell
minikube start --cpus=4 --memory=4096
minikube addons enable metrics-server
```

---

## 2. Build the images *inside* Minikube's Docker

The manifests use `imagePullPolicy: Never` with tags `voting-backend:v3` /
`voting-frontend:v3`, so the images must exist in Minikube's own daemon
(not your host's).

```powershell
minikube image build -t voting-backend:v3 ./backend
minikube image build -t voting-frontend:v3 ./frontend
```

---

## 3. Fix the frontend auth base URL (so admin login works in-cluster)

Create `frontend/.env.production` with one line — Vite bakes it in at build time:

```
VITE_API_URL=/api
```

Then rebuild **only the frontend** so auth also routes through the nginx `/api` proxy:

```powershell
minikube image build -t voting-frontend:v3 ./frontend
```

*(Skip this only if you intend to demo the public voting flow exclusively.)*

---

## 4. Deploy — Secret first

The backend and MySQL reference `voting-secrets`, so it must exist before they start.

```powershell
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/
```

Watch everything come up (wait for all pods `Running` / `READY 1/1`):

```powershell
kubectl get pods -w
```

---

## 5. Run database migrations

The backend image does **not** auto-migrate (its `CMD` only runs `config:clear` +
`artisan serve`). Once MySQL is `Running` and a backend pod is `Ready`:

```powershell
kubectl exec deploy/backend-deployment -- php artisan migrate --force
```

---

## 6. Access the app

Minikube on the Docker driver needs a tunnel per service. Open these in separate
terminals (each holds the tunnel open):

```powershell
minikube service frontend-service --url   # the voting UI / admin dashboard
minikube service backend-service  --url   # the raw API (used for stress testing)
```

Use the printed URLs in your browser / load tool.

---

## 7. Stress test → watch the HPA scale (the `/api/heavy` endpoint)

**Terminal A** — watch the autoscaler and pods live:

```powershell
kubectl get hpa backend-hpa -w
# second pane:
kubectl get pods -l app=backend -w
```

**Terminal B** — hammer the endpoint (`$BACKEND` = the backend-service URL from Step 6):

```powershell
$BACKEND = (minikube service backend-service --url)
hey -n 10000 -c 100 "$BACKEND/api/heavy"
# if you downloaded the binary:  & "$env:USERPROFILE\hey.exe" -n 10000 -c 100 "$BACKEND/api/heavy"
```

**No-install alternative (Option C) — pure PowerShell, ~10,000 requests / 100 parallel:**

```powershell
$BACKEND = (minikube service backend-service --url)
$jobs = 1..100 | ForEach-Object {
    Start-Job { param($u) 1..100 | ForEach-Object { Invoke-WebRequest -Uri "$u/api/heavy" -UseBasicParsing | Out-Null } } -ArgumentList $BACKEND
}
$jobs | Wait-Job | Receive-Job; $jobs | Remove-Job
```

**Expected:** each request runs the 10-million-iteration loop in
`backend/app/Http/Controllers/StressController.php`; CPU on the backend pods climbs
past the **50%** target in `k8s/hpa.yaml`; the HPA scales replicas **2 → up to 10**
step-wise. After load stops it scales back down (~5 min cooldown).

---

## 8. Chaos engineering → self-healing demo

While things are running, force-kill a live backend pod and watch Kubernetes
replace it almost instantly:

```powershell
kubectl get pods -l app=backend
kubectl delete pod <one-backend-pod-name> --force --grace-period=0
kubectl get pods -l app=backend -w
```

A replacement pod is scheduled immediately by the ReplicaSet controller — the
"zero transaction loss / sub-second recovery" claim. (This works regardless of
probes, which is why a liveness probe is intentionally omitted on the
single-threaded backend.)

---

## 9. Verify deduplication + the salt

Cast a vote twice from the same client — the second is rejected by the salted-hash
unique index (`backend/app/Http/Controllers/VoteController.php`):

```powershell
# Replace <uuid> and <option_id> with a real poll/option you created in the UI
$body = '{"poll_uuid":"<uuid>","option_id":<option_id>}'
curl.exe -s -X POST "$BACKEND/api/votes" -H "Content-Type: application/json" -d $body   # 201 Created
curl.exe -s -X POST "$BACKEND/api/votes" -H "Content-Type: application/json" -d $body   # 409 already voted
```

Confirm the stored hash is salted (won't equal a bare SHA-256 of the IP):

```powershell
kubectl exec deploy/backend-deployment -- php artisan tinker --execute="echo App\Models\Vote::value('ip_hash');"
```

---

## 10. Teardown

```powershell
kubectl delete -f k8s/
minikube stop          # or: minikube delete  (wipes everything)
```

---

## Quick troubleshooting

| Symptom | Cause / Fix |
|---|---|
| HPA shows `targets: <unknown>` | metrics-server not ready. Re-run Step 1; wait ~60s; check `kubectl top pods`. |
| Backend `CrashLoopBackOff` | DB not migrated, or Secret missing. Check `kubectl logs deploy/backend-deployment`; confirm `kubectl get secret voting-secrets`. |
| `ErrImageNeverPull` / image not found | Image built into host Docker, not Minikube's. Re-run Step 2 (`minikube image build`). |
| Admin login fails but voting works | You skipped Step 3; rebuild frontend with `VITE_API_URL=/api`. |
