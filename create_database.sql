-- Script de création de la base de données pour l'API d'authentification
-- À exécuter dans phpMyAdmin ou via la ligne de commande MySQL

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS auth_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE auth_db;

-- Note : Les tables seront créées automatiquement par Sequelize
-- lors du premier démarrage de l'application (mode développement)

