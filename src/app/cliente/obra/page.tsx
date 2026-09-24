import { redirect } from 'next/navigation';

export default function ClienteObraIndexPage() {
  // Bloquea el listado público y redirige al inicio
  redirect('/');
}