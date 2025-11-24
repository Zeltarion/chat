import {useCallback, useEffect, useRef} from 'react';

import {sendTyping} from '../socket';

const TYPING_TIMEOUT_MS = 1000;

export function useTyping(roomId: string) {
  const typingTimeoutRef = useRef<number | null>(null);
  const lastIsTypingRef = useRef<boolean>(false);

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (lastIsTypingRef.current === isTyping) return;
      lastIsTypingRef.current = isTyping;
      sendTyping({roomId, isTyping});
    },
    [roomId]
  );

  const handleTextChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (trimmed.length > 0) {
        notifyTyping(true);
      } else {
        notifyTyping(false);
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (trimmed.length > 0) {
        typingTimeoutRef.current = window.setTimeout(() => {
          notifyTyping(false);
        }, TYPING_TIMEOUT_MS);
      }
    },
    [notifyTyping]
  );

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    notifyTyping(false);
  }, [notifyTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      notifyTyping(false);
    };
  }, [notifyTyping]);

  return {handleTextChange, stopTyping};
}