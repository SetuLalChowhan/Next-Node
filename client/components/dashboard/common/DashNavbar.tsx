import React from "react";
import { IoIosNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import { usePathname } from "next/navigation";

interface DashNavbarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DashNavbar: React.FC<DashNavbarProps> = ({ open, setOpen }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between w-full py-3 md:py-6 px-0 rounded-2xl">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <span
          onClick={() => setOpen(!open)}
          className="xl:hidden block cursor-pointer"
        >
          <GiHamburgerMenu color="black" size={26} />
        </span>
        <p className="text-black text-3xl font-bold">Admin Header</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        <IoIosNotifications color="black" size={24} />
        <CgProfile color="black" size={24} />
      </div>
    </div>
  );
};

export default DashNavbar;