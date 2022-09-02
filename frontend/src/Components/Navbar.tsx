import { useState } from "react";

const Navbar = (): JSX.Element => {
  const [dropdown, setDropdown] = useState<boolean>(false);

  return (
    <nav className="navbar">
      <a href="/photo-gallery/#/" onClick={() => setDropdown(false)}>
        Photo Galleries
      </a>
      <span className={dropdown ? "dropdown active" : "dropdown"}>
        {/* <a href="/photo-gallery/#/gallery/albumDB" onClick={() => setDropdown(false)}>Albums</a> */}
        <a
          href="/photo-gallery/#/gallery/imageDB/album/images"
          onClick={() => setDropdown(false)}
        >
          Photos
        </a>
        {/* <a href="/photo-gallery/#/admin" onClick={() => setDropdown(false)}>Admin</a> */}
      </span>
      <span
        className="nav-dropdown-icon"
        onClick={() => setDropdown(!dropdown)}
      >
        <p className="text">☰</p>
      </span>
    </nav>
  );
};

export default Navbar;
