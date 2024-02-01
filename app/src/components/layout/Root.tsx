import { ReactNode } from 'react'
import '@fontsource/inter/latin.css'

export const Root = ({ children }: { children: ReactNode }) => {

  return (
    <div
      className="flex flex-col max-h-full h-full overflow-y-hidden"
    >
      {children}
    </div>
  );
}

export default Root;
