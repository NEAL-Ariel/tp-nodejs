/**
 * Controller de gestion des sessions
 */

const { RefreshToken } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /sessions
 * Liste toutes les sessions actives de l'utilisateur
 */
const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const sessions = await RefreshToken.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'userAgent', 'ipAddress', 'createdAt', 'expiresAt']
    });
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          isCurrent: session.id === req.body.currentSessionId // À déterminer côté client
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /sessions/:id
 * Révoque une session spécifique
 */
const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const session = await RefreshToken.findOne({
      where: {
        id,
        userId,
        revokedAt: null
      }
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session introuvable'
      });
    }
    
    // Révoque la session
    session.revokedAt = new Date();
    await session.save();
    
    res.json({
      success: true,
      message: 'Session révoquée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /sessions/others
 * Révoque toutes les autres sessions (sauf la session actuelle)
 */
const revokeOtherSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentSessionId } = req.body;
    
    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de session actuelle requis'
      });
    }
    
    // Révoque toutes les sessions sauf la session actuelle
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: {
          userId,
          id: {
            [Op.ne]: currentSessionId
          },
          revokedAt: null
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Toutes les autres sessions ont été révoquées'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  revokeSession,
  revokeOtherSessions
};

