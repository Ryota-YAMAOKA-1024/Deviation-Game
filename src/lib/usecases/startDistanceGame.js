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
    const { teamId, drawerUserId, selectedTopic } = input || {};
    if (!teamId || !drawerUserId || !selectedTopic?.id || !selectedTopic?.text) {
      return err('VALIDATION_ERROR', 'teamId / drawerUserId / selectedTopic は必須です。');
    }

    const topicsResult = await topicsRepo.listActiveTopics(DEFAULT_TOPIC_COUNT);
    if (!topicsResult.ok) return topicsResult;
    if (topicsResult.data.length === 0) {
      return err('NOT_FOUND', '有効なお題が見つかりません。');
    }

    const isSelectedTopicActive = topicsResult.data.some((topic) => topic.id === selectedTopic.id);
    if (!isSelectedTopicActive) {
      return err('NOT_FOUND', '選択したお題が見つかりません。画面を再読み込みしてください。');
    }

    return gamesRepo.createDistanceGame({
      teamId,
      drawerUserId,
      topicId: selectedTopic.id,
      topic: selectedTopic.text,
      inviteCode: createInviteCode()
    });
  }
});
