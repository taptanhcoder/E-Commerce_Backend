"use client"

import { Moon, User ,Settings, LogOut, SquareMenu, Sun} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";



const Navbar = () => {
    
  const{theme,setTheme}= useTheme();
  return (
    <div className="p-4 flex items-center justify-between">
    {/* LEFT */}
    collapseButton
    {/* RIGHT */}
    <Link href="/">Dashboard</Link>
    {/* THEME MENU */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {/* USERMenu */}
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar>
                <AvatarImage src="https://api.dicebear.com/9.x/bottts/svg?seed=Jessica" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <User className="h-[1.2rem] w-[1.2rem] mr-2"/>
                Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Settings className="h-[1.2rem] w-[1.2rem] mr-2"/>
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2"/>
                LogOut
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
      

    </div>
  );
};

export default Navbar;
