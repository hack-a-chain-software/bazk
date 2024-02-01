import { ReactNode } from 'react'

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="
        py-6
        px-4
        w-full
        flex-grow
        flex-col items-start justify-start
        overflow-y-scroll
        max-w-screen-xl
        mx-auto
      "
    >
      {children}
    </div>
  );
}

export default Container;
