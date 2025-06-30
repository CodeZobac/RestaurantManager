import { Metadata } from 'next';
import MenuPage from './components/menu-client';

export const metadata: Metadata = {
  title: 'Explore a variety of restaurants',
  description: 'Explore delicious menus, featuring a wide variety of dishes to suit every taste.',
};

export default function Page() {
  return <MenuPage />;
}