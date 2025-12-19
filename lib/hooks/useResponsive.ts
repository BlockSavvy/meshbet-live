import { useWindowDimensions, Platform } from 'react-native';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveState {
  width: number;
  height: number;
  isWeb: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  screenSize: ScreenSize;
  columns: number;
  contentWidth: number;
  sidebarWidth: number;
  showSidebar: boolean;
}

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export function useResponsive(): ResponsiveState {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  let screenSize: ScreenSize = 'mobile';
  if (width >= BREAKPOINTS.wide) {
    screenSize = 'wide';
  } else if (width >= BREAKPOINTS.desktop) {
    screenSize = 'desktop';
  } else if (width >= BREAKPOINTS.tablet) {
    screenSize = 'tablet';
  }

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop' || screenSize === 'wide';
  const isWide = screenSize === 'wide';

  const showSidebar = isWeb && isDesktop;
  const sidebarWidth = showSidebar ? 280 : 0;
  
  const columns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;
  
  const maxContentWidth = 1400;
  const contentWidth = Math.min(width - sidebarWidth - 48, maxContentWidth);

  return {
    width,
    height,
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    screenSize,
    columns,
    contentWidth,
    sidebarWidth,
    showSidebar,
  };
}

export function getResponsiveValue<T>(
  screenSize: ScreenSize,
  values: { mobile: T; tablet?: T; desktop?: T; wide?: T }
): T {
  switch (screenSize) {
    case 'wide':
      return values.wide ?? values.desktop ?? values.tablet ?? values.mobile;
    case 'desktop':
      return values.desktop ?? values.tablet ?? values.mobile;
    case 'tablet':
      return values.tablet ?? values.mobile;
    default:
      return values.mobile;
  }
}
