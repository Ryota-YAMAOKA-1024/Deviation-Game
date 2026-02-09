import { createGamesRepo } from '../repos/gamesRepo.js';
import { err } from '../result.js';

export const createSubmitAnswerUsecase = ({ gamesRepo = createGamesRepo() } = {}) => ({
  async execute(input) {
    const { gameId, userId, answer } = input || {};
    const normalizedAnswer = typeof answer === 'string' ? answer.trim() : '';
    if (!gameId || !userId || !normalizedAnswer) {
      return err('VALIDATION_ERROR', 'gameId, userId, answer は必須です。');
    }

    return gamesRepo.submitAnswer({
      gameId,
      userId,
      answer: normalizedAnswer,
      submittedAt: Date.now()
    });
  }
});
