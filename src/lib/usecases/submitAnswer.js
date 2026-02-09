import { createGamesRepo } from '../repos/gamesRepo.js';
import { err } from '../result.js';

export const createSubmitAnswerUsecase = ({ gamesRepo = createGamesRepo() } = {}) => ({
  async execute(input) {
    const { gameId, userId, answer } = input || {};
    if (!gameId || !userId || !answer?.trim()) {
      return err('VALIDATION_ERROR', 'gameId, userId, answer は必須です。');
    }

    return gamesRepo.submitAnswer({
      gameId,
      userId,
      answer: answer.trim(),
      submittedAt: Date.now()
    });
  }
});
