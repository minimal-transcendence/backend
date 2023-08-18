import Logo from "./NavBarLogo";
import Menu from "./NavBarMenu";
import Search from "./NavBarSearch";

export default function NavBar({
  socket,
  query,
  setQuery,
  setIsLoading,
  setSelectedRoom,
  setLeftHeader,
  setError,
}: {
  socket: any;
  query: string;
  setQuery: any;
  setIsLoading: any;
  setSelectedRoom: any;
  setLeftHeader: any;
  setError: any;
}) {
  console.log("navebar ");
  return (
    <nav className="nav-bar">
      <Logo />
      <Search
        query={query}
        setQuery={setQuery}
        socket={socket}
        setIsLoading={setIsLoading}
        setSelectedRoom={setSelectedRoom}
        setLeftHeader={setLeftHeader}
        setError={setError}
      />
      <Menu socket={socket} />
    </nav>
  );
}
