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

# Install dependencies.
#  --no-dev      : skip dev-only packages (pint, phpunit, etc.) not needed to run —
#                  this also avoids the flaky laravel/pint download that was failing.
#  PARALLEL_HTTP : 1 download at a time, dodging the HTTP/2 "stream CANCEL" errors
#                  that happen when many parallel downloads run over a shaky network.
ENV COMPOSER_MAX_PARALLEL_HTTP=1
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist
RUN composer dump-autoload --no-dev --optimize

# Expose uploaded files publicly via the public/storage -> storage/app/public symlink.
# The repo ships an empty public/storage DIRECTORY which blocks storage:link from
# creating the symlink, so remove it first, then create the link explicitly.
RUN rm -rf /var/www/public/storage \
    && ln -s /var/www/storage/app/public /var/www/public/storage

# Delete .env and ALL caches so it MUST use Kubernetes Env Vars
RUN rm -rf .env .env.example bootstrap/cache/*.php

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

# Clear config at runtime and start server
CMD php artisan config:clear && php artisan serve --host=0.0.0.0 --port=9000
