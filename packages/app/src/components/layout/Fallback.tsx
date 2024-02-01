import logo from '/logo.svg'

export const Fallback = () => {
  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-dark-blue"
    >
      <img src={logo} className="h-[22px]" alt="Bazk logo" />
    </div>
  )
}

export default Fallback;
