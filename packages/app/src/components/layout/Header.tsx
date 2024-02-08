import { Link } from "react-router-dom";
import logo from '/logo.svg'
import MenuMobile from "./MenuMobile";
import { HackaConnectContext } from '@/App';

export const Header = () => {
  const HackaConnectActorRef = HackaConnectContext.useActorRef()

  return (
    <div
      className="bg-dark-blue px-4"
    >
      <header
        className="mx-auto w-full max-w-7xl flex items-center justify-between py-4 min-h-[72px]"
      >
        <Link
          to="/"
        >
          <img src={logo} className="h-[22px]" alt="Bazk logo" />
        </Link>

        <Link
          to="/ceremony/create"
          className="py-2 px-6 hidden md:block"
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

        <button
          onClick={() => HackaConnectActorRef.send({ type: 'openModal' })}
          className="text-white"
        >
          Connect Wallet
        </button>


        <MenuMobile />
      </header>

    </div>
  )
}

export default Header;
