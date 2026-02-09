import { createGamesRepo } from '../repos/gamesRepo.js';
import { err } from '../result.js';

export const createCompleteDrawingUsecase = ({ gamesRepo = createGamesRepo() } = {}) => ({
  async execute(input) {
    const { gameId, sketchUrl } = input || {};
    if (!gameId || typeof sketchUrl !== 'string' || !sketchUrl.trim()) {
      return err('VALIDATION_ERROR', 'gameId と sketchUrl は必須です。');
    }

    return gamesRepo.updateDrawingResult({
      gameId,
      sketchUrl: sketchUrl.trim(),
      sketchUploadedAt: Date.now()
    });
  }
});
