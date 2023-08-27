import { useState } from "react";
import Avatarr from "./Avatar";

export default function ChatApp() {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  return (
    <div>
      <Avatarr
        open={open}
        setOpen={setOpen}
        onClick={handleClick}
        style={{ position: "fixed", bottom: "25px", right: "25px" }}
      />
    </div>
  );
}
