import { Metadata } from 'next';
import ReservePage from './components/reserve-client';

export const metadata: Metadata = {
  title: 'Reserve a Table - The Golden Spoon',
  description: 'Book a table at The Golden Spoon and enjoy our delicious modern European cuisine. We are open for dinner from Monday to Friday, and for lunch and dinner on weekends.',
};

export default function Page() {
  return <ReservePage />;
}