# 🚀 Local Development Setup (Kubernetes)

This project runs on a local Kubernetes cluster using **Minikube**. Follow these steps to get the frontend, backend, and database running on your machine.

---

## 📋 Prerequisites
Ensure you have the following installed:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

---

## 🛠️ Step 1: Start the Cluster
Open a terminal with Administrator privileges and run:

```powershell
minikube start
```

---

## 🏗️ Step 2: Build & Load Images
We use custom Docker images for the Frontend and Backend. You must build these locally and load them into the Minikube internal registry so Kubernetes can find them.

### Build Frontend
```powershell
docker build -t voting-frontend:v3 ./frontend
minikube image load voting-frontend:v3
```

### Build Backend
```powershell
docker build -t voting-backend:v3 ./backend
minikube image load voting-backend:v3
```

---

## 🚢 Step 3: Deploy to Kubernetes
Apply the configuration files located in the `k8s/` directory. This will create your Pods, Services, and Deployments.

```powershell
kubectl apply -f k8s/
```

Verify that all pods are running (it may take a minute for MySQL to fully initialize):
```powershell
kubectl get pods
```

---

## 🗄️ Step 4: Database Setup & Configuration
Once the pods are in the **Running** state, you must initialize the database schema and clear the application cache to ensure the environment variables are loaded.

```powershell
# Run migrations and seed the database with the test user
kubectl exec -it deployment/backend-deployment -- php artisan migrate:fresh --seed

# Clear the internal Laravel configuration cache
kubectl exec -it deployment/backend-deployment -- php artisan config:clear
```

---

## 🌐 Step 5: Access the Application
Because Kubernetes services run on an internal network, you must create a tunnel to bridge the cluster to your browser.

**Leave this terminal window open while using the app:**
```powershell
minikube service frontend-service
```

---

## 🔑 Test Credentials
Once the site opens in your browser via the tunnel, use the following credentials to log in:

* **Email:** `test@example.com`
* **Password:** `test`

---

## ⚠️ Troubleshooting
* **Hard Refresh:** If you see old errors or a white screen, press `Ctrl + F5` to clear the browser cache.
* **Logs:** If you encounter a 500 error, check the backend logs:
  `kubectl logs deployment/backend-deployment`
* **Database Reset:** If you need to wipe the data and start over, re-run the command in **Step 4**.
