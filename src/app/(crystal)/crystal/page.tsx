import { redirect } from 'next/navigation';

export default function CrystalPage() {
  redirect('/auth/login');
}
