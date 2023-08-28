import { useState, useEffect } from "react";
import img from "./image/Experia.png";
import "./style.css";
import ReactScrollableFeed from "react-scrollable-feed";

// MATERIAL_UI IMPORTS
import CardHeader from "@mui/material/CardHeader";
import Fab from "@mui/material/Fab";
import SendIcon from "@mui/icons-material/Send";
import TextField from "@mui/material/TextField";
import io from "socket.io-client";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const socket = io.connect("http://localhost:3010");

export default function SupportWindow({ open, setOpen }) {
  const [textInput, setTextInput] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [savedMessages, setSavedMessages] = useState([]);
  const [file, setFile] = useState();
  var MessageData = {
    type: "",
    message: textInput,
    time:
      new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
  };
  var Cid = null;

  // ==handling Client id [ Cid ]==
  useEffect(() => {
    if (localStorage.getItem("Cid")) {
      Cid = JSON.parse(localStorage.getItem("Cid"));
      var SM = JSON.parse(localStorage.getItem("SavedMessage"));
      if (SM) {
        SM.map((message) => {
          setSavedMessages((list) => [...list, message]);
          setMessageList((list) => [...list, message]);
        });
      }
    }
    socket.emit("CidExist", Cid);
    socket.on("CidExistTrue", (CCid) => {
      Cid = CCid;
      localStorage.setItem("Cid", JSON.stringify(Cid));
      socket.emit("join", Cid);
    });

    if (Cid) {
      socket.emit("join", Cid);
    }
  }, []);

  // ==handling Client id**==
  const handleSendMessage = async () => {
    if (textInput !== "") {
      MessageData.type = "client";
      await socket.emit("send_message", MessageData);
      setMessageList((list) => [...list, MessageData]);
      setTextInput("");

      setSavedMessages((list) => [...list, MessageData]);
    }
  };
  function selectFile(e) {
    setTextInput(e.target.files[0].namme);
    setFile(e.target.files[0]);
  }
  useEffect(() => {
    socket.on("receive_message", (input) => {
      input.type = "agent";
      console.log("hello from RabbitMq", input.Cid);
      setMessageList((list) => [...list, input]);
      setSavedMessages((list) => [...list, input]);
    });
  }, [socket]);

  // ==Save Message in the local storage
  useEffect(() => {
    if (savedMessages.length < 6) {
      localStorage.setItem("SavedMessage", JSON.stringify(savedMessages));
    } else {
      savedMessages.splice(0, 1);
      localStorage.setItem("SavedMessage", JSON.stringify(savedMessages));
    }
  }, [savedMessages]);
  // ===Save Message in the local storage===
  return (
    <>
      <div>
        <div id="supportWindow" style={{ opacity: open ? "1" : "0" }}>
          {/* HEADER */}
          <CardHeader
            style={{
              borderBottom: "1px solid #02210330",
              boxShadow: "0px 0px 14px 4px rgba(34, 57, 111, 0.2)",
              backgroundColor: "#394b7675",
              textAlign: "center",
            }}
            avatar={
              <img alt="Experia" src={img} style={{ width: 60, height: 50 }} />
            }
            title="Experia Support"
            subheader="Digital Customer Care"
          ></CardHeader>
          {/* ===HEADER== */}

          {/* CONTENT */}
          <div className="body">
            {/* <div className="body-continer"> */}
            <ReactScrollableFeed>
              {messageList.map((messageContent, i) => {
                return (
                  <div
                    className="message"
                    key={i}
                    id={messageContent.type === "client" ? "you" : "Experia"}
                  >
                    <div>
                      <div className="message-content">
                        <p className="message-p">{messageContent.message}</p>
                      </div>
                      <div className="message-meta">
                        <p id="time">{messageContent.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ReactScrollableFeed>
            {/* </div> */}
          </div>
          {/* ===CONTENT=== */}

          {/* FOOTER */}
          <div id="footer">
            <TextField
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              style={{ marginRight: "10px", width: "90%" }}
              label="hey"
              variant="outlined"
              // onkeydown={(e) => (e.code === "Enter" ? handleSendMessage : null)}
            />
            <Fab id="sendButton" aria-label="send">
              <SendIcon onClick={handleSendMessage} />
            </Fab>
            <Fab id="sendButton" type="file" aria-label="send">
              <ImageOutlinedIcon onClick={selectFile} />
            </Fab>
            {/* <IconButton aria-label="share">
          <ShareIcon />
        </IconButton> */}
          </div>
          {/* ===FOOTER=== */}
        </div>

        {/* CLOSE SUPPORT WINDOW */}
        <div
          style={{ width: "100vw", height: "100vh" }}
          onClick={() => setOpen(false)}
        />
        {/* ===CLOSE SUPPORT WINDOW=== */}
      </div>
    </>
  );
}
