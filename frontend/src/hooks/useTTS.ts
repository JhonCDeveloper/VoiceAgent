import { fetchTTS } from '../api/client';

export function useTTS() {
  const play = (text: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const blob = await fetchTTS(text);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.addEventListener('ended', () => {
          resolve(url);
        });

        audio.addEventListener('error', (err) => {
          reject(err);
        });

        await audio.play();
      } catch (error) {
        console.error('Failed to play TTS audio:', error);
        reject(error);
      }
    });
  };

  return { play };
}
