import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function EstoquePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/estoque/itens');
  }, [router]);

  return null;
}
