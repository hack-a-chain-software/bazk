import { ReactNode } from 'react'

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="
        py-[14px]
        md:py-6
        px-4
        w-full
        flex-grow
        flex-col items-start justify-start
        max-w-screen-xl
        mx-auto
        min-h-[100vh]
      "
    >
      {children}
    </div>
  );
}

export default Container;
