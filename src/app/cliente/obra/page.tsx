import { redirect } from 'next/navigation';

export default function ClienteObraIndexPage() {
  // Redirige al usuario al inicio si intenta acceder a /cliente/obra sin el ID de la obra
  redirect('/');
}