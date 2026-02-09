const NICKNAME_KEY = 'deviation.nickname';

export const getNickname = () => localStorage.getItem(NICKNAME_KEY)?.trim() || '';

export const setNickname = (nickname) => {
  localStorage.setItem(NICKNAME_KEY, nickname.trim());
};
