import { Link } from "react-router-dom";
import logo from '/logo.svg'
import MenuMobile from "./MenuMobile";
import ConnectWalletButton from "../wallet-connect/WalletConnectButton";

export const Header = () => {
  return (
    <div
      className="bg-bazk-dark-blue px-4"
    >
      <header
        className="mx-auto w-full max-w-7xl flex items-center justify-between py-4 min-h-[72px]"
      >
        <div
          className="flex items-center justify-start"
        >
          <Link
            to="/"
          >
            <img src={logo} className="h-[22px]" alt="Bazk logo" />
          </Link>

          <Link
            to="/ceremony/create"
            className="py-2 px-6 hidden md:block hover:opacity-90"
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
        </div>

        <ConnectWalletButton />

        <MenuMobile />
      </header>

    </div>
  )
}

export default Header;
