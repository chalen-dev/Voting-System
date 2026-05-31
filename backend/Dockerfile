FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libonig-dev \
    libxml2-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy files
COPY . .

# Install dependencies
RUN composer install --no-scripts --no-autoloader
RUN composer dump-autoload

# Delete .env and ALL caches so it MUST use Kubernetes Env Vars
RUN rm -rf .env .env.example bootstrap/cache/*.php

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

# Clear config at runtime and start server
CMD php artisan config:clear && php artisan serve --host=0.0.0.0 --port=9000
