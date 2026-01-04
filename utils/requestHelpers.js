/**
 * Helpers pour extraire les informations de la requête
 */

/**
 * Extrait l'adresse IP de la requête
 * @param {Object} req - Objet request Express
 * @returns {string} Adresse IP
 */
const getIpAddress = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
};

/**
 * Extrait le User-Agent de la requête
 * @param {Object} req - Objet request Express
 * @returns {string} User-Agent
 */
const getUserAgent = (req) => {
  return req.get('user-agent') || 'unknown';
};

module.exports = {
  getIpAddress,
  getUserAgent
};

