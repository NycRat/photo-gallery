import {useState} from "react";

const Navbar = (): JSX.Element => {

  const [dropdown, setDropdown] = useState<boolean>(false);

  return (
    <nav className="navbar">
      <a href="/#/">Photo Gallery</a>
      <span className={dropdown ? "dropdown active" : "dropdown"}>
        <a href="/#/submit">Submit Photos</a>
      </span>
      <button className="nav-dropdown-icon" onClick={() => setDropdown(!dropdown)}>
        ☰
      </button>
    </nav>
  );
};

export default Navbar;
