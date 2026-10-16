import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button, EmptyState, Panel } from '@/components/ui';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Panel>
      <EmptyState icon={Compass} title="Page not found" body="The page you are looking for does not exist." action={<Button onClick={() => navigate('/')}>Back to dashboard</Button>} />
    </Panel>
  );
}
