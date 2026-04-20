import React, { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useChatSidebar } from "../../context/ChatSidebarContext";

const cn = (...inputs) => twMerge(clsx(inputs));

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate = true }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({ className, children, ...props }) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>

      <MobileSidebar className={className} {...props}>
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, animate } = useSidebar();
  const { closeChatSidebar } = useChatSidebar();

  return (
    <motion.aside
      className={cn(
        "hidden md:flex md:flex-col h-full border-l border-slate-200 bg-white/95 shadow-xl backdrop-blur-md",
        className
      )}
      animate={{
        width: animate ? (open ? 300 : 72) : 300,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <motion.h2
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            display: animate ? (open ? "block" : "none") : "block",
          }}
          transition={{ duration: 0.2 }}
          className="text-sm font-semibold text-slate-700"
        >
          Messages
        </motion.h2>

        <button
          type="button"
          onClick={closeChatSidebar}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.aside>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  const { closeChatSidebar } = useChatSidebar();

  return (
    <div className="md:hidden" {...props}>
      <div className="flex h-12 items-center justify-end px-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
        >
          <Menu size={18} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "fixed left-0 top-[78px] z-40 h-[calc(100vh-78px)] w-[280px] border-r border-slate-200 bg-white shadow-2xl",
              className
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <h2 className="text-sm font-semibold text-slate-700">Messages</h2>

              <button
                type="button"
                onClick={closeChatSidebar}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex h-[calc(100%-57px)] flex-col">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open, animate, setOpen } = useSidebar();

  return (
    <Link
      to={link.href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-slate-700 transition hover:bg-slate-100 hover:text-blue-600",
        className
      )}
      {...props}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {link.icon}
      </span>

      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
        }}
        transition={{ duration: 0.2 }}
        className="whitespace-nowrap text-sm font-medium"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};