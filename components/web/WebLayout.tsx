import { View, Platform } from 'react-native';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { WebSidebar } from './WebSidebar';
import { Colors } from '@/constants/Colors';

interface WebLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function WebLayout({ children, showSidebar: forceShowSidebar }: WebLayoutProps) {
  const { isWeb, showSidebar, contentWidth } = useResponsive();

  if (!isWeb) {
    return <>{children}</>;
  }

  const shouldShowSidebar = forceShowSidebar !== undefined ? forceShowSidebar : showSidebar;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.background,
        minHeight: '100vh' as any,
      }}
    >
      {shouldShowSidebar && <WebSidebar />}
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          minHeight: '100vh' as any,
        }}
      >
        {children}
      </View>
    </View>
  );
}
