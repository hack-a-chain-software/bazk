import { Link } from "react-router-dom";
import logo from '/logo.svg'

export const Header = () => {
  return (
    <div
      className="bg-dark-blue"
    >
      <header
        className="mx-auto w-full max-w-7xl md:flex md:items-center md:justify-between py-4"
      >
        <Link
          to="/"
        >
          <img src={logo} className="h-[22px]" alt="Bazk logo" />
        </Link>

        <Link
          to="/ceremony/create"
          className="py-2 px-6"
        >
          <span
            className="
              text-white
              font-medium
            "
          >
            Create ceremony
          </span>
        </Link>
      </header>

    </div>
  )
}

export default Header;
