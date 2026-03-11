import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">
          Welcome to Social Strides
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Join our community and start your journey today.
        </p>
        <div className="flex gap-4">
          <Link href="/auth/sign-up">
            <Button className="px-6 py-2">Sign Up</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="px-6 py-2">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
