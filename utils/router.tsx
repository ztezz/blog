import React, { type ReactNode } from 'react';
import {
  Link as WouterLink,
  Route as WouterRoute,
  Switch,
  useLocation as useWouterLocation,
  useParams,
  useSearch,
} from 'wouter';

export const BrowserRouter = ({ children }: { children: ReactNode }) => children;

export const Routes = ({ children }: { children: ReactNode }) => (
  <Switch>{children}</Switch>
);

export const Route = ({ path, element }: { path: string; element: ReactNode }) => (
  path === '*' ? <WouterRoute>{element}</WouterRoute> : <WouterRoute path={path}>{element}</WouterRoute>
);

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export const Link = ({ to, ...props }: LinkProps) => (
  <WouterLink href={to} asChild>
    <a {...props} />
  </WouterLink>
);

export const useLocation = () => {
  const [pathname] = useWouterLocation();
  return { pathname };
};

export const useNavigate = () => {
  const [, navigate] = useWouterLocation();
  return navigate;
};

export const useSearchParams = () => {
  const search = useSearch();
  const [, navigate] = useWouterLocation();
  const params = new URLSearchParams(search);
  const setSearchParams = (next: URLSearchParams | Record<string, string>) => {
    const query = next instanceof URLSearchParams
      ? next.toString()
      : new URLSearchParams(next).toString();
    navigate(`${window.location.pathname}${query ? `?${query}` : ''}`);
  };

  return [params, setSearchParams] as const;
};

export { useParams };
