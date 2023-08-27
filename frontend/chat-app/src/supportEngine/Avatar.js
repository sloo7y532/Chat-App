import { useState } from "react";
import "./style.css";
import SupportWindow from "./SupportWindow";

// Material-UI imports
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import Avatar from "@mui/material/Avatar";


export default function Avatarr(props) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <SupportWindow open={props.open} setOpen={props.setOpen} />
      <div>
        <div style={props.style}>

          {/* HELLOW MESSAGE */}
          <div
            id="avatarHello"
            style={{
              opacity: hovered ? "1" : "0"
            }}
          >
            Contact Us
          </div>
          {/* ==HELLOW MESSAGE== */}

          {/* CHAT BUTTON */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar
              onClick={() => props.onClick()} 
              id="chatButton"
              style={{
                border: hovered ? "2px solid #22396fc8" : "4px solid #22396fc8",
              }}
            >
              <ChatOutlinedIcon style={{ fontSize: "50px" }} />
            </Avatar>
          </div>
          {/* ==CHAT BUTTON== */}
        </div>
      </div>
    </>
  );
}
