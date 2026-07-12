import { useNavigate } from 'react-router-dom';
import MusicLab from './MusicLab';

export default function MusicLabPage() {
  const navigate = useNavigate();
  return <MusicLab onBack={() => navigate('/')} />;
}
