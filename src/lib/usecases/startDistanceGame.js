import { createGamesRepo } from '../repos/gamesRepo.js';
import { createTopicsRepo } from '../repos/topicsRepo.js';
import { err } from '../result.js';

const DEFAULT_TOPIC_COUNT = 5;

const createInviteCode = () => `inv-${Math.random().toString(36).slice(2, 8)}`;

export const createStartDistanceGameUsecase = ({
  topicsRepo = createTopicsRepo(),
  gamesRepo = createGamesRepo()
} = {}) => ({
  async execute(input) {
    const { teamId, drawerUserId } = input || {};
    if (!teamId || !drawerUserId) {
      return err('VALIDATION_ERROR', 'teamId と drawerUserId は必須です。');
    }

    const topicsResult = await topicsRepo.listActiveTopics(DEFAULT_TOPIC_COUNT);
    if (!topicsResult.ok) return topicsResult;
    if (topicsResult.data.length === 0) {
      return err('NOT_FOUND', '有効なお題が見つかりません。');
    }

    const selected = topicsResult.data[Math.floor(Math.random() * topicsResult.data.length)];

    return gamesRepo.createDistanceGame({
      teamId,
      drawerUserId,
      topicId: selected.id,
      topic: selected.text,
      inviteCode: createInviteCode()
    });
  }
});
