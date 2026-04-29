import React from "react";
import {
  Navbar,
  Collapse,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { handleSignOut } from "../utilities";

const GENRE_LINKS = [
  { label: "Action", slug: "action" },
  { label: "Adventure", slug: "adventure" },
  { label: "Arcade", slug: "arcade" },
  { label: "Board", slug: "board" },
  { label: "Card", slug: "card" },
  { label: "Casual", slug: "casual" },
  { label: "Educational", slug: "educational" },
  { label: "Family", slug: "family" },
  { label: "Fighting", slug: "fighting" },
  { label: "Indie", slug: "indie" },
  { label: "Massively Multiplayer", slug: "massively-multiplayer" },
  { label: "Platformer", slug: "platformer" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "Racing", slug: "racing" },
  { label: "RPG", slug: "rpg" },
  { label: "Shooter", slug: "shooter" },
  { label: "Simulation", slug: "simulation" },
  { label: "Sports", slug: "sports" },
  { label: "Strategy", slug: "strategy" },
];

const PLATFORM_LINKS = [
  { label: "PC", slug: "pc" },
  { label: "macOS", slug: "macos" },
  { label: "Linux", slug: "linux" },
  { label: "PlayStation 5", slug: "playstation5" },
  { label: "PlayStation 4", slug: "playstation4" },
  { label: "Xbox Series X/S", slug: "xbox-series-x" },
  { label: "Xbox One", slug: "xbox-one" },
  { label: "Nintendo Switch", slug: "nintendo-switch" },
  { label: "iOS", slug: "ios" },
  { label: "Android", slug: "android" },
];

function NavItem({ label, to, onClick }) {
  return (
    <li>
      <Link to={to} onClick={onClick}>
        <Typography as="span" color="blue-gray" className="p-1 font-medium hover:text-black">
          {label}
        </Typography>
      </Link>
    </li>
  );
}

function NavDropdown({ label, items }) {
  return (
    <Menu allowHover>
      <MenuHandler>
        <Typography as="span" color="blue-gray" className="cursor-pointer p-1 font-medium hover:text-black">
          {label}
        </Typography>
      </MenuHandler>
      <MenuList>
        {items.map((item) => (
          <Link key={item.slug} to={`/${label.toLowerCase()}/${item.slug}`}>
            <MenuItem>{item.label}</MenuItem>
          </Link>
        ))}
      </MenuList>
    </Menu>
  );
}

function MobileDropdown({ label, items, onItemClick }) {
  return (
    <>
      <Typography as="span" color="blue-gray" className="px-1 py-2 text-sm font-semibold uppercase tracking-wide">
        {label}
      </Typography>
      <ul className="ml-3 mt-1 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              to={`/${label.toLowerCase()}/${item.slug}`}
              onClick={onItemClick}
              className="text-sm text-blue-gray-900 hover:text-black"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function NavList({ user, onNavigate }) {
  return (
    <ul className="mb-4 mt-2 flex flex-col gap-3 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-8">
      <NavItem label="Home" to="/" onClick={onNavigate} />
      <li className="hidden lg:block">
        <NavDropdown label="Genre" items={GENRE_LINKS} />
      </li>
      <li className="hidden lg:block">
        <NavDropdown label="Platform" items={PLATFORM_LINKS} />
      </li>
      <li className="lg:hidden">
        <MobileDropdown label="Genre" items={GENRE_LINKS} onItemClick={onNavigate} />
      </li>
      <li className="lg:hidden">
        <MobileDropdown label="Platform" items={PLATFORM_LINKS} onItemClick={onNavigate} />
      </li>
      <NavItem label="New Releases" to="/new" onClick={onNavigate} />
      <NavItem label="Your Library" to={user ? "/library" : "/auth"} onClick={onNavigate} />
      <NavItem label="Vibe Quiz" to="/quiz" onClick={onNavigate} />
    </ul>
  );
}

export default function NavBar({ user, setUser }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  function handleOpen() {
    setOpen((current) => !current);
  }

  async function onSignOutClick() {
    await handleSignOut();
    setUser(null);
    navigate("/");
  }

  React.useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 960) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMobileMenu() {
    setOpen(false);
  }

  return (
    <Navbar className="bg-cyan-400" fullWidth>
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <Link to="/">
          <Typography
            as="span"
            color="blue-gray"
            className="mr-4 cursor-pointer text-lg font-bold"
          >
            VibeGamer
          </Typography>
        </Link>

        <div className="hidden lg:block">
          <NavList user={user} onNavigate={closeMobileMenu} />
        </div>

        {user ? (
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/profile" className="flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6" />
              <span className="text-sm">{user.username}</span>
            </Link>
            <Button color="gray" onClick={onSignOutClick}>
              Sign out
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button color="gray" className="hidden lg:inline-block">
              Sign in
            </Button>
          </Link>
        )}

        <IconButton
          size="sm"
          variant="text"
          color="blue-gray"
          onClick={handleOpen}
          className="ml-auto inline-block text-blue-gray-900 lg:hidden"
        >
          {open ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>

      <Collapse open={open}>
        <div className="mt-2 rounded-xl bg-white py-2">
          <NavList user={user} onNavigate={closeMobileMenu} />

          {user ? (
            <Button className="mb-2" fullWidth onClick={onSignOutClick}>
              Sign out
            </Button>
          ) : (
            <Link to="/auth" onClick={closeMobileMenu}>
              <Button className="mb-2" fullWidth>
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </Collapse>
    </Navbar>
  );
}


