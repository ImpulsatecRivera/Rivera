import { useState, useCallback } from 'react';

export default function useQuotePreview() {
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState(null);

  const open = useCallback((data) => {
    setItem(data || null);
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  return { visible, item, open, close };
}
