'use client'

import { useParams, usePathname } from 'next/navigation'
import StoreAuthGuard from '@/components/StoreAuthGuard'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string

  // ログインページは認証不要
  if (pathname.endsWith('/login')) {
    return <>{children}</>
  }

  // その他のページは認証が必要
  return (
    <StoreAuthGuard slug={slug}>
      {children}
    </StoreAuthGuard>
  )
}
