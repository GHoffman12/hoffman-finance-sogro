import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * Simple page wrapper adding a `<head>` title and centering content on mobile.
 */
export default function Layout({ title = 'Hoffman Finance', children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </>
  );
}