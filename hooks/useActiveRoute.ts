import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Hook to determine if a route is currently active
 * 
 * @param path - The path to check against current pathname
 * @returns boolean indicating if the route is active
 * 
 * @example
 * const isActive = useActiveRoute('/dashboard');
 */
export function useActiveRoute(path: string): boolean {
  const pathname = usePathname();
  
  return useMemo(() => {
    if (!pathname) return false;
    
    // Exact match
    if (pathname === path) {
      return true;
    }
    
    // Check if pathname starts with path + '/' (for nested routes)
    const pathWithSlash = path + '/';
    return pathname.startsWith(pathWithSlash);
  }, [pathname, path]);
}

/**
 * Hook to get the most specific active route from a list of paths
 * 
 * @param paths - Array of paths to check
 * @returns The most specific matching path, or null if none match
 * 
 * @example
 * const activePath = useMostSpecificRoute(['/dashboard', '/dashboard/settings']);
 */
export function useMostSpecificRoute(paths: string[]): string | null {
  const pathname = usePathname();
  
  return useMemo(() => {
    if (!pathname) return null;
    
    // Find all matching paths
    const matchingPaths = paths.filter(path => {
      if (pathname === path) return true;
      const pathWithSlash = path + '/';
      return pathname.startsWith(pathWithSlash);
    });
    
    if (matchingPaths.length === 0) return null;
    
    // Return the most specific (longest) path
    return matchingPaths.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
  }, [pathname, paths]);
}
