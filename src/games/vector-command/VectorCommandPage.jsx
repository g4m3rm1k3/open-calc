import { useEffect } from 'react';
import VectorCommandGame from './VectorCommandGame.jsx';

export default function VectorCommandPage() {
  useEffect(() => {
    document.title = "Vector Command — UpSkillOS";
    return () => {
      document.title = "UpSkillOS";
    };
  }, []);

  return <VectorCommandGame />;
}
