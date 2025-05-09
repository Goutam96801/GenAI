import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "@/components/mobile-sidebar";

interface NavbarProps{
  isPro: boolean;
}

const Navbar = ({
  isPro = false
}: NavbarProps) => {

  return (
    <div className="flex items-center p-4">
      <MobileSidebar isPro={isPro}/>

      <div className="flex w-full justify-end z-50">
       
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export default Navbar;