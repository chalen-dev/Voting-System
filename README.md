🚀 Local Development Setup (Kubernetes)
This project runs on a local Kubernetes cluster using Minikube. Follow these steps to get the frontend, backend, and database running on your machine.

📋 Prerequisites
Ensure you have the following installed:

Docker Desktop

Minikube

kubectl

🛠️ Step 1: Start the Cluster
Open a terminal with Administrator/Sudo privileges and run:

PowerShell
minikube start
🏗️ Step 2: Build & Load Images
We use custom Docker images for the Frontend and Backend. You must build these locally and load them into the Minikube internal registry.

PowerShell
# Build Frontend
docker build -t voting-frontend:v3 ./frontend
minikube image load voting-frontend:v3

# Build Backend
docker build -t voting-backend:v3 ./backend
minikube image load voting-backend:v3
🚢 Step 3: Deploy to Kubernetes
Apply the configuration files located in the k8s/ directory.

PowerShell
kubectl apply -f k8s/
Verify that all pods are running (it may take a minute for MySQL to initialize):

PowerShell
kubectl get pods
🗄️ Step 4: Database Setup & APP_KEY
Once the pods are in the Running state, you must initialize the database and clear the application cache.

PowerShell
# Run migrations and seed the database
kubectl exec -it deployment/backend-deployment -- php artisan migrate:fresh --seed

# Clear the internal Laravel configuration cache
kubectl exec -it deployment/backend-deployment -- php artisan config:clear
🌐 Step 5: Access the Application
Because Kubernetes services run on an internal network, you must create a tunnel to access the frontend from your browser.

Leave this terminal window open:

PowerShell
minikube service frontend-service
🔑 Test Credentials
Once the site opens in your browser, use the following credentials to log in:

Email: test@example.com

Password: test

⚠️ Troubleshooting
Hard Refresh: If the site looks broken or shows old errors, press Ctrl + F5 (Windows) or Cmd + Shift + R (Mac) to bypass browser caching.

Logs: If you encounter a 500 error, check the backend logs:
kubectl logs deployment/backend-deployment

Port Conflicts: Ensure localhost:8000 or localhost:80 isn't being used by another application (like XAMPP or Apache).
